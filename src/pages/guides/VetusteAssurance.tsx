import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useJsonLdInHead } from "@/hooks/use-json-ld-head";

const toc = [
  { href: "#definition", label: "Qu'est-ce que la vétusté en assurance ?" },
  { href: "#calcul", label: "Comment la vétusté est-elle calculée ?" },
  { href: "#valeur-neuf", label: "Garantie valeur à neuf : éviter la vétusté" },
  { href: "#contester", label: "Quand la vétusté est-elle contestable ?" },
  { href: "#comment", label: "Comment contester une vétusté abusive ?" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Vétusté assurance : tout comprendre et comment la contester",
  description:
    "Votre assureur applique une vétusté sur votre indemnisation ? Découvrez comment elle est calculée, quand elle est contestable, et comment récupérer la différence.",
  url: "https://vertual.fr/guides/vetuste-assurance",
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
      name: "L'assureur peut-il appliquer une vétusté de 100% ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. La plupart des contrats prévoient un plafond de vétusté (souvent 70 à 80% selon les biens). Vérifiez le plafond prévu dans votre contrat.",
      },
    },
    {
      "@type": "Question",
      name: "La vétusté s'applique-t-elle aussi au bâtiment ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, mais les taux sont plus faibles que pour le mobilier. Le taux peut toutefois être contestable si l'entretien a été régulier.",
      },
    },
    {
      "@type": "Question",
      name: "J'ai la garantie valeur à neuf mais l'assureur me refuse le complément — que faire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le refus du second versement est contestable si vous avez présenté les justificatifs de remplacement dans les délais. Vérifiez les conditions de votre contrat et contestez par écrit si votre situation y correspond.",
      },
    },
    {
      "@type": "Question",
      name: "La vétusté s'applique-t-elle aux biens offerts ou reçus en héritage ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. La vétusté s'applique à l'ancienneté réelle du bien, quelle que soit son origine. La date de fabrication ou d'achat original fait foi.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on négocier la vétusté avec son assureur ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, dans le cadre de la procédure contradictoire. L'expert d'assuré peut négocier les taux poste par poste avec l'expert de l'assureur.",
      },
    },
  ],
} as const;

export function VetusteAssurancePage() {
  useJsonLdInHead(articleJsonLd, faqPageJsonLd);

  return (
    <SiteLayout>
      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Guide</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Vétusté assurance : définition, calcul et comment la contester
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Votre assureur applique une vétusté sur votre indemnisation ? Découvrez comment elle est calculée,
              quand elle est contestable, et comment récupérer la différence.
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
              Vous venez de recevoir l&apos;offre d&apos;indemnisation de votre assureur. Le montant vous semble
              étrangement bas. En lisant le rapport d&apos;expertise, vous tombez sur une ligne : &quot;déduction de
              vétusté : 40%&quot;. Votre indemnisation vient d&apos;être amputée de 40% — sans que personne ne vous
              l&apos;ait vraiment expliqué.
            </p>
            <p className="text-base leading-relaxed text-foreground">
              La vétusté est l&apos;un des mécanismes les plus utilisés par les assureurs pour réduire les
              indemnisations. C&apos;est aussi l&apos;un des plus contestables quand il est mal appliqué.
            </p>

            <section id="definition" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                1. Qu&apos;est-ce que la vétusté en assurance ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La vétusté est une déduction appliquée par l&apos;assureur sur la valeur des biens endommagés pour
                tenir compte de leur <strong>ancienneté et de leur usure normale</strong>.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Le principe est simple : un bien de 10 ans ne vaut pas la même chose qu&apos;un bien neuf. L&apos;assureur
                ne vous rembourse donc pas la valeur d&apos;un bien neuf, mais la valeur réelle du bien au moment du
                sinistre — c&apos;est-à-dire sa valeur neuve diminuée de la vétusté.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-[#F8F9FF] p-5 text-sm leading-relaxed text-foreground">
                <p className="font-semibold">Exemple concret</p>
                <p className="mt-2 text-muted-foreground">
                  Votre canapé, acheté 1 500 € il y a 5 ans, est détruit dans un incendie. L&apos;assureur applique une
                  vétusté de 40% (barème contractuel pour les meubles de 5 ans). Vous êtes indemnisé 900 € au lieu
                  de 1 500 €.
                </p>
              </div>
              <p className="mt-6 text-base leading-relaxed text-foreground">
                La vétusté est <strong>légale et prévue dans votre contrat</strong>. Ce n&apos;est pas un abus en soi.
                Mais elle devient un problème quand elle est mal calculée, appliquée à des taux excessifs, ou
                étendue à des postes qui ne devraient pas y être soumis.
              </p>
            </section>

            <section id="calcul" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                2. Comment la vétusté est-elle calculée ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La vétusté est calculée selon des <strong>barèmes définis dans vos conditions générales</strong>{" "}
                d&apos;assurance. Ces barèmes varient selon la nature du bien, son ancienneté, et parfois son état
                d&apos;entretien.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#F8F9FF]">
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Type de bien
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Vétusté annuelle
                      </th>
                      <th className="px-4 py-3 font-semibold text-[#5B50F0] sm:px-5" scope="col">
                        Vétusté maximale
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    <tr>
                      <td className="px-4 py-3 text-foreground sm:px-5">Électroménager</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">10 à 15%</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">70 à 80%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground sm:px-5">Mobilier</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">8 à 12%</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">60 à 70%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground sm:px-5">Vêtements</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">15 à 20%</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">80%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground sm:px-5">Toiture</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">2 à 4%</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">60%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground sm:px-5">Installations électriques</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">3 à 5%</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">70%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground sm:px-5">Peintures et revêtements</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">5 à 10%</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">60%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-base leading-relaxed text-foreground">
                <strong>Important :</strong> ces barèmes sont indicatifs. Les taux réels applicables à votre dossier
                sont ceux définis dans <strong>vos</strong> conditions générales — pas ceux que l&apos;expert de
                l&apos;assureur décide arbitrairement.
              </p>
            </section>

            <section id="valeur-neuf" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                3. La garantie valeur à neuf : comment éviter la vétusté ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La meilleure protection contre la vétusté est la <strong>garantie valeur à neuf</strong>, souvent
                proposée en option dans les contrats multirisque habitation.
              </p>
              <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">Comment fonctionne-t-elle ?</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Avec la garantie valeur à neuf, l&apos;assureur vous indemnise en deux temps :
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Premier versement</strong> : indemnisation après déduction de vétusté (valeur réelle)
                </li>
                <li>
                  <strong>Second versement</strong> : complément jusqu&apos;à la valeur à neuf, après justificatifs de
                  remplacement
                </li>
              </ol>
              <div className="mt-6 rounded-xl border border-border bg-[#F8F9FF] p-5 text-sm leading-relaxed text-foreground">
                <p className="font-semibold">Exemple</p>
                <p className="mt-2 text-muted-foreground">
                  Votre TV de 4 ans (achetée 800 €) est détruite. Sans garantie valeur à neuf, vous recevez 480 €
                  (40% de vétusté). Avec la garantie, vous recevez d&apos;abord 480 €, puis un complément de 320 € après
                  achat d&apos;une TV de remplacement.
                </p>
              </div>
              <h3 className="mt-8 font-sans text-lg font-semibold text-foreground">
                Les limites de la garantie valeur à neuf
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Elle ne s&apos;applique généralement qu&apos;aux biens de moins de 3 à 5 ans</li>
                <li>Elle nécessite de présenter des justificatifs de remplacement dans un délai donné</li>
                <li>Certains biens sont exclus selon les contrats</li>
              </ul>
              <p className="mt-6 text-base leading-relaxed text-foreground">
                Si vous n&apos;avez pas la garantie valeur à neuf, vous pouvez parfois la négocier lors du renouvellement
                de votre contrat.
              </p>
            </section>

            <section id="contester" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                4. Quand la vétusté est-elle contestable ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La vétusté n&apos;est pas toujours appliquée correctement. Voici les situations où elle est contestable :
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Taux supérieur aux barèmes contractuels.</strong> Si le rapport applique un taux au-delà du
                  maximum prévu au contrat, c&apos;est directement contestable.
                </li>
                <li>
                  <strong>Vétusté appliquée sur des postes exemptés.</strong> Certains postes (ex. frais annexes) peuvent
                  être exclus de la vétusté selon les contrats.
                </li>
                <li>
                  <strong>Calcul sur la mauvaise base.</strong> La vétusté doit porter sur le coût de remplacement
                  actuel, pas sur un prix d&apos;achat obsolète.
                </li>
                <li>
                  <strong>Application uniforme sans distinction.</strong> Appliquer le même taux à tous les biens sans
                  analyse individuelle est une erreur.
                </li>
                <li>
                  <strong>Bien récent avec vétusté excessive.</strong> Un bien de 2 ans à 40% de vétusté doit vous
                  alerter : vérifiez le barème.
                </li>
              </ul>
            </section>

            <section id="comment" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                5. Comment contester une vétusté abusive ?
              </h2>
              <ol className="mt-6 space-y-6 text-base leading-relaxed text-foreground">
                <li>
                  <h3 className="font-semibold text-foreground">Étape 1 — Relisez votre contrat</h3>
                  <p className="mt-1 text-muted-foreground">
                    Trouvez le tableau des barèmes de vétusté dans vos conditions générales et comparez les taux
                    appliqués dans le rapport.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 2 — Documentez l&apos;état réel des biens</h3>
                  <p className="mt-1 text-muted-foreground">
                    Photos, factures d&apos;entretien, garanties constructeur : tout ce qui prouve l&apos;état et
                    l&apos;entretien peut justifier un taux plus faible.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 3 — Mandatez un expert d&apos;assuré</h3>
                  <p className="mt-1 text-muted-foreground">
                    L&apos;expert d&apos;assuré vérifie poste par poste la conformité au contrat et conteste les taux en
                    procédure contradictoire.
                  </p>
                </li>
                <li>
                  <h3 className="font-semibold text-foreground">Étape 4 — Envoyez une lettre de contestation</h3>
                  <p className="mt-1 text-muted-foreground">
                    Contestation écrite, idéalement en recommandé, en citant les barèmes contractuels et les écarts
                    constatés.
                  </p>
                </li>
              </ol>
            </section>

            <section id="faq" className="scroll-mt-24">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">6. Questions fréquentes</h2>
              <dl className="mt-6 grid gap-6 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-foreground">L&apos;assureur peut-il appliquer une vétusté de 100% ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Non. La plupart des contrats prévoient un plafond (souvent 70 à 80%). Vérifiez votre contrat.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">La vétusté s&apos;applique-t-elle aussi au bâtiment ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, mais à des taux plus faibles. L&apos;entretien peut rendre un taux contestable.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    J&apos;ai la garantie valeur à neuf mais l&apos;assureur refuse le complément — que faire ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Si vous avez présenté les justificatifs dans les délais, contestez le refus par écrit en vous
                    appuyant sur les conditions du contrat.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">
                    La vétusté s&apos;applique-t-elle aux biens offerts ou reçus en héritage ?
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui. Elle dépend de l&apos;ancienneté réelle du bien (date de fabrication/achat original).
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-foreground">Peut-on négocier la vétusté avec son assureur ?</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Oui, en procédure contradictoire. C&apos;est précisément un levier de négociation poste par poste.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-sans text-xl font-semibold tracking-tight text-[#111827]">
                La vétusté ne doit pas être une fatalité
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Votre assureur applique une vétusté — c&apos;est normal. Mais il doit la calculer correctement, aux taux
                prévus par votre contrat, sur les bons postes. Quand ce n&apos;est pas le cas, vous avez le droit de
                contester.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Un expert d&apos;assuré vérifie systématiquement chaque ligne de vétusté dans votre dossier. C&apos;est
                souvent là que se cachent les gains les plus importants.
              </p>
              <p className="mt-6 font-semibold text-foreground">Faites analyser votre dossier gratuitement. Sans engagement.</p>
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
                to="/guides/expert-assure"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Qu&apos;est-ce qu&apos;un expert d&apos;assuré ?</span>
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

