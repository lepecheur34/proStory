import { Share } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

// Page publique (avec aperçu Open Graph : photo + texte) générée pour une
// réalisation — voir supabase/functions/realisation-page.
export function getPublicPageUrl(realisationId, channel) {
  return `${SUPABASE_URL}/functions/v1/realisation-page?id=${realisationId}&channel=${channel}`;
}

// Partage via le menu natif du téléphone : c'est la vraie app
// Facebook/Instagram/LinkedIn installée qui récupère l'aperçu du lien
// elle-même, exactement comme pour un article de presse partagé depuis un
// navigateur. Retourne true si l'artisan a effectivement partagé (pas
// annulé).
//
// Si l'artisan a connecté un site WordPress, ses réalisations y sont aussi
// publiées comme de vrais articles (voir wordpressService.js) : on passe
// alors explicitement cette URL en `pageUrl` pour l'utiliser à la place de
// la page technique générée par Supabase.
export async function shareRealisation({ realisationId, channel, content, pageUrl }) {
  const url = pageUrl || getPublicPageUrl(realisationId, channel);
  const result = await Share.share({ message: `${content}\n\n${url}`, url });
  return result.action === Share.sharedAction;
}
