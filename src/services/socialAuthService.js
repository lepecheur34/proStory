import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabaseClient";

WebBrowser.maybeCompleteAuthSession();

// Un provider est "configuré" côté appli seulement si son identifiant client
// est renseigné dans .env. Sans ça, on ne tente même pas d'ouvrir le
// navigateur : on prévient l'artisan que ce n'est pas encore prêt.
export const SOCIAL_PROVIDERS = {
  google: {
    label: "Google avis clients",
    envKey: "EXPO_PUBLIC_GOOGLE_CLIENT_ID",
    configured: Boolean(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID),
    supabaseProvider: "google",
    note: "Le lien ci-dessous est inséré automatiquement dans l'email d'avis envoyé à tes clients.",
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

// Enregistre le lien vers la fiche d'avis (ex: lien Google Business Profile)
// indépendamment du flux OAuth : ce lien est ce qui est inséré dans l'email
// envoyé au client, donc l'artisan doit pouvoir le renseigner même si la
// connexion OAuth complète n'est pas configurée côté appli.
export async function saveReviewLink(userId, providerKey, reviewLink) {
  const { error } = await supabase
    .from("social_connections")
    .upsert(
      { user_id: userId, provider: providerKey, review_link: reviewLink || null },
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

// Récupère uniquement le lien d'avis Google (pas besoin de toute la liste
// des connexions) : utilisé au moment de générer l'email pour l'insérer.
export async function fetchReviewLink(userId, providerKey = "google") {
  const { data, error } = await supabase
    .from("social_connections")
    .select("review_link")
    .eq("user_id", userId)
    .eq("provider", providerKey)
    .maybeSingle();
  if (error) throw error;
  return data?.review_link || null;
}

// Insère le lien d'avis à la fin du corps de l'email généré par l'IA. Fait
// séparément de la génération IA elle-même : on ne fait jamais confiance au
// modèle pour recopier une URL exacte, on l'ajoute nous-mêmes.
export function withReviewLink(emailAvis, reviewLink) {
  if (!reviewLink || !emailAvis) return emailAvis;
  return { ...emailAvis, corps: `${emailAvis.corps}\n\n👉 Laisser un avis Google : ${reviewLink}` };
}
