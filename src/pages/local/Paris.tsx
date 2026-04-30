import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Expert d'assuré Paris",
  provider: { "@type": "Organization", name: "Vertual" },
  areaServed: { "@type": "City", name: "Paris" },
  description: "Vertual défend les assurés sinistrés face à leurs assureurs à Paris.",
} as const;

export function ParisLocalPage() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Local</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré à Paris : Vertual défend votre indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Paris concentre chaque année des centaines de milliers de sinistres : dégâts des eaux dans les immeubles
              haussmanniens, incendies en copropriété, sinistres liés aux travaux du Grand Paris, inondations en zones
              inondables (Seine, Marne). La densité du bâti parisien rend les sinistres particulièrement complexes, et
              les litiges avec les assureurs plus fréquents.
            </p>
          </header>

          <div className="prose prose-neutral mt-12 max-w-none space-y-12">
            <section aria-labelledby="paris-sinistres">
              <h2 id="paris-sinistres" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les sinistres les plus fréquents à Paris
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Dégâts des eaux en copropriété</strong> : avec des immeubles anciens et des canalisations
                  vétustes, les dégâts des eaux sont le sinistre numéro un à Paris. La complexité des responsabilités en
                  copropriété (parties privatives vs parties communes) génère régulièrement des litiges d'indemnisation.
                </li>
                <li>
                  <strong>Sinistres liés aux travaux</strong> : les chantiers du Grand Paris Express et les nombreuses
                  rénovations en cours génèrent des fissures, des infiltrations et des dommages aux bâtiments voisins
                  souvent mal indemnisés.
                </li>
                <li>
                  <strong>Incendies en appartement</strong> : dans les immeubles denses, un incendie se propage
                  rapidement. Les dossiers multi-victimes sont complexes à gérer seul face à son assureur.
                </li>
                <li>
                  <strong>Inondations</strong> : les zones inondables en banlieue parisienne (Val-de-Marne,
                  Seine-Saint-Denis, Hauts-de-Seine) sont régulièrement touchées. Le régime Cat Nat s'applique
                  fréquemment.
                </li>
              </ul>
            </section>

            <section aria-labelledby="paris-pourquoi">
              <h2 id="paris-pourquoi" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi un expert d'assuré est particulièrement utile à Paris
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les enjeux financiers sont plus élevés qu'ailleurs (valeur immobilière, coûts de réparation), les
                assureurs sont plus sollicités, et les dossiers en copropriété sont structurellement plus complexes.
              </p>
            </section>

            <section aria-labelledby="paris-comment">
              <h2 id="paris-comment" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Comment ça marche avec Vertual
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Décrivez votre sinistre via notre chatbot. Analyse gratuite en 48h. Si votre dossier mérite un recours,
                un expert dédié prend en charge 100% des échanges avec votre assureur. Rémunération uniquement au succès :
                10% du gain obtenu.
              </p>
            </section>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-[#F8F9FF] p-6 sm:p-8">
            <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">
              Besoin d'un expert d'assuré à Paris ?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Qualifiez votre sinistre en quelques minutes. Analyse gratuite, sans engagement.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-[10px] bg-[#5B50F0] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
            >
              Qualifier mon sinistre gratuitement →
            </Link>
          </div>
        </article>
      </div>
    </SiteLayout>
  );
}

