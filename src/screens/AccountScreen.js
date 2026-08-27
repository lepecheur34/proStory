import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { getMetier } from "../data/metiers";
import {
  SOCIAL_PROVIDERS,
  connectProvider,
  disconnectProvider,
  saveConnection,
  fetchConnections,
} from "../services/socialAuthService";

function ProviderRow({ providerKey, provider, connection, onToggle, busy }) {
  const isConnected = Boolean(connection);
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{provider.label}</Text>
        <Text style={styles.rowNote}>{provider.note}</Text>
        {!provider.configured && (
          <Text style={styles.rowConfigWarning}>
            Non configuré côté appli ({provider.envKey} manquant dans .env)
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.rowButton, isConnected ? styles.rowButtonConnected : styles.rowButtonDefault]}
        onPress={() => onToggle(providerKey)}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={isConnected ? "#166534" : "white"} size="small" />
        ) : (
          <Text style={isConnected ? styles.rowButtonTextConnected : styles.rowButtonText}>
            {isConnected ? "✅ Connecté" : "Connecter"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function AccountScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const metier = getMetier(profile?.metier_id);
  const [connections, setConnections] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [busyProvider, setBusyProvider] = useState(null);

  const loadConnections = useCallback(async () => {
    if (!user) return;
    setLoadingList(true);
    try {
      const data = await fetchConnections(user.id);
      setConnections(data);
    } catch (e) {
      // silencieux : l'écran reste utilisable même si la table n'existe pas encore
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [loadConnections])
  );

  const getConnection = (providerKey) => connections.find((c) => c.provider === providerKey);

  const handleToggle = async (providerKey) => {
    const existing = getConnection(providerKey);
    setBusyProvider(providerKey);
    try {
      if (existing) {
        await disconnectProvider(providerKey, user.id);
      } else {
        await connectProvider(providerKey);
        await saveConnection(providerKey, user.id, user.email);
      }
      await loadConnections();
    } catch (e) {
      Alert.alert("Impossible pour l'instant", e.message || "Réessaie plus tard.");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Se déconnecter ?", "", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Mon compte</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.profileCard}>
          <Text style={styles.profileMetier}>
            {metier.emoji} {profile?.nom_entreprise || metier.label}
          </Text>
          {profile?.ville ? <Text style={styles.profileDetail}>📍 {profile.ville}</Text> : null}
          {profile?.description ? <Text style={styles.profileDetail}>{profile.description}</Text> : null}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate("EditProfile", { existingProfile: profile })}
          >
            <Text style={styles.editProfileButtonText}>✏️ Modifier mon profil</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Connexions réseaux sociaux</Text>
        <Text style={styles.sectionSubtitle}>
          Connecter un compte l'identifie sur ton profil. La publication automatique de posts
          demande en plus une validation de la plateforme (voir README) — tant que ce n'est pas
          validé, tu continueras à publier toi-même les textes générés par l'IA.
        </Text>

        {loadingList ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : (
          Object.entries(SOCIAL_PROVIDERS).map(([key, provider]) => (
            <ProviderRow
              key={key}
              providerKey={key}
              provider={provider}
              connection={getConnection(key)}
              onToggle={handleToggle}
              busy={busyProvider === key}
            />
          ))
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  email: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  profileMetier: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  profileDetail: { fontSize: 13, color: "#64748B", marginTop: 4 },
  editProfileButton: { marginTop: 12, alignSelf: "flex-start" },
  editProfileButtonText: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 6 },
  sectionSubtitle: { fontSize: 12.5, color: "#64748B", marginBottom: 16, lineHeight: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  rowLabel: { fontWeight: "700", color: "#1E293B", fontSize: 14.5 },
  rowNote: { fontSize: 11.5, color: "#94A3B8", marginTop: 2 },
  rowConfigWarning: { fontSize: 11, color: "#B45309", marginTop: 4 },
  rowButton: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, minWidth: 96, alignItems: "center" },
  rowButtonDefault: { backgroundColor: "#0F172A" },
  rowButtonConnected: { backgroundColor: "#DCFCE7" },
  rowButtonText: { color: "white", fontWeight: "700", fontSize: 12.5 },
  rowButtonTextConnected: { color: "#166534", fontWeight: "700", fontSize: 12.5 },
  signOutButton: { marginTop: 28, alignItems: "center", paddingVertical: 12 },
  signOutText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
});
