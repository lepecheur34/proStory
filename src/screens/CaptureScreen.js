import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { getMetier } from "../data/metiers";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useApp } from "../context/AppContext";
import { generateGenericContent } from "../services/aiService";
import { fetchConnections, fetchReviewLink, withReviewLink } from "../services/socialAuthService";
import { createWordPressArticle } from "../services/wordpressService";
import { sendReviewEmailWithFallback } from "../services/emailService";

const MAX_PHOTOS = 3;

export default function CaptureScreen({ route, navigation }) {
  const { metierId } = route.params;
  const metier = getMetier(metierId);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { addRealisation, markChannelSent, addChannelToRealisation } = useApp();

  const [photos, setPhotos] = useState([null, null, null]);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const photoCount = photos.filter(Boolean).length;

  const launchCamera = async (index) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false });
    if (!result.canceled && result.assets?.length) {
      setPhotoAt(index, result.assets[0].uri);
    }
  };

  const launchLibrary = async (index) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets?.length) {
      setPhotoAt(index, result.assets[0].uri);
    }
  };

  const setPhotoAt = (index, uri) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = uri;
      return next;
    });
  };

  const removePhotoAt = (index) => setPhotoAt(index, null);

  // Un seul point d'entrée pour chaque case photo : vide -> propose de
  // prendre/choisir une photo ; remplie -> propose de la remplacer ou
  // de la supprimer. Plus besoin de boutons Caméra/Galerie séparés.
  const handleSlotPress = (index) => {
    const isFilled = Boolean(photos[index]);

    const addOptions = ["Prendre une photo", "Choisir dans la galerie", "Annuler"];
    const filledOptions = ["Remplacer la photo", "Supprimer la photo", "Annuler"];
    const options = isFilled ? filledOptions : addOptions;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1 },
        (buttonIndex) => {
          if (buttonIndex === 0) launchCamera(index);
          else if (buttonIndex === 1) {
            if (isFilled) removePhotoAt(index);
            else launchLibrary(index);
          }
        }
      );
    } else {
      Alert.alert(
        isFilled ? "Modifier la photo" : "Ajouter une photo",
        undefined,
        isFilled
          ? [
              { text: "Remplacer", onPress: () => launchCamera(index) },
              { text: "Depuis la galerie", onPress: () => launchLibrary(index) },
              { text: "Supprimer", style: "destructive", onPress: () => removePhotoAt(index) },
              { text: "Annuler", style: "cancel" },
            ]
          : [
              { text: "📷 Prendre une photo", onPress: () => launchCamera(index) },
              { text: "🖼️ Depuis la galerie", onPress: () => launchLibrary(index) },
              { text: "Annuler", style: "cancel" },
            ]
      );
    }
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = (!email.trim() || isValidEmail) && !loading;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const usedPhotos = photos.filter(Boolean);
      const trimmedEmail = email.trim();
      // Contenu générique, instantané, sans IA pour l'instant (viendra
      // plus tard) — sert à l'email d'avis tout de suite, et à l'article
      // WordPress. Les posts Facebook/Instagram/LinkedIn, eux, ne sont
      // générés qu'au moment où l'artisan choisit de les partager, depuis
      // la fiche réalisation.
      const generic = generateGenericContent({ metierId, description });

      const savedRealisation = await addRealisation({
        metierId,
        email: trimmedEmail || null,
        description,
        photos: usedPhotos,
        facebook: null,
        instagram: null,
        linkedin: null,
        emailObjet: trimmedEmail ? generic.emailAvis.objet : null,
        emailCorps: trimmedEmail ? generic.emailAvis.corps : null,
      });

      // Email d'avis Google automatique, si un email a été renseigné.
      if (trimmedEmail && user) {
        try {
          const reviewLink = await fetchReviewLink(user.id).catch(() => null);
          const emailAvis = withReviewLink(generic.emailAvis, reviewLink);
          const result = await sendReviewEmailWithFallback({
            to: trimmedEmail,
            subject: emailAvis.objet,
            body: emailAvis.corps,
            senderName: profile?.nom_entreprise,
          });
          if (result.method !== "manual-cancelled") {
            await markChannelSent(savedRealisation.id, "emailAvis");
          }
        } catch (e) {
          // Silencieux : l'artisan pourra renvoyer l'email depuis la fiche.
        }
      }

      // Publication automatique sur le site WordPress connecté, s'il y en
      // a un (texte générique pour l'instant, l'IA arrivera plus tard).
      if (user) {
        try {
          const connections = await fetchConnections(user.id);
          const wpConnection = connections.find(
            (c) => c.provider === "wordpress" && c.wordpress_site_url && c.wordpress_api_key
          );
          if (wpConnection) {
            const wpResult = await createWordPressArticle({
              siteUrl: wpConnection.wordpress_site_url,
              apiKey: wpConnection.wordpress_api_key,
              title: `Nouvelle réalisation — ${metier.label}`,
              content: generic.article,
              metaDescription: generic.article.slice(0, 155),
              imageUrl: savedRealisation.photo_urls?.[0] || null,
            });
            await addChannelToRealisation(savedRealisation.id, { wordpress_url: wpResult.url });
          }
        } catch (e) {
          // Silencieux : la réalisation reste utilisable sans le site.
        }
      }

      // On rebascule directement sur la fiche de cette réalisation (dans
      // l'onglet "Mes réalisations"), prête pour le partage.
      navigation.navigate("HistoryTab", { screen: "RealisationDetail", params: { realisationId: savedRealisation.id } });
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible de créer cette réalisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>
            {metier.emoji} {metier.label}
          </Text>
          <Text style={styles.subtitle}>
            Photos de la réalisation (optionnel, jusqu'à {MAX_PHOTOS})
          </Text>

          <View style={styles.photoRow}>
            {[0, 1, 2].map((i) => (
              <TouchableOpacity key={i} style={styles.photoSlot} onPress={() => handleSlotPress(i)}>
                {photos[i] ? (
                  <>
                    <Image source={{ uri: photos[i] }} style={styles.photo} />
                    <View style={styles.editBadge}>
                      <Text style={styles.editBadgeText}>✎</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptySlot}>
                    <Text style={styles.emptySlotPlus}>+</Text>
                    <Text style={styles.emptySlotText}>Photo {i + 1}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Décris en quelques mots ce que tu as fait</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Ex : changement de la courroie de distribution et vidange complète, client très satisfait"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={styles.hint}>
            🎙️ Astuce : appuie sur le micro de ton clavier pour dicter à la voix au lieu d'écrire.
          </Text>

          <Text style={styles.label}>Email du client (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="client@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.hint}>
            Renseigné : l'email de demande d'avis Google part automatiquement. Le partage sur les
            réseaux se fera juste après, depuis la fiche de la réalisation.
          </Text>

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>✅ Créer la réalisation</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 15, color: "#64748B", marginTop: 4, marginBottom: 20 },
  photoRow: { flexDirection: "row", justifyContent: "space-between" },
  photoSlot: { width: "31%" },
  photo: { width: "100%", aspectRatio: 1, borderRadius: 12 },
  emptySlot: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  emptySlotPlus: { fontSize: 26, color: "#94A3B8", fontWeight: "700", lineHeight: 28 },
  emptySlotText: { fontSize: 11, color: "#94A3B8", fontWeight: "600", marginTop: 2 },
  editBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#0F172A",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadgeText: { color: "white", fontSize: 12, fontWeight: "700" },
  hint: { fontSize: 11.5, color: "#94A3B8", marginTop: 10 },
  label: { marginTop: 24, marginBottom: 10, fontSize: 14, fontWeight: "700", color: "#334155" },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  submitButton: {
    marginTop: 28,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  disabledButton: { opacity: 0.4 },
});
