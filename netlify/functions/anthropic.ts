/** Délai d'exécution max côté Netlify (s) — évite l'erreur « Inactivity Timeout » sur les appels longs. */
export const config = {
  timeout: 30,
};

const allowedOrigins = [
  "https://vertual.fr",
  "https://www.vertual.fr",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
];

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    if (!allowedOrigins.includes(origin)) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: allowedOrigins.includes(origin) ? corsHeaders(origin) : {},
    });
  }

  if (!allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("API key not configured", {
      status: 500,
      headers: corsHeaders(origin),
    });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        ...body,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(error, {
        status: response.status,
        headers: corsHeaders(origin),
      });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        ...corsHeaders(origin),
      },
    });
  } catch {
    return new Response("Internal error", {
      status: 500,
      headers: corsHeaders(origin),
    });
  }
};
