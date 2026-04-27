import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send, ShieldCheck, Sparkles } from "lucide-react";

type Role = "bot" | "user";
type Message = { id: string; role: Role; text: string };

type Step =
  | "intro"
  | "claimType"
  | "context"
  | "status"
  | "amounts"
  | "verdict";

const claimTypes = [
  "Habitation",
  "Auto",
  "Dégât des eaux",
  "Incendie",
  "Catastrophe naturelle",
  "Santé / prévoyance",
  "Autre",
];

const statusOptions = [
  "J'ai reçu une proposition trop basse",
  "Mon dossier a été refusé",
  "Une expertise est en cours",
  "Je n'ai pas encore déclaré",
];

function uid() {
  return Math.random().toString(36).slice(2);
}

export function QualificationChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "bot",
      text:
        "Bonjour 👋 Je suis votre conseiller virtuel. En 2 minutes, je vais évaluer si nous pouvons obtenir une meilleure indemnisation pour votre sinistre. C'est gratuit, sans engagement.",
    },
  ]);
  const [step, setStep] = useState<Step>("intro");
  const [claimType, setClaimType] = useState<string>("");
  const [contextText, setContextText] = useState("");
  const [statusText, setStatusText] = useState("");
  const [proposed, setProposed] = useState("");
  const [expected, setExpected] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, step]);

  function pushBot(text: string) {
    setMessages((m) => [...m, { id: uid(), role: "bot", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { id: uid(), role: "user", text }]);
  }

  function start() {
    setStep("claimType");
    pushBot("Quel type de sinistre êtes-vous en train de gérer ?");
  }

  function pickClaim(type: string) {
    setClaimType(type);
    pushUser(type);
    setStep("context");
    setTimeout(
      () =>
        pushBot(
          "Très bien. En quelques mots, pouvez-vous me décrire ce qu'il s'est passé et la date approximative ?",
        ),
      300,
    );
  }

  function submitContext(text: string) {
    if (!text.trim()) return;
    setContextText(text);
    pushUser(text);
    setInput("");
    setStep("status");
    setTimeout(() => pushBot("Où en est votre dossier aujourd'hui ?"), 300);
  }

  function pickStatus(s: string) {
    setStatusText(s);
    pushUser(s);
    setStep("amounts");
    setTimeout(
      () =>
        pushBot(
          "Dernière question : connaissez-vous le montant proposé par votre assureur et le montant que vous estimez juste ? (laissez vide si vous ne savez pas)",
        ),
      300,
    );
  }

  function submitAmounts() {
    const p = proposed.trim();
    const e = expected.trim();
    pushUser(
      p || e
        ? `Proposé : ${p || "—"} € · Estimé juste : ${e || "—"} €`
        : "Je ne sais pas encore",
    );

    const proposedNum = Number(p.replace(/[^\d]/g, ""));
    const expectedNum = Number(e.replace(/[^\d]/g, ""));
    const gap =
      proposedNum && expectedNum && expectedNum > proposedNum
        ? expectedNum - proposedNum
        : null;

    setStep("verdict");
    setTimeout(() => {
      pushBot(
        `Merci. D'après votre situation (${claimType.toLowerCase()}, ${statusText.toLowerCase()}), votre dossier est éligible à une analyse approfondie.`,
      );
    }, 300);
    setTimeout(() => {
      const gapText = gap
        ? ` Sur la base d'un écart de ${gap.toLocaleString("fr-FR")} €, notre marge de négociation moyenne est de 15 à 35 %.`
        : "";
      pushBot(
        `Nos experts étudient votre dossier sous 48h.${gapText} Pour aller plus loin, créez votre espace sécurisé et déposez vos pièces — c'est gratuit, et vous ne payez rien si nous n'obtenons rien.`,
      );
    }, 1100);
  }

  return (
    <div
      id="chatbot"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]"
    >
      <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-base font-semibold text-primary">
            Évaluation de dossier
          </p>
          <p className="text-xs text-muted-foreground">
            Conversation confidentielle · 2 min
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[420px] min-h-[320px] space-y-3 overflow-y-auto px-5 py-5"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-secondary text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {step === "intro" && (
          <div className="pt-2">
            <button
              onClick={start}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
            >
              Démarrer l'évaluation
            </button>
          </div>
        )}

        {step === "claimType" && (
          <div className="flex flex-wrap gap-2 pt-2">
            {claimTypes.map((t) => (
              <button
                key={t}
                onClick={() => pickClaim(t)}
                className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {step === "status" && (
          <div className="flex flex-col gap-2 pt-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => pickStatus(s)}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm font-medium text-foreground transition hover:border-accent hover:bg-accent-soft"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {step === "amounts" && (
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={proposed}
                onChange={(e) => setProposed(e.target.value)}
                placeholder="Proposé (€)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                type="text"
                inputMode="numeric"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="Estimé juste (€)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={submitAmounts}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow"
            >
              Voir l'évaluation <Send className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === "verdict" && (
          <div className="space-y-3 pt-3">
            <div className="rounded-xl border border-success/30 bg-success/10 p-4">
              <div className="flex items-center gap-2 text-success">
                <ShieldCheck className="h-5 w-5" />
                <p className="font-semibold">Dossier éligible</p>
              </div>
              <p className="mt-1.5 text-sm text-foreground">
                Créez votre espace pour déposer vos pièces. Aucun paiement avant
                l'obtention d'une indemnisation supplémentaire.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition hover:brightness-105"
            >
              Créer mon espace gratuit
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              Espace sécurisé · Données chiffrées · RGPD
            </p>
          </div>
        )}
      </div>

      {step === "context" && (
        <div className="border-t border-border bg-background px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitContext(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Décrivez votre situation…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow"
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
