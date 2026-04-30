import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Expert d'assuré Bordeaux",
  provider: { "@type": "Organization", name: "Vertual" },
  areaServed: { "@type": "City", name: "Bordeaux" },
  description: "Vertual défend les assurés sinistrés face à leurs assureurs à Bordeaux.",
} as const;

export function BordeauxLocalPage() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div className="bg-white font-sans text-foreground">
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <header className="border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5B50F0]">Local</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#5B50F0] sm:text-4xl">
              Expert d'assuré à Bordeaux — Vertual défend votre indemnisation
            </h1>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              La métropole bordelaise est particulièrement exposée à deux risques majeurs : la sécheresse et le
              retrait-gonflement des argiles, qui fissurent les fondations de milliers de maisons individuelles, et les
              tempêtes atlantiques qui frappent régulièrement la façade girondine. Ces deux risques génèrent une
              sinistralité élevée et des dossiers souvent mal indemnisés.
            </p>
          </header>

          <div className="prose prose-neutral mt-12 max-w-none space-y-12">
            <section aria-labelledby="bordeaux-sinistres">
              <h2 id="bordeaux-sinistres" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Les sinistres les plus fréquents à Bordeaux
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>
                  <strong>Sécheresse et fissures</strong> : la Gironde est l'un des départements français les plus
                  touchés par le phénomène de retrait-gonflement des argiles. Des milliers de maisons individuelles
                  présentent des fissures structurelles liées aux épisodes de sécheresse. Ces dossiers sont parmi les
                  plus complexes et les plus sous-indemnisés.
                </li>
                <li>
                  <strong>Tempêtes atlantiques</strong> : la région bordelaise est régulièrement frappée par des tempêtes
                  (comme les tempêtes Klaus et Xynthia l'ont montré). Toitures arrachées, arbres tombés, structures
                  endommagées — les dégâts sont importants et les indemnisations souvent insuffisantes.
                </li>
                <li>
                  <strong>Inondations</strong> : les zones basses de la métropole (rives de la Garonne, zones inondables
                  de la Dordogne) sont régulièrement soumises à des arrêtés Cat Nat.
                </li>
                <li>
                  <strong>Dégâts des eaux dans le bâti ancien</strong> : le centre historique de Bordeaux, avec ses
                  immeubles du 18ème siècle, génère une sinistralité eau importante.
                </li>
              </ul>
            </section>

            <section aria-labelledby="bordeaux-pourquoi">
              <h2 id="bordeaux-pourquoi" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
                Pourquoi un expert d'assuré est particulièrement utile à Bordeaux
              </h2>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Les dossiers sécheresse/fissures sont parmi les plus complexes techniquement et ceux où l'écart entre
                l'offre initiale de l'assureur et l'indemnisation réelle est le plus important. Un expert d'assuré
                spécialisé fait une différence considérable.
              </p>
            </section>

            <section aria-labelledby="bordeaux-comment">
              <h2 id="bordeaux-comment" className="font-sans text-2xl font-semibold tracking-tight text-[#5B50F0]">
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
              Besoin d'un expert d'assuré à Bordeaux ?
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

