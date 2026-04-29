import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const toc = [
  { href: "#pourquoi", label: "Comprendre pourquoi votre assureur refuse" },
  { href: "#contrat", label: "Recours 1 — Relire votre contrat en détail" },
  { href: "#lettre", label: "Recours 2 — Envoyer une lettre de contestation" },
  { href: "#expert", label: "Recours 3 — Faire appel à un expert d'assuré" },
  { href: "#mediateur", label: "Recours 4 — Saisir le médiateur de l'assurance" },
  { href: "#judiciaire", label: "Recours 5 — Engager une procédure judiciaire" },
  { href: "#ordre", label: "Dans quel ordre procéder ?" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Que faire si mon assureur refuse de payer ? (Guide complet 2026)",
  description:
    "Votre assureur refuse de rembourser votre sinistre ? Découvrez les 5 recours concrets pour contester un refus d'indemnisation et obtenir ce à quoi vous avez droit.",
  url: "https://vertual.fr/guides/assureur-refuse-payer",
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
      name: "Mon assureur a déjà versé une indemnisation partielle. Puis-je encore contester ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, dans la plupart des cas. Le versement d'une indemnisation partielle ne vaut pas acceptation définitive si vous n'avez pas signé de quittance pour solde de tout compte. Consultez un expert d'assuré avant de signer quoi que ce soit.",
      },
    },
    {
      "@type": "Question",
      name: "Quel est le délai de prescription pour contester ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En droit des assurances français, le délai de prescription est de 2 ans à compter de l'événement qui donne naissance à l'action. Ce délai peut être suspendu par une médiation ou interrompu par une action en justice.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur peut-il résilier mon contrat si je conteste ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non, le fait de contester une décision de votre assureur ne peut pas justifier une résiliation de votre contrat. Une résiliation pour ce motif serait abusive et contestable.",
      },
    },
    {
      "@type": "Question",
      name: "Est-ce que ça vaut le coup pour un petit sinistre ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pour un sinistre inférieur à 1 500 €, les recours formels (expert, médiation, justice) sont rarement rentables. En revanche, une simple lettre de contestation bien rédigée peut suffire. Pour les sinistres supérieurs à 3 000 €, un expert d'assuré est presque toujours justifié.",
      },
    },
    {
      "@type": "Question",
      name: "Que faire si mon assureur ne répond plus ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'absence de réponse à une réclamation écrite dans un délai de 2 mois vous ouvre le droit de saisir le médiateur. Conservez toutes les preuves d'envoi (recommandés, emails).",
      },
    },
  ],
} as const;

export function AssureurRefusePayerPage() {
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
              Que faire si mon assureur refuse de payer ?{" "}
              <span className="text-2xl font-semibold sm:text-3xl">(Guide complet 2026)</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Votre assureur refuse de prendre en charge votre sinistre. Ou il vous propose une indemnisation
              si basse qu'elle ne couvre pas vos dommages réels. Que faire ?
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              La bonne nouvelle : un refus d'assurance n'est jamais définitif. Vous disposez de plusieurs recours
              concrets — et l'un d'eux, en particulier, change radicalement le rapport de force en votre faveur.
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
            <section id="pourquoi" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Comprendre pourquoi votre assureur refuse
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Avant d'agir, il faut comprendre la nature exacte du refus. Il en existe trois types :
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Refus total</strong> : l'assureur considère que le sinistre n'est pas couvert par votre
                  contrat. C'est le cas le plus fréquent — et souvent le plus contestable.
                </li>
                <li>
                  <strong>Refus partiel</strong> : l'assureur accepte de prendre en charge une partie du sinistre
                  mais exclut certains postes de dommages. Par exemple, il couvre les dégâts structurels mais pas
                  le mobilier.
                </li>
                <li>
                  <strong>Offre insuffisante</strong> : techniquement ce n'est pas un refus, mais l'indemnisation
                  proposée est si éloignée de la réalité des dommages qu'elle revient à un refus partiel déguisé.
                </li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Dans tous les cas,{" "}
                <strong>demandez à votre assureur de vous confirmer son refus par écrit</strong>, avec les clauses
                précises du contrat sur lesquelles il s'appuie. C'est votre point de départ pour tout recours.
              </p>
            </section>

            <section id="contrat" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Recours 1 — Relire votre contrat en détail
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                C'est l'étape que la plupart des assurés sautent — et c'est une erreur.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les contrats d'assurance sont complexes, mais ils contiennent souvent des garanties que vous n'avez
                pas activées faute de les connaître. Voici ce qu'il faut chercher :
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Les garanties annexes.</strong> Votre contrat multirisque habitation contient probablement
                  bien plus que les garanties principales. Dommages électriques, bris de glace, protection
                  juridique, garantie événements climatiques... Chaque garantie a ses propres conditions
                  d'activation.
                </li>
                <li>
                  <strong>Les définitions contractuelles.</strong> Les mots ont un sens précis dans un contrat
                  d'assurance. « Dégât des eaux », « incendie », « tempête » sont définis avec des critères
                  spécifiques. Un sinistre refusé sous une définition peut être accepté sous une autre.
                </li>
                <li>
                  <strong>Les exclusions.</strong> L'assureur cite souvent une clause d'exclusion pour justifier son
                  refus. Vérifiez que cette exclusion est bien rédigée, claire, et qu'elle s'applique réellement à
                  votre situation. Une exclusion ambiguë s'interprète en faveur de l'assuré.
                </li>
                <li>
                  <strong>Les délais de déclaration.</strong> Certains refus sont liés à un dépassement de délai de
                  déclaration. Vérifiez si ce délai est opposable dans votre cas.
                </li>
              </ul>
              <blockquote className="mt-6 border-l-4 border-[#5B50F0] bg-[#F8F9FF] py-3 pl-4 pr-4 text-sm leading-relaxed text-foreground">
                <strong className="text-[#5B50F0]">À retenir :</strong> si vous ne comprenez pas votre contrat,
                c'est normal — il n'est pas fait pour être compris facilement. C'est précisément le rôle d'un expert
                d'assuré que de le décrypter pour vous.
              </blockquote>
            </section>

            <section id="lettre" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Recours 2 — Envoyer une lettre de contestation
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Une fois que vous avez identifié les points faibles du refus de votre assureur, vous pouvez envoyer
                une <strong>lettre de contestation en recommandé avec accusé de réception</strong>.
              </p>
              <p className="mt-4 text-base font-semibold text-foreground">Cette lettre doit contenir :</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>La référence de votre contrat et de votre sinistre</li>
                <li>Un rappel des faits et de la date du sinistre</li>
                <li>La citation précise des garanties que vous estimez applicables</li>
                <li>La contestation point par point des arguments de l'assureur</li>
                <li>Une demande de révision de la décision dans un délai de 15 jours</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>Ce que cette lettre accomplit :</strong> elle crée une trace écrite, elle force l'assureur à
                reformuler sa position par écrit, et elle constitue la base de tout recours ultérieur.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                <strong>Ce qu'elle ne fait pas :</strong> elle ne garantit pas un résultat. Face à un assureur
                déterminé, une lettre seule a peu de chances de changer la décision.
              </p>
            </section>

            <section id="expert" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Recours 3 — Faire appel à un expert d'assuré
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                C'est le recours le plus efficace — et pourtant le moins connu.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un <strong>expert d'assuré</strong> est un professionnel indépendant dont le seul rôle est de
                défendre vos intérêts face à votre assureur. Contrairement à l'expert mandaté par votre assureur,
                il travaille exclusivement pour vous.
              </p>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">Concrètement, il va :</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Analyser votre contrat pour identifier toutes les garanties mobilisables</li>
                <li>Évaluer vos dommages de façon indépendante et exhaustive</li>
                <li>Rédiger un contre-rapport technique</li>
                <li>Négocier directement avec l'expert de l'assureur lors d'une réunion contradictoire</li>
                <li>Prendre en charge 100% des échanges avec votre assureur</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>Le modèle économique est aligné sur vos intérêts :</strong> l'expert d'assuré est rémunéré
                uniquement en cas de succès, sur la base d'un pourcentage de l'indemnisation obtenue (généralement
                10%). Si rien n'est obtenu, vous ne payez rien.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                <strong>Résultat moyen :</strong> les dossiers traités avec un expert d'assuré aboutissent à des
                indemnisations significativement supérieures aux offres initiales des assureurs — souvent le
                double ou plus.
              </p>
            </section>

            <section id="mediateur" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Recours 4 — Saisir le médiateur de l'assurance
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Si votre assureur maintient son refus après votre lettre de contestation, vous pouvez saisir le{" "}
                <strong>Médiateur de l'Assurance</strong> — un organisme indépendant gratuit.
              </p>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">
                Conditions pour saisir le médiateur :
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Avoir d'abord contacté le service réclamation de votre assureur par écrit</li>
                <li>Ne pas avoir reçu de réponse satisfaisante dans un délai de 2 mois</li>
                <li>Le litige doit concerner un contrat d'assurance (pas une question de cotisation)</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>Comment saisir :</strong> via le site{" "}
                <a
                  href="https://www.mediateur-assurance.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#5B50F0] underline decoration-[#5B50F0]/30 underline-offset-2 hover:decoration-[#5B50F0]"
                >
                  mediateur-assurance.org
                </a>{" "}
                ou par courrier.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                <strong>Délai de traitement :</strong> 3 à 6 mois en moyenne.
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                <strong>Limites :</strong> la décision du médiateur n'est pas contraignante pour l'assureur (même
                si dans la pratique, les assureurs suivent généralement ses recommandations). Et la médiation
                suspend le délai de prescription, mais ne le remplace pas.
              </p>
              <blockquote className="mt-6 border-l-4 border-[#5B50F0] bg-[#F8F9FF] py-3 pl-4 pr-4 text-sm leading-relaxed text-foreground">
                <strong className="text-[#5B50F0]">Important :</strong> la médiation et l'intervention d'un expert
                d'assuré ne sont pas exclusives. Vous pouvez mandater un expert d'assuré tout en saisissant le
                médiateur.
              </blockquote>
            </section>

            <section id="judiciaire" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Recours 5 — Engager une procédure judiciaire
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                C'est le recours de dernier ressort. Il est envisageable quand tous les autres ont échoué et que les
                enjeux financiers le justifient.
              </p>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">Avant de saisir un tribunal :</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  Vérifiez si votre contrat inclut une <strong>garantie protection juridique</strong> — elle peut
                  couvrir vos frais d'avocat
                </li>
                <li>Consultez un avocat spécialisé en droit des assurances pour évaluer vos chances</li>
                <li>
                  Attention aux délais de prescription : en assurance, le délai est de{" "}
                  <strong>2 ans</strong> à compter de l'événement qui y donne naissance
                </li>
              </ul>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">Quelle juridiction ?</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Litige inférieur à 10 000 € → Tribunal de proximité</li>
                <li>Litige entre 10 000 € et 20 000 € → Tribunal judiciaire (juge unique)</li>
                <li>Litige supérieur à 20 000 € → Tribunal judiciaire (formation collégiale)</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                La voie judiciaire est longue (1 à 3 ans) et coûteuse. Elle est réservée aux dossiers où les autres
                recours ont échoué et où les montants en jeu sont significatifs.
              </p>
            </section>

            <section id="ordre" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Dans quel ordre procéder ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Voici la séquence recommandée, du plus rapide au plus lourd :
              </p>
              <ol className="mt-6 space-y-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Étape 1 (immédiat)</strong> — Demandez le refus par écrit avec les clauses invoquées.
                </li>
                <li>
                  <strong>Étape 2 (1 à 2 semaines)</strong> — Relisez votre contrat en détail, identifiez les
                  points contestables.
                </li>
                <li>
                  <strong>Étape 3 (en parallèle)</strong> — Mandatez un expert d'assuré. C'est l'étape qui change le
                  plus le rapport de force, sans risque financier pour vous.
                </li>
                <li>
                  <strong>Étape 4 (si l'expert n'a pas suffi)</strong> — Envoyez une lettre de contestation formelle
                  au service réclamation.
                </li>
                <li>
                  <strong>Étape 5 (2 mois après la lettre)</strong> — Saisissez le médiateur de l'assurance.
                </li>
                <li>
                  <strong>Étape 6 (dernier recours)</strong> — Consultez un avocat et évaluez la voie judiciaire.
                </li>
              </ol>
              <blockquote className="mt-6 border-l-4 border-[#5B50F0] bg-[#F8F9FF] py-3 pl-4 pr-4 text-sm leading-relaxed text-foreground">
                <strong className="text-[#5B50F0]">Dans la grande majorité des cas, les étapes 1 à 3 suffisent.</strong>{" "}
                Un expert d'assuré expérimenté résout la plupart des litiges sans passer par la médiation ou la
                justice.
              </blockquote>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur a déjà versé une indemnisation partielle. Puis-je encore contester ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, dans la plupart des cas. Le versement d'une indemnisation partielle ne vaut pas acceptation
                    définitive si vous n'avez pas signé de quittance pour solde de tout compte. Consultez un expert
                    d'assuré avant de signer quoi que ce soit.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Quel est le délai de prescription pour contester ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    En droit des assurances français, le délai de prescription est de <strong>2 ans</strong> à
                    compter de l'événement qui donne naissance à l'action. Ce délai peut être suspendu par une
                    médiation ou interrompu par une action en justice.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur peut-il résilier mon contrat si je conteste ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non, le fait de contester une décision de votre assureur ne peut pas justifier une résiliation de
                    votre contrat. Une résiliation pour ce motif serait abusive et contestable.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Est-ce que ça vaut le coup pour un petit sinistre ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Pour un sinistre inférieur à 1 500 €, les recours formels (expert, médiation, justice) sont
                    rarement rentables. En revanche, une simple lettre de contestation bien rédigée peut suffire.
                    Pour les sinistres supérieurs à 3 000 €, un expert d'assuré est presque toujours justifié.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Que faire si mon assureur ne répond plus ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    L'absence de réponse à une réclamation écrite dans un délai de 2 mois vous ouvre le droit de
                    saisir le médiateur. Conservez toutes les preuves d'envoi (recommandés, emails).
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">En résumé</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Face à un refus d'assurance, vous n'êtes pas sans recours. La clé est d'agir vite, par écrit, et de ne
                pas rester seul face à votre assureur.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>L'expert d'assuré est le recours le plus efficace et le moins risqué</strong> : sans avance
                de frais, sans procédure judiciaire, et avec un professionnel qui connaît les pratiques des assureurs
                de l'intérieur.
              </p>
              <p className="mt-4 text-base font-medium leading-relaxed text-foreground">
                Votre assureur refuse de payer ? Décrivez votre situation — nous analysons gratuitement si votre
                dossier mérite un recours.
              </p>
            </section>
          </div>

          <p className="mt-12 text-center text-xs text-muted-foreground">
            Article rédigé par l'équipe Vertual — avril 2026 · Dernière mise à jour : avril 2026
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
