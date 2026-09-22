import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMetier } from "../data/metiers";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { generateGenericContent } from "../services/aiService";
import { sendReviewEmailWithFallback } from "../services/emailService";
import { fetchReviewLink, withReviewLink } from "../services/socialAuthService";
import { shareRealisation } from "../services/shareService";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GOLD = "#B8935A";

const CHANNEL_META = {
  emailAvis: { icon: "✉️", label: "Email avis Google" },
  facebook: { icon: "📘", label: "Facebook" },
  instagram: { icon: "📸", label: "Instagram" },
  linkedin: { icon: "💼", label: "LinkedIn" },
};
const SOCIAL_CHANNEL_IDS = ["facebook", "instagram", "linkedin"];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

function getSendButtonLabel(channelId, isSent) {
  if (channelId === "emailAvis") return isSent ? "Renvoyer l'email" : "Envoyer l'email";
  return isSent ? "Repartager" : "Partager";
}

function formatDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${date} à ${time}`;
}

export default function RealisationDetailScreen({ route, navigation }) {
  const { realisationId } = route.params;
  const { realisations, markChannelSent, addChannelToRealisation, deleteRealisation, refresh } = useApp();
  const { user } = useAuth();
  const { profile } = useProfile();
  const realisation = realisations.find((r) => r.id === realisationId);
  const [sendingChannel, setSendingChannel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [checkingFreshList, setCheckingFreshList] = useState(!realisation);
  const [reviewEmailInput, setReviewEmailInput] = useState("");

  // Juste après création, cette fiche peut s'ouvrir avant que la liste en
  // mémoire ait fini de se synchroniser (ou après un redémarrage avec un
  // cache local périmé) : on force un rafraîchissement une fois avant de
  // conclure que la réalisation n'existe vraiment plus.
  useEffect(() => {
    if (!realisation && checkingFreshList) {
      refresh().finally(() => setCheckingFreshList(false));
    }
  }, [realisation, checkingFreshList, refresh]);

  if (!realisation) {
    return (
      <SafeAreaView style={styles.container}>
        {checkingFreshList ? (
          <ActivityIndicator style={styles.notFound} color="#0F172A" />
        ) : (
          <Text style={styles.notFound}>Cette réalisation n'est plus disponible.</Text>
        )}
      </SafeAreaView>
    );
  }

  const metier = getMetier(realisation.metier_id);
  const sentChannels = realisation.sent_channels || [];
  const photos = realisation.photo_urls || [];

  // Email avis Google et réseaux sociaux sont toujours proposés depuis cette
  // fiche : le mail peut être envoyé ici même s'il n'y avait pas d'email
  // client à la création, et le texte des réseaux est généré à la volée
  // (générique pour l'instant, IA plus tard) au moment du partage. Les
  // canaux déjà envoyés redescendent sous ceux encore en attente.
  const visibleChannels = ["emailAvis", ...SOCIAL_CHANNEL_IDS].sort(
    (a, b) => sentChannels.includes(a) - sentChannels.includes(b)
  );

  const handleSend = async (channelId) => {
    setSendingChannel(channelId);
    try {
      if (channelId === "emailAvis") {
        const targetEmail = realisation.client_email || reviewEmailInput.trim();
        if (!isValidEmail(targetEmail)) {
          Alert.alert("Email manquant", "Renseigne un email client valide pour envoyer la demande d'avis.");
          return;
        }

        let emailObjet = realisation.email_objet;
        let emailCorps = realisation.email_corps;
        if (!realisation.client_email) {
          const generic = generateGenericContent({
            metierId: realisation.metier_id,
            description: realisation.description,
          });
          emailObjet = generic.emailAvis.objet;
          emailCorps = generic.emailAvis.corps;
          await addChannelToRealisation(realisation.id, {
            client_email: targetEmail,
            email_objet: emailObjet,
            email_corps: emailCorps,
          });
        }

        const reviewLink = user ? await fetchReviewLink(user.id).catch(() => null) : null;
        const emailAvis = withReviewLink({ objet: emailObjet, corps: emailCorps }, reviewLink);

        const result = await sendReviewEmailWithFallback({
          to: targetEmail,
          subject: emailAvis.objet,
          body: emailAvis.corps,
          senderName: profile?.nom_entreprise,
        });
        if (result.method === "automatic") {
          await markChannelSent(realisation.id, channelId);
          Alert.alert("Email envoyé ✅", `L'avis a été envoyé automatiquement à ${targetEmail}.`);
        } else if (result.method === "manual") {
          await markChannelSent(realisation.id, channelId);
        }
        return;
      }

      // Pas encore de texte pour ce canal : on le génère maintenant, à
      // partir de l'article déjà créé (texte générique pour l'instant,
      // l'IA sera branchée ici plus tard), et on le sauvegarde avant de
      // partager.
      let content = realisation[channelId];
      if (!content) {
        const generic = generateGenericContent({
          metierId: realisation.metier_id,
          description: realisation.description,
        });
        content = generic[channelId];
        await addChannelToRealisation(realisation.id, { [channelId]: content });
      }

      const shared = await shareRealisation({
        realisationId: realisation.id,
        channel: channelId,
        content,
        pageUrl: realisation.wordpress_url || null,
      });
      if (shared) {
        await markChannelSent(realisation.id, channelId);
      }
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible d'envoyer pour l'instant.");
    } finally {
      setSendingChannel(null);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer cette réalisation ?",
      "Cette action est définitive. L'article déjà publié sur ton site WordPress (le cas échéant) ne sera pas supprimé, seulement retiré de ProStory.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteRealisation(realisation.id);
              navigation.goBack();
            } catch (e) {
              Alert.alert("Erreur", e.message || "Impossible de supprimer pour l'instant.");
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
          >
            {photos.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.galleryPhoto} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.galleryEmpty}>
            <Text style={styles.galleryEmptyEmoji}>{metier.emoji}</Text>
            <Text style={styles.galleryEmptyText}>Aucune photo pour cette réalisation</Text>
          </View>
        )}

        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>RÉALISATION</Text>
          <Text style={styles.title}>
            {metier.emoji} {metier.label}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📅 {formatDate(realisation.created_at)}</Text>
          </View>
          {realisation.client_email ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>👤 {realisation.client_email}</Text>
            </View>
          ) : null}
          {realisation.description ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>"{realisation.description}"</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionEyebrow}>CANAUX</Text>
        {visibleChannels.map((channelId) => {
          const meta = CHANNEL_META[channelId];
          const isSent = sentChannels.includes(channelId);
          const isSending = sendingChannel === channelId;
          const needsEmailInput = channelId === "emailAvis" && !realisation.client_email;
          const hasContent =
            channelId === "emailAvis" ? Boolean(realisation.email_objet) : Boolean(realisation[channelId]);
          const content =
            channelId === "emailAvis"
              ? `${realisation.email_objet}\n\n${realisation.email_corps}`
              : realisation[channelId];
          const canSend = channelId !== "emailAvis" || Boolean(realisation.client_email) || isValidEmail(reviewEmailInput);

          return (
            <View key={channelId} style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <View style={styles.channelHeaderLeft}>
                  <View style={styles.channelIconBadge}>
                    <Text style={styles.channelIconText}>{meta.icon}</Text>
                  </View>
                  <Text style={styles.channelLabel}>{meta.label}</Text>
                </View>
                <View style={[styles.statusBadge, isSent && styles.statusBadgeSent]}>
                  <Text style={[styles.statusText, isSent && styles.statusTextSent]}>
                    {isSent ? "Envoyé" : "En attente"}
                  </Text>
                </View>
              </View>
              {needsEmailInput ? (
                <>
                  <Text style={styles.channelHint}>
                    Renseigne l'email du client pour lui envoyer la demande d'avis Google.
                  </Text>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="client@exemple.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={reviewEmailInput}
                    onChangeText={setReviewEmailInput}
                  />
                </>
              ) : (
                <Text style={styles.channelContent} numberOfLines={4}>
                  {hasContent ? content : "Le texte sera généré au moment du partage."}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.sendButton, isSent && styles.sendButtonSecondary, !canSend && styles.sendButtonDisabled]}
                onPress={() => handleSend(channelId)}
                disabled={isSending || !canSend}
              >
                {isSending ? (
                  <ActivityIndicator color={isSent ? "#0F172A" : "white"} size="small" />
                ) : (
                  <Text style={[styles.sendButtonText, isSent && styles.sendButtonTextSecondary]}>
                    {getSendButtonLabel(channelId, isSent)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator color="#DC2626" size="small" />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️ Supprimer cette réalisation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { paddingBottom: 48 },
  notFound: { padding: 24, color: "#94A3B8", textAlign: "center" },

  gallery: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 },
  galleryPhoto: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 },
  galleryEmpty: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryEmptyEmoji: { fontSize: 40, marginBottom: 8 },
  galleryEmptyText: { color: "#94A3B8", fontSize: 12.5 },

  headerCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -28,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  eyebrow: { fontSize: 10.5, fontWeight: "800", color: GOLD, letterSpacing: 1.5, marginBottom: 6 },
  title: { fontSize: 21, fontWeight: "800", color: "#0F172A", marginBottom: 12 },
  metaRow: { marginTop: 4 },
  metaText: { fontSize: 13.5, color: "#64748B" },
  noteBox: { marginTop: 12, backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12 },
  noteText: { fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 18 },

  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1.2,
    marginTop: 28,
    marginBottom: 12,
    marginHorizontal: 20,
  },

  channelCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  channelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  channelHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  channelIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  channelIconText: { fontSize: 15 },
  channelLabel: { fontWeight: "700", fontSize: 14.5, color: "#1E293B" },
  statusBadge: { backgroundColor: "#F1F5F9", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 9 },
  statusBadgeSent: { backgroundColor: "#DCFCE7" },
  statusText: { fontSize: 10.5, fontWeight: "700", color: "#64748B" },
  statusTextSent: { color: "#166534" },
  channelContent: { fontSize: 13, color: "#475569", marginBottom: 14, lineHeight: 19 },
  channelHint: { fontSize: 12, color: "#94A3B8", marginBottom: 10 },
  emailInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  sendButton: { backgroundColor: "#0F172A", borderRadius: 11, paddingVertical: 12, alignItems: "center" },
  sendButtonSecondary: { backgroundColor: "#F1F5F9" },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { color: "white", fontWeight: "700", fontSize: 13 },
  sendButtonTextSecondary: { color: "#334155" },

  deleteButton: { alignItems: "center", paddingVertical: 16, marginTop: 24, marginHorizontal: 20 },
  deleteButtonText: { color: "#DC2626", fontWeight: "700", fontSize: 13.5 },
});
