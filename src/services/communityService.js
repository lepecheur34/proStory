import { supabase } from "./supabaseClient";

// Lit le flux "communauté" : les réalisations que d'autres artisans ont
// choisi de rendre publiques. Passe par la vue dédiée community_realisations
// (voir supabase/schema.sql), qui expose volontairement moins de colonnes
// que la table realisations (pas d'email client, pas d'identité ni de ville
// de l'artisan) : impossible de récupérer des données sensibles même en
// interrogeant l'API directement.
export async function fetchCommunityFeed({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("community_realisations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
