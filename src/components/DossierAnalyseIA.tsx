import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Copy,
  FileText,
  MessageSquare,
  Scale,
  Send,
  TrendingUp,
} from "lucide-react";

const ANTHROPIC_MODEL = "claude-sonnet-4-5";

const ANALYSE_SYSTEM_PROMPT = `Tu es un expert en droit des assurances français, 
spécialisé dans la défense des assurés sinistrés.

Tu vas analyser un dossier sinistre et identifier :
1. Les points contestables dans la proposition de l'assureur
2. Les éléments manquants qui empêchent de challenger la proposition
3. Les arguments juridiques et techniques à utiliser
4. Une estimation de la marge de négociation possible

Réponds UNIQUEMENT en JSON avec cette structure exacte :
{
  "score_contestabilite": 0-100,
  "resume_situation": "2-3 phrases résumant le cas",
  "points_a_challenger": [
    {
      "titre": "titre court",
      "description": "explication détaillée",
      "impact_estime": "montant ou %",
      "priorite": "haute|moyenne|faible"
    }
  ],
  "elements_manquants": [
    {
      "element": "ce qui manque",
      "action": "ce qu'il faut demander au client",
      "bloquant": true|false
    }
  ],
  "arguments_juridiques": [
    {
      "article": "référence légale",
      "description": "comment l'utiliser"
    }
  ],
  "marge_negociation_estimee": {
    "min": 0,
    "max": 0,
    "commentaire": ""
  },
  "urgences": ["action urgente 1", "action urgente 2"]
}`;

export interface DossierAnalyseIAProps {
  dossier: {
    id: string;
    type_sinistre: string;
    montant_estime: number;
    statut: string;
    assureur?: string;
    description?: string;
    nom_assure?: string;
    prenom_assure?: string;
  };
  documents: Array<{
    id: string;
    nom: string;
    chemin?: string;
  }>;
}

type PointChallenger = {
  titre: string;
  description: string;
  impact_estime: string;
  priorite: string;
};

type ElementManquant = {
  element: string;
  action: string;
  bloquant: boolean;
};

type ArgumentJuridique = {
  article: string;
  description: string;
};

type MargeNegociation = {
  min: number;
  max: number;
  commentaire: string;
};

export type AnalyseSinistreResult = {
  score_contestabilite: number;
  resume_situation: string;
  points_a_challenger: PointChallenger[];
  elements_manquants: ElementManquant[];
  arguments_juridiques: ArgumentJuridique[];
  marge_negociation_estimee: MargeNegociation;
  urgences: string[];
};

type ChatMsg = { id: string; role: "expert" | "assistant"; text: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractJsonText(raw: string): string {
  const t = raw.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) return fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1);
  return t;
}

function asStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNum(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function normalizeAnalyse(parsed: unknown): AnalyseSinistreResult | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const score = Math.min(100, Math.max(0, asNum(o.score_contestabilite, 0)));
  const resume = asStr(o.resume_situation, "");

  const pointsRaw = Array.isArray(o.points_a_challenger) ? o.points_a_challenger : [];
  const points_a_challenger: PointChallenger[] = pointsRaw.map((p) => {
    const x = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
    return {
      titre: asStr(x.titre, "Point"),
      description: asStr(x.description, ""),
      impact_estime: asStr(x.impact_estime, "Non renseigné"),
      priorite: asStr(x.priorite, "moyenne").toLowerCase(),
    };
  });

  const manqRaw = Array.isArray(o.elements_manquants) ? o.elements_manquants : [];
  const elements_manquants: ElementManquant[] = manqRaw.map((p) => {
    const x = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
    return {
      element: asStr(x.element, "Élément"),
      action: asStr(x.action, ""),
      bloquant: asBool(x.bloquant, false),
    };
  });

  const argRaw = Array.isArray(o.arguments_juridiques) ? o.arguments_juridiques : [];
  const arguments_juridiques: ArgumentJuridique[] = argRaw.map((p) => {
    const x = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
    return {
      article: asStr(x.article, "Non renseigné"),
      description: asStr(x.description, ""),
    };
  });

  const margeObj =
    o.marge_negociation_estimee && typeof o.marge_negociation_estimee === "object"
      ? (o.marge_negociation_estimee as Record<string, unknown>)
      : {};
  const marge_negociation_estimee: MargeNegociation = {
    min: asNum(margeObj.min, 0),
    max: asNum(margeObj.max, 0),
    commentaire: asStr(margeObj.commentaire, ""),
  };

  const urgRaw = Array.isArray(o.urgences) ? o.urgences : [];
  const urgences = urgRaw.map((u) => (typeof u === "string" ? u : String(u))).filter(Boolean);

  return {
    score_contestabilite: score,
    resume_situation: resume,
    points_a_challenger,
    elements_manquants,
    arguments_juridiques,
    marge_negociation_estimee,
    urgences,
  };
}

function buildAnalyseUserMessage(dossier: DossierAnalyseIAProps["dossier"], documents: DossierAnalyseIAProps["documents"]) {
  const nom = [dossier.prenom_assure, dossier.nom_assure].filter(Boolean).join(" ").trim() || "Non renseigné";
  const assureur = dossier.assureur?.trim() || "Non renseigné";
  const description = dossier.description?.trim() || "Non renseignée";
  const docNames = documents.length ? documents.map((d) => d.nom).join(", ") : "Aucun";

  return `Voici le dossier à analyser :
- Assuré : ${nom}
- Type de sinistre : ${dossier.type_sinistre}
- Assureur : ${assureur}
- Montant proposé par l'assureur : ${dossier.montant_estime}€
- Description : ${description}
- Documents disponibles : ${docNames}

Analyse ce dossier et identifie tous les points contestables.`;
}

async function callAnthropic(options: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  max_tokens: number;
}): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Clé API Anthropic manquante (VITE_ANTHROPIC_API_KEY).");
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
      max_tokens: options.max_tokens,
      system: options.system,
      messages: options.messages,
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(bodyText || `Erreur API Anthropic (${res.status}).`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    error?: { message?: string };
  };

  if (data.error?.message) throw new Error(data.error.message);

  const text = data?.content?.find((c) => c?.type === "text")?.text?.trim() ?? "";
  if (!text) throw new Error("Réponse IA vide.");
  return text;
}

function scoreLabel(score: number): { label: string; color: string; ring: string } {
  if (score <= 40) return { label: "Faible", color: "#EF4444", ring: "rgba(239,68,68,0.25)" };
  if (score <= 70) return { label: "Modéré", color: "#F97316", ring: "rgba(249,115,22,0.25)" };
  return { label: "Élevé", color: "#22C55E", ring: "rgba(34,197,94,0.25)" };
}

function prioriteClass(p: string) {
  const x = p.toLowerCase();
  if (x === "haute") return "bg-red-100 text-red-800 border-red-200";
  if (x === "faible") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-orange-100 text-orange-800 border-orange-200";
}

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function renderInlineBold(text: string) {
  const parts: Array<string | JSX.Element> = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={`b-${m.index}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderBubbleLines(text: string) {
  return text.split(/\r?\n/).map((line, idx) => {
    const t = line.trimEnd();
    if (!t.trim()) return null;
    return (
      <p key={idx} className="mt-1 text-sm leading-relaxed first:mt-0">
        {renderInlineBold(t)}
      </p>
    );
  });
}

const SUGGESTIONS_INIT = [
  "Détaille le calcul de vétusté",
  "Quels arguments pour contester la sous-assurance ?",
  "Rédige l'introduction du rapport contradictoire",
];

const cardShell = "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";

export function DossierAnalyseIA({ dossier, documents }: DossierAnalyseIAProps) {
  const dossierId = dossier.id;
  const payloadRef = useRef({ dossier, documents });
  payloadRef.current = { dossier, documents };

  const [analyseResult, setAnalyseResult] = useState<AnalyseSinistreResult | null>(null);
  const [analyseLoading, setAnalyseLoading] = useState(false);
  const [analyseError, setAnalyseError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const runAnalyse = useCallback(async () => {
    setAnalyseError(null);
    setAnalyseResult(null);
    setAnalyseLoading(true);
    try {
      const { dossier: d, documents: docs } = payloadRef.current;
      const userContent = buildAnalyseUserMessage(d, docs);
      const raw = await callAnthropic({
        system: ANALYSE_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
        max_tokens: 4000,
      });
      const jsonStr = extractJsonText(raw);
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        throw new Error("Réponse IA : JSON invalide.");
      }
      const normalized = normalizeAnalyse(parsed);
      if (!normalized) throw new Error("Structure d'analyse inattendue.");
      setAnalyseResult(normalized);
    } catch (e) {
      setAnalyseError(e instanceof Error ? e.message : "Analyse impossible.");
      setAnalyseResult(null);
    } finally {
      setAnalyseLoading(false);
    }
  }, []);

  useEffect(() => {
    setChatMessages([]);
    setChatInput("");
    setChatError(null);
    void runAnalyse();
  }, [dossierId, runAnalyse]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, chatLoading]);

  const chatSystemPrompt = useMemo(() => {
    if (!analyseResult) return "";
    const assureur = dossier.assureur?.trim() || "Non renseigné";
    return `Tu es un expert en droit des assurances français qui aide 
un expert d'assuré à construire un dossier contradictoire.

Contexte du dossier :
- Type : ${dossier.type_sinistre}
- Assureur : ${assureur}  
- Montant proposé : ${dossier.montant_estime}€
- Analyse initiale : ${JSON.stringify(analyseResult)}

Tu peux :
1. Approfondir l'analyse sur un point spécifique
2. Suggérer des arguments supplémentaires
3. Rédiger des passages pour le rapport contradictoire
4. Calculer des montants alternatifs
5. Citer la jurisprudence pertinente

Sois précis, factuel et orienté résultat pour l'expert.`;
  }, [analyseResult, dossier.assureur, dossier.montant_estime, dossier.type_sinistre]);

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || !analyseResult) return;
    setChatError(null);
    const userMsg: ChatMsg = { id: uid(), role: "expert", text };
    const next = [...chatMessages, userMsg];
    setChatMessages(next);
    setChatInput("");
    setChatLoading(true);
    try {
      const anthropicMessages = next.map((m) => ({
        role: m.role === "expert" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
      const reply = await callAnthropic({
        system: chatSystemPrompt,
        messages: anthropicMessages,
        max_tokens: 2000,
      });
      setChatMessages((prev) => [...prev, { id: uid(), role: "assistant", text: reply }]);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Envoi impossible.");
      setChatMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setChatInput(text);
    } finally {
      setChatLoading(false);
    }
  }

  async function generateReport() {
    if (!analyseResult) return;
    setReportError(null);
    setReportOpen(true);
    setReportText("");
    setReportLoading(true);
    try {
      const convo = chatMessages
        .map((m) => `${m.role === "expert" ? "Expert" : "IA"} : ${m.text}`)
        .join("\n\n");
      const userPrompt = [
        `Analyse structurée (JSON) :`,
        JSON.stringify(analyseResult),
        "",
        `Conversation :`,
        convo || "(aucun échange)",
        "",
        `Sur la base de l'analyse et de notre conversation, 
rédige un rapport contradictoire professionnel en français.
Format : lettre formelle à l'attention de l'assureur.
Inclus : contestation point par point, références légales, 
nouvelle estimation chiffrée, délai de réponse demandé.`,
      ].join("\n");

      const text = await callAnthropic({
        system: "Tu rédiges des rapports contradictoires pour experts d'assurés en France. Style professionnel, précis.",
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: 4000,
      });
      setReportText(text);
    } catch (e) {
      setReportError(e instanceof Error ? e.message : "Génération impossible.");
    } finally {
      setReportLoading(false);
    }
  }

  async function copyReport() {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
    } catch {
      setReportError("Copie impossible. Sélectionnez le texte manuellement.");
    }
  }

  const scoreMeta = analyseResult ? scoreLabel(analyseResult.score_contestabilite) : null;

  return (
    <section className={`${cardShell} mt-6`}>
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-[#F3F4F6] pb-4">
        <Brain className="h-6 w-6 shrink-0 text-[#5B50F0]" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Analyse IA et assistant expert</h2>
          <p className="text-sm text-[#6B7280]">Contestabilité, angles juridiques et affinage par conversation.</p>
        </div>
      </div>

      {analyseError ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Erreur</p>
          <p className="mt-1">{analyseError}</p>
          <button
            type="button"
            onClick={() => void runAnalyse()}
            className="mt-3 inline-flex rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Relancer l&apos;analyse
          </button>
        </div>
      ) : null}

      {analyseLoading && !analyseResult ? (
        <div className="space-y-6 py-6">
          <p className="text-center text-sm font-medium text-[#5B50F0]">🔍 Analyse IA en cours...</p>
          <div className="flex justify-center">
            <div className="h-36 w-36 shrink-0 animate-pulse rounded-full bg-[#E5E7EB]" />
          </div>
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="h-4 animate-pulse rounded bg-[#E5E7EB]" />
            <div className="h-4 w-[83%] animate-pulse rounded bg-[#E5E7EB]" />
            <div className="h-4 w-[66%] animate-pulse rounded bg-[#E5E7EB]" />
          </div>
        </div>
      ) : null}

      {analyseResult ? (
        <div className="space-y-8">
          {analyseResult.urgences.length > 0 ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
              <p className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                🚨 Actions urgentes :
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {analyseResult.urgences.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col items-center">
            <div
              className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 bg-white"
              style={{
                borderColor: scoreMeta?.color ?? "#E5E7EB",
                boxShadow: scoreMeta ? `0 0 0 8px ${scoreMeta.ring}` : undefined,
              }}
            >
              <span className="text-[2.5rem] font-black leading-none" style={{ color: scoreMeta?.color ?? "#111827" }}>
                {analyseResult.score_contestabilite}
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Contestabilité</span>
              <span className="text-sm font-bold" style={{ color: scoreMeta?.color ?? "#111827" }}>
                {scoreMeta?.label}
              </span>
            </div>
          </div>

          <div
            className="rounded-lg border-l-4 border-[#5B50F0] px-4 py-4"
            style={{ backgroundColor: "#F8F7FF", padding: "16px" }}
          >
            <p className="text-sm leading-relaxed text-[#374151]">{analyseResult.resume_situation}</p>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#111827]">
              <span aria-hidden>⚡</span> Points à contester
            </h3>
            <div className="space-y-3">
              {analyseResult.points_a_challenger.map((p, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#E5E7EB] bg-white p-4"
                  style={{ borderRadius: "8px", padding: "16px" }}
                >
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${prioriteClass(p.priorite)}`}
                  >
                    {p.priorite}
                  </span>
                  <p className="mt-2 font-bold text-[#111827]">{p.titre}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#374151]">{p.description}</p>
                  <p className="mt-2 text-sm font-semibold text-[#10B981]">Impact estimé : {p.impact_estime}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#111827]">
              <span aria-hidden>⚠️</span> Informations à obtenir du client
            </h3>
            <div className="space-y-3">
              {analyseResult.elements_manquants.map((el, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#E5E7EB] p-4"
                  style={{
                    backgroundColor: el.bloquant ? "#FFF9EC" : "#FFFFFF",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <p className="text-sm">
                    <span aria-hidden>{el.bloquant ? "🔴" : "🟡"}</span>{" "}
                    <span className="font-bold text-[#111827]">{el.element}</span>
                  </p>
                  <p className="mt-2 text-sm text-[#6B7280]">{el.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#111827]">
              <Scale className="h-5 w-5 text-[#5B50F0]" aria-hidden />
              Arguments juridiques
            </h3>
            <div className="space-y-3">
              {analyseResult.arguments_juridiques.map((a, i) => (
                <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
                  <span className="inline-block rounded-md bg-[#EDE9FE] px-2.5 py-1 text-xs font-semibold text-[#5B50F0]">
                    {a.article}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-[#374151]">{a.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border-2 border-[#10B981]/40 bg-[#ECFDF5] p-5"
            style={{ boxShadow: "0 4px 14px rgba(16,185,129,0.12)" }}
          >
            <div className="flex items-center gap-2 text-[#065F46]">
              <TrendingUp className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold">Marge de négociation</span>
            </div>
            <p className="mt-3 text-[#10B981]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              Marge estimée : entre {eur(analyseResult.marge_negociation_estimee.min)} et {eur(analyseResult.marge_negociation_estimee.max)}
            </p>
            {analyseResult.marge_negociation_estimee.commentaire ? (
              <p className="mt-2 text-sm leading-relaxed text-[#047857]">{analyseResult.marge_negociation_estimee.commentaire}</p>
            ) : null}
          </div>

          <div className="border-t border-[#F3F4F6] pt-8">
            <div className="mb-4 flex items-start gap-2">
              <MessageSquare className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">💬 Affiner le diagnostic</h3>
                <p className="text-sm text-[#6B7280]">Posez vos questions pour approfondir l&apos;analyse</p>
              </div>
            </div>

            {chatError ? <p className="mb-3 text-sm font-medium text-red-600">{chatError}</p> : null}

            <div className="min-h-[160px] max-h-[360px] space-y-3 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-[#FAFBFF] p-4">
              {chatMessages.length === 0 && !chatLoading ? (
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS_INIT.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={chatLoading}
                      onClick={() => {
                        setChatInput(s);
                      }}
                      className="rounded-full border border-[#5B50F0]/40 bg-white px-3 py-1.5 text-left text-xs font-medium text-[#5B50F0] hover:bg-[#F5F3FF] disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}

              {chatMessages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "expert" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-[12px] px-4 py-2.5 ${
                      m.role === "expert" ? "bg-[#5B50F0] text-white" : "bg-white text-[#111827] shadow-sm"
                    }`}
                  >
                    {renderBubbleLines(m.text)}
                  </div>
                </div>
              ))}

              {chatLoading ? (
                <div className="flex justify-start">
                  <div className="rounded-[12px] bg-white px-4 py-3 text-sm shadow-sm text-[#6B7280]">Réponse en cours…</div>
                </div>
              ) : null}
              <div ref={chatBottomRef} />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendChat();
                  }
                }}
                disabled={chatLoading}
                placeholder="Votre question…"
                className="min-h-11 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20 disabled:opacity-60"
              />
              <button
                type="button"
                disabled={chatLoading || !chatInput.trim()}
                onClick={() => void sendChat()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5B50F0] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden />
                Envoyer
              </button>
            </div>
          </div>

          <div className="border-t border-[#F3F4F6] pt-6">
            <button
              type="button"
              disabled={reportLoading}
              onClick={() => void generateReport()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#5B50F0] bg-[#5B50F0] py-3 text-sm font-bold text-white hover:bg-[#4B41D5] disabled:opacity-60 sm:w-auto sm:px-8"
            >
              <FileText className="h-5 w-5" aria-hidden />
              📄 Générer le rapport contradictoire
            </button>
          </div>
        </div>
      ) : null}

      {reportOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rapport-modal-title"
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white shadow-2xl"
            style={{ padding: "40px", borderRadius: "16px" }}
          >
            <h2 id="rapport-modal-title" className="text-xl font-bold text-[#111827]">
              Rapport contradictoire
            </h2>
            {reportError ? <p className="mt-4 text-sm text-red-600">{reportError}</p> : null}
            {reportLoading ? (
              <p className="mt-6 text-sm text-[#6B7280]">Génération en cours…</p>
            ) : (
              <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{reportText}</div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!reportText}
                onClick={() => void copyReport()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#5B50F0] bg-white px-4 py-2 text-sm font-semibold text-[#5B50F0] hover:bg-[#F5F3FF] disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden />
                Copier le rapport
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportOpen(false);
                  setReportError(null);
                }}
                className="rounded-lg bg-[#F3F4F6] px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
