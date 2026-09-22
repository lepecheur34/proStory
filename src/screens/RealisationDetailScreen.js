import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMetier } from "../data/metiers";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { generateContent } from "../services/aiService";
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
const ALL_CHANNEL_IDS = ["emailAvis", "facebook", "instagram", "linkedin"];

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

export default function RealisationDetailScreen({ route }) {
  const { realisationId } = route.params;
  const { realisations, markChannelSent, addChannelToRealisation } = useApp();
  const { user } = useAuth();
  const { profile } = useProfile();
  const realisation = realisations.find((r) => r.id === realisationId);
  const [sendingChannel, setSendingChannel] = useState(null);
  const [addingChannel, setAddingChannel] = useState(null);

  if (!realisation) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Cette réalisation n'est plus disponible.</Text>
      </SafeAreaView>
    );
  }

  const metier = getMetier(realisation.metier_id);
  const sentChannels = realisation.sent_channels || [];
  const photos = realisation.photo_urls || [];

  const presentChannels = [
    realisation.email_corps ? "emailAvis" : null,
    realisation.facebook ? "facebook" : null,
    realisation.instagram ? "instagram" : null,
    realisation.linkedin ? "linkedin" : null,
  ].filter(Boolean);
  const missingChannels = ALL_CHANNEL_IDS.filter((c) => !presentChannels.includes(c));

  const handleSend = async (channelId) => {
    setSendingChannel(channelId);
    try {
      if (channelId === "emailAvis") {
        const result = await sendReviewEmailWithFallback({
          to: realisation.client_email,
          subject: realisation.email_objet,
          body: realisation.email_corps,
          senderName: profile?.nom_entreprise,
        });
        if (result.method === "automatic") {
          await markChannelSent(realisation.id, channelId);
          Alert.alert("Email envoyé ✅", `L'avis a été envoyé automatiquement à ${realisation.client_email}.`);
        } else if (result.method === "manual") {
          await markChannelSent(realisation.id, channelId);
        }
        return;
      }

      const shared = await shareRealisation({
        realisationId: realisation.id,
        channel: channelId,
        content: realisation[channelId],
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

  const handleAddChannel = async (channelId) => {
    setAddingChannel(channelId);
    try {
      // On régénère un contenu complet (texte seul, sans repasser les photos)
      // et on ne garde que le canal demandé.
      const content = await generateContent({
        photos: [],
        metierId: realisation.metier_id,
        profile,
        description: realisation.description,
      });
      let patch;
      if (channelId === "emailAvis") {
        const reviewLink = user ? await fetchReviewLink(user.id).catch(() => null) : null;
        const emailAvis = withReviewLink(content.emailAvis, reviewLink);
        patch = { email_objet: emailAvis.objet, email_corps: emailAvis.corps };
      } else {
        patch = { [channelId]: content[channelId] };
      }
      await addChannelToRealisation(realisation.id, patch);
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible de générer ce canal pour l'instant.");
    } finally {
      setAddingChannel(null);
    }
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
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>👤 {realisation.client_email}</Text>
          </View>
          {realisation.description ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>"{realisation.description}"</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionEyebrow}>CANAUX</Text>
        {presentChannels.map((channelId) => {
          const meta = CHANNEL_META[channelId];
          const isSent = sentChannels.includes(channelId);
          const isSending = sendingChannel === channelId;
          const content =
            channelId === "emailAvis"
              ? `${realisation.email_objet}\n\n${realisation.email_corps}`
              : realisation[channelId];

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
              <Text style={styles.channelContent} numberOfLines={4}>
                {content}
              </Text>
              <TouchableOpacity
                style={[styles.sendButton, isSent && styles.sendButtonSecondary]}
                onPress={() => handleSend(channelId)}
                disabled={isSending}
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

        {missingChannels.length > 0 && (
          <>
            <Text style={styles.sectionEyebrow}>AJOUTER UN CANAL</Text>
            <View style={styles.addChannelsWrap}>
              {missingChannels.map((channelId) => {
                const meta = CHANNEL_META[channelId];
                const isAdding = addingChannel === channelId;
                return (
                  <TouchableOpacity
                    key={channelId}
                    style={styles.addChip}
                    onPress={() => handleAddChannel(channelId)}
                    disabled={Boolean(addingChannel)}
                  >
                    {isAdding ? (
                      <ActivityIndicator size="small" color="#334155" />
                    ) : (
                      <Text style={styles.addChipText}>
                        + {meta.icon} {meta.label}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
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
  sendButton: { backgroundColor: "#0F172A", borderRadius: 11, paddingVertical: 12, alignItems: "center" },
  sendButtonSecondary: { backgroundColor: "#F1F5F9" },
  sendButtonText: { color: "white", fontWeight: "700", fontSize: 13 },
  sendButtonTextSecondary: { color: "#334155" },

  addChannelsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginHorizontal: 20 },
  addChip: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    minWidth: 90,
    alignItems: "center",
  },
  addChipText: { fontSize: 12.5, fontWeight: "700", color: "#334155" },
});
