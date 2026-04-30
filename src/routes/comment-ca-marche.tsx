import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment obtenir une juste indemnisation avec Vertual",
  description: "Vertual gère 100% de votre dossier sinistre face à votre assureur en 4 étapes.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Qualification en 2 minutes",
      text: "Notre chatbot analyse votre situation : type de sinistre, statut du dossier, marge de négociation potentielle.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Création de votre espace sécurisé",
      text: "Vous déposez votre contrat, les courriers reçus, devis, photos et rapport d'expert. Tout est centralisé.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Analyse IA + expert dédié",
      text: "Notre IA extrait les garanties applicables et identifie les postes sous-évalués. Un expert humain valide la stratégie.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Négociation et indemnisation",
      text: "Nous prenons en charge tous les échanges avec l'assureur jusqu'à l'indemnisation finale.",
    },
  ],
} as const;

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche : expert d'assuré en ligne | Vertual" },
      {
        name: "description",
        content:
          "Vertual gère 100% de votre dossier sinistre face à votre assureur. Qualification en 2 minutes, analyse IA, expert dédié, négociation jusqu'à l'indemnisation finale.",
      },
      { property: "og:title", content: "Comment ça marche : expert d'assuré en ligne | Vertual" },
      {
        property: "og:description",
        content:
          "Vertual gère 100% de votre dossier sinistre face à votre assureur. Qualification en 2 minutes, analyse IA, expert dédié, négociation jusqu'à l'indemnisation finale.",
      },
      { property: "og:url", content: "https://vertual.fr/comment-ca-marche" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/comment-ca-marche" }],
  }),
  component: HowItWorksPage,
});

const phases = [
  {
    n: "01",
    title: "Qualification en 2 minutes",
    text:
      "Notre chatbot analyse votre situation : type de sinistre, statut du dossier, marge de négociation potentielle.",
    bullets: [
      "Conversation confidentielle, aucune donnée transmise",
      "Verdict d'éligibilité immédiat",
      "Aucune création de compte requise pour cette étape",
    ],
  },
  {
    n: "02",
    title: "Création de votre espace sécurisé",
    text:
      "Vous déposez votre contrat, les courriers reçus, devis, photos et rapport d'expert. Tout est centralisé.",
    bullets: [
      "Stockage chiffré conforme RGPD",
      "Upload PDF, photos, scans, e-mails",
      "Vous gardez toujours la main sur vos documents",
    ],
  },
  {
    n: "03",
    title: "Analyse IA + expert dédié",
    text:
      "Notre IA extrait les garanties applicables, compare au rapport d'expert et identifie les postes sous-évalués. Un expert humain valide la stratégie.",
    bullets: [
      "Analyse de la police d'assurance ligne par ligne",
      "Calcul d'écart entre indemnisation due et proposée",
      "Préparation d'un courrier contradictoire argumenté",
    ],
  },
  {
    n: "04",
    title: "Négociation et indemnisation",
    text:
      "Nous prenons en charge tous les échanges avec l'assureur. Vous suivez l'avancement en temps réel.",
    bullets: [
      "Aucune interaction directe avec l'assureur de votre part",
      "Notifications à chaque étape clé",
      "Rémunération uniquement sur le gain obtenu",
    ],
  },
];

function HowItWorksPage() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <section className="relative bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-foreground sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Comment ça marche
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Vous nous confiez le dossier. <br />
            Nous gérons tout le reste.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Notre méthode d&apos;expert d&apos;assuré en ligne combine IA et expertise humaine pour transformer chaque
            sinistre sous-indemnisé en juste réparation.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <ol className="space-y-12">
            {phases.map((p) => (
              <li
                key={p.n}
                className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10"
              >
                <span className="font-sans tracking-tight text-5xl font-semibold text-primary/40">
                  {p.n}
                </span>
                <div>
                  <h2 className="font-sans tracking-tight text-2xl font-semibold text-primary sm:text-3xl">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <section
            className="mt-16 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6 sm:p-8"
            aria-labelledby="a-lire-aussi-heading"
          >
            <h3 id="a-lire-aussi-heading" className="font-sans text-lg font-semibold text-foreground">
              À lire aussi
            </h3>
            <ul className="mt-4 space-y-3 text-sm font-medium">
              <li>
                <Link to="/guides/expert-assure" className="text-[#5B50F0] underline-offset-2 hover:underline">
                  Qu&apos;est-ce qu&apos;un expert d&apos;assuré ?
                </Link>
              </li>
              <li>
                <Link to="/guides/assureur-refuse-payer" className="text-[#5B50F0] underline-offset-2 hover:underline">
                  Que faire si mon assureur refuse de payer ?
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="text-[#5B50F0] underline-offset-2 hover:underline">
                  Nos tarifs
                </Link>
              </li>
            </ul>
          </section>

          <div className="mt-16 rounded-xl border border-border bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
            <h3 className="font-sans tracking-tight text-2xl font-semibold text-primary">
              Combien de temps ça prend ?
            </h3>
            <p className="mt-3 text-muted-foreground">
              Une analyse de dossier complète est rendue sous 48h. La phase de
              négociation avec l'assureur dure en moyenne 4 à 12 semaines selon la
              complexité ,  vous êtes informé à chaque étape.
            </p>
            <Link
              to="/"
              hash="chatbot"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
            >
              Démarrer maintenant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
