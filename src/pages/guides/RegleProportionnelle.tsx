import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

const toc = [
  { href: "#definition", label: "Qu'est-ce que la règle proportionnelle ?" },
  { href: "#calcul", label: "Comment est-elle calculée ?" },
  { href: "#sous-assurance", label: "Qu'est-ce que la sous-assurance ?" },
  { href: "#detecter", label: "Comment détecter si vous êtes sous-assuré ?" },
  { href: "#eviter", label: "Comment éviter la règle proportionnelle ?" },
  { href: "#contester", label: "La règle proportionnelle est-elle contestable ?" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Règle proportionnelle assurance : définition, calcul et comment l'éviter",
  description:
    "La règle proportionnelle peut réduire drastiquement votre indemnisation. Découvrez comment elle fonctionne, comment détecter une sous-assurance, et comment vous protéger.",
  url: "https://vertual.fr/guides/regle-proportionnelle-assurance",
  datePublished: "2026-05-01T00:00:00+02:00",
  dateModified: "2026-05-01T00:00:00+02:00",
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
      name: "La règle proportionnelle s'applique-t-elle toujours ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Elle ne s'applique que si votre contrat le prévoit explicitement. Certains contrats incluent une clause de renonciation à la règle proportionnelle. Vérifiez vos conditions générales.",
      },
    },
    {
      "@type": "Question",
      name: "Mon assureur peut-il appliquer la règle proportionnelle sans me prévenir ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. L'assureur doit vous informer de l'application de la règle proportionnelle dans son offre d'indemnisation et expliquer le calcul. Si ce n'est pas clairement expliqué, demandez-lui de détailler par écrit.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je régulariser ma situation après un sinistre ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non pour le sinistre en cours : la règle proportionnelle s'applique à la situation au moment du sinistre. En revanche, vous pouvez mettre à jour votre contrat pour les sinistres futurs.",
      },
    },
    {
      "@type": "Question",
      name: "La règle proportionnelle s'applique-t-elle en catastrophe naturelle ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Le régime Cat Nat n'échappe pas à la règle proportionnelle. Si votre bien est sous-assuré, l'indemnisation Cat Nat sera réduite dans les mêmes proportions.",
      },
    },
    {
      "@type": "Question",
      name: "Mon voisin a le même type de maison et une prime plus basse — suis-je sur-assuré ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pas nécessairement. Les primes dépendent de nombreux facteurs. Une prime plus basse chez votre voisin ne signifie pas que vous êtes sur-assuré : elle peut signifier qu'il est sous-assuré.",
      },
    },
  ],
} as const;

export function RegleProportionnellePage() {
  useJsonLdInHead(articleJsonLd, faqPageJsonLd);

  return (
    <SiteLayout>
      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Guide</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Règle proportionnelle assurance : définition, calcul et comment l&apos;éviter
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              La règle proportionnelle peut réduire drastiquement votre indemnisation. Découvrez comment elle
              fonctionne, comment détecter une sous-assurance, et comment vous protéger.
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
            <p className="text-base leading-relaxed text-foreground">
              Vous subissez un sinistre. Votre assureur vous propose une indemnisation — mais elle représente
              seulement 60% de vos dommages réels. Motif invoqué : &quot;application de la règle proportionnelle&quot;.
              Vous n&apos;avez jamais entendu parler de ce mécanisme. Et pourtant, il vient de vous coûter des milliers
              d&apos;euros.
            </p>
            <p className="text-base leading-relaxed text-foreground">
              La règle proportionnelle est l&apos;un des mécanismes les plus méconnus et les plus pénalisants du secteur
              assurantiel. Ce guide vous explique comment elle fonctionne, comment détecter si vous y êtes exposé,
              et comment vous en protéger.
            </p>

            <section id="definition" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                1. Qu&apos;est-ce que la règle proportionnelle ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La règle proportionnelle est un mécanisme légal prévu par le Code des assurances (article L113-9)
                qui s&apos;applique lorsqu&apos;un bien est <strong>assuré pour une valeur inférieure à sa valeur réelle</strong>{" "}
                — c&apos;est ce qu&apos;on appelle la <strong>sous-assurance</strong>.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                En cas de sinistre, si votre bien est sous-assuré, l&apos;assureur ne vous indemnise pas la totalité de
                vos dommages. Il applique une réduction proportionnelle à l&apos;écart entre la valeur déclarée et la
                valeur réelle.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-[#F8F9FF] p-5 text-sm leading-relaxed text-foreground">
                <p className="font-semibold">Principe</p>
                <p className="mt-2 text-muted-foreground">
                  Vous n&apos;êtes indemnisé que dans la proportion où vous étiez assuré.
                </p>
              </div>
              <p className="mt-6 text-base leading-relaxed text-foreground">La règle proportionnelle peut s&apos;appliquer à :</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>L&apos;assurance habitation (valeur du mobilier, valeur de reconstruction)</li>
                <li>L&apos;assurance professionnelle (valeur des stocks, du matériel)</li>
                <li>L&apos;assurance des objets de valeur</li>
              </ul>
            </section>

            <section id="calcul" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                2. Comment est-elle calculée ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">La formule de la règle proportionnelle est la suivante :</p>
              <div className="mt-6 rounded-xl border border-border bg-[#F8F9FF] p-5 text-sm leading-relaxed text-foreground">
                <p className="font-semibold">Formule</p>
                <p className="mt-2 text-muted-foreground">
                  Indemnisation = Dommages réels × (Valeur assurée / Valeur réelle)
                </p>
              </div>
              <h3 className="mt-8 font-sans text-lg font-semibold text-foreground">Exemple concret</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Votre maison vaut 400 000 € en valeur de reconstruction. Mais lors de la souscription du contrat il
                y a 10 ans, vous l&apos;aviez déclarée à 280 000 €. Vous êtes donc assuré à 70% de la valeur réelle.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">Un sinistre cause 50 000 € de dommages.</p>
              <p className="mt-4 text-base leading-relaxed text-foreground">Sans règle proportionnelle, vous seriez indemnisé 50 000 €.</p>
              <p className="mt-4 text-base leading-relaxed text-foreground">Avec la règle proportionnelle :</p>
              <div className="mt-4 rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm font-semibold text-foreground">50 000 € × (280 000 / 400 000) = 35 000 €</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vous perdez 15 000 € — non pas parce que le sinistre n&apos;est pas couvert, mais parce que vous étiez
                  sous-assuré.
                </p>
              </div>
              <p className="mt-6 text-base leading-relaxed text-foreground">
                Et ce mécanisme s&apos;applique à chaque sinistre, même les petits. Un dégât des eaux de 3 000 € dans
                cette même maison ne serait indemnisé que 2 100 €.
              </p>
            </section>

            <section id="sous-assurance" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                3. Qu&apos;est-ce que la sous-assurance ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La sous-assurance survient quand la valeur déclarée dans votre contrat est inférieure à la valeur
                réelle de vos biens.
              </p>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">Les causes les plus fréquentes</h3>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Le contrat n&apos;a pas été mis à jour.</strong> Vous avez souscrit il y a 10 ou 15 ans : prix,
                  travaux et biens ont évolué, mais le contrat n&apos;a pas été revu.
                </li>
                <li>
                  <strong>La valeur de reconstruction a augmenté.</strong> Matériaux et main d&apos;œuvre ont fortement
                  progressé ces dernières années : un contrat de plus de 5 ans est souvent sous-évalué.
                </li>
                <li>
                  <strong>Le mobilier a été sous-estimé.</strong> Faites l&apos;exercice : valorisez tous vos biens au
                  prix de remplacement actuel — le total est souvent surprenant.
                </li>
                <li>
                  <strong>Les travaux d&apos;amélioration non déclarés.</strong> Cuisine rénovée, extension, véranda :
                  si ces travaux n&apos;ont pas été déclarés, votre bien est d&apos;autant sous-assuré.
                </li>
              </ul>
            </section>

            <section id="detecter" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                4. Comment détecter si vous êtes sous-assuré ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">Voici les indicateurs qui doivent vous alerter :</p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Votre contrat a plus de 5 ans sans révision.</strong> Les valeurs déclarées vieillissent :
                  après 5 ans, la couverture reflète rarement la réalité.
                </li>
                <li>
                  <strong>Vous avez réalisé des travaux non déclarés.</strong> Extension, rénovation complète,
                  combles aménagés : tout ce qui augmente la valeur doit être déclaré.
                </li>
                <li>
                  <strong>Le montant de votre prime vous semble très bas.</strong> Une prime très basse peut indiquer
                  des valeurs assurées sous-estimées.
                </li>
              </ul>
              <div className="mt-6 rounded-xl border border-border bg-[#F8F9FF] p-5 text-sm leading-relaxed text-foreground">
                <p className="font-semibold">Comment calculer votre valeur réelle</p>
                <p className="mt-2 text-muted-foreground">
                  Pour le <strong>mobilier</strong> : listez tous vos biens et valorisez-les au prix de remplacement
                  actuel (pas au prix d&apos;achat).
                </p>
                <p className="mt-3 text-muted-foreground">
                  Pour la <strong>valeur de reconstruction</strong> : elle correspond au coût de démolition +
                  reconstruction à l&apos;identique. Pour une maison standard, comptez entre 1 200 et 2 000 €/m² selon la
                  région et les finitions.
                </p>
              </div>
            </section>

            <section id="eviter" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                5. Comment éviter la règle proportionnelle ?
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Mettez à jour votre contrat régulièrement.</strong> Révisez les valeurs tous les 3 à 5 ans et
                  signalez systématiquement les travaux importants.
                </li>
                <li>
                  <strong>Souscrivez une clause de renonciation à la règle proportionnelle.</strong> Certains contrats
                  la proposent moyennant une légère surprime : c&apos;est souvent un excellent investissement.
                </li>
                <li>
                  <strong>Utilisez les index d&apos;actualisation.</strong> Vérifiez la revalorisation automatique (index FFB
                  pour la construction, INSEE pour le mobilier) et qu&apos;elle est bien activée.
                </li>
                <li>
                  <strong>Faites estimer vos biens.</strong> Pour les objets de valeur, une expertise formelle limite les
                  contestations.
                </li>
                <li>
                  <strong>Optez pour une garantie &quot;valeur agréée&quot;.</strong> Pour certains biens, la valeur est
                  contractuellement fixée — ce qui élimine le risque de sous-assurance.
                </li>
              </ul>
            </section>

            <section id="contester" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                6. La règle proportionnelle est-elle contestable ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">Oui, dans certaines situations :</p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Si l&apos;assureur a contribué à la sous-assurance.</strong> Si votre conseiller vous a aidé à
                  remplir le contrat et n&apos;a pas correctement évalué vos biens, la responsabilité de l&apos;assureur peut
                  être engagée.
                </li>
                <li>
                  <strong>Si la clause n&apos;est pas clairement mentionnée.</strong> La règle proportionnelle doit être
                  prévue explicitement : clause absente ou ambiguë = application contestable.
                </li>
                <li>
                  <strong>Si les valeurs réelles sont contestées.</strong> L&apos;assureur doit prouver la sous-assurance.
                  Si son évaluation est excessive, vous pouvez la contester avec vos justificatifs.
                </li>
                <li>
                  <strong>Si votre contrat inclut une clause d&apos;abandon.</strong> Dans ce cas, vérifiez qu&apos;elle a bien
                  été respectée.
                </li>
              </ul>
              <p className="mt-6 text-base leading-relaxed text-foreground">
                Un expert d&apos;assuré peut analyser votre situation et identifier si la règle proportionnelle a été
                appliquée correctement ou si un recours est possible.
              </p>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">7. Questions fréquentes</h2>
              <dl className="mt-6 grid gap-6 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-foreground">La règle proportionnelle s&apos;applique-t-elle toujours ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non. Elle ne s&apos;applique que si votre contrat le prévoit explicitement. Certains contrats incluent
                    une clause de renonciation : vérifiez vos conditions générales.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    Mon assureur peut-il appliquer la règle proportionnelle sans me prévenir ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non. L&apos;assureur doit informer et expliquer le calcul dans l&apos;offre d&apos;indemnisation. Demandez un
                    détail écrit si ce n&apos;est pas clair.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Puis-je régulariser ma situation après un sinistre ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non pour le sinistre en cours. En revanche, vous pouvez mettre à jour votre contrat pour les
                    sinistres futurs.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">La règle proportionnelle s&apos;applique-t-elle en catastrophe naturelle ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui. Le régime Cat Nat n&apos;y échappe pas : si votre bien est sous-assuré, l&apos;indemnisation est
                    réduite dans les mêmes proportions.
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-foreground">
                    Mon voisin a le même type de maison et une prime plus basse — suis-je sur-assuré ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Pas nécessairement. Les primes dépendent de nombreux facteurs : une prime plus basse peut aussi
                    indiquer qu&apos;il est sous-assuré.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-sans text-xl font-semibold tracking-tight text-[#111827]">
                La règle proportionnelle peut vous coûter des milliers d&apos;euros
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                C&apos;est un mécanisme silencieux : vous ne le découvrez qu&apos;au moment du sinistre, quand il est trop
                tard pour régulariser. La meilleure protection est la prévention : mettre à jour votre contrat
                régulièrement.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Si vous avez déjà subi un sinistre et que la règle proportionnelle a été appliquée, un expert
                d&apos;assuré peut analyser si son application était correcte et si un recours est possible.
              </p>
              <p className="mt-6 font-semibold text-foreground">Analysez votre dossier gratuitement. Sans engagement.</p>
              <Link
                to="/"
                hash="chatbot"
                className="mt-4 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#5B50F0" }}
              >
                → Qualifier mon sinistre gratuitement
              </Link>
              <p className="mt-6 text-xs text-muted-foreground">
                Article rédigé par l&apos;équipe Vertual — Avril 2026 • Dernière mise à jour : Avril 2026
              </p>
            </section>
          </div>

          <section className="mt-12 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
            <h2 className="text-[16px] font-semibold text-[#374151]">À lire aussi</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/guides/sous-indemnisation"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Sous-indemnisation : comment la détecter ?</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/guides/vetuste-assurance"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Vétusté assurance : comment la contester ?</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/guides/declarer-sinistre-assurance"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Déclarer un sinistre : les étapes</span>
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

