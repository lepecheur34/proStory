import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMetier } from "../data/metiers";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { fetchConnections } from "../services/socialAuthService";
import { sendReviewEmailWithFallback } from "../services/emailService";
import { shareRealisation } from "../services/shareService";
import { createWordPressArticle } from "../services/wordpressService";

function PlatformBlock({ icon, title, value, onChange }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>
        {icon} {title}
      </Text>
      <TextInput style={styles.blockInput} value={value} onChangeText={onChange} multiline />
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const { metierId, email, content, channels = [], description } = route.params;
  const metier = getMetier(metierId);
  const { addRealisation, markChannelSent, addChannelToRealisation } = useApp();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [facebook, setFacebook] = useState(content.facebook);
  const [instagram, setInstagram] = useState(content.instagram);
  const [linkedin, setLinkedin] = useState(content.linkedin);
  const [emailObjet, setEmailObjet] = useState(content.emailAvis.objet);
  const [emailCorps, setEmailCorps] = useState(content.emailAvis.corps);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [connections, setConnections] = useState([]);
  const [savedRealisation, setSavedRealisation] = useState(null);
  const [sharingChannel, setSharingChannel] = useState(null);

  const showFacebook = channels.includes("facebook");
  const showInstagram = channels.includes("instagram");
  const showLinkedin = channels.includes("linkedin");
  const showEmail = channels.includes("emailAvis");

  useEffect(() => {
    if (!user) return;
    fetchConnections(user.id)
      .then(setConnections)
      .catch(() => setConnections([]));
  }, [user]);

  const googleReviewLink = connections.find((c) => c.provider === "google")?.review_link;

  const saveRealisation = async () => {
    setPublishing(true);
    try {
      const savedRealisation = await addRealisation({
        metierId,
        email,
        description,
        photos: route.params.photos,
        facebook: showFacebook ? facebook : null,
        instagram: showInstagram ? instagram : null,
        linkedin: showLinkedin ? linkedin : null,
        emailObjet: showEmail ? emailObjet : null,
        emailCorps: showEmail ? emailCorps : null,
      });
      const wpConnection = connections.find(
        (c) => c.provider === "wordpress" && c.wordpress_site_url && c.wordpress_api_key
      );
      if (wpConnection) {
        try {
          const articleText = facebook || linkedin || instagram || description || "";
          const wpResult = await createWordPressArticle({
            siteUrl: wpConnection.wordpress_site_url,
            apiKey: wpConnection.wordpress_api_key,
            title: `${profile?.nom_entreprise || metier.label} — nouvelle réalisation`,
            content: articleText,
            metaDescription: articleText.slice(0, 155),
            imageUrl: savedRealisation.photo_urls?.[0] || null,
            metier: metier.label,
          });
          await addChannelToRealisation(savedRealisation.id, { wordpress_url: wpResult.url });
          savedRealisation.wordpress_url = wpResult.url;
        } catch (wpError) {
          // Silencieux : la réalisation reste utilisable, l'artisan verra
          // simplement le partage retomber sur la page Supabase par défaut.
        }
      }

      let emailMessage = "";
      if (showEmail && email) {
        try {
          const result = await sendReviewEmailWithFallback({
            to: email,
            subject: emailObjet,
            body: emailCorps,
            senderName: profile?.nom_entreprise,
          });
          if (result.method === "automatic") {
            await markChannelSent(savedRealisation.id, "emailAvis");
            emailMessage = ` L'email d'avis a été envoyé automatiquement à ${email}.`;
          } else if (result.method === "manual") {
            await markChannelSent(savedRealisation.id, "emailAvis");
            emailMessage = " L'email d'avis a été envoyé.";
          } else {
            emailMessage = " L'envoi de l'email a été annulé, tu pourras le refaire depuis la fiche.";
          }
        } catch (emailError) {
          emailMessage = ` (email non envoyé : ${emailError.message})`;
        }
      }

      setSaved(true);
      setSavedRealisation(savedRealisation);
      if (emailMessage) Alert.alert("Email avis Google", emailMessage.trim());
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible d'enregistrer cette réalisation.");
    } finally {
      setPublishing(false);
    }
  };

  const handleShare = async (channelId, text) => {
    setSharingChannel(channelId);
    try {
      const shared = await shareRealisation({
        realisationId: savedRealisation.id,
        channel: channelId,
        content: text,
        pageUrl: savedRealisation.wordpress_url || null,
      });
      if (shared) {
        await markChannelSent(savedRealisation.id, channelId);
        setSavedRealisation((r) => ({ ...r, sent_channels: [...new Set([...(r.sent_channels || []), channelId])] }));
      }
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible de partager pour l'instant.");
    } finally {
      setSharingChannel(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {metier.emoji} Résultat pour {email || "cette réalisation"}
        </Text>
        {content._demo && (
          <Text style={styles.demoNotice}>
            Mode démo — configure ta clé API dans .env pour une vraie génération IA basée sur tes photos.
          </Text>
        )}

        {showFacebook && <PlatformBlock icon="📘" title="Facebook" value={facebook} onChange={setFacebook} />}
        {showInstagram && <PlatformBlock icon="📸" title="Instagram" value={instagram} onChange={setInstagram} />}
        {showLinkedin && <PlatformBlock icon="💼" title="LinkedIn" value={linkedin} onChange={setLinkedin} />}

        {showEmail && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>✉️ Email demande d'avis Google</Text>
            <Text style={styles.emailLabel}>Objet</Text>
            <TextInput style={styles.blockInputSmall} value={emailObjet} onChangeText={setEmailObjet} />
            <Text style={styles.emailLabel}>Corps</Text>
            <TextInput style={styles.blockInput} value={emailCorps} onChangeText={setEmailCorps} multiline />
            <Text style={styles.emailNote}>
              Cet email partira automatiquement à la validation si l'envoi automatique est configuré (voir
              README), sinon ton appli mail s'ouvrira.
            </Text>
            {!googleReviewLink && (
              <View style={styles.reviewLinkWarning}>
                <Text style={styles.reviewLinkWarningText}>
                  ⚠️ Aucun lien d'avis Google configuré : ce mail n'inclura pas de lien cliquable pour laisser
                  un avis.
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("AccountTab")}>
                  <Text style={styles.reviewLinkWarningLink}>Ajouter mon lien dans Compte</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {!saved && (
          <TouchableOpacity style={styles.validateButton} onPress={saveRealisation} disabled={publishing}>
            {publishing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.validateButtonText}>✅ Valider et publier</Text>
            )}
          </TouchableOpacity>
        )}

        {saved && (
          <View style={styles.shareSection}>
            <Text style={styles.shareTitle}>
              {showFacebook || showInstagram || showLinkedin ? "✅ Enregistré — partage maintenant" : "✅ Enregistré"}
            </Text>
            {savedRealisation?.wordpress_url && (
              <Text style={styles.wpPublishedNote}>📝 Publié aussi sur ton site : {savedRealisation.wordpress_url}</Text>
            )}
            {[
              { id: "facebook", icon: "📘", show: showFacebook, value: facebook },
              { id: "instagram", icon: "📸", show: showInstagram, value: instagram },
              { id: "linkedin", icon: "💼", show: showLinkedin, value: linkedin },
            ]
              .filter((c) => c.show)
              .map((c) => {
                const sent = savedRealisation?.sent_channels?.includes(c.id);
                const isSharing = sharingChannel === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.shareButton, sent && styles.shareButtonSent]}
                    onPress={() => handleShare(c.id, c.value)}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <ActivityIndicator color={sent ? "#166534" : "white"} size="small" />
                    ) : (
                      <Text style={[styles.shareButtonText, sent && styles.shareButtonTextSent]}>
                        {c.icon} {sent ? "Repartager" : "Partager"} sur {CHANNEL_LABELS[c.id]}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            <TouchableOpacity style={styles.doneButton} onPress={() => navigation.popToTop()}>
              <Text style={styles.doneButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CHANNEL_LABELS = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn" };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  demoNotice: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  block: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  blockTitle: { fontWeight: "700", fontSize: 15, color: "#1E293B", marginBottom: 8 },
  blockInput: {
    fontSize: 14,
    color: "#334155",
    minHeight: 70,
    textAlignVertical: "top",
  },
  blockInputSmall: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 6,
  },
  emailLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 4 },
  emailNote: { fontSize: 11, color: "#94A3B8", marginTop: 10, fontStyle: "italic" },
  reviewLinkWarning: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  reviewLinkWarningText: { color: "#92400E", fontSize: 12 },
  reviewLinkWarningLink: { color: "#92400E", fontSize: 12, fontWeight: "700", marginTop: 6 },
  validateButton: {
    marginTop: 24,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  validateButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  shareSection: {
    marginTop: 24,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  shareTitle: { fontWeight: "700", fontSize: 15, color: "#166534", marginBottom: 14 },
  wpPublishedNote: { fontSize: 12, color: "#64748B", marginTop: -6, marginBottom: 14 },
  shareButton: {
    backgroundColor: "#0F172A",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 10,
  },
  shareButtonSent: { backgroundColor: "#DCFCE7" },
  shareButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  shareButtonTextSent: { color: "#166534" },
  doneButton: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  doneButtonText: { color: "#64748B", fontWeight: "700", fontSize: 13.5 },
});
