import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs Vertual : 10% du gain obtenu, zéro risque | Expert d'assuré" },
      {
        name: "description",
        content:
          "Vertual est rémunéré uniquement sur les résultats obtenus : 10% du gain supplémentaire négocié avec votre assureur. Zéro frais si zéro résultat.",
      },
      { property: "og:title", content: "Tarifs Vertual : 10% du gain obtenu, zéro risque | Expert d'assuré" },
      {
        property: "og:description",
        content:
          "Vertual est rémunéré uniquement sur les résultats obtenus : 10% du gain supplémentaire négocié avec votre assureur. Zéro frais si zéro résultat.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/tarifs" }],
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
  const faqItems = [
    {
      q: "Comment sont calculés les honoraires ?",
      a: "Nos honoraires sont de 10% du gain supplémentaire obtenu par rapport à l'offre initiale de votre assureur. Si votre assureur proposait 10 000€ et que nous obtenons 15 000€, nos honoraires sont de 500€ (10% de 5 000€).",
    },
    {
      q: "Que se passe-t-il si vous n'obtenez rien ?",
      a: "Vous ne payez absolument rien. Notre rémunération est conditionnée à l'obtention d'un résultat. Zéro gain = zéro honoraires, sans exception.",
    },
    {
      q: "Y a-t-il des frais cachés ou une avance ?",
      a: "Non. L'analyse initiale est gratuite. Aucune avance n'est demandée. Les honoraires sont prélevés uniquement à la clôture du dossier.",
    },
  ] as const;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  } as const;

  useJsonLdInHead(faqJsonLd);

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
                Simulez votre gain potentiel
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Illustration du modèle sur des cas types. Chaque dossier est unique, et le gain réel dépend de votre contrat
                et de vos dommages.
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
              <p className="mt-6 text-[12px] text-[#9CA3AF]">
                Ces simulations sont fournies à titre illustratif. Vertual ne garantit pas de résultat spécifique.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="pricing-faq-heading" className="bg-background">
        <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] sm:p-10">
            <h2 id="pricing-faq-heading" className="font-sans tracking-tight text-2xl font-semibold text-foreground">
              FAQ
            </h2>
            <div className="mt-6 space-y-6">
              {faqItems.map((item) => (
                <div key={item.q} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-base font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
