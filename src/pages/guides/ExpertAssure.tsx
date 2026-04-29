import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const toc = [
  { href: "#definition", label: "Qu'est-ce qu'un expert d'assuré ?" },
  { href: "#difference", label: "Expert d'assuré vs expert de l'assureur" },
  { href: "#quand", label: "Quand faire appel à un expert d'assuré ?" },
  { href: "#deroulement", label: "Comment se déroule une mission ?" },
  { href: "#honoraires", label: "Honoraires : combien ça coûte ?" },
  { href: "#choisir", label: "Comment choisir son expert d'assuré ?" },
  { href: "#faq", label: "FAQ" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Qu'est-ce qu'un expert d'assuré ? Le guide complet",
  description:
    "L'expert d'assuré défend vos intérêts face à votre assureur après un sinistre. Rôle, honoraires, différence avec l'expert de l'assureur : tout comprendre en 5 minutes.",
  url: "https://vertual.fr/guides/expert-assure",
  datePublished: "2026-04-29",
  dateModified: "2026-04-29",
  author: {
    "@type": "Organization",
    name: "Vertual",
    url: "https://vertual.fr",
  },
  publisher: {
    "@type": "Organization",
    name: "Vertual",
    url: "https://vertual.fr",
    logo: {
      "@type": "ImageObject",
      url: "https://vertual.fr/logo.png",
    },
  },
} as const;

const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "L'assureur peut-il refuser la présence d'un expert d'assuré ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Vous avez le droit de vous faire représenter par un expert de votre choix lors de la procédure contradictoire.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je faire appel à un expert d'assuré après avoir signé le procès-verbal ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "C'est plus complexe une fois le PV signé, mais pas toujours impossible. Consultez un expert le plus tôt possible, idéalement avant toute signature.",
      },
    },
    {
      "@type": "Question",
      name: "Quels types de sinistres sont couverts ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tous les sinistres couverts par une assurance : dégât des eaux, incendie, tempête, catastrophe naturelle, dommages électriques, sinistres professionnels.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de temps dure une mission d'expertise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De quelques semaines pour un dossier simple, à plusieurs mois pour un dossier complexe.",
      },
    },
  ],
} as const;

export function ExpertAssurePage() {
  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />

      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Guide</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré : rôle, honoraires et comment ça marche
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Tout ce qu'il faut savoir pour défendre votre dossier après un sinistre, en quelques minutes.
            </p>
          </header>

          <nav
            aria-label="Sommaire"
            className="mt-10 rounded-xl border border-border bg-[#F8F9FF] p-5 sm:p-6"
          >
            <h2 className="text-sm font-semibold text-[#5B50F0]">Sommaire</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground">
              {toc.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-[#5B50F0] underline decoration-[#5B50F0]/30 underline-offset-2 hover:decoration-[#5B50F0]">
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="prose prose-neutral mt-12 max-w-none space-y-12">
            <section id="definition" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Qu'est-ce qu'un expert d'assuré ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un expert d'assuré est un professionnel indépendant mandaté par l'assuré pour défendre ses
                intérêts lors du règlement d'un sinistre. Son rôle couvre trois missions : évaluer les dommages
                de façon indépendante, analyser le contrat d'assurance pour identifier toutes les garanties
                mobilisables, et négocier avec l'expert de l'assureur pour obtenir une indemnisation juste.
              </p>
            </section>

            <section id="difference" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Expert d'assuré vs expert de l'assureur
              </h2>
              <div className="mt-6 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#F8F9FF]">
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col" />
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Expert de l'assureur
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Expert d'assuré
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Mandaté par
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Votre compagnie d'assurance</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Vous</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Objectif
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Évaluer les dommages pour l'assureur
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Maximiser votre indemnisation</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Payé par
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">L'assureur</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Vous (sur succès fee)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Indépendant ?
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Non</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Oui</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="quand" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Quand faire appel à un expert d'assuré ?
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Votre assureur propose une indemnisation insuffisante</li>
                <li>Votre assureur refuse de prendre en charge le sinistre</li>
                <li>Le sinistre est complexe ou d'un montant élevé</li>
                <li>
                  Vous faites face à un sinistre climatique (tempête, inondation, catastrophe naturelle)
                </li>
                <li>Vous n'avez pas le temps de gérer le dossier vous-même</li>
              </ul>
            </section>

            <section id="deroulement" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Comment se déroule une mission ?
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Étape 1 ,  Analyse du dossier</h3>
                  <p className="mt-1 text-muted-foreground">
                    Examen du contrat, des circonstances, des documents.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 2 ,  Visite des lieux</h3>
                  <p className="mt-1 text-muted-foreground">Constat indépendant et exhaustif des dommages.</p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 3 ,  Chiffrage contradictoire</h3>
                  <p className="mt-1 text-muted-foreground">
                    Évaluation indépendante basée sur les garanties du contrat.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 4 ,  Réunion contradictoire</h3>
                  <p className="mt-1 text-muted-foreground">Négociation entre les deux experts.</p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 5 ,  Accord et indemnisation</h3>
                  <p className="mt-1 text-muted-foreground">Versement de l'indemnisation négociée.</p>
                </li>
              </ol>
            </section>

            <section id="honoraires" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Honoraires : combien ça coûte ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le modèle standard est le success fee : 10% de l'indemnisation obtenue. Exemple : assureur
                propose 8 000€, après expertise l'indemnisation passe à 15 000€, l'expert perçoit 1 500€,
                l'assuré récupère 13 500€. Si aucune amélioration, vous ne payez rien.
              </p>
            </section>

            <section id="choisir" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Comment choisir son expert d'assuré ?
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Vérifier son indépendance (ne travaille jamais pour les assureurs)</li>
                <li>S'assurer de son expérience sur votre type de sinistre</li>
                <li>Demander des références ou avis</li>
                <li>Privilégier le modèle success fee (méfiance si honoraires fixes en amont)</li>
                <li>Exiger un contrat clair avant toute intervention</li>
              </ul>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">FAQ</h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    L'expert de l'assureur peut-il refuser ma présence ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non, vous avez le droit de vous faire représenter.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je intervenir après avoir signé le PV ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    C'est plus complexe mais parfois possible ,  consultez rapidement.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Quels types de sinistres sont couverts ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Tous : dégât des eaux, incendie, tempête, catastrophe naturelle, sinistres pro.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Combien de temps dure une mission ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    De quelques semaines à plusieurs mois selon la complexité.
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <footer className="mt-16 border-t border-border pt-10 text-center">
            <p className="text-sm text-muted-foreground">Prêt à faire analyser votre dossier ?</p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#5B50F0" }}
            >
              Qualifier mon sinistre gratuitement
            </Link>
          </footer>
        </article>
      </div>
    </SiteLayout>
  );
}
