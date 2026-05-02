import { MessageSquare, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/types";

function cardClass() {
  return "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
}

function authorLabel(auteur: string) {
  if (auteur === "admin") return "Administrateur";
  if (auteur === "expert") return "Expert";
  if (auteur === "client") return "Assuré";
  return auteur;
}

function isStaffMessage(auteur: string) {
  return auteur === "admin" || auteur === "expert";
}

export type DossierMessagerieSectionProps = {
  dossierId: string;
  messages: Message[];
  onEnvoyerMessage: (contenu: string) => Promise<void>;
  /** Appelé lors d'un INSERT realtime (liste fusionnée et triée). */
  onMessagesUpdated: (rows: Message[]) => void;
};

export function DossierMessagerieSection({
  dossierId,
  messages,
  onEnvoyerMessage,
  onMessagesUpdated,
}: DossierMessagerieSectionProps) {
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const onMessagesUpdatedRef = useRef(onMessagesUpdated);
  onMessagesUpdatedRef.current = onMessagesUpdated;

  useEffect(() => {
    const channel = supabase
      .channel(`admin-dossier-msgs-${dossierId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `dossier_id=eq.${dossierId}` },
        (payload) => {
          const row = payload.new as Message;
          const prev = messagesRef.current;
          if (prev.some((m) => m.id === row.id)) return;
          const next = [...prev, row].sort((a, b) => a.created_at.localeCompare(b.created_at));
          onMessagesUpdatedRef.current(next);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [dossierId]);

  async function send() {
    const text = messageText.trim();
    if (!text) return;
    setSendingMessage(true);
    try {
      await onEnvoyerMessage(text);
      setMessageText("");
    } catch {
      /* erreur déjà affichée par le parent */
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <section className={`${cardClass()} mt-6`}>
      <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
        <MessageSquare className="h-5 w-5 text-[#5B50F0]" aria-hidden />
        <h2 className="text-lg font-semibold text-[#111827]">Messagerie interne</h2>
      </div>
      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Aucun message.</p>
        ) : (
          messages.map((m) => {
            const staff = isStaffMessage(m.auteur);
            return (
              <div key={m.id} className={`flex ${staff ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm sm:max-w-[70%] ${
                    staff ? "bg-[#F3F4F6] text-[#111827]" : "bg-[#EEE9FF] text-[#111827]"
                  }`}
                >
                  <p className="text-xs font-semibold text-[#6B7280]">{authorLabel(m.auteur)}</p>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed">{m.contenu}</p>
                  <p className="mt-2 text-[11px] text-[#6B7280]">{timeAgo(m.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-6 flex flex-col gap-3 border-t border-[#F3F4F6] pt-4 sm:flex-row sm:items-end">
        <textarea
          rows={3}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Écrire un message..."
          className="min-h-[88px] w-full flex-1 resize-y rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
        />
        <button
          type="button"
          disabled={sendingMessage || !messageText.trim()}
          onClick={() => void send()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "#5B50F0" }}
        >
          <Send className="h-4 w-4" aria-hidden />
          Envoyer →
        </button>
      </div>
    </section>
  );
}
