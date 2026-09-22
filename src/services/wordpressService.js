import { supabase } from "./supabaseClient";

// Connecte le site WordPress de l'artisan (installation du plugin
// "ProStory Connector" — voir wordpress-plugin/) : URL du site + clé API
// générées par le plugin, à coller ici. Appelé directement en HTTPS depuis
// l'appli (comme pour Facebook/LinkedIn), sans passer par une fonction
// Supabase : c'est la clé de l'artisan pour son propre site, pas un secret
// nous appartenant.
export async function saveWordPressConnection(userId, { siteUrl, apiKey }) {
  const { error } = await supabase.from("social_connections").upsert(
    {
      user_id: userId,
      provider: "wordpress",
      wordpress_site_url: siteUrl.trim().replace(/\/+$/, ""),
      wordpress_api_key: apiKey.trim(),
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  );
  if (error) throw error;
}

export async function disconnectWordPress(userId) {
  const { error } = await supabase
    .from("social_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "wordpress");
  if (error) throw error;
}

// Vérifie que la connexion fonctionne vraiment (pas juste que des identifiants
// sont enregistrés) : crée un vrai article de test dans le Custom Post Type
// "Réalisations" du plugin, avec un texte simple (pas besoin d'IA pour un
// test de connexion). Si l'appel réussit, l'artisan a la preuve que tout le
// pipeline fonctionne (clé API valide, Custom Post Type bien créé).
export async function testWordPressConnection({ siteUrl, apiKey }) {
  return createWordPressArticle({
    siteUrl,
    apiKey,
    title: "Test de connexion ProStory",
    content:
      "Ceci est un article de test généré automatiquement pour vérifier que ProStory est bien connecté à ce site. Tu peux le supprimer (ou le laisser, il n'apparaît pas dans tes articles classiques).",
    metaDescription: "Article de test — connexion ProStory",
  });
}

// Publie une réalisation comme article sur le site WordPress connecté.
// Retourne { id, url } (l'URL du nouvel article) fournis par le plugin.
export async function createWordPressArticle({ siteUrl, apiKey, title, content, metaDescription, imageUrl }) {
  const response = await fetch(`${siteUrl}/wp-json/prostory/v1/realisations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      content,
      meta_description: metaDescription,
      image_url: imageUrl || undefined,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Publication WordPress impossible.");
  }
  return data;
}
