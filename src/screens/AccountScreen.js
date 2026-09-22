import React, { useCallback, useEffect, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { getMetier } from "../data/metiers";
import {
  SOCIAL_PROVIDERS,
  connectProvider,
  disconnectProvider,
  saveConnection,
  saveReviewLink,
  fetchConnections,
} from "../services/socialAuthService";
import { fetchFacebookPages, saveFacebookPage, disconnectFacebookPage } from "../services/facebookService";

// Carte unique pour Google : contrairement à Facebook/LinkedIn, ce qui compte
// ici n'est pas une identité OAuth mais le lien d'avis. L'état "connecté"
// reflète donc directement la présence de ce lien.
function GoogleReviewCard({ provider, connection, userId, onSaved }) {
  const [value, setValue] = useState(connection?.review_link || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(connection?.review_link || "");
  }, [connection?.review_link]);

  const hasLink = Boolean(connection?.review_link);
  const dirty = value.trim() !== (connection?.review_link || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveReviewLink(userId, "google", value.trim());
      await onSaved();
    } catch (e) {
      Alert.alert("Impossible d'enregistrer", e.message || "Réessaie plus tard.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.googleCard}>
      <View style={styles.googleCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>{provider.label}</Text>
          <Text style={styles.rowNote}>{provider.note}</Text>
        </View>
        <View style={[styles.statusPill, hasLink ? styles.statusPillConnected : styles.statusPillDefault]}>
          <Text style={hasLink ? styles.statusPillTextConnected : styles.statusPillText}>
            {hasLink ? "✅ Connecté" : "Non connecté"}
          </Text>
        </View>
      </View>

      <View style={styles.googleCardDivider} />

      <Text style={styles.reviewLinkLabel}>🔗 Lien pour recevoir des avis</Text>
      <Text style={styles.reviewLinkHint}>
        Va sur ta fiche Google Business Profile → "Demander des avis" → copie le lien, et colle-le
        ici. C'est ce lien qui sera inséré dans l'email envoyé à tes clients.
      </Text>
      <TextInput
        style={styles.reviewLinkInput}
        placeholder="https://g.page/r/..."
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={value}
        onChangeText={setValue}
      />
      <TouchableOpacity
        style={[styles.reviewLinkSaveButton, (!dirty || saving) && styles.disabled]}
        onPress={handleSave}
        disabled={!dirty || saving}
      >
        {saving ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.reviewLinkSaveButtonText}>{hasLink ? "Mettre à jour" : "Enregistrer"}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Carte unique pour Facebook : ce qui compte n'est pas juste une identité
// OAuth mais une Page précise (+ son compte Instagram lié le cas échéant),
// avec son token de publication. L'état "connecté" reflète la présence
// d'une Page enregistrée.
function FacebookPageCard({ connection, userId, onSaved }) {
  const [connecting, setConnecting] = useState(false);
  const isConnected = Boolean(connection?.facebook_page_id);

  const finalizePageChoice = async (page) => {
    try {
      await saveFacebookPage(userId, page);
      await onSaved();
    } catch (e) {
      Alert.alert("Impossible d'enregistrer", e.message || "Réessaie plus tard.");
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const pages = await fetchFacebookPages();
      if (pages.length === 1) {
        await finalizePageChoice(pages[0]);
        return;
      }
      Alert.alert("Choisis ta Page", "Plusieurs Pages Facebook sont liées à ton compte.", [
        ...pages.map((page) => ({ text: page.name, onPress: () => finalizePageChoice(page) })),
        { text: "Annuler", style: "cancel" },
      ]);
    } catch (e) {
      Alert.alert("Connexion impossible", e.message || "Réessaie plus tard.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert("Déconnecter cette Page ?", "Tu pourras en reconnecter une (la même ou une autre) à tout moment.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          try {
            await disconnectFacebookPage(userId);
            await onSaved();
          } catch (e) {
            Alert.alert("Impossible", e.message || "Réessaie plus tard.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.googleCard}>
      <View style={styles.googleCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Facebook (page pro)</Text>
          <Text style={styles.rowNote}>
            {isConnected
              ? `Page identifiée : "${connection.facebook_page_name}"${
                  connection.instagram_username ? ` (+ Instagram @${connection.instagram_username})` : ""
                }. La publication automatique n'est pas encore activée (Meta demande une validation
              supplémentaire) — partage les posts toi-même depuis "Mes réalisations" en un tap.`
              : "Identifie ta Page pro (préparation pour une future publication automatique). En attendant, partage les posts toi-même depuis \"Mes réalisations\"."}
          </Text>
        </View>
        <View style={[styles.statusPill, isConnected ? styles.statusPillConnected : styles.statusPillDefault]}>
          <Text style={isConnected ? styles.statusPillTextConnected : styles.statusPillText}>
            {isConnected ? "✅ Connecté" : "Non connecté"}
          </Text>
        </View>
      </View>

      <View style={styles.googleCardDivider} />

      <TouchableOpacity
        style={[styles.reviewLinkSaveButton, connecting && styles.disabled]}
        onPress={isConnected ? handleDisconnect : handleConnect}
        disabled={connecting}
      >
        {connecting ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.reviewLinkSaveButtonText}>
            {isConnected ? "Déconnecter / changer de page" : "Connecter ma page Facebook"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

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
          <>
            <GoogleReviewCard
              provider={SOCIAL_PROVIDERS.google}
              connection={getConnection("google")}
              userId={user.id}
              onSaved={loadConnections}
            />
            <FacebookPageCard connection={getConnection("facebook")} userId={user.id} onSaved={loadConnections} />
            {Object.entries(SOCIAL_PROVIDERS)
              .filter(([key]) => key !== "google" && key !== "facebook")
              .map(([key, provider]) => (
                <ProviderRow
                  key={key}
                  providerKey={key}
                  provider={provider}
                  connection={getConnection(key)}
                  onToggle={handleToggle}
                  busy={busyProvider === key}
                />
              ))}
          </>
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
  googleCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  googleCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  googleCardDivider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 14 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, minWidth: 96, alignItems: "center" },
  statusPillDefault: { backgroundColor: "#F1F5F9" },
  statusPillConnected: { backgroundColor: "#DCFCE7" },
  statusPillText: { color: "#64748B", fontWeight: "700", fontSize: 12.5 },
  statusPillTextConnected: { color: "#166534", fontWeight: "700", fontSize: 12.5 },
  reviewLinkLabel: { fontWeight: "700", color: "#1E293B", fontSize: 13.5 },
  reviewLinkHint: { fontSize: 11.5, color: "#94A3B8", marginTop: 4, marginBottom: 10, lineHeight: 16 },
  reviewLinkInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  reviewLinkSaveButton: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  reviewLinkSaveButtonText: { color: "white", fontWeight: "700", fontSize: 12.5 },
  disabled: { opacity: 0.4 },
});
