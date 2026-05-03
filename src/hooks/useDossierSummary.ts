import { useCallback, useMemo, useState } from "react";
import { consumeAnthropicNetlifySse } from "@/lib/anthropicNetlifyStream";

export type DossierSummaryInput = {
  id?: string;
  type_sinistre: string;
  statut: string;
  montant_estime: number | string | null | undefined;
  description?: string | null;
  assureur_compagnie_nom?: string | null;
  date_sinistre?: string | null;
  date_ouverture?: string | null;
  documents: Array<{
    nom: string;
    statut?: string | null;
    created_at?: string | null;
  }>;
};

const EXPERT_SYSTEM_PROMPT =
  "Tu es un expert d'assuré français. Analyse ce dossier de sinistre et fournis un résumé structuré en 4 points : 1) Situation actuelle, 2) Points forts du dossier, 3) Points de vigilance, 4) Prochaine étape recommandée. Sois concis et professionnel.";

const ASSURE_SYSTEM_PROMPT = `Tu es un assistant bienveillant qui aide des particuliers 
à comprendre leur situation face à leur assureur.

Tu t'adresses DIRECTEMENT à l'assuré, en "vous", 
avec un ton chaleureux, rassurant et simple.
Pas de jargon juridique, pas de termes techniques.
Ton objectif : que l'assuré se sente compris et confiant.

Réponds avec cette structure EXACTE, courte et impactante :

**Votre situation en un coup d'œil**
[1-2 phrases maximum qui résument simplement ce qui s'est passé 
et ce que l'assureur a proposé. Ton humain et direct.]

**Ce que nous avons identifié pour vous** ✨
[2-3 points positifs TRÈS courts sur le dossier, 
formulés comme des bonnes nouvelles pour l'assuré.
Ex: "Votre dossier est bien documenté"
    "Le montant proposé semble contestable"
    "Nous avons les éléments pour négocier"]

**Pour renforcer votre dossier** 📎
[1-3 suggestions de documents complémentaires utiles, 
formulées comme des conseils amicaux.
Ex: "Avez-vous des photos des dégâts ? Elles pourraient 
    nous aider à appuyer votre demande."
    "Un devis de réparation renforcerait votre position."]

**La suite** 🚀
[1 phrase d'action claire et rassurante.
Ex: "Notre expert analyse votre dossier et vous 
    contactera sous 48h."]

IMPORTANT : 
- Maximum 150 mots au total
- Zéro mention de délais légaux, d'articles de loi, 
  d'incohérences techniques
- Ne pas alarmer l'assuré avec des "points de vigilance"
- Toujours terminer sur une note positive et rassurante`;

export type UseDossierSummaryOptions = {
  audience?: "assure" | "expert";
};

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
    `- Assureur: ${input.assureur_compagnie_nom ?? ""}`,
    `- Montant estimé: ${eur(input.montant_estime)}`,
    "",
    "Description (si disponible) :",
    input.description?.trim() ? input.description.trim() : ", ",
    "",
    `Documents (${input.documents.length}) :`,
    docs || "- (aucun)",
  ].join("\n");
}

export function useDossierSummary(
  input: DossierSummaryInput | null,
  options?: UseDossierSummaryOptions,
) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audience = options?.audience ?? "expert";
  const systemPrompt = audience === "assure" ? ASSURE_SYSTEM_PROMPT : EXPERT_SYSTEM_PROMPT;

  const dossier = useMemo(() => (input ? { ...input, documents: undefined } : null), [input]);
  const documents = useMemo(() => input?.documents ?? [], [input]);
  const prompt = useMemo(() => (input ? buildUserPrompt(input) : ""), [input]);

  const generate = useCallback(async () => {
    setError(null);
    if (!input) {
      setError("Dossier indisponible.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 450,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      await consumeAnthropicNetlifySse(res, setSummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de générer le résumé.");
    } finally {
      setLoading(false);
    }
  }, [input, prompt, systemPrompt]);

  return { summary, loading, error, generate, dossier, documents, systemPrompt };
}
