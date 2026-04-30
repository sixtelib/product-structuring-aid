import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Expert d'assuré Toulouse",
  provider: { "@type": "Organization", name: "Vertual" },
  areaServed: { "@type": "City", name: "Toulouse" },
  description: "Vertual défend les assurés sinistrés face à leurs assureurs à Toulouse.",
} as const;

export function ToulouseLocalPage() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Local</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré à Toulouse — Vertual défend votre indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Toulouse et la Haute-Garonne sont exposées à plusieurs risques naturels importants : inondations de la
              Garonne, épisodes de grêle violents (la région toulousaine est l'une des plus touchées de France),
              sécheresse et retrait-gonflement des argiles, et tempêtes. La forte croissance démographique de la
              métropole génère également une sinistralité élevée dans le parc immobilier neuf et en cours de
              construction.
            </p>
          </header>

          <div className="prose prose-neutral mt-12 max-w-none space-y-12">
            <section aria-labelledby="toulouse-sinistres">
              <h2 id="toulouse-sinistres" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les sinistres les plus fréquents à Toulouse
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Grêle</strong> : la région toulousaine est l'une des zones de France les plus fréquemment
                  touchées par des épisodes de grêle violents. Toitures, véhicules, panneaux solaires, vérandas — les
                  dégâts sont importants et répétés.
                </li>
                <li>
                  <strong>Inondations</strong> : la Garonne et ses affluents génèrent régulièrement des inondations dans
                  la métropole. Les arrêtés Cat Nat sont fréquents en Haute-Garonne.
                </li>
                <li>
                  <strong>Sécheresse et fissures</strong> : comme dans toute la région Sud-Ouest, le retrait-gonflement
                  des argiles fissure les fondations de nombreuses maisons individuelles de la périphérie toulousaine.
                </li>
                <li>
                  <strong>Sinistres dans le neuf</strong> : la forte construction dans la métropole génère des sinistres
                  spécifiques (malfaçons, désordres en garantie décennale) qui peuvent se combiner avec des sinistres
                  assurance.
                </li>
              </ul>
            </section>

            <section aria-labelledby="toulouse-pourquoi">
              <h2 id="toulouse-pourquoi" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi un expert d'assuré est particulièrement utile à Toulouse
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La fréquence des épisodes de grêle et la sinistralité sécheresse font de la région toulousaine l'une des
                plus actives en termes de litiges d'indemnisation. Les assureurs y traitent un volume élevé de dossiers
                — ce qui favorise les évaluations rapides et insuffisantes.
              </p>
            </section>

            <section aria-labelledby="toulouse-comment">
              <h2 id="toulouse-comment" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
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
              Besoin d'un expert d'assuré à Toulouse ?
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

