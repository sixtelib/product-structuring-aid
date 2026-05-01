import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

const toc = [
  { href: "#delais", label: "Les délais de déclaration à respecter absolument" },
  { href: "#comment", label: "Comment déclarer : les différentes méthodes" },
  { href: "#contenu", label: "Ce qu'il faut inclure dans votre déclaration" },
  { href: "#erreurs", label: "Les erreurs à éviter" },
  { href: "#apres", label: "Que se passe-t-il après la déclaration ?" },
  { href: "#probleme", label: "Que faire si votre déclaration est mal reçue ?" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Comment déclarer un sinistre à son assurance : le guide complet",
  description:
    "Vous venez de subir un sinistre ? Découvrez comment le déclarer correctement à votre assureur, les délais à respecter, et les erreurs à éviter pour protéger votre indemnisation.",
  url: "https://vertual.fr/guides/declarer-sinistre-assurance",
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
      name: "Dois-je déclarer même si le montant est inférieur à ma franchise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, dans la plupart des cas. Même si vous n'êtes pas indemnisé (montant inférieur à la franchise), la déclaration crée une trace dans votre dossier qui peut être utile si des dommages supplémentaires apparaissent plus tard.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je déclarer un sinistre longtemps après qu'il s'est produit ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Techniquement non si vous dépassez le délai contractuel. Mais si vous venez de découvrir des dommages liés à un sinistre ancien (infiltration progressive), le délai commence à la découverte — pas à la survenance. Déclarez dès que vous constatez les dommages.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur me demande un constat amiable — est-ce obligatoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le constat amiable est obligatoire en cas d'accident de voiture entre deux véhicules. Pour les sinistres habitation, il n'est pas obligatoire mais peut être demandé en cas de sinistre impliquant un voisin (dégât des eaux).",
      },
    },
    {
      "@type": "Question",
      name: "Que faire si je n'ai pas de preuve de l'origine du sinistre ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Déclarez quand même avec les éléments dont vous disposez. L'absence de preuve absolue n'empêche pas la déclaration. Décrivez les circonstances telles que vous les connaissez. Un expert d'assuré peut vous aider à reconstituer les preuves manquantes.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur peut-il augmenter ma prime après un sinistre ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Après un sinistre, votre assureur peut appliquer une majoration de prime ou, dans certains cas, résilier votre contrat à l'échéance. C'est légal — mais la résiliation doit respecter un préavis et des conditions précises.",
      },
    },
  ],
} as const;

export function DeclarerSinistrePage() {
  useJsonLdInHead(articleJsonLd, faqPageJsonLd);

  return (
    <SiteLayout>
      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Guide</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Comment déclarer un sinistre à son assurance : le guide complet
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Délais, preuves, documents, erreurs à éviter : les étapes clés pour protéger votre indemnisation.
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
            <section className="scroll-mt-24">
              <p className="text-base leading-relaxed text-foreground">
                Vous venez de subir un sinistre — dégât des eaux, incendie, tempête, cambriolage. Le choc passé,
                une question s'impose : comment déclarer correctement ce sinistre à votre assureur pour ne pas
                compromettre votre indemnisation ?
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La déclaration de sinistre est une étape cruciale. Une erreur, un oubli, un délai dépassé — et
                votre assureur peut réduire ou refuser votre indemnisation. Ce guide vous explique exactement
                quoi faire, dans quel ordre, et comment éviter les pièges.
              </p>
            </section>

            <section id="delais" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                1. Les délais de déclaration à respecter absolument
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                C'est le point le plus important. En France, les délais de déclaration sont fixés par la loi et
                par votre contrat. Les dépasser peut entraîner une réduction ou un refus d'indemnisation.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#F8F9FF]">
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Type de sinistre
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Délai légal
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Point de départ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Sinistre courant (dégât des eaux, incendie, tempête...)
                      </td>
                      <td className="px-4 py-3 text-foreground sm:px-5">
                        <strong>5 jours ouvrés</strong>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Jour de constatation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Vol ou cambriolage</td>
                      <td className="px-4 py-3 text-foreground sm:px-5">
                        <strong>2 jours ouvrés</strong>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Jour de constatation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Catastrophe naturelle</td>
                      <td className="px-4 py-3 text-foreground sm:px-5">
                        <strong>10 jours</strong>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Publication de l'arrêté au JO
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        Responsabilité civile (dommages causés à un tiers)
                      </td>
                      <td className="px-4 py-3 text-foreground sm:px-5">
                        <strong>5 jours ouvrés</strong>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">Jour de l'événement</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-base leading-relaxed text-foreground">
                <strong>Important :</strong> le délai commence à la <strong>constatation</strong> du sinistre, pas
                nécessairement à sa survenance. Si vous découvrez un dégât des eaux en rentrant de vacances, le
                délai commence le jour de votre retour.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                <strong>Que se passe-t-il si vous dépassez le délai ?</strong> Votre assureur peut invoquer la
                déchéance de garantie — c'est-à-dire refuser toute indemnisation. Mais cette déchéance n'est
                applicable que si le retard vous est imputable et s'il a causé un préjudice à l'assureur (par
                exemple, impossibilité d'expertiser les dommages). Une déchéance automatique sans démonstration
                de préjudice est contestable.
              </p>
            </section>

            <section id="comment" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                2. Comment déclarer : les différentes méthodes
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Vous pouvez déclarer votre sinistre de plusieurs façons. <strong>La règle d'or : toujours confirmer par écrit</strong>,
                quelle que soit la méthode initiale.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">Par téléphone</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                La plupart des assureurs disposent d'un numéro sinistres disponible 24h/24. C'est la méthode la
                plus rapide pour déclencher la procédure. Notez le numéro de dossier qu'on vous communique.
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                <strong>Mais :</strong> un appel téléphonique seul ne suffit pas. Confirmez toujours par écrit
                dans les jours qui suivent.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">Par email</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Envoyez un email à votre conseiller ou au service sinistres de votre assureur. Conservez une
                copie de l'email envoyé avec la date.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Par courrier recommandé avec accusé de réception
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                C'est la méthode la plus solide juridiquement. Elle crée une preuve de date certaine et force
                votre assureur à accuser réception. Recommandée pour les sinistres importants ou si vous
                anticipez un litige.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Via l'application ou l'espace client en ligne
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                La plupart des grands assureurs permettent de déclarer un sinistre en ligne. C'est rapide et
                vous recevez une confirmation par email. Conservez cette confirmation.
              </p>
            </section>

            <section id="contenu" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                3. Ce qu'il faut inclure dans votre déclaration
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Une déclaration complète accélère le traitement de votre dossier et limite les risques de
                contestation ultérieure.
              </p>

              <p className="mt-5 text-base leading-relaxed text-foreground">
                <strong>Les informations obligatoires :</strong>
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Vos coordonnées et numéro de contrat</li>
                <li>La date et l'heure approximative du sinistre</li>
                <li>Le lieu précis du sinistre</li>
                <li>La nature et les circonstances du sinistre (description factuelle)</li>
                <li>La liste des dommages constatés (aussi exhaustive que possible)</li>
                <li>Les éventuels tiers impliqués (coordonnées, plaque d'immatriculation...)</li>
              </ul>

              <p className="mt-6 text-base leading-relaxed text-foreground">
                <strong>Les documents à joindre si disponibles :</strong>
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Photos des dommages</li>
                <li>Devis de réparation d'urgence déjà engagée</li>
                <li>Factures des biens endommagés</li>
                <li>Rapport de police ou de pompiers si intervention</li>
                <li>Témoignages écrits si disponibles</li>
              </ul>

              <p className="mt-6 text-base leading-relaxed text-foreground">
                <strong>Le principe : déclarez tout.</strong> Il vaut mieux déclarer trop que pas assez. Vous
                pouvez toujours retirer un poste de la liste, mais il est très difficile d'en ajouter un après
                coup si l'assureur considère que vous n'en avez pas parlé initialement.
              </p>
            </section>

            <section id="erreurs" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                4. Les erreurs à éviter
              </h2>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Erreur 1 — Nettoyer ou réparer avant de documenter
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                C'est l'erreur la plus fréquente et la plus coûteuse. Avant tout nettoyage, avant toute
                réparation d'urgence : <strong>photographiez tout</strong>. Chaque pièce endommagée, chaque bien
                abîmé, l'origine visible du sinistre. Ces photos sont votre seule preuve.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Erreur 2 — Jeter les biens endommagés
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Ne jetez rien avant l'expertise de l'assureur — même ce qui semble totalement irrécupérable.
                L'expert doit pouvoir constater les dommages en personne. Si vous devez jeter pour des raisons
                sanitaires (inondation), photographiez et listez tout en détail avant.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Erreur 3 — Sous-estimer l'étendue des dommages
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Dans l'urgence, on a tendance à ne déclarer que ce qui est visible. Or les dommages cachés
                (humidité dans les murs, structures affaiblies) peuvent représenter la majorité du coût réel.
                Déclarez aussi les dommages que vous suspectez, même si vous n'en êtes pas sûr.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Erreur 4 — Accepter la première offre sans vérifier
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Votre assureur vous proposera une indemnisation. Ne l'acceptez pas immédiatement. Prenez le
                temps de vérifier que tous vos dommages sont couverts et que les montants correspondent à la
                réalité. Une fois la quittance signée, il est très difficile de revenir en arrière.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Erreur 5 — Ne pas relire son contrat avant de déclarer
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Votre contrat précise les garanties activables, les franchises applicables, et les conditions
                de mise en jeu. Relisez-le avant d'appeler votre assureur — ça vous permettra de mentionner les
                bonnes garanties dans votre déclaration.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Erreur 6 — Confondre la déclaration et l'acceptation
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Déclarer un sinistre ne signifie pas accepter la version de l'assureur. Vous pouvez contester
                l'évaluation, la prise en charge, et l'indemnisation proposée — même après avoir déclaré.
              </p>
            </section>

            <section id="apres" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                5. Que se passe-t-il après la déclaration ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Une fois votre déclaration reçue, voici la procédure standard :
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Dans les 10 à 15 jours :</strong> votre assureur mandate un expert pour expertiser les
                  dommages. Cet expert travaille pour votre assureur — pas pour vous.
                </li>
                <li>
                  <strong>Lors de la visite de l'expert :</strong> il constate les dommages, interroge les
                  circonstances, et établit son évaluation. C'est le moment de lui présenter tous vos
                  justificatifs (photos, factures, devis).
                </li>
                <li>
                  <strong>Dans les 30 jours suivant la réception du dossier complet :</strong> votre assureur
                  doit vous faire une offre d'indemnisation.
                </li>
                <li>
                  <strong>À la réunion contradictoire :</strong> si vous avez mandaté un expert d'assuré, les
                  deux experts se confrontent. C'est là que se joue l'essentiel de l'indemnisation.
                </li>
                <li>
                  <strong>À la clôture :</strong> vous signez la quittance pour solde de tout compte et
                  l'assureur verse l'indemnisation.
                </li>
              </ul>
            </section>

            <section id="probleme" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                6. Que faire si votre déclaration est mal reçue ?
              </h2>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Votre assureur tarde à répondre
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Si vous n'avez pas de nouvelles dans les 15 jours suivant votre déclaration, relancez par
                écrit. L'assureur a l'obligation de vous répondre dans un délai raisonnable.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Votre assureur conteste les circonstances
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Répondez par écrit, calmement et factuellement, en vous appuyant sur vos preuves (photos,
                témoignages, rapports). Ne cédez pas à une version inexacte.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                Votre assureur invoque un délai dépassé
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Vérifiez que le délai est réellement dépassé et qu'il vous est imputable. Si vous étiez absent
                ou dans l'impossibilité de déclarer, ces circonstances peuvent être invoquées.
              </p>

              <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-[#5B50F0]">
                L'offre d'indemnisation vous semble insuffisante
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Ne signez pas. Mandatez un expert d'assuré — c'est le recours le plus efficace pour obtenir une
                indemnisation juste sans engagement financier préalable.
              </p>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                7. Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    Dois-je déclarer même si le montant est inférieur à ma franchise ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, dans la plupart des cas. Même si vous n'êtes pas indemnisé (montant inférieur à la
                    franchise), la déclaration crée une trace dans votre dossier qui peut être utile si des
                    dommages supplémentaires apparaissent plus tard.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je déclarer un sinistre longtemps après qu'il s'est produit ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Techniquement non si vous dépassez le délai contractuel. Mais si vous venez de découvrir
                    des dommages liés à un sinistre ancien (infiltration progressive), le délai commence à la
                    découverte — pas à la survenance. Déclarez dès que vous constatez les dommages.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur me demande un constat amiable — est-ce obligatoire ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Le constat amiable est obligatoire en cas d'accident de voiture entre deux véhicules. Pour
                    les sinistres habitation, il n'est pas obligatoire mais peut être demandé en cas de sinistre
                    impliquant un voisin (dégât des eaux).
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Que faire si je n'ai pas de preuve de l'origine du sinistre ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Déclarez quand même avec les éléments dont vous disposez. L'absence de preuve absolue
                    n'empêche pas la déclaration. Décrivez les circonstances telles que vous les connaissez. Un
                    expert d'assuré peut vous aider à reconstituer les preuves manquantes.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur peut-il augmenter ma prime après un sinistre ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui. Après un sinistre, votre assureur peut appliquer une majoration de prime ou, dans
                    certains cas, résilier votre contrat à l'échéance. C'est légal — mais la résiliation doit
                    respecter un préavis et des conditions précises.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Une bonne déclaration, c'est la base d'une bonne indemnisation
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La façon dont vous déclarez votre sinistre conditionne largement l'indemnisation que vous
                obtiendrez. Prenez le temps de bien faire les choses : documenter, déclarer complètement, et ne
                pas signer trop vite.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Et si vous pensez que votre assureur ne vous a pas proposé ce à quoi vous avez droit, faites
                analyser votre dossier — gratuitement, sans engagement.
              </p>
              <p className="mt-4">
                <a
                  href="#chatbot"
                  className="font-semibold text-[#5B50F0] underline decoration-[#5B50F0]/30 underline-offset-2 hover:decoration-[#5B50F0]"
                >
                  → Qualifier mon sinistre gratuitement
                </a>
              </p>
              <p className="mt-10 text-sm text-muted-foreground">
                Article rédigé par l'équipe Vertual — Avril 2026
                <br />
                Dernière mise à jour : Avril 2026
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
                <span>Assureur refuse de payer : que faire ?</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/guides/vetuste-assurance"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Vétusté assurance : comment la contester ?</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

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

