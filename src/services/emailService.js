import * as MailComposer from "expo-mail-composer";
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

// Point d'entrée unique pour envoyer l'email d'avis, utilisé aussi bien à la
// création d'une réalisation que depuis sa fiche détail. Essaie l'envoi
// automatique (Brevo) ; si ce n'est pas configuré ou échoue, bascule sur
// l'appli mail du téléphone pour que l'envoi reste toujours possible.
// Retourne { method: "automatic" | "manual" | "manual-cancelled" }.
export async function sendReviewEmailWithFallback({ to, subject, body, senderName }) {
  try {
    await sendReviewEmailAutomatic({ to, subject, body, senderName });
    return { method: "automatic" };
  } catch (autoError) {
    const available = await MailComposer.isAvailableAsync();
    if (!available) {
      throw new Error(
        "L'envoi automatique n'est pas configuré (voir README) et aucune appli mail n'est disponible sur ce téléphone."
      );
    }
    const result = await MailComposer.composeAsync({ recipients: [to], subject, body });
    if (result.status === "sent" || result.status === "saved") {
      return { method: "manual" };
    }
    return { method: "manual-cancelled" };
  }
}
