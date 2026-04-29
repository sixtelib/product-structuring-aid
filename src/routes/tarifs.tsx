import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs ,  Vertual" },
      {
        name: "description",
        content:
          "Rémunération uniquement au succès : 10 % de l'indemnisation supplémentaire obtenue. Gratuit si nous n'obtenons rien. Aucun frais caché.",
      },
      { property: "og:title", content: "Tarifs ,  Vertual" },
      {
        property: "og:description",
        content:
          "Modèle au succès : vous ne payez que si nous obtenons plus pour vous.",
      },
    ],
  }),
  component: PricingPage,
});

const examples = [
  {
    proposed: 8000,
    obtained: 14500,
    gain: 6500,
    fee: 650,
    net: 5850,
  },
  {
    proposed: 15000,
    obtained: 22000,
    gain: 7000,
    fee: 700,
    net: 6300,
  },
  {
    proposed: 32000,
    obtained: 48500,
    gain: 16500,
    fee: 1650,
    net: 14850,
  },
];

const inclus = [
  "Évaluation initiale gratuite",
  "Analyse de la police d'assurance",
  "Préparation des courriers contradictoires",
  "Négociation avec l'assureur de bout en bout",
  "Expert dédié et suivi temps réel",
  "Aucun paiement avant gain effectif",
];

const fmt = (n: number) => n.toLocaleString("fr-FR") + " €";

function PricingPage() {
  return (
    <SiteLayout>
      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-foreground sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Tarifs
          </p>
          <h1 className="mt-3 font-sans tracking-tight text-4xl font-semibold sm:text-5xl">
            Vous ne payez que si nous gagnons.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Notre seule rémunération : un pourcentage du gain supplémentaire que
            nous obtenons. Aucun frais d'ouverture, aucune mensualité, aucun
            engagement.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* Card principale */}
            <div className="rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sans risque
              </span>
              <p className="mt-5 font-sans tracking-tight text-6xl font-semibold text-primary sm:text-7xl">
                10 %
              </p>
              <p className="mt-2 text-lg text-foreground">
                du <strong>gain supplémentaire</strong> obtenu pour vous.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pas de gain ? Vous payez 0 €. Sans condition.
              </p>

              <ul className="mt-8 space-y-3">
                {inclus.map((i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    <span className="text-foreground">{i}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/"
                hash="chatbot"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                Évaluer mon dossier gratuitement <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Exemples chiffrés */}
            <div>
              <h2 className="font-sans tracking-tight text-2xl font-semibold text-primary">
                Exemples concrets
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Voici ce que vous percevez réellement, après notre rémunération.
              </p>
              <div className="mt-6 space-y-4">
                {examples.map((e) => (
                  <div
                    key={e.proposed}
                    className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        Proposition assureur
                      </p>
                      <p className="font-sans tracking-tight text-base font-semibold text-foreground">
                        {fmt(e.proposed)}
                      </p>
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        Indemnisation obtenue
                      </p>
                      <p className="font-sans tracking-tight text-base font-semibold text-primary">
                        {fmt(e.obtained)}
                      </p>
                    </div>
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          Notre rémunération (10 %)
                        </p>
                        <p className="text-sm text-foreground">−{fmt(e.fee)}</p>
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold text-success">
                          Vous percevez en plus
                        </p>
                        <p className="font-sans tracking-tight text-xl font-semibold text-success">
                          +{fmt(e.net)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
