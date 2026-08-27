import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetPassword(email.trim());
      Alert.alert("Email envoyé ✅", "Vérifie ta boîte mail pour réinitialiser ton mot de passe.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (e) {
      Alert.alert("Erreur", e.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>On t'envoie un lien de réinitialisation par email.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.button, (!email || loading) && styles.disabled]}
          onPress={handleReset}
          disabled={!email || loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Envoyer le lien</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  title: { fontSize: 24, fontWeight: "800", color: "white", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginBottom: 24 },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  button: { backgroundColor: "#16A34A", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.4 },
  link: { color: "#93C5FD", textAlign: "center", marginTop: 20, fontSize: 13 },
});
