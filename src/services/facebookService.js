import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabaseClient";

WebBrowser.maybeCompleteAuthSession();

const GRAPH_VERSION = "v21.0";
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
const FACEBOOK_CONFIG_ID = process.env.EXPO_PUBLIC_FACEBOOK_CONFIG_ID;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Fonction serveur qui sert de redirect_uri stable pour Facebook (voir son
// propre commentaire pour le détail) — nécessaire car l'appli mobile n'a pas
// d'URL HTTPS fixe en dev (Expo Go change d'URL à chaque session).
const RELAY_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/facebook-oauth-relay` : null;

// Tronque les tokens dans les logs pour ne pas les afficher en clair en
// entier (juste de quoi vérifier qu'ils sont présents/cohérents).
function short(value) {
  if (!value) return value;
  return `${String(value).slice(0, 12)}…(${String(value).length} chars)`;
}

function extractQueryParams(url) {
  const raw = url.split("?")[1] || "";
  return Object.fromEntries(new URLSearchParams(raw).entries());
}

// Ouvre le dialogue OAuth Facebook nous-mêmes (sans passer par
// supabase.auth.linkIdentity) et récupère le "code" d'autorisation.
//
// Pourquoi ne pas utiliser Supabase Auth ici comme pour Google/LinkedIn :
// GoTrue (le serveur d'auth de Supabase) ajoute automatiquement le scope
// "email" à toute requête OAuth Facebook, sans moyen de le désactiver. Or
// une configuration "Facebook Login for Business" (nécessaire pour accéder
// aux Pages/Instagram) ne peut PAS inclure "email" (ce n'est pas une
// permission liée aux éléments professionnels) : Facebook rejette alors la
// requête avec "Invalid Scopes: email". On construit donc la requête
// nous-mêmes, sans passer par le mécanisme d'identité de Supabase (on n'a de
// toute façon pas besoin de lier une identité Facebook à l'utilisateur,
// juste d'obtenir un token d'accès à l'API Graph).
async function getFacebookAuthCode() {
  if (!FACEBOOK_CONFIG_ID) {
    throw new Error(
      "EXPO_PUBLIC_FACEBOOK_CONFIG_ID n'est pas configuré (voir README) : Facebook Login for Business nécessite l'ID de la configuration de connexion créée sur Meta for Developers."
    );
  }
  if (!FACEBOOK_APP_ID || !RELAY_URL) {
    throw new Error("Configuration Facebook incomplète (App ID ou URL Supabase manquants).");
  }

  const redirectTo = Linking.createURL("auth-callback");
  console.log("[FB] redirectTo =", redirectTo);
  console.log("[FB] relayUrl =", RELAY_URL);
  console.log("[FB] config_id =", FACEBOOK_CONFIG_ID);

  const authorizeUrl =
    `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth` +
    `?client_id=${encodeURIComponent(FACEBOOK_APP_ID)}` +
    `&config_id=${encodeURIComponent(FACEBOOK_CONFIG_ID)}` +
    `&redirect_uri=${encodeURIComponent(RELAY_URL)}` +
    `&response_type=code` +
    `&state=${encodeURIComponent(redirectTo)}`;
  console.log("[FB] authorizeUrl =", authorizeUrl);

  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectTo);
  console.log("[FB] WebBrowser result.type =", result.type);
  console.log("[FB] WebBrowser result.url =", result.url);
  if (result.type !== "success") {
    throw new Error("Connexion annulée");
  }

  const params = extractQueryParams(result.url);
  console.log("[FB] redirect params =", params);
  if (params.error) {
    throw new Error(params.error_description || "Connexion Facebook refusée");
  }
  if (!params.code) {
    throw new Error("Facebook n'a pas renvoyé de code d'autorisation. Réessaie.");
  }
  return params.code;
}

// Lance le flux complet de connexion et retourne la liste des Pages
// gérables par l'artisan (avec leur compte Instagram lié, s'il existe).
export async function fetchFacebookPages() {
  const code = await getFacebookAuthCode();
  console.log("[FB] auth code =", short(code));

  const { data, error } = await supabase.functions.invoke("facebook-connect", {
    body: { code, redirectUri: RELAY_URL },
  });
  console.log("[FB] facebook-connect invoke error =", error);
  console.log(
    "[FB] facebook-connect pages =",
    (data?.pages || []).map((p) => ({ id: p.id, name: p.name, accessToken: short(p.accessToken) }))
  );
  if (error) throw error;
  if (data?.error) {
    throw new Error(typeof data.error === "string" ? data.error : "Impossible de récupérer tes Pages Facebook.");
  }

  const pages = data?.pages || [];
  console.log("[FB] pages count =", pages.length);
  if (pages.length === 0) {
    throw new Error(
      "Aucune Page Facebook trouvée. Vérifie que tu es administrateur d'au moins une Page, et que ProStory a bien reçu l'accès à tes Pages lors de la connexion."
    );
  }
  return pages;
}

export async function saveFacebookPage(userId, page) {
  const { error } = await supabase.from("social_connections").upsert(
    {
      user_id: userId,
      provider: "facebook",
      account_label: page.name,
      facebook_page_id: page.id,
      facebook_page_name: page.name,
      facebook_page_access_token: page.accessToken,
      instagram_business_id: page.instagram?.id || null,
      instagram_username: page.instagram?.username || null,
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  );
  if (error) throw error;
}

export async function disconnectFacebookPage(userId) {
  const { error } = await supabase
    .from("social_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "facebook");
  if (error) throw error;
}

// Publie un post sur la Page Facebook connectée. Avec photo -> endpoint
// /photos (image + légende en un seul post) ; sans photo -> /feed (texte).
export async function publishToFacebookPage({ pageId, pageAccessToken, message, photoUrl }) {
  const endpoint = photoUrl
    ? `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/photos`
    : `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`;
  const body = new URLSearchParams({
    access_token: pageAccessToken,
    ...(photoUrl ? { url: photoUrl, caption: message } : { message }),
  });
  console.log("[FB publish] endpoint =", endpoint);
  console.log("[FB publish] pageId =", pageId);
  console.log("[FB publish] photoUrl =", photoUrl);
  console.log("[FB publish] message =", message);
  console.log("[FB publish] pageAccessToken =", short(pageAccessToken));
  const response = await fetch(endpoint, { method: "POST", body });
  const data = await response.json();
  console.log("[FB publish] response.status =", response.status);
  console.log("[FB publish] response.body =", JSON.stringify(data));
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Publication Facebook impossible.");
  }
  return data;
}

// Publie sur Instagram : nécessite une photo hébergée (l'API ne permet pas
// de poster du texte seul) et se fait en deux temps : création du média,
// puis publication.
export async function publishToInstagram({ igUserId, pageAccessToken, photoUrl, caption }) {
  if (!photoUrl) {
    throw new Error("Instagram nécessite au moins une photo.");
  }

  console.log("[IG publish] igUserId =", igUserId);
  console.log("[IG publish] photoUrl =", photoUrl);
  console.log("[IG publish] pageAccessToken =", short(pageAccessToken));

  const createRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${igUserId}/media`, {
    method: "POST",
    body: new URLSearchParams({ image_url: photoUrl, caption: caption || "", access_token: pageAccessToken }),
  });
  const createData = await createRes.json();
  console.log("[IG publish] /media status =", createRes.status, "body =", JSON.stringify(createData));
  if (!createRes.ok || createData.error) {
    throw new Error(createData.error?.message || "Création du média Instagram impossible.");
  }

  const publishRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${igUserId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({ creation_id: createData.id, access_token: pageAccessToken }),
  });
  const publishData = await publishRes.json();
  console.log("[IG publish] /media_publish status =", publishRes.status, "body =", JSON.stringify(publishData));
  if (!publishRes.ok || publishData.error) {
    throw new Error(publishData.error?.message || "Publication Instagram impossible.");
  }
  return publishData;
}
