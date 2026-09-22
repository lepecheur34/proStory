// Supabase Edge Function : page publique (avec balises Open Graph) pour une
// réalisation. En partageant CETTE page (au lieu du texte brut) sur
// Facebook/LinkedIn via leurs boîtes de dialogue officielles de partage, ces
// plateformes affichent un aperçu riche (photo + titre + description) —
// sans passer par l'API Graph, donc sans permission ni App Review requis.
//
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY sont injectées automatiquement
// par Supabase dans chaque Edge Function, pas besoin de les définir.
//
// Volontairement PUBLIC (pas de vérification JWT) : appelée par le
// navigateur d'un visiteur quelconque et par les robots d'aperçu de
// Facebook/LinkedIn, sans authentification.
//
// Sécurité : la clé service_role donne un accès complet à la base, donc on
// ne renvoie ici QUE les champs publics (photo, texte généré, nom
// d'entreprise) — jamais l'email du client ni aucune autre donnée privée.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// URL PUBLIQUE de cette fonction, en dur. En interne, Supabase réécrit la
// requête (préfixe /functions/v1/<nom> retiré, http au lieu de https) avant
// qu'elle n'atteigne le code ci-dessous : reconstruire og:url depuis
// req.url produit donc une URL cassée (introuvable de l'extérieur), que
// Facebook essaie ensuite de vérifier lui-même et obtient un 404 — c'est
// exactement ce qui bloquait l'aperçu.
const PUBLIC_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/realisation-page`;
const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");

function escapeHtml(value: string) {
  return (value || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

function notFound() {
  return new Response("Page introuvable.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const channel = url.searchParams.get("channel") === "linkedin" ? "linkedin" : "facebook";

  if (!id || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return notFound();
  }

  const restHeaders = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` };

  const realisationRes = await fetch(
    `${SUPABASE_URL}/rest/v1/realisations?id=eq.${encodeURIComponent(id)}&select=photo_urls,facebook,linkedin,user_id`,
    { headers: restHeaders }
  );
  const realisations = await realisationRes.json();
  const realisation = realisations?.[0];
  if (!realisation) {
    return notFound();
  }

  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${encodeURIComponent(realisation.user_id)}&select=nom_entreprise`,
    { headers: restHeaders }
  );
  const profiles = await profileRes.json();
  const entreprise = profiles?.[0]?.nom_entreprise || "Notre entreprise";

  const title = `Nouvelle réalisation — ${entreprise}`;
  const description = (realisation[channel] || realisation.facebook || realisation.linkedin || "").slice(0, 300);
  const image = realisation.photo_urls?.[0] || "";
  const pageUrl = `${PUBLIC_FUNCTION_URL}?id=${encodeURIComponent(id)}&channel=${channel}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
<meta property="og:type" content="article">
<meta property="og:url" content="${escapeHtml(pageUrl)}">
${FACEBOOK_APP_ID ? `<meta property="fb:app_id" content="${escapeHtml(FACEBOOK_APP_ID)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px 20px 48px; background: #F8FAFC; color: #0F172A; }
  img { width: 100%; border-radius: 14px; margin-bottom: 20px; display: block; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  p { font-size: 15px; line-height: 1.6; white-space: pre-wrap; color: #334155; }
  .brand { font-size: 12px; color: #94A3B8; margin-top: 32px; text-transform: uppercase; letter-spacing: 1px; }
</style>
</head>
<body>
  ${image ? `<img src="${escapeHtml(image)}" alt="">` : ""}
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <div class="brand">Publié via ProStory</div>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
});
