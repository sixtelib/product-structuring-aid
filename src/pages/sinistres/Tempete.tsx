import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

const toc = [
  { href: "#couverture", label: "Ce que couvre votre assurance" },
  { href: "#difference", label: "Tempête vs catastrophe naturelle" },
  { href: "#pourquoi", label: "Pourquoi l'indemnisation est sous-évaluée" },
  { href: "#role", label: "Le rôle de l'expert d'assuré" },
  { href: "#etapes", label: "Les étapes à suivre après une tempête" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Expert d'assuré sinistre tempête : obtenez la juste indemnisation",
  description:
    "Votre assureur minimise les dommages après une tempête ? Un expert d'assuré indépendant défend vos intérêts. Analyse gratuite, sans avance de frais.",
  url: "https://vertual.fr/sinistres/tempete",
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
      name: "Mon assureur dit que les vents n'ont pas atteint le seuil requis : que faire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Demandez à votre assureur de vous communiquer par écrit les relevés météorologiques sur lesquels il s'appuie, et la station de mesure utilisée. Les données sont relevées en des points précis qui ne correspondent pas toujours à votre localisation exacte. Un expert d'assuré peut contester cette interprétation (stations voisines, témoignages, dommages constatés).",
      },
    },
    {
      "@type": "Question",
      name: "Ma toiture avait déjà des tuiles abîmées avant la tempête : l'assureur peut-il réduire l'indemnisation ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'assureur peut invoquer un défaut d'entretien pour réduire l'indemnisation sur les parties déjà dégradées, mais il doit prouver que l'état préexistant a directement aggravé les dommages. La réduction ne peut s'appliquer qu'aux parties concernées, pas à l'ensemble du sinistre.",
      },
    },
    {
      "@type": "Question",
      name: "Les dommages à mon jardin (arbres arrachés, clôture) sont-ils couverts ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cela dépend de votre contrat. Certains MRH couvrent explicitement les dommages aux éléments extérieurs (clôtures, abris de jardin, mobilier). D'autres les excluent. Vérifiez les garanties « dépendances et annexes ».",
      },
    },
    {
      "@type": "Question",
      name: "J'ai des panneaux solaires endommagés : sont-ils couverts ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les panneaux solaires sont souvent couverts par la garantie tempête si votre contrat inclut une garantie « équipements extérieurs » ou si vous avez souscrit une extension. C'est un poste fréquemment oublié dans les indemnisations.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je commencer les réparations d'urgence avant l'expertise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, pour les travaux strictement nécessaires (bâchage de toiture, sécurisation). Documentez tout par photos avant intervention, conservez les factures et informez votre assureur par écrit.",
      },
    },
  ],
} as const;

export function TempetePage() {
  useJsonLdInHead(articleJsonLd, faqPageJsonLd);

  return (
    <SiteLayout>
      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Sinistre</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré sinistre tempête : obtenez la juste indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Les sinistres tempête sont en forte hausse en France : +100% sur 20 ans sous l'effet du changement
              climatique. Grêle, vents violents, neige exceptionnelle : ces événements causent des dommages
              considérables, souvent mal indemnisés par les assureurs.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Les sinistres climatiques sont complexes à évaluer, les contrats contiennent des définitions
              restrictives, et les assureurs traitent ces dossiers en masse, ce qui favorise des évaluations rapides
              et insuffisantes.
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
                Ce que couvre votre assurance en cas de tempête
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La garantie tempête est incluse dans la grande majorité des contrats multirisque habitation (MRH). Elle
                couvre les dommages causés par :
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Les vents violents</strong> (généralement au-delà de 100 km/h selon les contrats)
                </li>
                <li>
                  <strong>La grêle</strong> sur la toiture, les vérandas, les fenêtres
                </li>
                <li>
                  <strong>Le poids de la neige ou de la glace</strong> sur les structures
                </li>
                <li>
                  <strong>Les dommages causés par la chute d'arbres ou d'objets</strong> projetés par le vent
                </li>
              </ul>
              <p className="mt-6 text-base font-semibold leading-relaxed text-foreground">Ce qui est généralement couvert :</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Toiture arrachée ou endommagée</li>
                <li>Fenêtres et volets brisés</li>
                <li>Gouttières et chéneaux déformés</li>
                <li>Dommages au mobilier de jardin et aux abris</li>
                <li>Dommages consécutifs (infiltrations d'eau suite à la toiture endommagée)</li>
                <li>Véhicules sur votre propriété (selon les contrats)</li>
              </ul>
            </section>

            <section id="difference" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Tempête vs catastrophe naturelle : quelle différence ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                C'est une distinction cruciale, et elle peut changer radicalement la procédure d'indemnisation.
              </p>
              <div className="mt-6 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#F8F9FF]">
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col" />
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Garantie Tempête
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Régime Catastrophe Naturelle
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Déclenchement
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Automatique si le contrat inclut la garantie
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Nécessite un arrêté ministériel</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Franchise
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Franchise contractuelle (variable)
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Franchise légale fixe (380 € habitation)
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Délai de déclaration
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">5 jours ouvrés</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">10 jours après arrêté</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Couverture
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Définie par le contrat</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Définie par la loi</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Exemples
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Tempête localisée, grêle</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Inondation, sécheresse, submersion
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                En pratique : une même tempête peut déclencher les deux régimes. Un expert d'assuré s'assure que tous
                les régimes applicables sont activés pour votre sinistre.
              </p>
            </section>

            <section id="pourquoi" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi les indemnisations tempête sont souvent sous-évaluées
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les sinistres tempête présentent des caractéristiques qui favorisent la sous-indemnisation.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Le traitement en masse.</strong> Après une tempête, les assureurs reçoivent des milliers de
                  déclarations simultanément. Les expertises sont traitées rapidement, parfois par des experts débordés
                  qui passent peu de temps sur chaque dossier.
                </li>
                <li>
                  <strong>Les dommages cachés sur la toiture.</strong> Une toiture endommagée peut sembler correcte de
                  loin mais présenter des désordres structurels importants (chevrons fissurés, zinguerie décollée,
                  isolation compromise).
                </li>
                <li>
                  <strong>Les dommages consécutifs sous-estimés.</strong> Une toiture percée entraîne des infiltrations
                  qui endommagent l'isolation, les plafonds, les murs, le mobilier. L'évaluation se limite souvent aux
                  dommages visibles le jour de l'expertise.
                </li>
                <li>
                  <strong>La définition contractuelle de « tempête ».</strong> Certains contrats exigent un seuil (100
                  km/h, 120 km/h) pour déclencher la garantie. Un expert d'assuré peut contester l'interprétation
                  (station de mesure, sources, cohérence des dégâts).
                </li>
                <li>
                  <strong>Les franchises mal appliquées.</strong> Elles varient selon les contrats et peuvent être
                  calculées différemment selon les assureurs. Vérifiez la conformité au contrat.
                </li>
              </ul>
            </section>

            <section id="role" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Le rôle de l'expert d'assuré après une tempête
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Inspection technique complète.</strong> Toiture, charpente, façades, éléments exposés.
                </li>
                <li>
                  <strong>Documentation des dommages cachés.</strong> Isolation compromise, structure affaiblie,
                  infiltrations naissantes.
                </li>
                <li>
                  <strong>Vérification du régime applicable.</strong> Tempête, Cat Nat, ou les deux ; franchises
                  conformes au contrat.
                </li>
                <li>
                  <strong>Chiffrage au coût de reconstruction réel.</strong> Prix du marché, coût réel de main d'œuvre
                  pour les travaux en hauteur.
                </li>
                <li>
                  <strong>Suivi des dommages évolutifs.</strong> Intégration au dossier si des dommages apparaissent
                  après l'expertise initiale.
                </li>
              </ul>
            </section>

            <section id="etapes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les étapes à suivre après un sinistre tempête
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Étape 1 : Sécurisez les lieux</h3>
                  <p className="mt-1 text-muted-foreground">
                    Bâchez la toiture endommagée pour éviter d'aggraver les infiltrations. Conservez les matériaux
                    arrachés (tuiles, ardoises) comme preuves.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 2 : Documentez immédiatement</h3>
                  <p className="mt-1 text-muted-foreground">
                    Photographiez tous les dommages visibles (toiture, façades, fenêtres, jardin, véhicules) et filmez
                    le tour complet du bâtiment si possible.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 3 : Déclarez dans les 5 jours ouvrés</h3>
                  <p className="mt-1 text-muted-foreground">
                    Contactez votre assureur et confirmez par écrit. Précisez la date et l'heure approximative de
                    l'événement climatique.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 4 : Vérifiez un arrêté Cat Nat</h3>
                  <p className="mt-1 text-muted-foreground">
                    Consultez votre mairie / préfecture. En cas d'arrêté publié, vous disposez de 10 jours après sa
                    publication pour déclarer ce volet.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Étape 5 : Mandatez un expert d'assuré avant l'expertise contradictoire
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Intervenez avant la réunion contradictoire. Une fois le procès-verbal signé, la marge de
                    négociation est fortement réduite.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 6 : Obtenez des devis locaux</h3>
                  <p className="mt-1 text-muted-foreground">
                    Devis de couvreurs, charpentiers et artisans locaux : ils documentent le coût réel des réparations.
                  </p>
                </li>
              </ol>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur dit que les vents n'ont pas atteint le seuil requis : que faire ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Demandez les relevés météorologiques (station utilisée) et la clause invoquée. Les relevés sont
                    ponctuels et peuvent ne pas refléter exactement votre situation. Un expert d'assuré peut contester
                    l'interprétation (stations voisines, témoignages, cohérence des dommages).
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Ma toiture avait déjà des tuiles abîmées avant la tempête : l'assureur peut-il réduire
                    l'indemnisation ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, sur les parties déjà dégradées, mais seulement s'il prouve que l'état préexistant a aggravé
                    les dommages. La réduction ne doit pas s'appliquer à l'ensemble du sinistre.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Les dommages à mon jardin (arbres arrachés, clôture) sont-ils couverts ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Selon votre contrat : certains couvrent les éléments extérieurs, d'autres les excluent. Vérifiez les
                    garanties « dépendances et annexes ».
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    J'ai des panneaux solaires endommagés : sont-ils couverts ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Souvent oui si la garantie « équipements extérieurs » (ou extension) est prévue. C'est un poste
                    fréquemment oublié dans les indemnisations.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je commencer les réparations d'urgence avant l'expertise ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui pour les travaux nécessaires. Documentez avant, conservez les factures et informez l'assureur
                    par écrit.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                La tempête est passée. Ne laissez pas l'assureur décider seul de ce que ça vaut
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les sinistres tempête sont complexes, les dommages évolutifs, et les assureurs sous pression après
                chaque événement majeur. Un expert d'assuré vous garantit une évaluation exhaustive et une négociation
                à parité.
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

