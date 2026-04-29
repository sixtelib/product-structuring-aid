import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Paperclip, Send } from "lucide-react";

type Role = "claude" | "user";
type Message =
  | { id: string; role: Role; kind: "text"; text: string }
  | { id: string; role: "user"; kind: "file"; fileName: string; fileSize: number };

type CollectedData = {
  type_sinistre: string;
  assureur: string;
  montant_propose: string;
  date_sinistre: string;
  description: string;
};

const SYSTEM_PROMPT = `Tu es un conseiller expert en indemnisation d'assurance pour Claimeur, une plateforme française qui défend les assurés face à leurs assureurs. Ton rôle est double : qualifier le dossier ET rassurer l'assuré.

TON STYLE : empathique, expert, direct. Jamais condescendant. Comme un ami avocat qui explique les droits de l'assuré.

TON OBJECTIF : en 3-5 messages maximum, collecter ces informations :
- Type de sinistre (dégât des eaux, incendie, tempête, vol, etc.)
- Nom de l'assureur
- Montant proposé par l'assureur (ou "refus total")
- Date approximative du sinistre
- Description courte de la situation

RÈGLES :
- Le premier message doit être exactement : "Bonjour 👋 Décrivez-moi votre situation en quelques mots — type de sinistre, ce que votre assureur vous a proposé, et ce qui vous semble injuste."
- Une question à la fois maximum
- Quand tu as toutes les infos, fais une évaluation courte (2-3 phrases) et dis si le dossier mérite d'être contesté
- Termine TOUJOURS par proposer de créer un compte pour qu'un expert prenne en charge le dossier
- Ne donne JAMAIS de conseil juridique précis
- Réponds TOUJOURS en français
- N'utilise jamais le tiret long —. Utilise des virgules, des points, ou des retours à la ligne à la place.

FORMAT D'ÉVALUATION :
- Quand tu as assez d'informations pour évaluer, réponds en 2 parties :
1) Un message normal d'introduction (ex: "Voici mon évaluation de votre dossier...")
2) Puis une section entre balises <evaluation> et </evaluation> contenant :
   - un pourcentage de succès estimé (ex: "78%")
   - 2 à 3 arguments clés
   - un gain potentiel estimé en euros

EXTRACTION : À chaque message, si tu as collecté des infos structurées, inclus à la fin de ta réponse un bloc JSON caché entre les balises <data> et </data> avec les champs remplis :
{"type_sinistre": "", "assureur": "", "montant_propose": "", "date_sinistre": "", "description": ""}`;

function uid() {
  return Math.random().toString(36).slice(2);
}

const EMPTY_DATA: CollectedData = {
  type_sinistre: "",
  assureur: "",
  montant_propose: "",
  date_sinistre: "",
  description: "",
};

type PendingFile = {
  name: string;
  type: string;
  size: number;
  base64: string;
};

function parseClaudeResponse(text: string) {
  const match = text.match(/<data>([\s\S]*?)<\/data>/i);
  const evalMatch = text.match(/<evaluation>([\s\S]*?)<\/evaluation>/i);
  let parsedData: Partial<CollectedData> | null = null;
  let evaluation: string | null = null;

  if (match?.[1]) {
    try {
      parsedData = JSON.parse(match[1]) as Partial<CollectedData>;
    } catch {
      parsedData = null;
    }
  }

  if (evalMatch?.[1]) {
    evaluation = evalMatch[1].trim();
  }

  const cleanText = text
    .replace(/<data>[\s\S]*?<\/data>/gi, "")
    .replace(/<evaluation>[\s\S]*?<\/evaluation>/gi, "")
    .trim();
  return { cleanText, parsedData, evaluation };
}

function renderInlineMarkdown(text: string) {
  const nodes: Array<string | JSX.Element> = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(<strong key={`b-${match.index}`}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMarkdown(text: string) {
  return text
    .split(/\r?\n/)
    .map((raw, idx) => {
      const line = raw.trimEnd();
      if (!line.trim()) return null;
      if (line.trim() === "---") return <hr key={`hr-${idx}`} className="my-2 border-border/40" />;
      if (line.startsWith("### ")) {
        return (
          <h3 key={`h3-${idx}`} className="mt-2 text-sm font-semibold">
            {renderInlineMarkdown(line.slice(4))}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={`h2-${idx}`} className="mt-2 text-base font-semibold">
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={`h1-${idx}`} className="mt-2 text-lg font-semibold">
            {renderInlineMarkdown(line.slice(2))}
          </h1>
        );
      }
      const bullet = line.match(/^\*\s+(.*)$/);
      if (bullet) {
        return (
          <p key={`li-${idx}`} className="mt-1">
            • {renderInlineMarkdown(bullet[1])}
          </p>
        );
      }
      return (
        <p key={`p-${idx}`} className="mt-1">
          {renderInlineMarkdown(line)}
        </p>
      );
    })
    .filter(Boolean);
}

export function QualificationChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "claude",
      kind: "text",
      text: "Bonjour 👋 Décrivez-moi votre situation en quelques mots. Type de sinistre, ce que votre assureur vous a proposé, ce qui vous semble injuste.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [collectedData, setCollectedData] = useState<CollectedData>(EMPTY_DATA);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [evaluationPreview, setEvaluationPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const shouldShowSignupCta = useMemo(() => {
    if (evaluationPreview) return true;
    const lastClaude = [...messages].reverse().find((m) => m.role === "claude" && m.kind === "text");
    if (!lastClaude) return false;
    return /créer un compte|creer un compte/i.test(lastClaude.text);
  }, [messages, evaluationPreview]);

  const evaluationSuccess = useMemo(() => {
    if (!evaluationPreview) return "??%";
    return evaluationPreview.match(/\b\d{1,3}\s?%/)?.[0] ?? "??%";
  }, [evaluationPreview]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function askClaude(nextMessages: Message[]) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    if (!apiKey) throw new Error("Clé API Anthropic manquante (VITE_ANTHROPIC_API_KEY).");

    const anthropicMessages = nextMessages
      .map((m) => {
        if (m.kind === "file") {
          return {
            role: "user" as const,
            content: `L'utilisateur a joint le fichier : ${m.fileName}`,
          };
        }

        return {
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        };
      });

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

    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
    if (!text) throw new Error("Réponse Claude vide.");
    return text;
  }

  function mergeCollectedData(incoming: Partial<CollectedData> | null) {
    if (!incoming) return;
    setCollectedData((prev) => ({
      type_sinistre: incoming.type_sinistre?.trim() || prev.type_sinistre,
      assureur: incoming.assureur?.trim() || prev.assureur,
      montant_propose: incoming.montant_propose?.trim() || prev.montant_propose,
      date_sinistre: incoming.date_sinistre?.trim() || prev.date_sinistre,
      description: incoming.description?.trim() || prev.description,
    }));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setShowCategories(false);
    const userMessage: Message = { id: uid(), role: "user", kind: "text", text };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askClaude(next);
      const { cleanText, parsedData, evaluation } = parseClaudeResponse(reply);
      mergeCollectedData(parsedData);
      if (evaluation) setEvaluationPreview(evaluation);
      setMessages((prev) => [...prev, { id: uid(), role: "claude", kind: "text", text: cleanText }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "claude",
          kind: "text",
          text: "Je rencontre un problème temporaire. Réessayez dans quelques secondes.",
        },
      ]);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendPreset(text: string) {
    if (isLoading) return;
    setShowCategories(false);
    const userMessage: Message = { id: uid(), role: "user", kind: "text", text };
    const next = [...messages, userMessage];
    setMessages(next);
    setIsLoading(true);
    try {
      const reply = await askClaude(next);
      const { cleanText, parsedData, evaluation } = parseClaudeResponse(reply);
      mergeCollectedData(parsedData);
      if (evaluation) setEvaluationPreview(evaluation);
      setMessages((prev) => [...prev, { id: uid(), role: "claude", kind: "text", text: cleanText }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "claude",
          kind: "text",
          text: "Je rencontre un problème temporaire. Réessayez dans quelques secondes.",
        },
      ]);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function toDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
      reader.readAsDataURL(file);
    });
  }

  function formatBytes(size: number) {
    if (size < 1024) return `${size} o`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isLoading) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;

    try {
      setShowCategories(false);
      const base64 = await toDataUrl(file);
      const pending: PendingFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
      };
      setPendingFiles((prev) => [...prev, pending]);

      const fileMessage: Message = {
        id: uid(),
        role: "user",
        kind: "file",
        fileName: file.name,
        fileSize: file.size,
      };

      const next = [...messages, fileMessage];
      setMessages(next);
      setIsLoading(true);
      const reply = await askClaude(next);
      const { cleanText, parsedData, evaluation } = parseClaudeResponse(reply);
      mergeCollectedData(parsedData);
      if (evaluation) setEvaluationPreview(evaluation);
      setMessages((prev) => [...prev, { id: uid(), role: "claude", kind: "text", text: cleanText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "claude",
          kind: "text",
          text: "J'ai bien noté votre document. Nous pourrons l'analyser en détail après création du dossier.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function goToSignup() {
    localStorage.setItem("claimeur_collected_data", JSON.stringify(collectedData));
    if (evaluationPreview) {
      localStorage.setItem("claimeur_evaluation", evaluationPreview);
    }
    localStorage.setItem("claimeur_pending_files", JSON.stringify(pendingFiles));
  }

  return (
    <div
      id="chatbot"
      className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 font-['Inter'] shadow-md"
    >
      <div className="min-h-[120px] max-h-[320px] space-y-3 overflow-y-auto bg-transparent">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-[12px] px-4 py-2.5 text-sm leading-relaxed ${
                m.kind === "file"
                  ? "bg-white text-foreground shadow-sm"
                  : m.role === "user"
                  ? "bg-[#5B50F0] text-white"
                  : "bg-white text-foreground shadow-sm"
              }`}
            >
              {m.kind === "file" ? (
                <div className="min-w-[180px]">
                  <p className="truncate text-sm font-medium">📄 {m.fileName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatBytes(m.fileSize)}</p>
                </div>
              ) : (
                renderMarkdown(m.text)
              )}
            </div>
          </div>
        ))}

        {showCategories && messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: "🌊 Dégât des eaux", text: "Mon sinistre est de type : Dégât des eaux" },
              { label: "🔥 Incendie", text: "Mon sinistre est de type : Incendie" },
              { label: "🌪️ Tempête / Catastrophe", text: "Mon sinistre est de type : Tempête / Catastrophe" },
              { label: "🚗 Accident auto", text: "Mon sinistre est de type : Accident auto" },
              { label: "🏠 Multirisque habitation", text: "Mon sinistre est de type : Multirisque habitation" },
              { label: "📋 Autre sinistre", text: "Mon sinistre est de type : Autre sinistre" },
            ].map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => void sendPreset(c.text)}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-[12px] bg-white px-4 py-3 shadow-sm">
              <span className="inline-flex items-center gap-2 text-sm text-foreground">
                En cours d'analyse
                <span className="inline-flex">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse [animation-delay:150ms]">.</span>
                  <span className="animate-pulse [animation-delay:300ms]">.</span>
                </span>
              </span>
            </div>
          </div>
        )}

        {evaluationPreview && (
          <div className="relative mt-4 overflow-hidden rounded-xl border-2 border-dashed border-[#5B50F0]/40 bg-white p-5">
            <p className="text-sm font-semibold text-foreground">Votre évaluation est prête ✨</p>

            <div className="pointer-events-none mt-3 select-none">
              <div className="inline-flex items-center rounded-full bg-[#5B50F0]/15 px-3 py-1 text-xs font-semibold text-[#5B50F0]">
                Probabilité de succès: <span className="ml-1 blur-[3px]">{evaluationSuccess}</span>
              </div>
              <div className="mt-3 text-sm text-muted-foreground [filter:blur(6px)]">
                {renderMarkdown(evaluationPreview)}
              </div>
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
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Créez votre compte gratuit pour accéder à votre analyse complète
              </p>
              <p className="mt-1 text-center text-[11px] text-muted-foreground">
                Gratuit · Sans engagement · 2 minutes
              </p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        {shouldShowSignupCta && (
          <div className="mb-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              onClick={goToSignup}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#5B50F0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
            >
              Révéler mon analyse →
            </Link>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => void handleFileSelected(e)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[#F8F9FF] disabled:opacity-60"
            aria-label="Joindre un fichier"
            title="Joindre un PDF, JPG ou PNG (10MB max)"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            autoFocus
            id="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez votre situation…"
            className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-muted-foreground shadow-sm focus:border-[#5B50F0]/40 focus:ring-2 focus:ring-[#5B50F0]/10"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#5B50F0] text-white transition-colors hover:bg-[#4B41D5] disabled:opacity-60"
            aria-label="Envoyer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-2 text-right text-[10px] text-muted-foreground">
          Claimeur n'est pas un cabinet juridique.
        </p>
      </div>
    </div>
  );
}
