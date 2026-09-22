// Supabase Edge Function : échange le token Facebook obtenu côté appli
// (courte durée, ~1-2h) contre un token utilisateur longue durée, puis
// récupère les Pages gérées par l'artisan (et leur compte Instagram
// Business lié s'il existe). L'App Secret Facebook reste côté serveur
// (secret Supabase), jamais dans l'appli mobile — voir README.
//
// Appelée depuis l'appli via supabase.functions.invoke("facebook-connect", {...})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");
const GRAPH_VERSION = "v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return new Response(
        JSON.stringify({
          error: "FACEBOOK_APP_ID / FACEBOOK_APP_SECRET non configurés côté serveur (voir README).",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userAccessToken: providedToken, code, redirectUri } = await req.json();
    let userAccessToken = providedToken;

    // Si on reçoit un "code" d'autorisation (flux OAuth manuel, bypass de
    // Supabase Auth — voir facebookService.js), on l'échange d'abord contre
    // un token utilisateur courte durée avant de poursuivre normalement.
    if (!userAccessToken && code) {
      const codeExchangeUrl =
        `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token` +
        `?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`;
      const codeExchangeRes = await fetch(codeExchangeUrl);
      const codeExchangeData = await codeExchangeRes.json();
      console.log(
        "[facebook-connect] code exchange status =",
        codeExchangeRes.status,
        "body =",
        JSON.stringify(codeExchangeData)
      );
      if (!codeExchangeRes.ok || !codeExchangeData.access_token) {
        return new Response(
          JSON.stringify({ error: codeExchangeData.error?.message || "Échange du code impossible." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userAccessToken = codeExchangeData.access_token;
    }

    console.log("[facebook-connect] userAccessToken length =", userAccessToken?.length);
    if (!userAccessToken) {
      return new Response(JSON.stringify({ error: "userAccessToken (ou code) manquant." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Échange le token court terme contre un token utilisateur longue
    // durée (~60 jours). Nécessite l'App Secret.
    const exchangeUrl =
      `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token` +
      `?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}` +
      `&fb_exchange_token=${encodeURIComponent(userAccessToken)}`;
    console.log("[facebook-connect] exchange request to", exchangeUrl.replace(FACEBOOK_APP_SECRET, "***"));
    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();
    console.log("[facebook-connect] exchange status =", exchangeRes.status, "body =", JSON.stringify(exchangeData));
    if (!exchangeRes.ok || !exchangeData.access_token) {
      return new Response(JSON.stringify({ error: exchangeData.error?.message || "Échange du token impossible." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const longLivedToken = exchangeData.access_token;

    // 2. Liste les Pages gérées par l'utilisateur. Le token de Page renvoyé
    // ici est dérivé d'un token utilisateur longue durée : il n'expire
    // (quasi) jamais tant que l'artisan ne révoque pas l'accès. On récupère
    // aussi le compte Instagram Business lié à la Page, s'il existe.
    const pagesUrl =
      `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts` +
      `?fields=id,name,access_token,instagram_business_account{id,username}` +
      `&access_token=${encodeURIComponent(longLivedToken)}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();
    console.log("[facebook-connect] /me/accounts status =", pagesRes.status, "body =", JSON.stringify(pagesData));
    if (!pagesRes.ok) {
      return new Response(JSON.stringify({ error: pagesData.error?.message || "Impossible de récupérer les Pages." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pages = (pagesData.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      accessToken: p.access_token,
      instagram: p.instagram_business_account
        ? { id: p.instagram_business_account.id, username: p.instagram_business_account.username }
        : null,
    }));
    console.log("[facebook-connect] pages found =", pages.length);

    return new Response(JSON.stringify({ pages }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log("[facebook-connect] uncaught error =", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
