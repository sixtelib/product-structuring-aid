import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const toc = [
  { href: "#couverture", label: "Ce que couvre votre assurance" },
  { href: "#pourquoi", label: "Pourquoi l'indemnisation est contestable" },
  { href: "#role", label: "Le rôle de l'expert d'assuré" },
  { href: "#etapes", label: "Les étapes critiques après un incendie" },
  { href: "#responsabilite", label: "Incendie et responsabilité" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Expert d'assuré sinistre incendie : défendez votre indemnisation",
  description:
    "Après un incendie, votre assureur minimise les dommages ? Un expert d'assuré indépendant défend vos intérêts et maximise votre indemnisation. Sans avance de frais.",
  url: "https://vertual.fr/sinistres/incendie",
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
      name: "Mon assureur invoque un défaut d'entretien pour réduire l'indemnisation : est-ce légal ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, mais sous conditions strictes. L'assureur doit prouver que le défaut d'entretien est la cause directe du sinistre, et que cette exclusion est clairement mentionnée dans votre contrat. Une exclusion ambiguë s'interprète en faveur de l'assuré. Un expert d'assuré peut contester cette invocation si elle n'est pas solidement fondée.",
      },
    },
    {
      "@type": "Question",
      name: "Je suis locataire : suis-je couvert en cas d'incendie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, si vous avez une assurance habitation (obligatoire pour les locataires). Votre assurance couvre vos biens mobiliers et votre responsabilité locative (dommages causés à l'immeuble). Le propriétaire est couvert par sa propre assurance pour le bâti.",
      },
    },
    {
      "@type": "Question",
      name: "Mon installation électrique était ancienne : l'assureur peut-il refuser ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une installation électrique ancienne ne justifie pas automatiquement un refus. L'assureur doit prouver un lien direct entre l'état de l'installation et le sinistre, et que cette situation constituait une exclusion contractuelle explicite. C'est souvent contestable avec l'aide d'un expert.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de temps prend le règlement d'un sinistre incendie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un sinistre incendie simple peut être réglé en 2 à 4 mois. Un sinistre complexe (maison totalement détruite, litige sur les responsabilités, montants élevés) peut prendre 6 à 18 mois. Un expert d'assuré permet souvent d'accélérer le processus en structurant le dossier dès le départ.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je contester une indemnisation que j'ai déjà acceptée ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si vous avez signé une quittance pour solde de tout compte, c'est très difficile, sauf en cas de vice du consentement (erreur, dol, violence) prouvable. C'est pourquoi il est crucial de ne signer aucun accord sans avoir vérifié qu'il est juste. Si vous n'avez pas encore signé, il est encore temps d'agir.",
      },
    },
  ],
} as const;

export function IncendiePage() {
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
              Expert d'assuré sinistre incendie : défendez votre indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Un sinistre incendie est l'un des événements les plus dévastateurs qu'un particulier ou une entreprise
              puisse traverser. C'est aussi l'un des sinistres où les enjeux financiers sont les plus élevés, et où
              les assureurs ont le plus d'intérêt à minimiser l'indemnisation.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Les tickets moyens d'un sinistre incendie dépassent souvent 30 000 €. À ces montants, chaque poste de
              dommage mal évalué représente des milliers d'euros perdus.
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
                Ce que couvre votre assurance en cas d'incendie
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un contrat multirisque habitation standard couvre généralement :
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Les dommages directs par le feu</strong> : structure du bâtiment, toiture, murs, planchers
                </li>
                <li>
                  <strong>Les dommages par fumée</strong> : même sans contact direct avec les flammes, la fumée détruit
                  les biens mobiliers, les textiles, les appareils électroniques
                </li>
                <li>
                  <strong>Les dommages par l'eau des pompiers</strong> : l'intervention des secours cause souvent des
                  dégâts considérables
                </li>
                <li>
                  <strong>Les frais de déblaiement</strong> : évacuation des décombres
                </li>
                <li>
                  <strong>Les frais de relogement</strong> : si le logement est inhabitable
                </li>
                <li>
                  <strong>Le mobilier et les biens personnels</strong> : vêtements, électroménager, meubles, objets de
                  valeur
                </li>
              </ul>
              <p className="mt-6 text-base font-semibold leading-relaxed text-foreground">
                Les garanties souvent oubliées :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Perte de loyer (pour les propriétaires bailleurs)</li>
                <li>Frais de garde-meuble pendant les travaux</li>
                <li>Honoraires d'architecte pour la reconstruction</li>
                <li>Relogement d'animaux de compagnie</li>
              </ul>
            </section>

            <section id="pourquoi" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi les indemnisations incendie sont souvent contestables
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Un sinistre incendie est complexe à évaluer, et cette complexité joue systématiquement en faveur de
                l'assureur si vous n'êtes pas accompagné.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>La destruction des preuves.</strong> Le feu détruit les biens et les preuves de leur
                  existence simultanément. Sans inventaire préalable, il est difficile de prouver ce que vous
                  possédiez. L'assureur en profite pour contester certains postes.
                </li>
                <li>
                  <strong>L'évaluation des dommages structurels.</strong> Les dommages visibles ne représentent souvent
                  qu'une partie de la réalité. Structures affaiblies par la chaleur, dommages aux fondations,
                  infiltrations liées à l'eau des pompiers : cela nécessite une expertise technique poussée.
                </li>
                <li>
                  <strong>La vétusté sur les biens mobiliers.</strong> Les assureurs appliquent des coefficients de
                  vétusté qui peuvent réduire drastiquement l'indemnisation sur les meubles, appareils et vêtements.
                  Ces coefficients sont souvent contestables.
                </li>
                <li>
                  <strong>Les exclusions mal appliquées.</strong> Certains assureurs invoquent des exclusions (défaut
                  d'entretien, installation électrique non conforme) pour réduire ou refuser l'indemnisation. Ces
                  exclusions doivent être prouvées par l'assureur. Elles ne peuvent pas être présumées.
                </li>
                <li>
                  <strong>La pression temporelle.</strong> Après un incendie, l'assuré est en situation de vulnérabilité,
                  souvent sans logement et sous stress. Les assureurs le savent et peuvent pousser à une acceptation rapide
                  d'une offre insuffisante.
                </li>
              </ul>
            </section>

            <section id="role" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Le rôle de l'expert d'assuré après un incendie
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Face à un sinistre incendie, l'expert d'assuré est particulièrement précieux : les enjeux sont élevés
                et la complexité technique importante.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Inventaire exhaustif des biens détruits.</strong> Reconstitution de la liste complète des
                  biens endommagés ou détruits (souvenirs, photos, factures disponibles, relevés bancaires).
                </li>
                <li>
                  <strong>Expertise technique indépendante.</strong> Évaluation des dommages structurels avec ses outils
                  et références, et recours possible à des spécialistes (charpentiers, électriciens, experts en
                  bâtiment).
                </li>
                <li>
                  <strong>Contestation de la vétusté.</strong> Vérification et contestation des coefficients de
                  vétusté, poste par poste.
                </li>
                <li>
                  <strong>Activation de toutes les garanties.</strong> Mobilisation des garanties moins connues
                  (relogement, honoraires d'architecte, frais annexes).
                </li>
                <li>
                  <strong>Négociation à parité.</strong> Réunion contradictoire documentée face à l'expert de
                  l'assureur.
                </li>
                <li>
                  <strong>Accompagnement humain.</strong> L'expert d'assuré prend tout en charge, vous n'avez pas à
                  gérer le litige.
                </li>
              </ul>
            </section>

            <section id="etapes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les étapes critiques après un incendie
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Étape 1 : Sécurité avant tout</h3>
                  <p className="mt-1 text-muted-foreground">
                    Ne rentrez pas dans les locaux sinistrés sans l'accord des pompiers et des autorités. Un bâtiment
                    touché par un incendie peut être structurellement instable.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 2 : Déclarez immédiatement</h3>
                  <p className="mt-1 text-muted-foreground">
                    Appelez votre assureur dans les 5 jours ouvrés. Pour un sinistre incendie, la déclaration est
                    souvent faite dans les 24h, mais confirmez par écrit (lettre recommandée ou email avec accusé).
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 3 : Documentez avant tout nettoyage</h3>
                  <p className="mt-1 text-muted-foreground">
                    Si vous pouvez accéder aux lieux en sécurité : photographiez et filmez tout. Chaque pièce, chaque
                    bien visible, les dommages structurels. Ces images sont votre seule preuve avant le nettoyage.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 4 : Reconstituez l'inventaire</h3>
                  <p className="mt-1 text-muted-foreground">
                    Listez tous les biens détruits ou endommagés : électroménager, meubles, vêtements, matériel
                    informatique, objets de valeur. Retrouvez les factures, relevés bancaires, photos, etc.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Étape 5 : Mandatez un expert d'assuré AVANT la réunion contradictoire
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    La réunion contradictoire fixe les bases de l'indemnisation. Une fois le procès-verbal signé,
                    revenir en arrière est très difficile.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 6 : Ne signez rien sans avoir compris</h3>
                  <p className="mt-1 text-muted-foreground">
                    Ne signez aucun document (quittance, procès-verbal, accord d'indemnisation) sans l'avoir relu
                    attentivement, idéalement avec votre expert d'assuré.
                  </p>
                </li>
              </ol>
            </section>

            <section id="responsabilite" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Incendie et responsabilité : qui paie quoi ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La question de la responsabilité est centrale dans un sinistre incendie.
              </p>
              <div className="mt-6 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#F8F9FF]">
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Origine de l'incendie
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Qui prend en charge
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Votre logement (accidentel)
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Votre assurance MRH</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Votre logement (négligence prouvée)
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Votre assurance MRH (avec possible franchise augmentée)
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Logement voisin
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Assurance du voisin + votre MRH en complément
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Parties communes (copropriété)
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Assurance de la copropriété</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Tiers identifié (incendie criminel)
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Votre MRH + recours contre le tiers via assurance
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-medium text-foreground sm:px-5" scope="row">
                        Catastrophe naturelle associée
                      </th>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Régime Cat Nat en complément</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Dans les cas complexes (origine multiple, plusieurs logements), un expert d'assuré est particulièrement
                utile pour démêler les responsabilités et activer les bonnes garanties.
              </p>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur invoque un défaut d'entretien pour réduire l'indemnisation : est-ce légal ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, mais sous conditions strictes. L'assureur doit prouver que le défaut d'entretien est la cause
                    directe du sinistre, et que cette exclusion est clairement mentionnée dans votre contrat. Une
                    exclusion ambiguë s'interprète en faveur de l'assuré. Un expert d'assuré peut contester cette
                    invocation si elle n'est pas solidement fondée.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Je suis locataire : suis-je couvert en cas d'incendie ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, si vous avez une assurance habitation (obligatoire pour les locataires). Votre assurance
                    couvre vos biens mobiliers et votre responsabilité locative (dommages causés à l'immeuble). Le
                    propriétaire est couvert par sa propre assurance pour le bâti.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon installation électrique était ancienne : l'assureur peut-il refuser ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Une installation électrique ancienne ne justifie pas automatiquement un refus. L'assureur doit
                    prouver un lien direct entre l'état de l'installation et le sinistre, et que cette situation
                    constituait une exclusion contractuelle explicite. C'est souvent contestable avec l'aide d'un
                    expert.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Combien de temps prend le règlement d'un sinistre incendie ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Un sinistre incendie simple peut être réglé en 2 à 4 mois. Un sinistre complexe (maison totalement
                    détruite, litige sur les responsabilités, montants élevés) peut prendre 6 à 18 mois. Un expert
                    d'assuré permet souvent d'accélérer le processus en structurant le dossier dès le départ.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je contester une indemnisation que j'ai déjà acceptée ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Si vous avez signé une quittance pour solde de tout compte, c'est très difficile, sauf en cas de
                    vice du consentement prouvable. C'est pourquoi il est crucial de ne signer aucun accord sans avoir
                    vérifié qu'il est juste. Si vous n'avez pas encore signé, il est encore temps d'agir.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Ne laissez pas votre assureur fixer seul l'indemnisation
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Après un incendie, vous êtes en position de faiblesse. Votre assureur le sait. Un expert d'assuré
                rééquilibre ce rapport de force, sans avance de frais et sans risque pour vous.
              </p>
              <p className="mt-4 text-base font-semibold leading-relaxed text-foreground">
                Analysez votre dossier gratuitement en 5 minutes.
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

