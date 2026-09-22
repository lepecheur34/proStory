import { getMetier } from "../data/metiers";

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

// Appelle l'API OpenAI (Chat Completions) et retourne l'objet JSON répondu
// par le modèle. `response_format: json_object` garantit un JSON valide côté
// OpenAI (sans balises markdown à retirer), à condition que le mot "JSON"
// apparaisse dans le prompt — c'est le cas dans tous nos prompts.
async function callOpenAI(content, maxTokens) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur API (${response.status}) : ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Réponse IA vide");

  return parseJsonResponse(text);
}

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

function buildArticlePrompt(metier, profile, description) {
  const identite = profile?.nom_entreprise
    ? `L'entreprise s'appelle "${profile.nom_entreprise}"${profile.ville ? `, basée à ${profile.ville}` : ""}.`
    : "";
  const savoirFaire = profile?.description
    ? `Voici comment l'artisan décrit lui-même son savoir-faire, reprends cet esprit dans le ton : "${profile.description}"`
    : "";
  const noteArtisan = description?.trim()
    ? `L'artisan a décrit lui-même ce qu'il a fait, utilise ça comme base factuelle principale, sans inventer de détails absents (pas de nom de client, pas d'adresse précise) : "${description.trim()}"`
    : "Aucune description fournie par l'artisan : rédige un article générique mais crédible pour ce métier, sans inventer de détails trop spécifiques.";

  return `Tu es un rédacteur SEO pour le site web d'un(e) ${metier.label.toLowerCase()}.
Ton de la marque : ${metier.ton}.
${identite}
${savoirFaire}
${noteArtisan}

Rédige un article de blog optimisé SEO présentant cette réalisation, prêt à publier sur le site de l'artisan. Ton professionnel et engageant, orienté confiance/conversion pour un client potentiel, entre 150 et 250 mots, structuré en 2 à 4 paragraphes.

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte autour), au format exact suivant :

{
  "title": "titre SEO de la page (balise <title>), 50 à 60 caractères, avec le métier et un mot-clé pertinent",
  "h1": "titre affiché en haut de l'article (H1), accrocheur, peut différer légèrement du title",
  "metaDescription": "méta-description SEO, 140 à 155 caractères, incitant au clic",
  "content": "corps de l'article en HTML simple, uniquement des balises <p>, pas de <script> ni de style"
}`;
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

function demoArticleContent(metier, description) {
  // Pas de clé API configurée -> article de démonstration, pas d'appel réseau.
  const detail = description?.trim();
  const base = detail || `une nouvelle intervention de ${metier.label.toLowerCase()}`;
  const intro = base.charAt(0).toUpperCase() + base.slice(1);
  return {
    title: `${metier.label} — réalisation récente`,
    h1: `Une nouvelle réalisation signée notre équipe de ${metier.label.toLowerCase()}`,
    metaDescription: `Découvrez notre dernière réalisation en tant que ${metier.label.toLowerCase()} : ${base}.`.slice(
      0,
      155
    ),
    content: `<p>${intro}.</p><p>Réalisation effectuée par notre équipe de ${metier.label.toLowerCase()}, avec le soin et le sérieux qui nous caractérisent.</p>`,
    _demo: true,
  };
}

// Article de blog optimisé SEO (titre, H1, méta-description, corps),
// destiné à être publié sur le site WordPress connecté de l'artisan. Séparé
// de generateGenericContent (réseaux sociaux + email), qui reste instantané
// et sans appel réseau : cet article, lui, vaut la peine d'attendre un vrai
// appel IA pour être réellement optimisé SEO.
export async function generateArticleContent({ metierId, profile, description }) {
  const metier = getMetier(metierId);

  if (!API_KEY) {
    await new Promise((r) => setTimeout(r, 900));
    return demoArticleContent(metier, description);
  }

  return callOpenAI(buildArticlePrompt(metier, profile, description), 1200);
}

export async function generateContent({ photos, metierId, profile, description }) {
  const metier = getMetier(metierId);
  const hasPhotos = photos && photos.length > 0;

  if (!API_KEY) {
    // Pas de clé configurée -> mode démo, pas d'appel réseau.
    await new Promise((r) => setTimeout(r, 900));
    return demoContent(metier);
  }

  const imageParts = hasPhotos
    ? await Promise.all(
        photos.map(async (uri) => ({
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${await toBase64(uri)}` },
        }))
      )
    : [];

  return callOpenAI(
    [{ type: "text", text: buildPrompt(metier, profile, hasPhotos, description) }, ...imageParts],
    1000
  );
}
