import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Expert d'assuré Lyon",
  provider: { "@type": "Organization", name: "Vertual" },
  areaServed: { "@type": "City", name: "Lyon" },
  description: "Vertual défend les assurés sinistrés face à leurs assureurs à Lyon.",
} as const;

export function LyonLocalPage() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Local</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré à Lyon : Vertual défend votre indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              Lyon et sa métropole sont exposées à des risques spécifiques : inondations récurrentes dans les zones Saône
              et Rhône, sinistres climatiques en hausse dans les Monts d'Or et le Beaujolais, et une forte sinistralité
              dans le parc immobilier ancien de la Presqu'île et de la Croix-Rousse.
            </p>
          </header>

          <div className="prose prose-neutral mt-12 max-w-none space-y-12">
            <section aria-labelledby="lyon-sinistres">
              <h2 id="lyon-sinistres" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les sinistres les plus fréquents à Lyon
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Inondations et crues</strong> : les quartiers riverains de la Saône et du Rhône (La Mulatière,
                  Givors, Irigny) sont régulièrement touchés par des crues. Les arrêtés Cat Nat sont fréquents dans la
                  métropole.
                </li>
                <li>
                  <strong>Dégâts des eaux dans les traboules</strong> : le bâti ancien lyonnais, avec ses toitures
                  complexes et ses canalisations vétustes, génère une forte sinistralité eau.
                </li>
                <li>
                  <strong>Tempêtes et grêle</strong> : la région lyonnaise est régulièrement frappée par des épisodes de
                  grêle violents qui endommagent toitures et véhicules.
                </li>
                <li>
                  <strong>Sinistres professionnels</strong> : Lyon est une métropole économique majeure. Les sinistres
                  touchant les commerces, restaurants et entreprises sont fréquents et les enjeux financiers élevés.
                </li>
              </ul>
            </section>

            <section aria-labelledby="lyon-pourquoi">
              <h2 id="lyon-pourquoi" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi un expert d'assuré est particulièrement utile à Lyon
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                La fréquence des sinistres climatiques et la complexité du bâti ancien lyonnais créent régulièrement des
                situations où l'évaluation initiale de l'assureur sous-estime les dommages réels.
              </p>
            </section>

            <section aria-labelledby="lyon-comment">
              <h2 id="lyon-comment" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
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
              Besoin d'un expert d'assuré à Lyon ?
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

