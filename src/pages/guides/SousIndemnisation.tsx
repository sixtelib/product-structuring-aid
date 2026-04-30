import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

const toc = [
  { href: "#definition", label: "Qu'est-ce que la sous-indemnisation ?" },
  { href: "#signes", label: "Les 6 signes que vous êtes sous-indemnisé" },
  { href: "#mecanismes", label: "Les mécanismes les plus fréquents" },
  { href: "#calculer", label: "Comment calculer si vous êtes sous-indemnisé" },
  { href: "#faire", label: "Que faire si vous détectez une sous-indemnisation ?" },
  { href: "#sinistres", label: "Les sinistres les plus touchés" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Sous-indemnisation : comment savoir si votre assureur vous a sous-payé ?",
  description:
    "Votre assureur vous a-t-il vraiment remboursé ce à quoi vous aviez droit ? Découvrez les signes d'une sous-indemnisation et les recours pour obtenir la différence.",
  url: "https://vertual.fr/guides/sous-indemnisation",
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
      name: "J'ai déjà signé la quittance : est-il trop tard ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dans la grande majorité des cas, oui : la quittance pour solde de tout compte clôt le dossier. Il existe des exceptions rares (vice du consentement, erreur manifeste) mais elles sont difficiles à faire valoir. Ne signez jamais sous pression.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de temps ai-je pour contester ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous disposez de 2 ans à compter du sinistre pour agir. Mais plus vous contestez tôt (avant toute signature), plus votre marge de manœuvre est large.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur peut-il refuser de revoir son offre ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, au début. C'est pour cela qu'une contre-expertise documentée (notamment via un expert d'assuré) est efficace lors de la réunion contradictoire.",
      },
    },
    {
      "@type": "Question",
      name: "La sous-assurance, c'est de ma faute ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pas nécessairement. Les valeurs déclarées vieillissent, et elles sont rarement mises à jour. Si vous suspectez une sous-assurance, faites réviser les valeurs garanties de votre contrat.",
      },
    },
    {
      "@type": "Question",
      name: "Un expert d'assuré peut-il intervenir sur un sinistre ancien ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, dans la limite du délai de prescription de 2 ans. Si vous n'avez pas signé de quittance et que le sinistre a moins de 2 ans, un expert d'assuré peut encore intervenir.",
      },
    },
  ],
} as const;

export function SousIndemnisationPage() {
  useJsonLdInHead(articleJsonLd, faqPageJsonLd);

  return (
    <SiteLayout>
      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Guide</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Sous-indemnisation : comment savoir si votre assureur vous a sous-payé ?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Votre assureur vous a-t-il vraiment remboursé ce à quoi vous aviez droit ? Voici les signes d'une
              sous-indemnisation et les recours pour obtenir la différence.
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
                Qu'est-ce que la sous-indemnisation ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La sous-indemnisation est la situation dans laquelle l'indemnisation versée par votre assureur est
                inférieure à ce à quoi vous avez droit selon votre contrat et la réalité de vos dommages.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">Elle peut résulter de :</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Une évaluation incomplète des dommages</li>
                <li>Une application abusive de la vétusté</li>
                <li>Des garanties non activées</li>
                <li>Une mauvaise valorisation des biens</li>
                <li>Des exclusions mal appliquées</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La sous-indemnisation n'est pas toujours intentionnelle, mais elle est systémique : l'assureur traite
                des millions de dossiers et a structurellement intérêt à limiter les indemnisations.
              </p>
            </section>

            <section id="signes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les 6 signes que vous êtes sous-indemnisé
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Signe 1 : L'expert est passé moins d'une heure</h3>
                  <p className="mt-1 text-muted-foreground">
                    Une expertise sérieuse prend du temps. Une visite expresse sur un sinistre significatif est souvent
                    synonyme de postes oubliés.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Signe 2 : Certains postes de dommages ont été ignorés
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Comparez le rapport à vos dommages réels : des biens ou des travaux manquent ? C'est un signal
                    clair.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Signe 3 : L'indemnisation ne couvre pas les devis d'artisans
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Si vos devis locaux dépassent largement l'offre, l'assureur utilise probablement des barèmes
                    sous-évalués.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Signe 4 : Une vétusté élevée a été appliquée sur tout
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    La vétusté est normale, mais pas uniforme et pas à des taux excessifs sur des biens récents.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Signe 5 : Votre contrat mentionne des garanties non activées
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Relogement, frais annexes, valeur à neuf, honoraires : si c'est prévu mais absent, c'est souvent
                    contestable.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Signe 6 : L'assureur vous a poussé à signer vite</h3>
                  <p className="mt-1 text-muted-foreground">
                    Une pression pour accepter rapidement est un signal d'alarme : gardez du temps pour vérifier.
                  </p>
                </li>
              </ol>
            </section>

            <section id="mecanismes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les mécanismes de sous-indemnisation les plus fréquents
              </h2>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">La règle proportionnelle</h3>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Si votre bien est sous-assuré, l'assureur réduit proportionnellement toutes les indemnisations.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Exemple : maison à 300 000 € assurée pour 200 000 € → l'assureur indemnise environ 67% des dommages.
              </p>
              <h3 className="mt-8 font-sans text-lg font-semibold text-foreground">La vétusté non contractuelle</h3>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Des taux supérieurs au contrat ou appliqués à des postes exemptés : comparez les barèmes au rapport.
              </p>
              <h3 className="mt-8 font-sans text-lg font-semibold text-foreground">
                Les dommages immatériels oubliés
              </h3>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Relogement, perte de jouissance, garde-meuble, nettoyage : souvent couverts, souvent omis.
              </p>
              <h3 className="mt-8 font-sans text-lg font-semibold text-foreground">
                Réparation vs remplacement
              </h3>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Vérifiez si votre contrat prévoit la valeur à neuf ou valeur de remplacement.
              </p>
              <h3 className="mt-8 font-sans text-lg font-semibold text-foreground">Dommages consécutifs ignorés</h3>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Humidité, moisissures, dégâts retardés : ils peuvent apparaître après l'expertise initiale.
              </p>
            </section>

            <section id="calculer" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Comment calculer vous-même si vous êtes sous-indemnisé
              </h2>
              <ol className="mt-6 space-y-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Étape 1</strong> : listez tous vos dommages (bâti, mobilier, frais annexes).
                </li>
                <li>
                  <strong>Étape 2</strong> : valorisez chaque poste au prix du marché (devis, remplacement équivalent).
                </li>
                <li>
                  <strong>Étape 3</strong> : comparez au rapport de l'expert (postes manquants, valorisations faibles).
                </li>
                <li>
                  <strong>Étape 4</strong> : vérifiez les garanties activées.
                </li>
                <li>
                  <strong>Étape 5</strong> : calculez l'écart : au-delà de 20%, un recours est souvent justifié.
                </li>
              </ol>
            </section>

            <section id="faire" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Que faire si vous détectez une sous-indemnisation ?
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Ne signez pas la quittance.</strong> Une fois signée, revenir en arrière est très difficile.
                </li>
                <li>
                  <strong>Mandatez un expert d'assuré.</strong> Il identifie les postes sous-évalués et négocie la
                  différence, rémunéré sur résultats.
                </li>
                <li>
                  <strong>Envoyez une lettre de contestation.</strong> Point par point, en recommandé.
                </li>
                <li>
                  <strong>Saisissez le médiateur.</strong> Gratuit, si l'assureur maintient sa position.
                </li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Dans la majorité des cas, un recours aboutit à une indemnisation supplémentaire significative.
              </p>
            </section>

            <section id="sinistres" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les types de sinistres les plus touchés
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Certains sinistres sont statistiquement plus concernés :
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Dégât des eaux</strong> : dommages cachés souvent omis.
                </li>
                <li>
                  <strong>Incendie</strong> : destruction des preuves et complexité technique.
                </li>
                <li>
                  <strong>Catastrophe naturelle (sécheresse)</strong> : dommages structurels difficiles à chiffrer.
                </li>
                <li>
                  <strong>Sinistres professionnels</strong> : pertes d'exploitation, stocks, matériel.
                </li>
                <li>
                  <strong>Règle proportionnelle</strong> : sous-assurance.
                </li>
              </ul>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">Questions fréquentes</h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">J'ai déjà signé la quittance : est-il trop tard ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Dans la grande majorité des cas, oui. Ne signez jamais sous pression.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Combien de temps ai-je pour contester ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    2 ans après le sinistre, mais idéalement avant toute signature.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Mon assureur peut-il refuser de revoir son offre ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui au début. Une contre-expertise documentée change le rapport de force.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">La sous-assurance, c'est de ma faute ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Pas forcément : les valeurs vieillissent. Faites réviser les valeurs de votre contrat.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Un expert d'assuré peut-il intervenir sur un sinistre ancien ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, si le sinistre a moins de 2 ans et sans quittance signée.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Ne laissez pas passer une sous-indemnisation
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La sous-indemnisation est silencieuse. Mais elle représente parfois des milliers d'euros que vous ne
                récupérerez jamais si vous ne contestez pas.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un expert d'assuré analyse votre dossier gratuitement et vous dit si un recours est justifié, et ce
                qu'il pourrait rapporter.
              </p>
              <p className="mt-4 text-base font-semibold leading-relaxed text-foreground">
                Faites analyser votre dossier. Sans engagement, sans avance de frais.
              </p>
            </section>
          </div>

          <section className="mt-12 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
            <h2 className="text-[16px] font-semibold text-[#374151]">À lire aussi</h2>
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
              <Link
                to="/sinistres/degat-des-eaux"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Sinistre dégât des eaux : vos droits</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

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

