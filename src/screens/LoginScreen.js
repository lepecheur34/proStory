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

export default function LoginScreen({ navigation }) {
  const { signIn, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      Alert.alert("Connexion impossible", e.message || "Vérifie ton email et ton mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.logo}>🔧 ProStory</Text>
          <Text style={styles.title}>Connexion</Text>

          {!isSupabaseConfigured && (
            <Text style={styles.warning}>
              ⚠️ Supabase n'est pas encore configuré (fichier .env). Voir le README pour créer ton
              projet gratuit — sans ça, la connexion ne peut pas fonctionner.
            </Text>
          )}

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
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, (!email || !password || loading) && styles.disabled]}
            onPress={handleLogin}
            disabled={!email || !password || loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.link}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.footerLink}> S'inscrire</Text>
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
  logo: { fontSize: 22, fontWeight: "800", color: "white", textAlign: "center", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "white", marginBottom: 24, textAlign: "center" },
  warning: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 16,
  },
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
  link: { color: "#93C5FD", textAlign: "center", marginTop: 16, fontSize: 13 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { color: "#94A3B8", fontSize: 14 },
  footerLink: { color: "white", fontWeight: "700", fontSize: 14 },
});
