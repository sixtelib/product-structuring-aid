import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const toc = [
  { href: "#causes", label: "Les causes couvertes par l'assurance" },
  { href: "#pourquoi", label: "Pourquoi les indemnisations sont insuffisantes" },
  { href: "#role", label: "Ce que fait un expert d'assuré" },
  { href: "#etapes", label: "Les étapes clés après un dégât des eaux" },
  { href: "#delais", label: "Délais et prescription" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Expert d'assuré dégât des eaux : obtenez l'indemnisation que vous méritez",
  description:
    "Votre assureur sous-évalue votre dégât des eaux ? Un expert d'assuré indépendant analyse votre dossier gratuitement et défend vos intérêts. Sans avance de frais.",
  url: "https://vertual.fr/sinistres/degat-des-eaux",
  datePublished: "2026-04-30",
  dateModified: "2026-04-30",
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
      name: "La fuite vient de chez mon voisin : qui paie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si la fuite est d'origine privative (chez votre voisin), c'est l'assurance de votre voisin qui prend en charge les dommages chez vous. Votre propre assurance intervient en cas de carence ou de litige. Un expert d'assuré peut vous aider à identifier les responsabilités et à activer les bonnes garanties.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur veut déduire la vétusté : est-ce normal ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, la déduction de vétusté est légale et prévue dans la plupart des contrats. Mais elle est souvent appliquée de façon excessive. Un expert d'assuré vérifie que les taux appliqués sont conformes aux barèmes contractuels et conteste les abus.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je faire des réparations d'urgence avant l'expertise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, pour les réparations strictement nécessaires (arrêt de fuite, bâchage). Mais documentez tout par photos avant intervention, et conservez les factures. Informez votre assureur de ces travaux d'urgence par écrit.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur tarde à envoyer son expert : que faire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si l'assureur ne mandate pas son expert dans un délai raisonnable (2 à 3 semaines), relancez par écrit. Si la situation se prolonge, mandatez un expert d'assuré qui peut initier la procédure contradictoire indépendamment.",
      },
    },
    {
      "@type": "Question",
      name: "Est-ce que ça vaut le coup pour un petit dégât des eaux ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pour un sinistre inférieur à 1 500 €, l'intervention d'un expert d'assuré est rarement rentable. En revanche, dès que les dommages dépassent 3 000 € (ce qui est fréquent dès qu'un plancher ou une cloison est touché), l'expertise est presque toujours justifiée.",
      },
    },
  ],
} as const;

export function DegatDesEauxPage() {
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
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Sinistre</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré dégât des eaux : obtenez l'indemnisation que vous méritez
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Le dégât des eaux est le sinistre le plus fréquent en France : plus de 3 millions de déclarations par an.
              C'est aussi l'un des sinistres où les assurés sont le plus souvent sous-indemnisés.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Fuite, infiltration, rupture de canalisation, débordement... Quelle que soit l'origine, votre assureur a
              tendance à minimiser l'étendue des dommages. Un expert d'assuré change la donne.
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
            <section id="causes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les causes de dégât des eaux couvertes par l'assurance
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La plupart des contrats multirisque habitation (MRH) couvrent les dégâts des eaux causés par :
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Fuites et ruptures de canalisations</strong> (eau froide, eau chaude, chauffage)
                </li>
                <li>
                  <strong>Débordements</strong> d'appareils ménagers (lave-linge, lave-vaisselle, chauffe-eau)
                </li>
                <li>
                  <strong>Infiltrations par la toiture</strong> ou les terrasses
                </li>
                <li>
                  <strong>Refoulement des égouts</strong>
                </li>
                <li>
                  <strong>Fuites provenant des voisins</strong> ou des parties communes
                </li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Chaque contrat définit précisément les causes couvertes et les exclusions. C'est souvent dans les
                exclusions que se cache le litige avec l'assureur.
              </p>
            </section>

            <section id="pourquoi" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi les indemnisations sont souvent insuffisantes
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un dégât des eaux semble parfois anodin en surface, mais les dommages réels sont souvent bien plus
                étendus que ce que l'œil voit immédiatement.
              </p>
              <p className="mt-4 text-base font-semibold leading-relaxed text-foreground">
                Ce que l'expert de l'assureur minimise fréquemment :
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Les dommages cachés.</strong> L'humidité s'infiltre dans les murs, les planchers, les
                  isolants. Ces dommages ne sont pas toujours visibles lors de la première expertise, mais ils se
                  manifestent des semaines plus tard (moisissures, décollement, gonflement).
                </li>
                <li>
                  <strong>Le coût réel de remise en état.</strong> L'expert de l'assureur utilise souvent des barèmes
                  de coût inférieurs aux tarifs réels du marché. Un artisan local coûte plus cher que ce que les
                  barèmes prévoient.
                </li>
                <li>
                  <strong>Les biens mobiliers.</strong> Meubles, appareils électroménagers, revêtements de sol, livres,
                  vêtements... La liste des biens endommagés est souvent sous-estimée faute d'inventaire précis au
                  moment de l'expertise.
                </li>
                <li>
                  <strong>La vétusté appliquée abusivement.</strong> Les assureurs appliquent des coefficients de
                  vétusté pour déduire l'ancienneté des biens. Ces coefficients sont parfois appliqués de façon
                  excessive ou sur des postes qui ne le justifient pas.
                </li>
              </ul>
            </section>

            <section id="role" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Ce que fait un expert d'assuré pour votre dossier
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Face à un dégât des eaux, un expert d'assuré intervient à plusieurs niveaux :
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Analyse complète du contrat.</strong> Il identifie toutes les garanties mobilisables, y
                  compris celles que vous n'avez pas pensé à activer (garantie recherche de fuite, garantie
                  embellissement, garantie relogement).
                </li>
                <li>
                  <strong>Expertise indépendante des dommages.</strong> Il dresse un état des lieux exhaustif, en
                  incluant les dommages cachés et les postes que l'expert de l'assureur a omis.
                </li>
                <li>
                  <strong>Chiffrage au prix du marché.</strong> Il valorise les dommages aux tarifs réels, pas aux
                  barèmes sous-évalués des assureurs.
                </li>
                <li>
                  <strong>Négociation contradictoire.</strong> Il confronte son évaluation à celle de l'expert de
                  l'assureur lors d'une réunion formelle. C'est à ce moment que se joue l'essentiel de l'indemnisation.
                </li>
                <li>
                  <strong>Prise en charge complète.</strong> Il gère 100% des échanges avec votre assureur. Vous
                  n'avez rien à faire.
                </li>
                <li>
                  <strong>Rémunération au succès.</strong> Il perçoit 10% de l'indemnisation obtenue, uniquement en cas
                  de résultat. Zéro risque financier pour vous.
                </li>
              </ul>
            </section>

            <section id="etapes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les étapes clés après un dégât des eaux
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Étape 1 : Déclarez dans les 5 jours ouvrés</h3>
                  <p className="mt-1 text-muted-foreground">
                    C'est le délai légal pour déclarer un sinistre à votre assureur. Passé ce délai, votre assureur
                    peut réduire ou refuser l'indemnisation (sauf cas de force majeure).
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 2 : Documentez les dommages</h3>
                  <p className="mt-1 text-muted-foreground">
                    Avant tout nettoyage ou réparation d'urgence : <strong>photographiez tout</strong>. Chaque pièce
                    endommagée, chaque bien abîmé, l'origine visible de la fuite. Ces photos sont votre preuve.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 3 : Conservez les biens endommagés</h3>
                  <p className="mt-1 text-muted-foreground">
                    Ne jetez rien avant l'expertise, même ce qui semble irrécupérable. L'expert de l'assureur doit
                    pouvoir constater les dommages en personne.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 4 : Demandez des devis de réparation</h3>
                  <p className="mt-1 text-muted-foreground">
                    Faites établir des devis par des artisans locaux. Ces devis serviront de base de négociation face
                    à l'expert de l'assureur.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Étape 5 : Mandatez un expert d'assuré avant la réunion contradictoire
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    C'est le moment clé. Une fois la réunion contradictoire tenue et le procès-verbal signé, il est
                    beaucoup plus difficile de contester l'indemnisation. Intervenez <strong>avant</strong>.
                  </p>
                </li>
              </ol>
            </section>

            <section id="delais" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Délais et prescription
              </h2>
              <div className="mt-6 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#F8F9FF]">
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Étape
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Délai
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Déclaration du sinistre
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        5 jours ouvrés après constatation
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Réponse de l'assureur
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        30 jours après réception du dossier complet
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Prescription de l'action
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">2 ans à compter de l'événement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>Le délai de 2 ans est crucial.</strong> Passé ce délai, vous perdez tout droit de recours contre
                votre assureur. Si votre sinistre remonte à plus d'un an, agissez rapidement.
              </p>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">La fuite vient de chez mon voisin : qui paie ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Si la fuite est d'origine privative (chez votre voisin), c'est l'assurance de votre voisin qui
                    prend en charge les dommages chez vous. Votre propre assurance intervient en cas de carence ou de
                    litige. Un expert d'assuré peut vous aider à identifier les responsabilités et à activer les bonnes
                    garanties.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur veut déduire la vétusté : est-ce normal ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, la déduction de vétusté est légale et prévue dans la plupart des contrats. Mais elle est
                    souvent appliquée de façon excessive. Un expert d'assuré vérifie que les taux appliqués sont
                    conformes aux barèmes contractuels et conteste les abus.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je faire des réparations d'urgence avant l'expertise ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, pour les réparations strictement nécessaires (arrêt de fuite, bâchage). Mais documentez tout
                    par photos avant intervention, et conservez les factures. Informez votre assureur de ces travaux
                    d'urgence par écrit.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur tarde à envoyer son expert : que faire ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Si l'assureur ne mandate pas son expert dans un délai raisonnable (2 à 3 semaines), relancez par
                    écrit. Si la situation se prolonge, mandatez un expert d'assuré qui peut initier la procédure
                    contradictoire indépendamment.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Est-ce que ça vaut le coup pour un petit dégât des eaux ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Pour un sinistre inférieur à 1 500 €, l'intervention d'un expert d'assuré est rarement rentable. En
                    revanche, dès que les dommages dépassent 3 000 € (ce qui est fréquent dès qu'un plancher ou une
                    cloison est touché), l'expertise est presque toujours justifiée.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Votre dégât des eaux mérite une analyse sérieuse
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Votre assureur vous a proposé une indemnisation ? Avant d'accepter, faites analyser votre dossier
                gratuitement. En quelques minutes, nous évaluons si votre dossier mérite un recours et vous disons
                clairement si ça vaut le coup.
              </p>
              <p className="mt-4 text-base font-semibold leading-relaxed text-foreground">
                Aucune avance de frais. Aucun engagement.
              </p>
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
              <h2 className="text-[16px] font-semibold text-[#374151]">
                Vous êtes concerné par un autre sinistre ?
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/sinistres/incendie"
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
                >
                  <span>Sinistre incendie : vos droits</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/sinistres/tempete"
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
                >
                  <span>Sinistre tempête : vos droits</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/sinistres/catastrophe-naturelle"
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
                >
                  <span>Catastrophe naturelle : vos droits</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/sinistres/dommages-electriques"
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
                >
                  <span>Dommages électriques : vos droits</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
              <h2 className="text-[16px] font-semibold text-[#374151]">Nos guides gratuits</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/guides/expert-assure"
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
                >
                  <span>Qu'est-ce qu'un expert d'assuré ?</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/guides/assureur-refuse-payer"
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
                >
                  <span>Que faire si mon assureur refuse de payer ?</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </section>
          </div>

          <p className="mt-12 text-center text-xs text-muted-foreground">
            Article rédigé par l'équipe Vertual, avril 2026 · Dernière mise à jour : avril 2026
          </p>

          <footer className="mt-10 border-t border-border pt-10 text-center">
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

