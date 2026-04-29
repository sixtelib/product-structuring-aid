import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send } from "lucide-react";
import {
  migrateLegacyQualificationLocalStorage,
  QUALIFICATION_STORAGE_KEYS,
} from "@/lib/qualificationLocalStorage";

type Msg = { id: string; role: "claude" | "user"; text: string };

type CollectedData = {
  type_sinistre: string;
  assureur: string;
  montant_propose: string;
  date_sinistre: string;
  description: string;
};

const EMPTY_DATA: CollectedData = {
  type_sinistre: "",
  assureur: "",
  montant_propose: "",
  date_sinistre: "",
  description: "",
};

const WELCOME = "Bonjour 👋 Quel type de sinistre avez-vous subi ?";

const SYSTEM_PROMPT = `Tu es un conseiller Vertual (assurance, France). Tu collectes les informations pour orienter l'utilisateur.

Ordre strict des questions : pose une seule question par message, dans cet ordre exact, sans en sauter une :
1) Ce que l'assureur a proposé (refus total, offre trop basse, absence de réponse, offre partielle, sinistre ignoré, ou autre).
2) Le nom de l'assureur.
3) Le montant proposé par l'assureur (ou l'ordre de grandeur).
4) La date approximative du sinistre.
5) Si l'assuré dispose de documents (police, rapport, courriers, etc.).
6) Si l'assuré a déjà tenté de contester (seul, avec un avocat, recours précédent, etc.).

Le type de sinistre peut déjà avoir été indiqué par l'utilisateur (boutons ou message) ; ne le redemande pas si tu l'as déjà.

Ne JAMAIS lister des options dans ton texte : pas de tirets, pas de listes à puces, pas d'énumération « par exemple : A, B, C ». Les choix possibles sont affichés sous forme de boutons (pills) à côté du chat ; contente-toi de poser une question courte et simple, sans proposer toi-même les réponses.

Réponds en français.
À la fin de chaque message, si tu as des infos structurées, ajoute un bloc JSON entre <data> et </data> :
{"type_sinistre":"","assureur":"","montant_propose":"","date_sinistre":"","description":""}
Remplis le champ description avec une synthèse courte incluant, quand elles sont connues : la proposition de l'assureur, les documents dont dispose l'assuré, et ses tentatives de contestation.
Quand tu peux évaluer brièvement, mets l'évaluation entre <evaluation> et </evaluation> (pourcentage de succès, 2 arguments, gain potentiel estimé en euros).
N'utilise pas le tiret long (tiret cadratin) ; préfère une virgule.

À la fin de chaque réponse, ajoute une balise cachée indiquant quelle catégorie de suggestion afficher. Format exact : <suggest>TYPE</suggest>

Types disponibles :
- <suggest>type_sinistre</suggest> → quand tu demandes le type de sinistre
- <suggest>reponse_assureur</suggest> → quand tu demandes ce que l'assureur a proposé/répondu
- <suggest>montant</suggest> → quand tu demandes un montant d'indemnisation
- <suggest>assureur</suggest> → quand tu demandes le nom de l'assureur
- <suggest>anciennete</suggest> → quand tu demandes depuis quand date le sinistre
- <suggest>none</suggest> → pour les questions ouvertes ou si aucune suggestion n'est pertinente

La balise <suggest> doit toujours être présente, même si c'est <suggest>none</suggest>.
N'affiche pas cette balise à l'utilisateur, elle sera parsée automatiquement.`;

/** Pills initiales (type de sinistre), même jeu que type_sinistre ; codées en dur, sans balise suggest sur l'accueil. */
const STARTUP_TYPE_SINISTRE_PILLS: { label: string; text: string }[] = [
  { label: "Dégât des eaux", text: "Mon sinistre est de type : Dégât des eaux" },
  { label: "Incendie", text: "Mon sinistre est de type : Incendie" },
  { label: "Tempête", text: "Mon sinistre est de type : Tempête" },
  { label: "Accident auto", text: "Mon sinistre est de type : Accident auto" },
  { label: "Multirisque", text: "Mon sinistre est de type : Multirisque habitation" },
  { label: "Autre", text: "Mon sinistre est de type : Autre" },
];

function uid() {
  return Math.random().toString(36).slice(2);
}

function parseClaudeResponse(text: string) {
  const dataMatch = text.match(/<data>([\s\S]*?)<\/data>/i);
  const evalMatch = text.match(/<evaluation>([\s\S]*?)<\/evaluation>/i);
  let parsedData: Partial<CollectedData> | null = null;
  let evaluation: string | null = null;
  if (dataMatch?.[1]) {
    try {
      parsedData = JSON.parse(dataMatch[1]) as Partial<CollectedData>;
    } catch {
      parsedData = null;
    }
  }
  if (evalMatch?.[1]) evaluation = evalMatch[1].trim();
  const cleanText = text
    .replace(/<data>[\s\S]*?<\/data>/gi, "")
    .replace(/<evaluation>[\s\S]*?<\/evaluation>/gi, "")
    .trim();
  return { cleanText, parsedData, evaluation };
}

function suggestionsFromLastClaude(text: string): string[] {
  const suggestMatch = text.match(/<suggest>([\s\S]*?)<\/suggest>/i);
  const suggestType = suggestMatch ? suggestMatch[1].trim().toLowerCase() : "none";

  const suggestionSets: Record<string, string[]> = {
    type_sinistre: ["Dégât des eaux", "Incendie", "Tempête", "Accident auto", "Multirisque", "Autre"],
    reponse_assureur: [
      "Refus total",
      "Offre trop basse",
      "Pas encore de réponse",
      "Offre partielle",
      "Sinistre ignoré",
    ],
    montant: [
      "Moins de 1 000€",
      "1 000€ à 5 000€",
      "5 000€ à 20 000€",
      "20 000€ à 50 000€",
      "Plus de 50 000€",
    ],
    assureur: ["AXA", "MAAF", "Allianz", "MMA", "Groupama", "Macif", "MAIF", "Autre assureur"],
    anciennete: ["Moins d'1 mois", "1 à 3 mois", "3 à 6 mois", "Plus de 6 mois"],
    none: [],
  };

  return suggestionSets[suggestType] ?? [];
}

function cleanMessageText(text: string): string {
  return text
    .replace(/<suggest>[\s\S]*?<\/suggest>/gi, "")
    .replace(/<data>[\s\S]*?<\/data>/gi, "")
    .replace(/<evaluation>[\s\S]*?<\/evaluation>/gi, "")
    .trim();
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

function renderTextBubble(text: string) {
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

export function QualificationChatbot() {
  const [messages, setMessages] = useState<Msg[]>(() => [{ id: uid(), role: "claude", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [collectedData, setCollectedData] = useState<CollectedData>(EMPTY_DATA);
  const [evaluationPreview, setEvaluationPreview] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    migrateLegacyQualificationLocalStorage();
  }, []);

  useEffect(() => {
    const lastClaude = messages.filter((m) => m.role === "claude").slice(-1)[0];
    const onlyWelcome =
      messages.length === 1 && lastClaude?.role === "claude" && lastClaude.text === WELCOME;
    if (onlyWelcome) {
      setSuggestions([]);
      return;
    }
    setSuggestions(suggestionsFromLastClaude(lastClaude?.text ?? ""));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  function mergeData(incoming: Partial<CollectedData> | null) {
    if (!incoming) return;
    setCollectedData((prev) => ({
      type_sinistre: incoming.type_sinistre?.trim() || prev.type_sinistre,
      assureur: incoming.assureur?.trim() || prev.assureur,
      montant_propose: incoming.montant_propose?.trim() || prev.montant_propose,
      date_sinistre: incoming.date_sinistre?.trim() || prev.date_sinistre,
      description: incoming.description?.trim() || prev.description,
    }));
  }

  async function askClaude(next: Msg[]) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    if (!apiKey) throw new Error("Clé API Anthropic manquante (VITE_ANTHROPIC_API_KEY).");

    const anthropicMessages = next.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.role === "user" ? m.text : cleanMessageText(m.text),
    }));

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
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: anthropicMessages,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Erreur Anthropic (${res.status})`);
    }

    const data = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
    if (!text) throw new Error("Réponse Claude vide.");
    return text;
  }

  async function sendUserText(text: string) {
    const t = text.trim();
    if (!t || isLoading) return;

    const userMsg: Msg = { id: uid(), role: "user", text: t };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askClaude(next);
      const { cleanText, parsedData, evaluation } = parseClaudeResponse(reply);
      mergeData(parsedData);
      if (evaluation) setEvaluationPreview(evaluation);
      setMessages((prev) => [...prev, { id: uid(), role: "claude", text: cleanText }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "claude",
          text: "Je rencontre un problème temporaire. Réessayez dans quelques secondes.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function goToSignup() {
    if (typeof window === "undefined") return;
    migrateLegacyQualificationLocalStorage();
    window.localStorage.setItem(QUALIFICATION_STORAGE_KEYS.collectedData, JSON.stringify(collectedData));
    if (evaluationPreview) {
      window.localStorage.setItem(QUALIFICATION_STORAGE_KEYS.evaluation, evaluationPreview);
    }
  }

  const evaluationBlurPct = evaluationPreview?.match(/\b\d{1,3}\s?%/)?.[0] ?? "??%";

  const onlyWelcome =
    messages.length === 1 && messages[0]?.role === "claude" && messages[0]?.text === WELCOME;

  return (
    <div
      id="chatbot"
      className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 font-['Inter'] shadow-md"
    >
      <div className="min-h-[120px] max-h-[320px] space-y-3 overflow-y-auto bg-transparent">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-[12px] px-4 py-2.5 ${
                m.role === "user" ? "bg-[#5B50F0] text-white" : "bg-white text-foreground shadow-sm"
              }`}
            >
              {renderTextBubble(m.role === "claude" ? cleanMessageText(m.text) : m.text)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-[12px] bg-white px-4 py-3 text-sm shadow-sm text-foreground">En cours…</div>
          </div>
        )}

        {evaluationPreview && (
          <div className="relative mt-4 overflow-hidden rounded-xl border-2 border-dashed border-[#5B50F0]/40 bg-white p-5">
            <p className="text-sm font-semibold text-foreground">Votre évaluation est prête ✨</p>
            <div className="pointer-events-none mt-3 select-none">
              <div className="inline-flex items-center rounded-full bg-[#5B50F0]/15 px-3 py-1 text-xs font-semibold text-[#5B50F0]">
                Probabilité de succès: <span className="ml-1 blur-[3px]">{evaluationBlurPct}</span>
              </div>
              <div className="mt-3 text-sm text-muted-foreground [filter:blur(6px)]">{renderTextBubble(evaluationPreview)}</div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
            <div className="relative mt-4 flex flex-col items-center">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                onClick={goToSignup}
                className="inline-flex items-center justify-center rounded-lg bg-[#5B50F0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
              >
                Révéler mon évaluation →
              </Link>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!isLoading && onlyWelcome && (
        <div className="mt-2 flex flex-wrap gap-2 px-1 pb-2">
          {STARTUP_TYPE_SINISTRE_PILLS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => void sendUserText(p.text)}
              className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {!isLoading && !onlyWelcome && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 px-1 pb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void sendUserText(s)}
              className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          void sendUserText(input);
        }}
      >
        <textarea
          rows={1}
          style={{ resize: "none" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez votre situation…"
          autoComplete="off"
          className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-muted-foreground shadow-sm focus:border-[#5B50F0]/40 focus:ring-2 focus:ring-[#5B50F0]/10"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5B50F0] text-white transition-colors hover:bg-[#4B41D5] disabled:opacity-60"
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-2 text-right text-[10px] text-muted-foreground">Vertual n'est pas un cabinet juridique.</p>
    </div>
  );
}
