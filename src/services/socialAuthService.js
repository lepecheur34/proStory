import { supabase } from "./supabaseClient";

// Facebook/Instagram/LinkedIn se partagent directement via l'app du
// téléphone (voir shareService.js) : pas besoin d'identifier un compte au
// préalable. Seul Google reste ici, pour le lien d'avis inséré dans les
// emails envoyés aux clients.
export const SOCIAL_PROVIDERS = {
  google: {
    label: "Google avis clients",
    note: "Le lien ci-dessous est inséré automatiquement dans l'email d'avis envoyé à tes clients.",
  },
};

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
