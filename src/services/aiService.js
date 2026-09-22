import { getMetier } from "../data/metiers";

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";

// Convertit une image locale (uri) en base64 pour l'envoyer à l'API.
async function toBase64(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildPrompt(metier, profile, hasPhotos, description) {
  const identite = profile?.nom_entreprise
    ? `L'entreprise s'appelle "${profile.nom_entreprise}"${profile.ville ? `, basée à ${profile.ville}` : ""}.`
    : "";
  const savoirFaire = profile?.description
    ? `Voici comment l'artisan décrit lui-même son savoir-faire, reprends cet esprit dans le ton : "${profile.description}"`
    : "";
  const noteArtisan = description?.trim()
    ? `L'artisan a décrit lui-même ce qu'il a fait en quelques mots, utilise ça comme base factuelle principale : "${description.trim()}"`
    : "";
  const consigne = hasPhotos
    ? "Je te donne aussi des photos de cette réalisation. Génère un contenu marketing prêt à publier, en combinant la description ci-dessus (si présente) et ce que tu vois sur les photos."
    : description?.trim()
    ? "Aucune photo n'est disponible cette fois : base-toi uniquement sur la description ci-dessus pour générer un contenu marketing prêt à publier."
    : "Aucune photo ni description n'est disponible cette fois. Génère un contenu marketing générique mais crédible pour une réalisation typique de ce métier, sans inventer de détails trop spécifiques (pas de nom de client, pas de lieu précis).";

  return `Tu es un community manager pour un(e) ${metier.label.toLowerCase()}.
Ton de la marque : ${metier.ton}.
${identite}
${savoirFaire}
${noteArtisan}
${consigne}

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte autour), au format exact suivant :

{
  "facebook": "post Facebook, chaleureux et convivial, 2-4 phrases, peut inclure des emojis",
  "instagram": "légende Instagram, courte et visuelle, avec quelques hashtags pertinents en plus de ${metier.hashtags.join(" ")}",
  "linkedin": "post LinkedIn, plus professionnel, orienté savoir-faire et sérieux, 3-5 phrases",
  "emailAvis": {
    "objet": "objet court et engageant pour un email demandant un avis Google",
    "corps": "corps d'email chaleureux, tutoiement ou vouvoiement adapté au métier, qui remercie le client et demande un avis Google avec un ton naturel, sans lien factice"
  }
}`;
}

function parseJsonResponse(text) {
  // Sécurité : on retire d'éventuels ``` autour du JSON.
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

function demoContent(metier) {
  // Contenu de démonstration utilisé si aucune clé API n'est configurée,
  // pour que l'appli reste testable immédiatement sans setup.
  return {
    facebook: `✨ Nouvelle réalisation terminée chez notre client ! Notre équipe de ${metier.label.toLowerCase()} a mis tout son savoir-faire dans ce projet. Merci pour votre confiance ! 🙌`,
    instagram: `Encore une réalisation dont on est fiers 💪 ${metier.hashtags.join(" ")}`,
    linkedin: `Nous venons de finaliser une nouvelle intervention chez un de nos clients. Ce type de projet illustre bien notre exigence de qualité et notre sérieux au quotidien. Merci à notre client pour sa confiance.`,
    emailAvis: {
      objet: "Merci pour votre confiance 🙏",
      corps: `Bonjour,\n\nMerci de nous avoir fait confiance pour cette intervention ! Si vous êtes satisfait(e) du résultat, cela nous aiderait énormément que vous preniez 30 secondes pour laisser un avis Google.\n\nMerci encore,\nL'équipe`,
    },
    _demo: true,
  };
}

// Contenu générique (aucun appel réseau, instantané) utilisé pour la
// création d'une réalisation et pour générer un canal à la volée au moment
// du partage, tant qu'il n'a pas encore de texte. La vraie génération IA
// (generateContent ci-dessous) sera rebranchée sur ce flux plus tard.
export function generateGenericContent({ metierId, description }) {
  const metier = getMetier(metierId);
  const detail = description?.trim();
  const base = detail || `une nouvelle intervention de ${metier.label.toLowerCase()}`;
  const articleIntro = base.charAt(0).toUpperCase() + base.slice(1);

  return {
    facebook: `✨ Réalisation terminée : ${base}. Notre équipe de ${metier.label.toLowerCase()} a mis tout son savoir-faire dans ce projet. Merci pour votre confiance ! 🙌`,
    instagram: `${base} 💪 ${metier.hashtags.join(" ")}`,
    linkedin: `Nous venons de finaliser une nouvelle intervention : ${base}. Ce type de projet illustre notre exigence de qualité au quotidien.`,
    emailAvis: {
      objet: "Merci pour votre confiance 🙏",
      corps: `Bonjour,\n\nMerci de nous avoir fait confiance pour cette intervention${
        detail ? ` (${detail})` : ""
      } ! Si vous êtes satisfait(e) du résultat, cela nous aiderait énormément que vous preniez 30 secondes pour laisser un avis Google.\n\nMerci encore,\nL'équipe`,
    },
    article: `${articleIntro}.\n\nRéalisation effectuée par notre équipe de ${metier.label.toLowerCase()}.`,
  };
}

export async function generateContent({ photos, metierId, profile, description }) {
  const metier = getMetier(metierId);
  const hasPhotos = photos && photos.length > 0;

  if (!API_KEY) {
    // Pas de clé configurée -> mode démo, pas d'appel réseau.
    await new Promise((r) => setTimeout(r, 900));
    return demoContent(metier);
  }

  const imageBlocks = hasPhotos
    ? await Promise.all(
        photos.map(async (uri) => ({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: await toBase64(uri),
          },
        }))
      )
    : [];

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [...imageBlocks, { type: "text", text: buildPrompt(metier, profile, hasPhotos, description) }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur API (${response.status}) : ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("Réponse IA vide");

  return parseJsonResponse(textBlock.text);
}
