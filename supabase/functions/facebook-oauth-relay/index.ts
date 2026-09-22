// Supabase Edge Function : relais de redirection OAuth Facebook.
//
// Pourquoi cette fonction existe : Facebook exige une redirect_uri HTTPS
// stable et enregistrée à l'avance. Mais l'appli mobile (Expo Go en dev)
// tourne sur une URL qui change à chaque session (exp://<ip-locale>:8081/...).
// Cette fonction sert donc de point fixe : Facebook redirige ici avec le
// code d'autorisation, et on relaie (302) vers l'URL réelle de l'appli, que
// l'on a fait transiter dans le paramètre "state" au moment d'ouvrir le
// dialogue Facebook (voir facebookService.js côté appli).
//
// Volontairement PUBLIC (pas de vérification JWT) : appelée directement par
// le navigateur de l'utilisateur suite à la redirection Facebook, sans
// aucun header d'authentification Supabase.

Deno.serve((req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const state = url.searchParams.get("state");

  if (!state) {
    return new Response("Paramètre state manquant, impossible de revenir à l'application.", { status: 400 });
  }

  let target: URL;
  try {
    // "state" contient directement l'URL de redirection de l'appli
    // (exp://... en dev, ou le scheme custom en build standalone).
    target = new URL(state);
  } catch {
    return new Response("Paramètre state invalide.", { status: 400 });
  }

  if (code) target.searchParams.set("code", code);
  if (error) target.searchParams.set("error", error);
  if (errorDescription) target.searchParams.set("error_description", errorDescription);

  return Response.redirect(target.toString(), 302);
});
