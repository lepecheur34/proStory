// Supabase Edge Function : envoie un email transactionnel via Brevo.
// La clé API Brevo reste côté serveur (Supabase secrets), jamais dans
// l'appli mobile. Déploiement et configuration : voir README.md.
//
// Appelée depuis l'appli via supabase.functions.invoke("send-review-email", {...})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_SENDER_EMAIL = Deno.env.get("BREVO_SENDER_EMAIL") || "no-reply@prostory.app";
const BREVO_SENDER_NAME = Deno.env.get("BREVO_SENDER_NAME") || "ProStory";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!BREVO_API_KEY) {
      return new Response(
        JSON.stringify({ error: "BREVO_API_KEY n'est pas configurée côté serveur (voir README)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, body, senderName } = await req.json();
    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: "Paramètres manquants (to, subject, body requis)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName || BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: `<div style="font-family: sans-serif; font-size: 15px; color: #1E293B; line-height: 1.6;">${body
          .split("\n")
          .map((line) => `<p style="margin: 0 0 12px;">${line}</p>`)
          .join("")}</div>`,
      }),
    });

    const data = await brevoResponse.json();

    if (!brevoResponse.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: brevoResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
