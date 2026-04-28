/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type DossierPayload = Record<string, unknown>;
type DocumentPayload = Record<string, unknown>;

type RequestBody = {
  dossier: DossierPayload;
  documents: DocumentPayload[];
};

type AnthropicMessageResponse = {
  content?: Array<{ type: string; text?: string }>;
};

function corsHeaders(origin: string | null) {
  const defaults = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ];

  const envAllowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowed = new Set([...defaults, ...envAllowed]);
  const allowOrigin = origin && allowed.has(origin) ? origin : defaults[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function pickSummaryText(data: AnthropicMessageResponse) {
  return (data.content ?? [])
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text)
    .join("\n")
    .trim();
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const baseCors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: baseCors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...baseCors, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing ANTHROPIC_API_KEY secret" }), {
        status: 500,
        headers: { ...baseCors, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Partial<RequestBody>;
    const dossier = body.dossier ?? null;
    const documents = body.documents ?? [];
    if (!dossier || typeof dossier !== "object") {
      return new Response(JSON.stringify({ error: "Invalid body: missing dossier" }), {
        status: 400,
        headers: { ...baseCors, "Content-Type": "application/json" },
      });
    }

    const system =
      "Tu es un expert d'assuré français. Analyse ce dossier de sinistre et fournis un résumé structuré en 4 points : 1) Situation actuelle, 2) Points forts du dossier, 3) Points de vigilance, 4) Prochaine étape recommandée. Sois concis et professionnel.";

    const userPrompt = JSON.stringify({ dossier, documents }, null, 2);

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return new Response(JSON.stringify({ error: `Anthropic error (${resp.status})`, details: text || resp.statusText }), {
        status: 502,
        headers: { ...baseCors, "Content-Type": "application/json" },
      });
    }

    const data = (await resp.json()) as AnthropicMessageResponse;
    const summary = pickSummaryText(data);
    if (!summary) {
      return new Response(JSON.stringify({ error: "Empty summary" }), {
        status: 502,
        headers: { ...baseCors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { ...baseCors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...baseCors, "Content-Type": "application/json" },
    });
  }
});

