import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type NetlifyEvent = {
  httpMethod: string;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: "Configuration serveur incomplète (Supabase)." }),
    };
  }

  let email = "";
  let specialite: string[] = [];
  try {
    const parsed = JSON.parse(event.body ?? "{}") as { email?: unknown; specialite?: unknown };
    email = typeof parsed.email === "string" ? parsed.email.trim() : "";
    const raw = parsed.specialite;
    if (Array.isArray(raw)) {
      specialite = raw
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean);
    } else if (typeof raw === "string" && raw.trim()) {
      specialite = [raw.trim()];
    }
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Corps JSON invalide." }) };
  }

  if (!email) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Email requis." }) };
  }
  if (specialite.length === 0) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: "Au moins une spécialité est requise." }),
    };
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: "https://vertual.fr/expert/onboarding",
    data: { role: "expert", specialite },
  });

  if (error) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: error.message }),
    };
  }

  return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true }) };
};
