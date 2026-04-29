import { useCallback, useMemo, useState } from "react";

export type DossierSummaryInput = {
  id?: string;
  type_sinistre: string;
  statut: string;
  montant_estime: number | string | null | undefined;
  description?: string | null;
  assureur_nom?: string | null;
  date_sinistre?: string | null;
  date_ouverture?: string | null;
  documents: Array<{
    nom: string;
    statut?: string | null;
    created_at?: string | null;
  }>;
};

const SYSTEM_PROMPT =
  "Tu es un expert d'assuré français. Analyse ce dossier de sinistre et fournis un résumé structuré en 4 points : 1) Situation actuelle, 2) Points forts du dossier, 3) Points de vigilance, 4) Prochaine étape recommandée. Sois concis et professionnel.";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";

function eur(amount: number | string | null | undefined) {
  const n = amount == null ? 0 : typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

function buildUserPrompt(input: DossierSummaryInput) {
  const docs = input.documents
    .slice(0, 30)
    .map((d) => {
      const when = d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : ", ";
      const st = d.statut ?? ", ";
      return `- ${d.nom} (statut: ${st}, ajouté: ${when})`;
    })
    .join("\n");

  const opened = input.date_ouverture
    ? new Date(input.date_ouverture).toLocaleDateString("fr-FR")
    : ", ";
  const incident = input.date_sinistre ? new Date(input.date_sinistre).toLocaleDateString("fr-FR") : ", ";

  return [
    "Voici les données du dossier (France) :",
    `- ID: ${input.id ?? ", "}`,
    `- Type de sinistre: ${input.type_sinistre}`,
    `- Statut: ${input.statut}`,
    `- Date d'ouverture: ${opened}`,
    `- Date du sinistre: ${incident}`,
    `- Assureur: ${input.assureur_nom ?? ", "}`,
    `- Montant estimé: ${eur(input.montant_estime)}`,
    "",
    "Description (si disponible) :",
    input.description?.trim() ? input.description.trim() : ", ",
    "",
    `Documents (${input.documents.length}) :`,
    docs || "- (aucun)",
  ].join("\n");
}

export function useDossierSummary(input: DossierSummaryInput | null) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dossier = useMemo(() => (input ? { ...input, documents: undefined } : null), [input]);
  const documents = useMemo(() => input?.documents ?? [], [input]);
  const prompt = useMemo(() => (input ? buildUserPrompt(input) : ""), [input]);

  const generate = useCallback(async () => {
    console.log("clé API:", import.meta.env.VITE_ANTHROPIC_API_KEY);
    setError(null);
    if (!input) {
      setError("Dossier indisponible.");
      return;
    }

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
      if (!apiKey) {
        throw new Error("Clé Anthropic manquante (VITE_ANTHROPIC_API_KEY).");
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        mode: "cors",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 450,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(bodyText || `Erreur Anthropic (${res.status}).`);
      }

      const data = (await res.json()) as {
        content?: Array<{ type?: string; text?: string }>;
        error?: { message?: string };
      };

      const text = data?.content?.find((c) => c?.type === "text")?.text?.trim() ?? "";

      if (!text) throw new Error("Réponse IA vide.");
      setSummary(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de générer le résumé.");
    } finally {
      setLoading(false);
    }
  }, [input, prompt]);

  return { summary, loading, error, generate, dossier, documents, systemPrompt: SYSTEM_PROMPT };
}
