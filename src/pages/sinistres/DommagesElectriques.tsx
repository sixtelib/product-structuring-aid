import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const toc = [
  { href: "#couverture", label: "Ce que couvre votre assurance" },
  { href: "#causes", label: "Les causes les plus fréquentes" },
  { href: "#pourquoi", label: "Pourquoi l'indemnisation est contestée" },
  { href: "#role", label: "Le rôle de l'expert d'assuré" },
  { href: "#etapes", label: "Les étapes à suivre" },
  { href: "#foudre", label: "Foudre et surtension" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Expert d'assuré dommages électriques : obtenez la juste indemnisation",
  description:
    "Votre assureur refuse ou minimise votre sinistre électrique ? Un expert d'assuré indépendant défend vos intérêts. Analyse gratuite, sans avance de frais.",
  url: "https://vertual.fr/sinistres/dommages-electriques",
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
      name: "Mon assureur dit que mes appareils sont trop vieux pour être indemnisés : est-ce légal ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'ancienneté peut justifier un coefficient de vétusté, mais pas un refus total si la cause du dommage est couverte. Un appareil ancien vaut moins qu'un neuf, mais il a une valeur. L'assureur ne peut pas indemniser zéro pour un appareil fonctionnel détruit par une surtension.",
      },
    },
    {
      "@type": "Question",
      name: "Mon installation électrique n'est pas aux normes : puis-je quand même être indemnisé ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cela dépend du contrat. L'assureur doit prouver que la non-conformité est la cause directe du sinistre, pas simplement qu'elle existait. Un expert d'assuré peut contester l'exclusion si le lien de causalité n'est pas établi.",
      },
    },
    {
      "@type": "Question",
      name: "Ma box internet et mon matériel informatique sont-ils couverts ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Selon votre contrat. Certains MRH couvrent explicitement le matériel informatique et les équipements de communication, d'autres les excluent ou les plafonnent. Un expert d'assuré peut vous aider à interpréter les conditions.",
      },
    },
    {
      "@type": "Question",
      name: "Enedis est responsable de la surtension : puis-je me retourner contre eux ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Si la surtension est due à une défaillance du réseau public, vous pouvez déposer une réclamation auprès d'Enedis en parallèle de votre déclaration à l'assureur. Un expert d'assuré peut vous accompagner dans cette démarche.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de temps ai-je pour déclarer un dommage électrique ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le délai légal est de 5 jours ouvrés après constatation du sinistre. Pour les dommages liés à la foudre, le délai court à partir du moment où vous constatez les dégâts, pas nécessairement le jour de l'orage.",
      },
    },
  ],
} as const;

export function DommagesElectriquesPage() {
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
              Expert d'assuré dommages électriques : obtenez la juste indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Surtension, court-circuit, foudre, variation de courant... Les dommages électriques touchent chaque année
              des centaines de milliers de foyers. C'est aussi l'un des sinistres où les refus et sous-indemnisations
              sont les plus fréquents.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Les assureurs s'appuient souvent sur des clauses techniques complexes pour limiter l'indemnisation. Un
              expert d'assuré rééquilibre le rapport de force.
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
            <section id="couverture" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Ce que couvre votre assurance pour les dommages électriques
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La garantie dommages électriques n'est pas toujours incluse de base dans les contrats MRH ; elle est
                souvent optionnelle ou via une extension.
              </p>
              <p className="mt-6 text-base font-semibold leading-relaxed text-foreground">Ce qui est généralement couvert :</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Dommages causés par la <strong>foudre</strong> (directe ou indirecte)</li>
                <li>Dommages causés par une <strong>surtension</strong> du réseau électrique</li>
                <li>Dommages causés par un <strong>court-circuit</strong> d'origine accidentelle</li>
                <li>Dommages causés par une <strong>variation brusque de courant</strong></li>
                <li><strong>Électroménager</strong>, <strong>informatique</strong> et électronique (selon les contrats)</li>
                <li><strong>Installations électriques fixes</strong> (tableau, câblage)</li>
              </ul>
              <p className="mt-6 text-base font-semibold leading-relaxed text-foreground">Ce qui est souvent exclu :</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Usure normale</li>
                <li>Pannes mécaniques sans cause électrique identifiée</li>
                <li>Appareils non déclarés ou très anciens (selon clauses)</li>
                <li>Dommages consécutifs à un défaut d'entretien</li>
              </ul>
            </section>

            <section id="causes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les causes les plus fréquentes de dommages électriques
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La <strong>foudre</strong> est la cause la plus spectaculaire : un impact à proximité peut détruire
                simultanément tous les appareils connectés.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les <strong>surtensions du réseau</strong> sont plus fréquentes ; elles surviennent lors de coupures,
                travaux ou incidents sur le réseau public et endommagent particulièrement les appareils sensibles.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les <strong>courts-circuits</strong> peuvent endommager tableau, câblage et appareils, et parfois
                provoquer un incendie (dans ce cas, la garantie incendie prend le relais).
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les <strong>variations de courant</strong> affectent fortement les équipements électroniques (TV,
                ordinateurs, box internet, appareils médicaux).
              </p>
            </section>

            <section id="pourquoi" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi les indemnisations sont souvent contestées
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Difficulté à prouver la cause.</strong> Un dommage électrique ne laisse pas toujours de trace
                  visible : l'assureur peut contester la cause (surtension, foudre) si elle n'est pas documentée.
                </li>
                <li>
                  <strong>Exclusions techniques.</strong> Appareils de plus de X années, installation non conforme,
                  défaut d'entretien : ces clauses sont parfois appliquées de façon extensive.
                </li>
                <li>
                  <strong>Vétusté massive.</strong> Les coefficients peuvent réduire fortement l'indemnisation.
                </li>
                <li>
                  <strong>Périmètre des appareils couverts.</strong> Certains contrats plafonnent ou excluent certains
                  équipements (portable, hi-fi, informatique).
                </li>
                <li>
                  <strong>Preuve de possession.</strong> Sans facture, certains assureurs refusent d'indemniser. On peut
                  souvent reconstituer la preuve (relevés bancaires, photos, déclarations).
                </li>
              </ul>
            </section>

            <section id="role" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Le rôle de l'expert d'assuré
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Analyse du contrat.</strong> Identifier les garanties applicables et leurs conditions.
                </li>
                <li>
                  <strong>Inventaire exhaustif.</strong> Liste des appareils touchés + preuves + valeurs de remplacement.
                </li>
                <li>
                  <strong>Contestation de la vétusté.</strong> Vérification poste par poste.
                </li>
                <li>
                  <strong>Preuve de la cause.</strong> Relevés météo (foudre), rapports Enedis (surtension), constats
                  techniques.
                </li>
                <li>
                  <strong>Négociation contradictoire.</strong> Défense de chaque poste face à l'expert de l'assureur.
                </li>
              </ul>
            </section>

            <section id="etapes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les étapes à suivre après un dommage électrique
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Étape 1 : Ne jetez aucun appareil</h3>
                  <p className="mt-1 text-muted-foreground">
                    Les appareils endommagés sont vos preuves. Ne jetez rien avant l'expertise.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 2 : Documentez immédiatement</h3>
                  <p className="mt-1 text-muted-foreground">
                    Photos des appareils, prises brûlées, tableau électrique. Notez date et heure approximative.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 3 : Signalez à Enedis si surtension réseau</h3>
                  <p className="mt-1 text-muted-foreground">
                    En cas de suspicion réseau, signalez l'incident : un rapport Enedis est une preuve précieuse.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 4 : Déclarez dans les 5 jours ouvrés</h3>
                  <p className="mt-1 text-muted-foreground">
                    Déclarez à l'assureur et confirmez par écrit. Listez tous les appareils touchés.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 5 : Rassemblez les preuves de possession</h3>
                  <p className="mt-1 text-muted-foreground">
                    Factures, garanties, relevés bancaires, photos. Pour les appareils anciens, une déclaration sur
                    l'honneur peut parfois suffire.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 6 : Mandatez un expert si le montant est significatif</h3>
                  <p className="mt-1 text-muted-foreground">
                    Au-delà de 2 000 €, c'est souvent rentable : la vétusté seule peut représenter plusieurs centaines
                    d'euros récupérables.
                  </p>
                </li>
              </ol>
            </section>

            <section id="foudre" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Foudre et surtension : cas particuliers
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La <strong>foudre directe</strong> est souvent bien couverte. La <strong>foudre indirecte</strong> est
                plus difficile à prouver : les relevés météo et données de détection peuvent aider.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La <strong>surtension réseau</strong> est fréquente mais parfois niée : réunissez rapport Enedis,
                témoignages de voisins, et relevés Linky si disponibles.
              </p>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur dit que mes appareils sont trop vieux pour être indemnisés : est-ce légal ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    La vétusté peut réduire l'indemnisation mais ne justifie pas un refus total si la cause est couverte.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon installation électrique n'est pas aux normes : puis-je quand même être indemnisé ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    L'assureur doit prouver un lien direct entre la non-conformité et le sinistre. C'est souvent contestable.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Ma box internet et mon matériel informatique sont-ils couverts ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Selon les contrats : certains couvrent explicitement, d'autres excluent ou plafonnent.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Enedis est responsable de la surtension : puis-je me retourner contre eux ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, via une réclamation Enedis en parallèle de la déclaration à l'assureur.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Combien de temps ai-je pour déclarer ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    5 jours ouvrés après constatation du sinistre.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Dommages électriques : chaque appareil compte
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un sinistre électrique peut représenter plusieurs milliers d'euros. Les assureurs comptent sur la
                complexité technique pour décourager les recours. Un expert d'assuré connaît les arguments, les preuves à
                réunir et les postes à défendre.
              </p>
              <p className="mt-4 text-base font-semibold leading-relaxed text-foreground">
                Analysez votre dossier gratuitement. Sans engagement.
              </p>
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
              <h2 className="text-[16px] font-semibold text-[#374151]">
                Vous êtes concerné par un autre sinistre ?
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/sinistres/degat-des-eaux"
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
                >
                  <span>Sinistre dégât des eaux : vos droits</span>
                  <span aria-hidden>→</span>
                </Link>
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

