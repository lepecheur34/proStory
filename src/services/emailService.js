import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Envoie un email automatiquement via la fonction serveur Supabase, qui
// relaie vers Brevo en gardant la clé API côté serveur. Lève une erreur si
// la fonction n'est pas déployée/configurée : l'appelant peut alors basculer
// sur un envoi manuel (appli mail du téléphone) en repli.
export async function sendReviewEmailAutomatic({ to, subject, body, senderName }) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase non configuré");
  }
  const { data, error } = await supabase.functions.invoke("send-review-email", {
    body: { to, subject, body, senderName },
  });
  if (error) throw error;
  if (data?.error) {
    throw new Error(typeof data.error === "string" ? data.error : "Envoi automatique impossible");
  }
  return data;
}
