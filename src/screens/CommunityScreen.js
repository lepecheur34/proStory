import React, { useCallback, useState } from "react";
import { View, Text, Image, FlatList, ScrollView, StyleSheet, RefreshControl, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getMetier } from "../data/metiers";
import { fetchCommunityFeed } from "../services/communityService";

// Largeur d'une carte = largeur d'écran moins le padding horizontal de la
// liste (20 de chaque côté) : sert à donner une largeur fixe à chaque photo
// du carousel, une ScrollView horizontale ne pouvant pas utiliser "100%".
const CARD_WIDTH = Dimensions.get("window").width - 40;

function formatShortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function CommunityScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchCommunityFeed();
      setItems(data);
    } catch (e) {
      // Silencieux : le flux communauté reste secondaire, jamais bloquant.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Communauté</Text>
        <Text style={styles.subtitle}>Les réalisations partagées par les artisans ProStory</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const metier = getMetier(item.metier_id);
          const photos = item.photo_urls || [];
          return (
            <View style={styles.card}>
              {photos.length > 0 ? (
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                  {photos.map((url, i) => (
                    <Image key={i} source={{ uri: url }} style={styles.photo} />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderEmoji}>{metier.emoji}</Text>
                </View>
              )}
              {item.video_url ? (
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>🎥 Vidéo</Text>
                </View>
              ) : null}
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardMetier}>
                    {metier.emoji} {metier.label}
                  </Text>
                  <Text style={styles.cardDate}>{formatShortDate(item.created_at)}</Text>
                </View>
                {item.description ? (
                  <Text style={styles.cardDescription} numberOfLines={4}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌍</Text>
              <Text style={styles.empty}>Aucune réalisation publique pour l'instant.</Text>
              <Text style={styles.emptySubtext}>Sois le premier à partager la tienne !</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#94A3B8", marginTop: 2, fontWeight: "600" },
  list: { padding: 20, paddingTop: 12 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  photo: { width: CARD_WIDTH, aspectRatio: 16 / 10 },
  photoPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 10,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderEmoji: { fontSize: 34, opacity: 0.7 },
  videoBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  videoBadgeText: { color: "white", fontSize: 11, fontWeight: "700" },
  cardBody: { padding: 16 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardMetier: { fontWeight: "700", fontSize: 14.5, color: "#1E293B" },
  cardDate: { fontSize: 11.5, color: "#94A3B8", fontWeight: "600" },
  cardDescription: { fontSize: 13.5, color: "#475569", lineHeight: 19 },
  emptyState: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  empty: { textAlign: "center", color: "#334155", fontWeight: "700", fontSize: 15 },
  emptySubtext: { textAlign: "center", color: "#94A3B8", fontSize: 12.5, marginTop: 4 },
});
