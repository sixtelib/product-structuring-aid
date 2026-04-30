import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const toc = [
  { href: "#regime", label: "Le régime Cat Nat : comment ça fonctionne ?" },
  { href: "#couverture", label: "Les sinistres couverts" },
  { href: "#pourquoi", label: "Pourquoi l'indemnisation est insuffisante" },
  { href: "#role", label: "Le rôle de l'expert d'assuré" },
  { href: "#etapes", label: "Les étapes clés" },
  { href: "#secheresse", label: "Sécheresse et fissures" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Expert d'assuré catastrophe naturelle : défendez votre indemnisation",
  description:
    "Victime d'une catastrophe naturelle ? Votre assureur sous-indemnise votre sinistre ? Un expert d'assuré défend vos droits. Analyse gratuite, sans avance de frais.",
  url: "https://vertual.fr/sinistres/catastrophe-naturelle",
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
      name: "Ma commune n'a pas été reconnue en état de catastrophe naturelle : que faire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La demande de reconnaissance Cat Nat est faite par la commune. Si elle n'a pas déposé de demande ou si elle a été refusée, contactez votre mairie pour les encourager à déposer ou renouveler la demande. En attendant, vos garanties ordinaires (tempête, dégât des eaux) peuvent couvrir une partie des dommages.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je être indemnisé si je n'avais pas souscrit de garantie Cat Nat spécifique ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La garantie Cat Nat est obligatoirement incluse dans tous les contrats multirisque habitation depuis 1982. Si vous avez un contrat MRH, vous êtes couvert, même si vous ne l'aviez pas demandé explicitement.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur tarde à m'indemniser après l'arrêté Cat Nat : est-ce légal ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. La loi impose un délai maximum de 3 mois pour indemniser après la déclaration de sinistre ou la publication de l'arrêté. En cas de dépassement, vous pouvez saisir le médiateur de l'assurance.",
      },
    },
    {
      "@type": "Question",
      name: "Les dommages à mon véhicule sont-ils couverts par Cat Nat ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non, les véhicules ne sont pas couverts par le régime Cat Nat. Ils peuvent être couverts par la garantie « tous risques » ou une garantie catastrophes naturelles de votre assurance auto, si vous l'avez souscrite.",
      },
    },
    {
      "@type": "Question",
      name: "Mes meubles et appareils électroménagers sont-ils couverts ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, les biens mobiliers sont couverts par le régime Cat Nat au même titre que le bâti. Conservez ou documentez tous les biens endommagés pour en obtenir l'indemnisation.",
      },
    },
  ],
} as const;

export function CatastropheNaturellePage() {
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
              Expert d'assuré catastrophe naturelle : défendez votre indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Inondation, sécheresse, coulée de boue, submersion marine... Les catastrophes naturelles touchent chaque
              année des centaines de milliers de Français. Et pourtant, le régime d'indemnisation Cat Nat est l'un des
              plus mal compris et des plus mal appliqués.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Résultat : des milliers d'assurés acceptent des indemnisations très inférieures à ce à quoi ils ont droit,
              faute de connaître leurs droits et les recours disponibles.
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
            <section id="regime" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Le régime catastrophe naturelle : comment ça fonctionne ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le régime Cat Nat est un système de solidarité nationale créé en 1982. Il repose sur un mécanisme
                spécifique :
              </p>
              <ol className="mt-6 space-y-5 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">1. L'arrêté interministériel</h3>
                  <p className="mt-1 text-muted-foreground">
                    Pour que le régime s'active, un arrêté reconnaissant l'état de catastrophe naturelle pour les
                    communes concernées doit être publié au Journal Officiel. Sans arrêté, pas d'indemnisation Cat Nat.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">2. La déclaration sous 10 jours</h3>
                  <p className="mt-1 text-muted-foreground">
                    Une fois l'arrêté publié, vous disposez de <strong>10 jours</strong> pour déclarer votre sinistre au
                    titre du régime Cat Nat.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">3. La franchise légale</h3>
                  <p className="mt-1 text-muted-foreground">
                    La franchise est fixée par la loi : <strong>380 €</strong> pour les habitations et{" "}
                    <strong>1 520 €</strong> pour les professionnels. Elle ne peut pas être rachetée.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">4. L'indemnisation</h3>
                  <p className="mt-1 text-muted-foreground">
                    L'assureur doit indemniser les dommages matériels directs causés par la catastrophe naturelle, dans
                    un délai de 3 mois après déclaration ou après publication de l'arrêté.
                  </p>
                </li>
              </ol>
            </section>

            <section id="couverture" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les sinistres couverts par le régime Cat Nat
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le régime Cat Nat couvre les dommages matériels directs causés par :
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Inondations et coulées de boue</strong> : débordement de cours d'eau, ruissellement, remontée
                  de nappe phréatique
                </li>
                <li>
                  <strong>Sécheresse et réhydratation des sols</strong> : mouvements de terrain différentiels liés à la
                  sécheresse (fissures)
                </li>
                <li>
                  <strong>Séismes</strong>
                </li>
                <li>
                  <strong>Submersion marine</strong>
                </li>
                <li>
                  <strong>Avalanches</strong>
                </li>
                <li>
                  <strong>Affaissements de terrain</strong> liés à des cavités souterraines naturelles
                </li>
              </ul>
              <p className="mt-6 text-base font-semibold leading-relaxed text-foreground">
                Ce qui n'est pas couvert par Cat Nat (mais peut l'être par d'autres garanties) :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Dommages causés par le vent (→ garantie tempête)</li>
                <li>Grêle (→ garantie tempête)</li>
                <li>Dommages corporels</li>
                <li>Pertes d'exploitation pour les particuliers</li>
              </ul>
            </section>

            <section id="pourquoi" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi les indemnisations Cat Nat sont souvent insuffisantes
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le régime Cat Nat est censé protéger les victimes. Dans la pratique, les indemnisations sont
                fréquemment contestables.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Complexité technique.</strong> Les dommages peuvent être difficiles à évaluer et à prouver.
                  Une expertise trop rapide peut passer à côté de dommages structurels.
                </li>
                <li>
                  <strong>Dommages tardifs.</strong> Certains dommages apparaissent plusieurs semaines ou mois après
                  l'événement (moisissures, décollement, pourriture).
                </li>
                <li>
                  <strong>Coût réel de remise en état.</strong> Décontamination, séchage professionnel, remplacement
                  d'isolants, remise aux normes : ces postes sont souvent sous-évalués.
                </li>
                <li>
                  <strong>Refus d'arrêté.</strong> La demande de reconnaissance peut être refusée : la commune peut
                  contester et les assurés peuvent faire pression via leurs élus et associations.
                </li>
                <li>
                  <strong>Confusion entre régimes.</strong> Un même sinistre peut relever de plusieurs garanties (tempête
                  + Cat Nat). Si un seul régime est activé, des postes peuvent rester non indemnisés.
                </li>
              </ul>
            </section>

            <section id="role" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Le rôle de l'expert d'assuré dans un dossier Cat Nat
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Vérification de l'arrêté et des délais.</strong> Identifier l'arrêté, vérifier la déclaration
                  dans les délais et l'inclusion des événements couverts.
                </li>
                <li>
                  <strong>Expertise technique approfondie.</strong> Évaluer les dommages visibles et cachés (fondations,
                  structures, revêtements, isolants, réseaux).
                </li>
                <li>
                  <strong>Chiffrage exhaustif.</strong> Séchage, décontamination, démolition partielle, reconstruction
                  aux normes, relogement.
                </li>
                <li>
                  <strong>Activation de tous les régimes.</strong> Tempête, Cat Nat et toutes les garanties applicables
                  simultanément.
                </li>
                <li>
                  <strong>Suivi sur la durée.</strong> Les sinistres Cat Nat s'inscrivent souvent dans le temps : suivi
                  jusqu'à clôture complète du dossier.
                </li>
              </ul>
            </section>

            <section id="etapes" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les étapes clés après une catastrophe naturelle
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Étape 1 : Sécurisez et documentez immédiatement</h3>
                  <p className="mt-1 text-muted-foreground">
                    Photographiez et filmez tous les dommages dès que c'est sécurisé. Pour une inondation : notez le
                    niveau de l'eau sur les murs et documentez avant tout nettoyage.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 2 : Déclarez à votre assureur dans les 5 jours</h3>
                  <p className="mt-1 text-muted-foreground">
                    Déclarez le sinistre au titre des garanties ordinaires, même avant l'arrêté. Vous compléterez la
                    déclaration Cat Nat une fois l'arrêté publié.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 3 : Suivez la publication de l'arrêté</h3>
                  <p className="mt-1 text-muted-foreground">
                    Les arrêtés peuvent être publiés plusieurs semaines après l'événement. Dès publication : vous avez
                    10 jours pour déclarer.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 4 : Ne jetez rien et conservez les preuves</h3>
                  <p className="mt-1 text-muted-foreground">
                    Conservez les biens jusqu'à l'expertise. Si vous devez jeter pour raisons sanitaires, photographiez
                    et listez tout en détail avant.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">
                    Étape 5 : Mandatez un expert d'assuré avant l'expertise contradictoire
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Comme pour tout sinistre : intervenez avant la réunion contradictoire. C'est là que se joue
                    l'indemnisation.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 6 : Suivez les dommages évolutifs</h3>
                  <p className="mt-1 text-muted-foreground">
                    Certains dommages apparaissent progressivement. Signalez-les dès qu'ils se manifestent.
                  </p>
                </li>
              </ol>
            </section>

            <section id="secheresse" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Sécheresse et fissures : un cas particulier
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La sécheresse est l'une des catastrophes naturelles les plus sous-indemnisées. Les épisodes de
                sécheresse provoquent des mouvements de terrain (retrait-gonflement des argiles) qui fissurent les
                fondations et les murs.
              </p>
              <p className="mt-4 text-base font-semibold leading-relaxed text-foreground">Pourquoi c'est complexe :</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Les fissures apparaissent souvent des mois ou des années après l'épisode</li>
                <li>Le lien de causalité doit être prouvé</li>
                <li>Les assureurs contestent la nature des désordres</li>
                <li>Les travaux (micropieux, injection) sont très coûteux</li>
              </ul>
              <p className="mt-6 text-base font-semibold leading-relaxed text-foreground">Ce qu'il faut faire :</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Vérifier l'arrêté Cat Nat sécheresse pour la période concernée</li>
                <li>Faire réaliser une étude géotechnique (G5)</li>
                <li>Mandater un expert d'assuré spécialisé avant toute expertise</li>
              </ol>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les dossiers sécheresse font partie de ceux où l'écart entre l'offre initiale et l'indemnisation
                obtenue avec un expert d'assuré est le plus important.
              </p>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Questions fréquentes
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-semibold text-foreground">
                    Ma commune n'a pas été reconnue en état de catastrophe naturelle : que faire ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Si votre commune n'a pas déposé de demande ou si elle a été refusée, contactez votre mairie. En
                    attendant, des garanties ordinaires (tempête, dégât des eaux) peuvent couvrir une partie des
                    dommages.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Puis-je être indemnisé si je n'avais pas souscrit de garantie Cat Nat spécifique ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui : la garantie Cat Nat est incluse dans tous les contrats MRH depuis 1982.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur tarde à m'indemniser après l'arrêté Cat Nat : est-ce légal ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non : la loi impose un délai maximum de 3 mois. En cas de dépassement, vous pouvez saisir le
                    médiateur.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Les dommages à mon véhicule sont-ils couverts ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non : ils relèvent généralement de l'assurance auto (tous risques / extension Cat Nat).
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mes meubles et appareils électroménagers sont-ils couverts ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui : les biens mobiliers sont couverts au même titre que le bâti. Documentez tout pour être
                    indemnisé.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="scroll-mt-24 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Catastrophe naturelle : ne restez pas seul face à votre assureur
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les dossiers Cat Nat sont parmi les plus complexes. Un expert d'assuré vous garantit une évaluation
                exhaustive, une connaissance fine du régime applicable, et une négociation à parité.
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

