import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { METIERS } from "../data/metiers";
import { useProfile } from "../context/ProfileContext";

export default function ProfileFormScreen({ navigation, route }) {
  const { saveProfile } = useProfile();
  const isEditing = Boolean(route?.params?.existingProfile);
  const existing = route?.params?.existingProfile;

  const [metierId, setMetierId] = useState(existing?.metier_id || null);
  const [nomEntreprise, setNomEntreprise] = useState(existing?.nom_entreprise || "");
  const [ville, setVille] = useState(existing?.ville || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [loading, setLoading] = useState(false);

  const canSubmit = Boolean(metierId) && !loading;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveProfile({ metierId, nomEntreprise, ville, description });
      if (isEditing) {
        Alert.alert("Profil mis à jour ✅");
        navigation.goBack();
      }
      // Sinon (premier onboarding) : la navigation bascule automatiquement
      // vers l'appli principale dès que le profil existe.
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible d'enregistrer ton profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>{isEditing ? "Modifier mon profil" : "Bienvenue 👋"}</Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "Ces infos aident l'IA à mieux écrire à ta place."
              : "Quelques infos pour que l'IA écrive vraiment comme toi."}
          </Text>

          <Text style={styles.label}>Ton métier</Text>
          <View style={styles.metierGrid}>
            {METIERS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.metierChip, metierId === m.id && styles.metierChipSelected]}
                onPress={() => setMetierId(m.id)}
              >
                <Text style={styles.metierEmoji}>{m.emoji}</Text>
                <Text style={[styles.metierLabel, metierId === m.id && styles.metierLabelSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nom de ton entreprise (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Garage Dupont"
            value={nomEntreprise}
            onChangeText={setNomEntreprise}
          />

          <Text style={styles.label}>Ville (optionnel)</Text>
          <TextInput style={styles.input} placeholder="Ex : Montpellier" value={ville} onChangeText={setVille} />

          <Text style={styles.label}>Quelques mots sur ton savoir-faire (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Ex : Spécialiste camping-cars et véhicules de loisirs depuis 15 ans, on soigne chaque intervention comme si c'était notre propre véhicule."
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={styles.hint}>
            Plus tu en dis, plus les posts et l'email généré ressembleront à ta façon de parler.
          </Text>

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? "Enregistrer" : "Commencer avec ProStory 🚀"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 8, marginTop: 18 },
  metierGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metierChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  metierChipSelected: { backgroundColor: "#0F172A", borderColor: "#0F172A" },
  metierEmoji: { fontSize: 15 },
  metierLabel: { fontSize: 13, fontWeight: "600", color: "#334155" },
  metierLabelSelected: { color: "white" },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  hint: { fontSize: 11.5, color: "#94A3B8", marginTop: 6 },
  submitButton: {
    marginTop: 28,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  disabledButton: { opacity: 0.4 },
});
