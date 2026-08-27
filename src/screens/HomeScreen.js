import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../context/ProfileContext";
import { useApp } from "../context/AppContext";
import { getMetier } from "../data/metiers";

const GOLD = "#B8935A";

function computeStats(realisations) {
  const now = new Date();
  const thisMonth = realisations.filter((r) => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  let totalChannels = 0;
  let sentChannels = 0;
  realisations.forEach((r) => {
    const available = [r.email_corps, r.facebook, r.instagram, r.linkedin].filter(Boolean).length;
    totalChannels += available;
    sentChannels += (r.sent_channels || []).length;
  });

  const sendRate = totalChannels > 0 ? Math.round((sentChannels / totalChannels) * 100) : null;

  return {
    total: realisations.length,
    thisMonth: thisMonth.length,
    sendRate,
  };
}

function StatCard({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { profile } = useProfile();
  const { realisations } = useApp();
  const metier = getMetier(profile?.metier_id);

  const stats = useMemo(() => computeStats(realisations), [realisations]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>{profile?.ville ? profile.ville.toUpperCase() : "PROSTORY"}</Text>
        <Text style={styles.greeting}>
          {metier.emoji} {profile?.nom_entreprise || metier.label}
        </Text>
        <Text style={styles.subtitle}>Prêt à valoriser ta dernière intervention ?</Text>

        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Capture", { metierId: profile?.metier_id })}
        >
          <Text style={styles.mainButtonEmoji}>📸</Text>
          <Text style={styles.mainButtonText}>Nouvelle réalisation</Text>
          <Text style={styles.mainButtonSubtext}>Quelques photos → posts + email d'avis en 1 minute</Text>
        </TouchableOpacity>

        {stats.total > 0 && (
          <>
            <Text style={styles.statsTitle}>TON ACTIVITÉ</Text>
            <View style={styles.statsRow}>
              <StatCard value={stats.total} label="Réalisations au total" />
              <StatCard value={stats.thisMonth} label="Ce mois-ci" />
              <StatCard value={stats.sendRate !== null ? `${stats.sendRate}%` : "—"} label="Canaux envoyés" />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: GOLD,
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 8,
  },
  greeting: { fontSize: 25, fontWeight: "800", color: "#0F172A", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#64748B", textAlign: "center", marginTop: 8, marginBottom: 36 },
  mainButton: {
    backgroundColor: "#0F172A",
    borderRadius: 22,
    paddingVertical: 38,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  mainButtonEmoji: { fontSize: 40, marginBottom: 10 },
  mainButtonText: { color: "white", fontWeight: "800", fontSize: 18, letterSpacing: 0.2 },
  mainButtonSubtext: { color: "#94A3B8", fontSize: 12.5, marginTop: 6, textAlign: "center", paddingHorizontal: 20 },
  statsTitle: { fontSize: 11, fontWeight: "800", color: "#94A3B8", letterSpacing: 1.2, marginTop: 36, marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 10.5, color: "#94A3B8", textAlign: "center", marginTop: 4, paddingHorizontal: 4 },
});

