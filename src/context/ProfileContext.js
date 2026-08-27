import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (e) {
      console.warn("Impossible de charger le profil", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async ({ metierId, nomEntreprise, ville, description }) => {
    if (!user) throw new Error("Non connecté");
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          metier_id: metierId,
          nom_entreprise: nomEntreprise || null,
          ville: ville || null,
          description: description || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, saveProfile, refreshProfile: loadProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile doit être utilisé dans un ProfileProvider");
  return ctx;
}
