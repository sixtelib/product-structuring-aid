import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Expert d'assuré Marseille",
  provider: { "@type": "Organization", name: "Vertual" },
  areaServed: { "@type": "City", name: "Marseille" },
  description: "Vertual défend les assurés sinistrés face à leurs assureurs à Marseille.",
} as const;

export function MarseilleLocalPage() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Local</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré à Marseille : Vertual défend votre indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Marseille présente une sinistralité spécifique liée à son climat méditerranéen, à la vétusté d'une partie
              importante de son parc immobilier, et à des risques naturels particuliers (incendies de forêt, épisodes
              cévenols, mistral). La ville concentre également un parc de logements anciens dont les sinistres génèrent
              régulièrement des litiges d'indemnisation.
            </p>
          </header>

          <div className="prose prose-neutral mt-12 max-w-none space-y-12">
            <section aria-labelledby="marseille-sinistres">
              <h2 id="marseille-sinistres" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les sinistres les plus fréquents à Marseille
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Incendies</strong> : Marseille est l'une des villes françaises les plus touchées par les
                  incendies, qu'ils soient urbains ou liés aux feux de forêt en interface urbaine (13ème, 14ème
                  arrondissements, quartiers nord).
                </li>
                <li>
                  <strong>Épisodes cévenols et inondations éclairs</strong> : les pluies torrentielles méditerranéennes
                  génèrent des inondations soudaines et des dégâts considérables, souvent couverts par le régime Cat Nat.
                </li>
                <li>
                  <strong>Dégâts liés au mistral</strong> : les vents violents endommagent régulièrement les toitures,
                  terrasses et structures légères.
                </li>
                <li>
                  <strong>Sinistres dans le bâti ancien dégradé</strong> : une partie significative du parc immobilier
                  marseillais est ancienne et mal entretenue. Les sinistres y sont fréquents et les responsabilités
                  complexes.
                </li>
              </ul>
            </section>

            <section aria-labelledby="marseille-pourquoi">
              <h2 id="marseille-pourquoi" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi un expert d'assuré est particulièrement utile à Marseille
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La multiplicité des risques (climatique, incendie, bâti dégradé) et la fréquence des arrêtés Cat Nat dans
                les Bouches-du-Rhône créent un contexte où les dossiers sont souvent complexes et les indemnisations
                initiales insuffisantes.
              </p>
            </section>

            <section aria-labelledby="marseille-comment">
              <h2 id="marseille-comment" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
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
              Besoin d'un expert d'assuré à Marseille ?
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

