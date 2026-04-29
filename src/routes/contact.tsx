import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, ShieldCheck, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Vertual" },
      {
        name: "description",
        content:
          "Une question, un dossier complexe, un partenariat ? Notre équipe vous répond sous 24h ouvrées.",
      },
      { property: "og:title", content: "Contact — Vertual" },
      {
        property: "og:description",
        content: "Écrivez-nous, nous vous répondons sous 24h ouvrées.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <SiteLayout>
      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-foreground sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Contact
          </p>
          <h1 className="mt-3 font-sans tracking-tight text-4xl font-semibold sm:text-5xl">
            Parlons de votre dossier.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Pour une évaluation rapide, utilisez plutôt notre chatbot. Pour toute
            autre demande, ce formulaire est fait pour vous.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Mail className="h-5 w-5" />
              </span>
              <p className="mt-3 font-sans tracking-tight text-base font-semibold text-primary">
                Par email
              </p>
              <a
                href="mailto:contact@recours.fr"
                className="mt-1 block text-sm text-foreground hover:text-primary"
              >
                contact@recours.fr
              </a>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <MessageSquare className="h-5 w-5" />
              </span>
              <p className="mt-3 font-sans tracking-tight text-base font-semibold text-primary">
                Évaluation immédiate
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Notre chatbot répond en 2 minutes, 24h/24.
              </p>
            </div>
            <div className="rounded-xl bg-sand p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="mt-3 font-sans tracking-tight text-base font-semibold text-primary">
                Confidentialité garantie
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Toutes vos données sont chiffrées et conformes RGPD.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <Send className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-sans tracking-tight text-2xl font-semibold text-primary">
                  Message envoyé.
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Nous vous répondons sous 24h ouvrées. À très vite.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h2 className="font-sans tracking-tight text-2xl font-semibold text-primary">
                  Écrivez-nous
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Prénom
                    </label>
                    <input
                      required
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nom
                    </label>
                    <input
                      required
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sujet
                  </label>
                  <select
                    required
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="">— Choisir —</option>
                    <option>Question sur un dossier en cours</option>
                    <option>Sinistre complexe / partenariat</option>
                    <option>Presse</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Votre message
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
                >
                  Envoyer le message <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
