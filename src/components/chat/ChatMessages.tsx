import type { RefObject, ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export type Msg = { id: string; role: "claude" | "user"; text: string };

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

export type ChatMessagesProps = {
  messages: Msg[];
  isLoading: boolean;
  evaluationPreview: string | null;
  onRevelerEvaluation: () => void;
  bottomRef: RefObject<HTMLDivElement | null>;
  /** Rendu après la bulle du dernier message Claude (ex. zone d’upload). */
  showDocumentsUpload?: boolean;
  documentsUpload?: ReactNode;
};

export function ChatMessages({
  messages,
  isLoading,
  evaluationPreview,
  onRevelerEvaluation,
  bottomRef,
  showDocumentsUpload = false,
  documentsUpload = null,
}: ChatMessagesProps) {
  const lastClaude = messages.filter((m) => m.role === "claude").slice(-1)[0];
  const evaluationBlurPct = evaluationPreview?.match(/\b\d{1,3}\s?%/)?.[0] ?? "??%";

  return (
    <>
      {messages.map((m) => (
        <div key={m.id} className="space-y-3">
          <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-[12px] px-4 py-2.5 ${
                m.role === "user" ? "bg-[#5B50F0] text-white" : "bg-white text-foreground shadow-sm"
              }`}
            >
              {renderTextBubble(m.role === "claude" ? cleanMessageText(m.text) : m.text)}
            </div>
          </div>

          {m.role === "claude" && lastClaude?.id === m.id && showDocumentsUpload && documentsUpload ? (
            <div className="flex justify-start">
              <div className="w-full max-w-[85%]">{documentsUpload}</div>
            </div>
          ) : null}
        </div>
      ))}

      {isLoading ? (
        <div className="flex justify-start">
          <div className="rounded-[12px] bg-white px-4 py-3 text-sm text-foreground shadow-sm">En cours…</div>
        </div>
      ) : null}

      {evaluationPreview ? (
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
              onClick={onRevelerEvaluation}
              className="inline-flex items-center justify-center rounded-lg bg-[#5B50F0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
            >
              Révéler mon évaluation →
            </Link>
          </div>
        </div>
      ) : null}

      <div ref={bottomRef} />
    </>
  );
}
