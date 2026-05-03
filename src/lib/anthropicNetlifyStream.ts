function textDeltaFromSseData(data: string): string {
  if (!data || data === "[DONE]") return "";
  try {
    const parsed = JSON.parse(data) as { delta?: { text?: string } };
    return typeof parsed.delta?.text === "string" ? parsed.delta.text : "";
  } catch {
    return "";
  }
}

/**
 * Lit le flux SSE renvoyé par `/.netlify/functions/anthropic` (proxy Anthropic `stream: true`).
 */
export async function consumeAnthropicNetlifySse(
  response: Response,
  onAccumulatedText?: (fullText: string) => void,
): Promise<string> {
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const err = new Error(bodyText || `Erreur API Anthropic (${response.status}).`) as Error & {
      status?: number;
    };
    err.status = response.status;
    throw err;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const err = new Error("Corps de réponse non lisible.") as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  let fullText = "";
  let buffer = "";
  const decoder = new TextDecoder();

  const handleLine = (line: string): boolean => {
    if (!line.startsWith("data: ")) return false;
    const data = line.slice(6).trim();
    if (data === "[DONE]") return true;
    const delta = textDeltaFromSseData(data);
    if (delta) {
      fullText += delta;
      onAccumulatedText?.(fullText);
    }
    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (value?.length) buffer += decoder.decode(value, { stream: true });
    if (done) {
      buffer += decoder.decode();
      break;
    }

    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const raw = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
      if (handleLine(line)) {
        if (!fullText.trim()) throw new Error("Réponse IA vide.");
        return fullText;
      }
    }
  }

  if (buffer.trim()) {
    const line = buffer.endsWith("\r") ? buffer.slice(0, -1) : buffer;
    if (handleLine(line)) {
      if (!fullText.trim()) throw new Error("Réponse IA vide.");
      return fullText;
    }
  }

  if (!fullText.trim()) throw new Error("Réponse IA vide.");
  return fullText;
}
