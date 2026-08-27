import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { getMetier } from "../data/metiers";

function channelsCount(item) {
  const total = [item.email_corps, item.facebook, item.instagram, item.linkedin].filter(Boolean).length;
  const sent = (item.sent_channels || []).length;
  return { total, sent };
}

function formatShortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function HistoryScreen({ navigation }) {
  const { realisations } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes réalisations</Text>
        <Text style={styles.subtitle}>
          {realisations.length} réalisation{realisations.length > 1 ? "s" : ""}
        </Text>
      </View>
      <FlatList
        data={realisations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const metier = getMetier(item.metier_id);
          const { total, sent } = channelsCount(item);
          const thumb = (item.photo_urls || [])[0];
          const fullySent = total > 0 && sent === total;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("RealisationDetail", { realisationId: item.id })}
            >
              {thumb ? (
                <Image source={{ uri: thumb }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Text style={styles.thumbEmoji}>{metier.emoji}</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {metier.emoji} {metier.label}
                </Text>
                <Text style={styles.cardEmail} numberOfLines={1}>
                  {item.client_email}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>{formatShortDate(item.created_at)}</Text>
                  <View style={[styles.statusPill, fullySent && styles.statusPillDone]}>
                    <Text style={[styles.statusPillText, fullySent && styles.statusPillTextDone]}>
                      {sent}/{total}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.empty}>Aucune réalisation pour l'instant.</Text>
            <Text style={styles.emptySubtext}>Elles apparaîtront ici dès ta première publication.</Text>
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  thumb: { width: 56, height: 56, borderRadius: 12, marginRight: 14 },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbEmoji: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { fontWeight: "700", fontSize: 14.5, color: "#1E293B" },
  cardEmail: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  cardFooter: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  cardDate: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
  statusPill: { backgroundColor: "#F1F5F9", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusPillDone: { backgroundColor: "#DCFCE7" },
  statusPillText: { fontSize: 10.5, fontWeight: "700", color: "#64748B" },
  statusPillTextDone: { color: "#166534" },
  chevron: { fontSize: 22, color: "#CBD5E1", marginLeft: 6 },
  emptyState: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  empty: { textAlign: "center", color: "#334155", fontWeight: "700", fontSize: 15 },
  emptySubtext: { textAlign: "center", color: "#94A3B8", fontSize: 12.5, marginTop: 4 },
});
