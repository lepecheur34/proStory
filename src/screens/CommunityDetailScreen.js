import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { getMetier } from "../data/metiers";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GOLD = "#B8935A";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Fiche détail d'une réalisation de la communauté (lecture seule — pas les
// siennes) : contrairement à la carte dans le flux, on y montre la vidéo (en
// premier, si présente) et les informations du vendeur (nom d'entreprise,
// ville), volontairement absentes de la vue en liste.
export default function CommunityDetailScreen({ route }) {
  const { realisation } = route.params;
  const metier = getMetier(realisation.metier_id);
  const photos = realisation.photo_urls || [];
  const hasSellerInfo = Boolean(realisation.nom_entreprise || realisation.ville);

  const videoPlayer = useVideoPlayer(realisation.video_url || null, (player) => {
    player.loop = false;
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {realisation.video_url ? (
          <View style={styles.videoWrap}>
            <VideoView
              style={styles.video}
              player={videoPlayer}
              nativeControls
              contentFit="cover"
              allowsFullscreen
            />
          </View>
        ) : null}

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
        ) : !realisation.video_url ? (
          <View style={styles.galleryEmpty}>
            <Text style={styles.galleryEmptyEmoji}>{metier.emoji}</Text>
            <Text style={styles.galleryEmptyText}>Aucune photo pour cette réalisation</Text>
          </View>
        ) : null}

        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>COMMUNAUTÉ</Text>
          {hasSellerInfo ? (
            <>
              {realisation.nom_entreprise ? <Text style={styles.title}>{realisation.nom_entreprise}</Text> : null}
              <View style={styles.metierChip}>
                <Text style={styles.metierChipText}>
                  {metier.emoji} {metier.label}
                </Text>
              </View>
              {realisation.ville ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>📍 {realisation.ville}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.title}>{metier.label}</Text>
              <View style={styles.metierChip}>
                <Text style={styles.metierChipText}>
                  {metier.emoji} {metier.label}
                </Text>
              </View>
            </>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📅 {formatDate(realisation.created_at)}</Text>
          </View>
          {realisation.description ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>"{realisation.description}"</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { paddingBottom: 48 },

  videoWrap: { width: SCREEN_WIDTH, aspectRatio: 16 / 9, backgroundColor: "#0F172A" },
  video: { width: "100%", height: "100%" },

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
  title: { fontSize: 21, fontWeight: "800", color: "#0F172A" },
  metierChip: {
    alignSelf: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 11,
    marginTop: 8,
    marginBottom: 6,
  },
  metierChipText: { fontSize: 11.5, fontWeight: "700", color: "#334155" },
  metaRow: { marginTop: 4 },
  metaText: { fontSize: 13.5, color: "#64748B" },
  noteBox: { marginTop: 12, backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12 },
  noteText: { fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 18 },
});
