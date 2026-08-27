import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password.length < 6) {
      Alert.alert("Mot de passe trop court", "Utilise au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      Alert.alert(
        "Compte créé ✅",
        "Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (e) {
      Alert.alert("Inscription impossible", e.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.title}>Créer un compte</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (6 caractères min.)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, (!email || !password || loading) && styles.disabled]}
            onPress={handleSignup}
            disabled={!email || !password || loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  title: { fontSize: 26, fontWeight: "800", color: "white", marginBottom: 24, textAlign: "center" },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.4 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { color: "#94A3B8", fontSize: 14 },
  footerLink: { color: "white", fontWeight: "700", fontSize: 14 },
});
