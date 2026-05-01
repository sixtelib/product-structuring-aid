import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

const toc = [
  { href: "#definition", label: "Qu'est-ce que la prescription en assurance ?" },
  { href: "#calcul", label: "Le délai de 2 ans : comment le calculer ?" },
  { href: "#interruption", label: "Suspension et interruption : comment gagner du temps" },
  { href: "#particuliers", label: "Cas particuliers (10 ans, assurance vie, Cat Nat…)" },
  { href: "#agir", label: "Que faire avant l'expiration du délai ?" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Délai de prescription assurance : définition et recours avant expiration",
  description:
    "En assurance, vous avez 2 ans pour agir après un sinistre. Passé ce délai, vous perdez tout droit. Découvrez comment calculer ce délai et comment agir à temps.",
  url: "https://vertual.fr/guides/delai-prescription-assurance",
  datePublished: "2026-04-30T00:00:00+02:00",
  dateModified: "2026-04-30T00:00:00+02:00",
  image: {
    "@type": "ImageObject",
    url: "https://vertual.fr/og-image.png",
    width: 1200,
    height: 630,
  },
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
      name: "Mon assureur peut-il invoquer la prescription même s'il ne m'a jamais informé de ce délai ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. La prescription est une règle légale que votre assureur peut invoquer sans vous en avoir informé. Il est donc crucial d'anticiper le délai.",
      },
    },
    {
      "@type": "Question",
      name: "La prescription s'applique-t-elle si mon assureur ne m'a jamais répondu ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. L'absence de réponse ne suspend pas le délai. Envoyez une lettre recommandée de relance : elle interrompra la prescription.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je agir après 2 ans si mon assureur m'a induit en erreur ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dans des cas exceptionnels, la prescription peut être écartée en cas de fraude ou de manœuvres dolosives de l'assureur. C'est difficile à prouver et nécessite souvent un avocat.",
      },
    },
    {
      "@type": "Question",
      name: "Le délai de prescription peut-il être modifié par contrat ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, mais uniquement dans un sens favorable à l'assuré : un contrat peut prévoir un délai plus long que 2 ans, jamais plus court.",
      },
    },
    {
      "@type": "Question",
      name: "J'ai signé une quittance : la prescription s'applique-t-elle encore ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si vous avez signé une quittance pour solde de tout compte, la quittance clôt le dossier (sauf vice du consentement). La question n'est alors plus seulement la prescription.",
      },
    },
  ],
} as const;

export function DelaiPrescriptionPage() {
  useJsonLdInHead(articleJsonLd, faqPageJsonLd);

  return (
    <SiteLayout>
      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Guide</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Délai de prescription en assurance : tout ce qu&apos;il faut savoir
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              En assurance, le temps joue contre vous : au-delà d&apos;un certain délai, vous perdez
              définitivement tout droit d&apos;agir, même si votre dossier est fondé. Voici comment
              calculer la prescription et comment l&apos;interrompre à temps.
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
                  <a
                    href={href}
                    className="text-[#5B50F0] underline decoration-[#5B50F0]/30 underline-offset-2 hover:decoration-[#5B50F0]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="prose prose-neutral mt-12 max-w-none space-y-12">
            <section id="definition" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                1. Qu&apos;est-ce que la prescription en assurance ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La prescription est le délai légal au-delà duquel vous ne pouvez plus agir en
                justice contre votre assureur. Elle est régie par l&apos;article{" "}
                <strong>L114-1 du Code des assurances</strong>.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>Le principe :</strong> toutes les actions dérivant d&apos;un contrat
                d&apos;assurance sont prescrites par <strong>deux ans</strong> à compter de
                l&apos;événement qui y donne naissance.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>Passé ce délai :</strong> votre assureur peut invoquer la prescription pour
                rejeter toute demande, même si votre dossier est solide. Le juge constatera la
                prescription et rejettera l&apos;action.
              </p>
            </section>

            <section id="calcul" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                2. Le délai de 2 ans : comment le calculer ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le calcul dépend du <strong>point de départ</strong>, qui varie selon la nature de
                l&apos;action.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#F8F9FF]">
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Type d&apos;action
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Point de départ du délai
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Sinistre non indemnisé
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Date du sinistre</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Refus de prise en charge
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Date de notification du refus
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Indemnisation insuffisante
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Date de versement de l&apos;indemnisation
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Sinistre à évolution lente
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Date de connaissance du dommage
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Responsabilité civile
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Date du fait dommageable ou de sa connaissance
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Recours contre un tiers
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Date de paiement de l&apos;indemnité par l&apos;assureur
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-[#F8F9FF] p-5 sm:p-6">
                <p className="m-0 text-base leading-relaxed text-foreground">
                  <strong>Attention aux dommages à évolution lente :</strong> infiltrations,
                  sécheresse, moisissures… Le point de départ est la date à laquelle vous avez eu
                  connaissance des dommages, pas forcément la date du sinistre initial.
                </p>
              </div>
            </section>

            <section id="interruption" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                3. Les causes de suspension et d&apos;interruption
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La prescription peut être <strong>suspendue</strong> (le délai s&apos;arrête
                temporairement) ou <strong>interrompue</strong> (le délai repart à zéro).
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#111827]">
                Causes d&apos;interruption (le délai repart de zéro)
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Une action en justice :</strong> l&apos;assignation interrompt la
                  prescription ; un nouveau délai de 2 ans commence.
                </li>
                <li>
                  <strong>Une reconnaissance par l&apos;assureur :</strong> reconnaissance écrite
                  d&apos;une dette ou d&apos;une responsabilité.
                </li>
                <li>
                  <strong>Une désignation d&apos;expert ou une médiation :</strong> demande
                  d&apos;expert judiciaire ou saisine du médiateur.
                </li>
                <li>
                  <strong>Une lettre recommandée :</strong> l&apos;envoi d&apos;une LRAR (article
                  L114-2) interrompt la prescription.
                </li>
              </ul>

              <h3 className="mt-8 font-sans text-xl font-semibold tracking-tight text-[#111827]">
                Causes de suspension (le délai s&apos;arrête temporairement)
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>La médiation :</strong> le délai est suspendu pendant la procédure et
                  reprend à la clôture.
                </li>
                <li>
                  <strong>La force majeure :</strong> une impossibilité d&apos;agir peut suspendre
                  le délai.
                </li>
              </ul>
            </section>

            <section id="particuliers" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                4. Les cas particuliers
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground">
                <div>
                  <h3 className="font-semibold text-foreground">Sinistres corporels</h3>
                  <p className="mt-2 text-muted-foreground">
                    Pour les dommages corporels, le délai est en général de <strong>10 ans</strong>{" "}
                    à compter de la consolidation du dommage ou du décès.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Assurance vie</h3>
                  <p className="mt-2 text-muted-foreground">
                    En assurance vie, la prescription est de <strong>10 ans</strong> à compter de la
                    date à laquelle le bénéficiaire a eu connaissance du contrat.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Catastrophe naturelle</h3>
                  <p className="mt-2 text-muted-foreground">
                    Le délai biennal s&apos;applique aussi. Il court notamment à compter de la
                    publication de l&apos;arrêté Cat Nat ou de la notification du refus.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Sinistres découverts tardivement
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Pour des dommages progressifs (infiltrations, fissures liées à la sécheresse),
                    le délai peut courir à partir de la <strong>découverte</strong> des dommages,
                    avec des limites selon l&apos;ancienneté.
                  </p>
                </div>
              </div>
            </section>

            <section id="agir" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                5. Comment agir avant l&apos;expiration du délai ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Si votre délai approche, voici les actions à entreprendre immédiatement.
              </p>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">
                    Action 1 — Envoyez une lettre recommandée
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Contestez l&apos;indemnisation ou le refus par LRAR : c&apos;est le moyen le
                    plus simple d&apos;interrompre la prescription.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Action 2 — Saisissez le médiateur de l&apos;assurance
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    La médiation suspend le délai pendant la procédure. C&apos;est une option
                    gratuite et accessible.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Action 3 — Mandatez un expert d&apos;assuré
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Un expert peut analyser rapidement votre dossier et déclencher les démarches
                    utiles pour protéger vos droits.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Action 4 — Consultez un avocat</h3>
                  <p className="mt-1 text-muted-foreground">
                    Si le délai est très proche et les enjeux importants, une action conservatoire
                    peut être engagée.
                  </p>
                </li>
              </ol>
              <div className="mt-8 rounded-xl border border-border bg-[#F8F9FF] p-5 sm:p-6">
                <p className="m-0 text-base leading-relaxed text-foreground">
                  <strong>La règle absolue :</strong> n&apos;attendez pas. Une lettre recommandée
                  envoyée la veille suffit à interrompre la prescription. Mais après
                  l&apos;expiration, aucun recours n&apos;est possible.
                </p>
              </div>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                6. Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur peut-il invoquer la prescription même s&apos;il ne m&apos;a jamais
                    informé de ce délai ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui. La prescription est une règle légale que votre assureur peut invoquer même
                    sans information préalable.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    La prescription s&apos;applique-t-elle si mon assureur ne m&apos;a jamais
                    répondu ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui. L&apos;absence de réponse ne suspend pas le délai. Une relance en LRAR peut
                    l&apos;interrompre.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je agir après 2 ans si mon assureur m&apos;a induit en erreur ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Dans des cas exceptionnels (fraude, manœuvres dolosives), la prescription peut
                    être écartée, mais c&apos;est difficile à prouver.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Le délai de prescription peut-il être modifié par contrat ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, mais seulement dans un sens favorable à l&apos;assuré : un délai plus long
                    est possible, jamais plus court.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    J&apos;ai signé une quittance : le délai de prescription s&apos;applique-t-il
                    encore ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Une quittance pour solde de tout compte clôt le dossier (sauf vice du
                    consentement). Le débat n&apos;est alors plus uniquement la prescription.
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="mt-12 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
            <h2 className="text-[16px] font-semibold text-[#374151]">À lire aussi</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/guides/assureur-refuse-payer"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Assureur refuse de payer : que faire ?</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/guides/declarer-sinistre-assurance"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Déclarer un sinistre : étapes et délais</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/guides/expert-assure"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Expert d&apos;assuré : rôle et honoraires</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

          <footer className="mt-16 border-t border-border pt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Analysez votre dossier gratuitement. Sans engagement.
            </p>
            <Link
              to="/"
              hash="#chatbot"
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
