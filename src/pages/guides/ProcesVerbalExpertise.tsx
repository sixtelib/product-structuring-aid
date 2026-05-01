import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

const toc = [
  { href: "#definition", label: "Qu'est-ce qu'un procès-verbal d'expertise ?" },
  { href: "#contenu", label: "Que contient un procès-verbal d'expertise ?" },
  { href: "#types", label: "Les différents types de PV et leurs conséquences" },
  { href: "#signer", label: "Faut-il signer le procès-verbal ?" },
  { href: "#comment", label: "Comment signer sans se piéger ?" },
  { href: "#apres", label: "Que faire si vous avez déjà signé ?" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Procès-verbal d'expertise assurance : faut-il signer ?",
  description:
    "L'expert de votre assureur vous demande de signer un procès-verbal. Que contient ce document ? Quelles sont les conséquences ? Quand refuser de signer ? Tout comprendre.",
  url: "https://vertual.fr/guides/proces-verbal-expertise-assurance",
  datePublished: "2026-04-01T00:00:00+02:00",
  dateModified: "2026-04-01T00:00:00+02:00",
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
      name: "L'expert peut-il m'obliger à signer sur place ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Vous avez le droit de refuser de signer immédiatement et de demander un délai de réflexion. Un expert qui vous presse de signer immédiatement doit alerter votre vigilance.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je signer le PV et contester l'indemnisation ensuite ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ça dépend du document signé. Si c'est un PV de constat, oui. Si c'est une quittance pour solde de tout compte, non — sauf dans des cas exceptionnels.",
      },
    },
    {
      "@type": "Question",
      name: "Que faire si l'expert a omis des dommages dans le PV ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Refusez de signer ou ajoutez une réserve manuscrite (ex. « Sous réserves des dommages non mentionnés… »). Puis signalez immédiatement à votre assureur les dommages omis par écrit.",
      },
    },
    {
      "@type": "Question",
      name: "Mon expert d'assuré peut-il signer le PV à ma place ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Le PV doit être signé par l'assuré lui-même. En revanche, votre expert d'assuré peut vous conseiller et peut co-signer le PV contradictoire en sa qualité d'expert.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de temps ai-je pour contester après signature d'un PV non définitif ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si vous n'avez pas signé de quittance, vous disposez du délai de prescription légal — 2 ans à compter du sinistre ou de la notification de l'indemnisation. N'attendez pas.",
      },
    },
  ],
} as const;

export function ProcesVerbalExpertisePage() {
  useJsonLdInHead(articleJsonLd, faqPageJsonLd);

  return (
    <SiteLayout>
      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Guide</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Procès-verbal d'expertise assurance : faut-il signer ?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Ce que vous signez (ou refusez de signer) peut conditionner votre indemnisation. Voici comment éviter
              les pièges et protéger vos droits.
            </p>
          </header>

          <nav aria-label="Sommaire" className="mt-10 rounded-xl border border-border bg-[#F8F9FF] p-5 sm:p-6">
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
                1. Qu'est-ce qu'un procès-verbal d'expertise ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le procès-verbal d'expertise (PV) est le document qui formalise les conclusions de l'expert mandaté
                par votre assureur après la visite des lieux sinistrés. Il constitue la base sur laquelle
                l'assureur va calculer et proposer votre indemnisation.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Ce n'est pas un simple compte-rendu : c'est un document contractuel dont la signature peut avoir
                des conséquences définitives sur votre dossier.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le PV est rédigé par l'expert mandaté par l'assureur : son évaluation reflète d'abord les intérêts
                de l'assureur, pas les vôtres.
              </p>
            </section>

            <section id="contenu" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                2. Que contient un procès-verbal d'expertise ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un procès-verbal d'expertise contient généralement des éléments descriptifs, des éléments
                d'évaluation, et des clauses importantes à repérer.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Les éléments descriptifs</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>L'identité de l'assuré et les références du contrat</li>
                <li>La date et les circonstances du sinistre</li>
                <li>La description des dommages constatés lors de la visite</li>
                <li>Les éléments relatifs aux causes du sinistre</li>
              </ul>

              <h3 className="mt-6 font-semibold text-foreground">Les éléments d'évaluation</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>La liste des dommages retenus (et ceux exclus)</li>
                <li>Les valeurs attribuées à chaque poste</li>
                <li>Les coefficients de vétusté appliqués</li>
                <li>Le montant total des dommages retenus</li>
                <li>La franchise applicable</li>
                <li>Le montant de l'indemnisation proposée</li>
              </ul>

              <h3 className="mt-6 font-semibold text-foreground">Les clauses importantes</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Une mention sur l'accord ou le désaccord de l'assuré</li>
                <li>
                  Parfois une clause de « solde de tout compte » — la plus dangereuse (renonciation à tout recours)
                </li>
              </ul>
            </section>

            <section id="types" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                3. Les différents types de PV et leurs conséquences
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                L'expert peut vous soumettre plusieurs documents, avec des conséquences très différentes.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Le PV de constat</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                Il décrit les dommages constatés, sans valider l'indemnisation. Sa signature confirme surtout la
                visite et les faits constatés.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                <strong>Conséquence :</strong> limitée — vous confirmez les faits, pas l'indemnisation.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Le PV d'expertise contradictoire</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                Établi lors de la réunion entre l'expert de l'assureur et votre expert d'assuré. Il formalise
                l'accord (ou le désaccord) sur l'évaluation des dommages.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                <strong>Conséquence :</strong> importante — c'est la base de votre indemnisation en cas d'accord.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">La quittance pour solde de tout compte</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                C'est le document le plus engageant. En le signant, vous acceptez définitivement l'indemnisation
                proposée et renoncez à tout recours ultérieur pour ce sinistre.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                <strong>Conséquence :</strong> définitive — une fois signé, il est quasi impossible de revenir en
                arrière.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Le rapport d'expertise unilatéral</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                Rédigé par l'expert de l'assureur seul, sans votre présence. Il vous est parfois soumis pour
                signature « pour accord ».
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Ne le signez pas sans l'avoir relu attentivement.
              </p>
            </section>

            <section id="signer" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                4. Faut-il signer le procès-verbal ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La réponse dépend du type de document et de votre situation. La règle d'or : prenez le temps de
                lire. Vous avez le droit d'emporter le document pour le relire chez vous.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Ne signez jamais :</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Une quittance pour solde de tout compte sans être certain que l'indemnisation est juste</li>
                <li>Un PV qui contient des inexactitudes sur les dommages constatés</li>
                <li>Un document que vous n'avez pas eu le temps de lire attentivement</li>
                <li>Tout document sous pression ou dans l'urgence</li>
              </ul>

              <h3 className="mt-6 font-semibold text-foreground">Vous pouvez signer :</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Un PV de constat exact (qui ne valide pas l'indemnisation)</li>
                <li>Un PV d'expertise contradictoire négocié par votre expert d'assuré et avec lequel vous êtes d'accord</li>
              </ul>
            </section>

            <section id="comment" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                5. Comment signer sans se piéger ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Si vous devez signer un document, voici les réflexes de protection.
              </p>

              <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Lisez tout, ligne par ligne.</strong> Chaque poste, chaque montant, chaque coefficient de
                  vétusté. Comparez avec votre propre liste.
                </li>
                <li>
                  <strong>Vérifiez l'exhaustivité.</strong> Tous vos dommages sont-ils mentionnés ? Les dommages
                  cachés sont-ils pris en compte ?
                </li>
                <li>
                  <strong>Repérez la clause « solde de tout compte ».</strong> Toute mention de renonciation à
                  recours doit vous alerter : ne signez pas sans être certain.
                </li>
                <li>
                  <strong>Émettez des réserves par écrit.</strong> Exemple : « Sous réserves de dommages non
                  apparents ».
                </li>
                <li>
                  <strong>Demandez une copie.</strong> Exigez-la systématiquement pour tout document signé.
                </li>
                <li>
                  <strong>Mandatez un expert d'assuré avant signature.</strong> C'est la protection la plus
                  efficace pour éviter une signature irréversible.
                </li>
              </ul>
            </section>

            <section id="apres" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                6. Que faire si vous avez déjà signé ?
              </h2>

              <h3 className="mt-6 font-semibold text-foreground">Si vous avez signé un PV de constat</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                La situation est récupérable : le PV de constat ne fixe pas l'indemnisation. Vous pouvez contester
                l'évaluation qui sera faite sur cette base.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Si vous avez signé un PV d'expertise sans quittance</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                La situation peut rester récupérable : vous pouvez contester l'évaluation et demander une
                contre-expertise si aucune quittance « solde de tout compte » n'a été signée.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Si vous avez signé une quittance pour solde de tout compte</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                C'est la situation la plus difficile : la quittance clôt définitivement le dossier. Les voies de
                recours possibles (vice du consentement, erreur manifeste, lésion) sont rares et complexes.
              </p>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                7. Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">L'expert peut-il m'obliger à signer sur place ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non. Vous avez le droit de demander un délai de réflexion et d'emporter le document.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je signer le PV et contester l'indemnisation ensuite ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Ça dépend : PV de constat, oui. Quittance « solde de tout compte », non (sauf cas exceptionnels).
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Que faire si l'expert a omis des dommages dans le PV ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Refusez de signer ou ajoutez des réserves manuscrites détaillées, puis écrivez à l'assureur
                    immédiatement.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Mon expert d'assuré peut-il signer le PV à ma place ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non. Vous signez vous-même, mais votre expert d'assuré peut vous conseiller et co-signer le PV
                    contradictoire.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Combien de temps ai-je pour contester après signature d'un PV non définitif ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    En l'absence de quittance, vous disposez du délai de prescription légal (souvent 2 ans). N'attendez pas.
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="mt-12 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
            <h2 className="text-[16px] font-semibold text-[#374151]">Ne signez jamais sous pression</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Le procès-verbal d'expertise peut avoir des conséquences définitives. Prenez le temps de lire, de
              comprendre, et de vous faire accompagner avant de signer quoi que ce soit d'important.
            </p>
            <p className="mt-4 text-sm font-semibold text-foreground">Analysez votre dossier gratuitement. Sans engagement.</p>
            <a
              href="#chatbot"
              className="mt-4 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#5B50F0" }}
            >
              Qualifier mon sinistre gratuitement
            </a>
          </section>

          <section className="mt-12 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
            <h2 className="text-[16px] font-semibold text-[#374151]">À lire aussi</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/guides/assureur-refuse-payer"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Que faire si mon assureur refuse de payer ?</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/guides/delai-prescription-assurance"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Délai de prescription assurance : combien de temps pour agir ?</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/guides/expert-assure"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Expert d'assuré : rôle et honoraires</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

          <footer className="mt-16 border-t border-border pt-10 text-center">
            <p className="text-sm text-muted-foreground">Article rédigé par l'équipe Vertual — Avril 2026</p>
            <p className="mt-1 text-sm text-muted-foreground">Dernière mise à jour : Avril 2026</p>
          </footer>
        </article>
      </div>
    </SiteLayout>
  );
}

