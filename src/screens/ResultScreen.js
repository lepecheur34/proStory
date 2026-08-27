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

// Associe chaque identifiant de canal choisi à l'écran à son provider
// social (pour vérifier la connexion) — non listé pour l'email, pas concerné.
const SOCIAL_BY_CHANNEL = { facebook: "facebook", instagram: "facebook", linkedin: "linkedin" };

export default function ResultScreen({ route, navigation }) {
  const { metierId, email, content, channels = [], description } = route.params;
  const metier = getMetier(metierId);
  const { addRealisation, markChannelSent } = useApp();
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

  useEffect(() => {
    if (!user) return;
    fetchConnections(user.id)
      .then(setConnections)
      .catch(() => setConnections([]));
  }, [user]);

  const showFacebook = channels.includes("facebook");
  const showInstagram = channels.includes("instagram");
  const showLinkedin = channels.includes("linkedin");
  const showEmail = channels.includes("emailAvis");

  const missingConnections = () => {
    const socialChannelsUsed = channels.filter((c) => SOCIAL_BY_CHANNEL[c]);
    const providersNeeded = [...new Set(socialChannelsUsed.map((c) => SOCIAL_BY_CHANNEL[c]))];
    return providersNeeded.filter((p) => !connections.some((c) => c.provider === p));
  };

  const handleValidate = async () => {
    const missing = missingConnections();
    if (missing.length > 0) {
      const labels = missing.map((p) => (p === "facebook" ? "Facebook/Instagram" : "LinkedIn")).join(" et ");
      Alert.alert(
        "Compte non connecté",
        `Tu as choisi de publier sur ${labels}, mais ce compte n'est pas encore connecté. Va dans Compte pour le connecter, ou décoche ce canal pour cette fois.`,
        [
          { text: "Décocher et continuer", onPress: () => saveRealisation() },
          { text: "Aller dans Compte", onPress: () => navigation.navigate("AccountTab") },
          { text: "Annuler", style: "cancel" },
        ]
      );
      return;
    }
    await saveRealisation();
  };

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
      Alert.alert(
        "Enregistré ✅",
        `Retrouve cette réalisation dans "Mes réalisations" pour partager sur les réseaux non connectés.${emailMessage}`,
        [{ text: "OK", onPress: () => navigation.popToTop() }]
      );
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible d'enregistrer cette réalisation.");
    } finally {
      setPublishing(false);
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
          </View>
        )}

        <TouchableOpacity style={styles.validateButton} onPress={handleValidate} disabled={saved || publishing}>
          {publishing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.validateButtonText}>{saved ? "✅ Enregistré" : "✅ Valider et publier"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  validateButton: {
    marginTop: 24,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  validateButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
});
