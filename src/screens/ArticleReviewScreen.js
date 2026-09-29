import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { createWordPressArticle } from "../services/wordpressService";

// Le contenu généré par l'IA est du HTML simple (uniquement des <p>), pour
// pouvoir être publié tel quel sur WordPress. Pour l'édition ici, on
// l'affiche comme du texte brut (un paragraphe par ligne vide), et on le
// reconvertit en <p> au moment de publier.
function htmlToPlainText(html) {
  return (html || "")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .trim();
}

function plainTextToHtml(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");
}

export default function ArticleReviewScreen({ route, navigation }) {
  const { realisationId, article, wpConnection, photoUrls = [] } = route.params;
  const { addChannelToRealisation } = useApp();

  const [title, setTitle] = useState(article.title || "");
  const [h1, setH1] = useState(article.h1 || "");
  const [metaDescription, setMetaDescription] = useState(article.metaDescription || "");
  const [content, setContent] = useState(htmlToPlainText(article.content));
  const [publishing, setPublishing] = useState(false);

  const canPublish = Boolean(title.trim() && h1.trim() && content.trim()) && !publishing;

  const goToRealisation = () => {
    navigation.navigate("HistoryTab", { screen: "RealisationDetail", params: { realisationId } });
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const wpResult = await createWordPressArticle({
        siteUrl: wpConnection.siteUrl,
        apiKey: wpConnection.apiKey,
        title: title.trim(),
        h1: h1.trim(),
        content: plainTextToHtml(content),
        metaDescription: metaDescription.trim(),
        imageUrl: photoUrls[0] || null,
        galleryUrls: photoUrls.slice(1),
      });
      await addChannelToRealisation(realisationId, { wordpress_url: wpResult.url });
      goToRealisation();
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible de publier sur le site pour l'instant.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>APERÇU AVANT PUBLICATION</Text>
          <Text style={styles.title}>Vérifie l'article avant qu'il parte sur ton site</Text>
          <Text style={styles.subtitle}>
            Rédigé par l'IA à partir de ta description. Modifie ce que tu veux avant de publier.
          </Text>

          {photoUrls[0] ? <Image source={{ uri: photoUrls[0] }} style={styles.heroImage} /> : null}

          <Text style={styles.label}>Titre SEO (balise du site)</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Titre affiché sur la page</Text>
          <TextInput style={styles.input} value={h1} onChangeText={setH1} />

          <Text style={styles.label}>Résumé SEO (méta-description)</Text>
          <TextInput
            style={[styles.input, styles.textareaSmall]}
            value={metaDescription}
            onChangeText={setMetaDescription}
            multiline
          />

          <Text style={styles.label}>Contenu de l'article</Text>
          <TextInput style={[styles.input, styles.textarea]} value={content} onChangeText={setContent} multiline />

          <TouchableOpacity
            style={[styles.publishButton, !canPublish && styles.disabledButton]}
            onPress={handlePublish}
            disabled={!canPublish}
          >
            {publishing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.publishButtonText}>🚀 Publier sur le site</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={goToRealisation} disabled={publishing}>
            <Text style={styles.skipButtonText}>Ne pas publier cette fois</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 24, paddingBottom: 48 },
  eyebrow: { fontSize: 11, fontWeight: "800", color: "#B8935A", letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 21, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13.5, color: "#64748B", marginTop: 6, marginBottom: 20, lineHeight: 19 },
  heroImage: { width: "100%", aspectRatio: 16 / 10, borderRadius: 14, marginBottom: 20 },
  label: { marginTop: 18, marginBottom: 10, fontSize: 14, fontWeight: "700", color: "#334155" },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textareaSmall: { minHeight: 60, textAlignVertical: "top" },
  textarea: { minHeight: 160, textAlignVertical: "top" },
  publishButton: {
    marginTop: 28,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  publishButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  skipButton: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
  skipButtonText: { color: "#94A3B8", fontWeight: "700", fontSize: 13.5 },
  disabledButton: { opacity: 0.4 },
});
