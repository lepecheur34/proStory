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
import { SOCIAL_PROVIDERS, saveReviewLink, fetchConnections } from "../services/socialAuthService";
import { saveWordPressConnection, disconnectWordPress, testWordPressConnection } from "../services/wordpressService";

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

// Carte pour le site WordPress de l'artisan (plugin "ProStory Connector",
// voir wordpress-plugin/) : URL du site + clé API généré par le plugin.
// Quand connecté, chaque nouvelle réalisation est aussi publiée comme un
// vrai article sur ce site, utilisé en priorité pour le partage.
//
// Le badge "Connecté" (vert) ne reflète pas juste la présence
// d'identifiants enregistrés : il ne s'affiche qu'après un vrai test de
// connexion réussi (création d'un article de test dans le Custom Post
// Type "Réalisations" du plugin). Tant que ce n'est pas testé avec succès
// dans cette session, le badge reste "Non vérifié".
function WordPressCard({ connection, userId, onSaved }) {
  const [siteUrl, setSiteUrl] = useState(connection?.wordpress_site_url || "");
  const [apiKey, setApiKey] = useState(connection?.wordpress_api_key || "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setSiteUrl(connection?.wordpress_site_url || "");
    setApiKey(connection?.wordpress_api_key || "");
    setVerified(false);
  }, [connection?.wordpress_site_url, connection?.wordpress_api_key]);

  const isConfigured = Boolean(connection?.wordpress_site_url && connection?.wordpress_api_key);
  const dirty =
    siteUrl.trim() !== (connection?.wordpress_site_url || "") || apiKey.trim() !== (connection?.wordpress_api_key || "");

  const runTest = async (siteUrlToTest, apiKeyToTest) => {
    setTesting(true);
    try {
      const result = await testWordPressConnection({ siteUrl: siteUrlToTest, apiKey: apiKeyToTest });
      setVerified(true);
      Alert.alert("Connexion vérifiée ✅", `Un article de test a été créé sur ton site :\n${result.url}`);
    } catch (e) {
      setVerified(false);
      Alert.alert("Connexion impossible", e.message || "Vérifie l'URL du site et la clé API.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!siteUrl.trim() || !apiKey.trim()) {
      Alert.alert("Champs manquants", "Renseigne l'URL du site et la clé API (visibles dans Réglages > ProStory sur ton site).");
      return;
    }
    setSaving(true);
    try {
      await saveWordPressConnection(userId, { siteUrl: siteUrl.trim(), apiKey: apiKey.trim() });
      await onSaved();
      await runTest(siteUrl.trim(), apiKey.trim());
    } catch (e) {
      Alert.alert("Impossible d'enregistrer", e.message || "Réessaie plus tard.");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert("Déconnecter ce site ?", "", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          try {
            await disconnectWordPress(userId);
            await onSaved();
          } catch (e) {
            Alert.alert("Impossible", e.message || "Réessaie plus tard.");
          }
        },
      },
    ]);
  };

  const statusLabel = verified ? "✅ Connecté" : isConfigured ? "⚠️ Non vérifié" : "Non connecté";
  const statusPillStyle = verified
    ? styles.statusPillConnected
    : isConfigured
    ? styles.statusPillWarning
    : styles.statusPillDefault;
  const statusTextStyle = verified
    ? styles.statusPillTextConnected
    : isConfigured
    ? styles.statusPillTextWarning
    : styles.statusPillText;

  return (
    <View style={styles.googleCard}>
      <View style={styles.googleCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Site WordPress</Text>
          <Text style={styles.rowNote}>
            Publie automatiquement chaque réalisation comme article sur ton site (nécessite le
            plugin "ProStory Connector").
          </Text>
        </View>
        <View style={[styles.statusPill, statusPillStyle]}>
          <Text style={statusTextStyle}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.googleCardDivider} />

      <Text style={styles.reviewLinkLabel}>URL du site</Text>
      <TextInput
        style={styles.reviewLinkInput}
        placeholder="https://monsite.fr"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={siteUrl}
        onChangeText={setSiteUrl}
      />
      <Text style={styles.reviewLinkLabel}>Clé API</Text>
      <Text style={styles.reviewLinkHint}>Les deux sont visibles dans Réglages → ProStory sur ton site.</Text>
      <TextInput
        style={styles.reviewLinkInput}
        placeholder="Clé générée par le plugin"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        value={apiKey}
        onChangeText={setApiKey}
      />
      <TouchableOpacity
        style={[styles.reviewLinkSaveButton, (!dirty || saving) && styles.disabled]}
        onPress={handleSave}
        disabled={!dirty || saving}
      >
        {saving ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.reviewLinkSaveButtonText}>{isConfigured ? "Mettre à jour" : "Connecter"}</Text>
        )}
      </TouchableOpacity>
      {isConfigured && !dirty && (
        <TouchableOpacity
          style={[styles.wpTestButton, testing && styles.disabled]}
          onPress={() => runTest(connection.wordpress_site_url, connection.wordpress_api_key)}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#0F172A" size="small" />
          ) : (
            <Text style={styles.wpTestButtonText}>🔄 Tester la connexion</Text>
          )}
        </TouchableOpacity>
      )}
      {isConfigured && (
        <TouchableOpacity style={styles.wpDisconnectButton} onPress={handleDisconnect}>
          <Text style={styles.wpDisconnectButtonText}>Déconnecter ce site</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AccountScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const metier = getMetier(profile?.metier_id);
  const [connections, setConnections] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

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

        <Text style={styles.sectionTitle}>Connexions</Text>
        <Text style={styles.sectionSubtitle}>
          Facebook/Instagram/LinkedIn se partagent directement via l'app du téléphone, pas besoin de
          connexion ici. Seuls Google (lien d'avis) et ton site WordPress (publication d'articles) se
          configurent.
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
            <WordPressCard connection={getConnection("wordpress")} userId={user.id} onSaved={loadConnections} />
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
  rowLabel: { fontWeight: "700", color: "#1E293B", fontSize: 14.5 },
  rowNote: { fontSize: 11.5, color: "#94A3B8", marginTop: 2 },
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
  statusPillWarning: { backgroundColor: "#FEF3C7" },
  statusPillText: { color: "#64748B", fontWeight: "700", fontSize: 12.5 },
  statusPillTextConnected: { color: "#166534", fontWeight: "700", fontSize: 12.5 },
  statusPillTextWarning: { color: "#92400E", fontWeight: "700", fontSize: 12.5 },
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
  wpTestButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  wpTestButtonText: { color: "#0F172A", fontWeight: "700", fontSize: 12.5 },
  wpDisconnectButton: { alignItems: "center", paddingVertical: 10, marginTop: 4 },
  wpDisconnectButtonText: { color: "#DC2626", fontWeight: "700", fontSize: 12.5 },
});
