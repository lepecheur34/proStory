import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);
const LOCAL_CACHE_KEY = "artisan-app:realisations-cache";

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [realisations, setRealisations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadFromCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_CACHE_KEY);
      if (raw) setRealisations(JSON.parse(raw));
    } catch (e) {
      console.warn("Impossible de charger le cache local", e);
    }
  }, []);

  const saveToCache = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Impossible de sauvegarder le cache local", e);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      await loadFromCache();
      setLoaded(true);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("realisations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRealisations(data || []);
      saveToCache(data || []);
    } catch (e) {
      console.warn("Impossible de charger depuis Supabase, utilisation du cache local", e);
      await loadFromCache();
    } finally {
      setLoaded(true);
    }
  }, [user, loadFromCache, saveToCache]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Uploade les photos locales vers Supabase Storage et retourne les URLs publiques.
  // Sur React Native, fetch(uri).blob() n'est pas fiable pour l'upload de
  // fichiers (échoue souvent avec "Network request failed") : on passe par
  // la nouvelle API File d'Expo (SDK 54+), qui expose directement
  // arrayBuffer(), le format attendu par Supabase Storage.
  const uploadPhotos = async (photoUris) => {
    if (!isSupabaseConfigured || !user) return [];
    const urls = [];
    for (let i = 0; i < photoUris.length; i++) {
      const uri = photoUris[i];
      try {
        const file = new File(uri);
        const arrayBuffer = await file.arrayBuffer();
        const path = `${user.id}/${Date.now()}-${i}.jpg`;
        const { error } = await supabase.storage
          .from("realisations-photos")
          .upload(path, arrayBuffer, { contentType: "image/jpeg" });
        if (error) {
          console.warn("Upload photo échoué, on continue sans", error);
          continue;
        }
        const { data } = supabase.storage.from("realisations-photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      } catch (e) {
        console.warn("Upload photo échoué, on continue sans", e);
      }
    }
    return urls;
  };

  // NB : toutes les fonctions ci-dessous mettent à jour `realisations` via la
  // forme fonctionnelle de setRealisations(prev => ...), jamais en lisant la
  // variable `realisations` capturée à la création de la fonction. Un écran
  // (ex: CaptureScreen) peut enchaîner plusieurs de ces appels dans un seul
  // handler async ; entre deux `await`, ce composant ne se re-rend pas
  // forcément, donc les références qu'il a capturées via useApp() peuvent
  // rester basées sur un instantané de `realisations` antérieur à l'appel
  // précédent (ex: markChannelSent appelé juste après addRealisation ne
  // trouvait pas encore la réalisation tout juste créée, et s'arrêtait sans
  // rien enregistrer). La forme fonctionnelle lit toujours l'état réel au
  // moment de l'exécution, quelle que soit l'ancienneté de la closure.
  const addRealisation = async (realisation) => {
    if (isSupabaseConfigured && user) {
      const photoUrls = await uploadPhotos(realisation.photos || []);
      const { data, error } = await supabase
        .from("realisations")
        .insert({
          user_id: user.id,
          metier_id: realisation.metierId,
          client_email: realisation.email,
          description: realisation.description || null,
          photo_urls: photoUrls,
          facebook: realisation.facebook,
          instagram: realisation.instagram,
          linkedin: realisation.linkedin,
          email_objet: realisation.emailObjet,
          email_corps: realisation.emailCorps,
          sent_channels: [],
        })
        .select()
        .single();
      if (error) throw error;
      setRealisations((prev) => {
        const next = [data, ...prev];
        saveToCache(next);
        return next;
      });
      return data;
    }

    // Pas de compte / Supabase non configuré : on garde le comportement
    // local d'origine pour que l'appli reste testable sans setup.
    const local = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      metier_id: realisation.metierId,
      client_email: realisation.email,
      photo_urls: realisation.photos || [],
      sent_channels: [],
      ...realisation,
    };
    setRealisations((prev) => {
      const next = [local, ...prev];
      saveToCache(next);
      return next;
    });
    return local;
  };

  // Marque un canal comme envoyé pour une réalisation donnée (après un vrai
  // envoi d'email ou un partage vers un réseau social).
  const markChannelSent = async (realisationId, channelId) => {
    let sentChannels = [channelId];
    setRealisations((prev) => {
      const target = prev.find((r) => r.id === realisationId);
      sentChannels = [...new Set([...(target?.sent_channels || []), channelId])];
      if (!target) return prev;
      const next = prev.map((r) => (r.id === realisationId ? { ...r, sent_channels: sentChannels } : r));
      saveToCache(next);
      return next;
    });

    if (isSupabaseConfigured && user) {
      const { error } = await supabase
        .from("realisations")
        .update({ sent_channels: sentChannels })
        .eq("id", realisationId);
      if (error) throw error;
    }
  };

  // Ajoute du contenu pour un canal qui n'avait pas été choisi à la création
  // de la réalisation (ex : on avait fait que l'email, on veut ajouter Facebook).
  const addChannelToRealisation = async (realisationId, patch) => {
    if (isSupabaseConfigured && user) {
      const { data, error } = await supabase
        .from("realisations")
        .update(patch)
        .eq("id", realisationId)
        .select()
        .single();
      if (error) throw error;
      setRealisations((prev) => {
        const exists = prev.some((r) => r.id === realisationId);
        const next = exists ? prev.map((r) => (r.id === realisationId ? data : r)) : [data, ...prev];
        saveToCache(next);
        return next;
      });
      return data;
    }

    let updated;
    setRealisations((prev) => {
      const next = prev.map((r) => (r.id === realisationId ? { ...r, ...patch } : r));
      updated = next.find((r) => r.id === realisationId);
      saveToCache(next);
      return next;
    });
    return updated;
  };

  // Supprime définitivement une réalisation (protégé par RLS : chacun ne
  // peut supprimer que les siennes). Ne supprime que l'entrée côté
  // ProStory — pas l'article WordPress déjà publié le cas échéant, à gérer
  // depuis le site si besoin.
  const deleteRealisation = async (realisationId) => {
    if (isSupabaseConfigured && user) {
      const { error } = await supabase.from("realisations").delete().eq("id", realisationId);
      if (error) throw error;
    }

    setRealisations((prev) => {
      const next = prev.filter((r) => r.id !== realisationId);
      saveToCache(next);
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        realisations,
        addRealisation,
        markChannelSent,
        addChannelToRealisation,
        deleteRealisation,
        loaded,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans un AppProvider");
  return ctx;
}
