import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabaseClient";

WebBrowser.maybeCompleteAuthSession();

// Un provider est "configuré" côté appli seulement si son identifiant client
// est renseigné dans .env. Sans ça, on ne tente même pas d'ouvrir le
// navigateur : on prévient l'artisan que ce n'est pas encore prêt.
export const SOCIAL_PROVIDERS = {
  google: {
    label: "Google (avis clients)",
    envKey: "EXPO_PUBLIC_GOOGLE_CLIENT_ID",
    configured: Boolean(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID),
    supabaseProvider: "google",
    note: "Sert à identifier ta fiche Google Business Profile.",
  },
  facebook: {
    label: "Facebook",
    envKey: "EXPO_PUBLIC_FACEBOOK_APP_ID",
    configured: Boolean(process.env.EXPO_PUBLIC_FACEBOOK_APP_ID),
    supabaseProvider: "facebook",
    note: "La connexion identifie ton compte. La publication automatique de posts nécessite en plus une validation Meta (App Review) sur les permissions pages_manage_posts.",
  },
  linkedin: {
    label: "LinkedIn",
    envKey: "EXPO_PUBLIC_LINKEDIN_CLIENT_ID",
    configured: Boolean(process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID),
    supabaseProvider: "linkedin_oidc",
    note: "La connexion identifie ton compte. La publication automatique nécessite le produit \"Share on LinkedIn\" validé par LinkedIn.",
  },
};

// Lance le flux OAuth pour lier un réseau social au compte connecté.
export async function connectProvider(providerKey) {
  const provider = SOCIAL_PROVIDERS[providerKey];
  if (!provider) throw new Error("Fournisseur inconnu");
  if (!provider.configured) {
    throw new Error(
      `${provider.label} n'est pas encore configuré (variable ${provider.envKey} absente du .env). Voir le README.`
    );
  }

  const redirectTo = Linking.createURL("auth-callback");

  const { data, error } = await supabase.auth.linkIdentity({
    provider: provider.supabaseProvider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") {
    throw new Error("Connexion annulée");
  }
  return true;
}

export async function disconnectProvider(providerKey, userId) {
  const provider = SOCIAL_PROVIDERS[providerKey];
  const { error } = await supabase
    .from("social_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", providerKey);
  if (error) throw error;
  return true;
}

export async function saveConnection(providerKey, userId, accountLabel) {
  const { error } = await supabase
    .from("social_connections")
    .upsert(
      { user_id: userId, provider: providerKey, account_label: accountLabel || null, connected_at: new Date().toISOString() },
      { onConflict: "user_id,provider" }
    );
  if (error) throw error;
}

export async function fetchConnections(userId) {
  const { data, error } = await supabase
    .from("social_connections")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data || [];
}
