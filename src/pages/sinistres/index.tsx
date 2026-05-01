import { Helmet } from "react-helmet-async";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const sinistres = [
  {
    emoji: "💧",
    title: "Dégât des eaux",
    description: "Fuite, infiltration, rupture : faites évaluer l'étendue réelle des dommages.",
    to: "/sinistres/degat-des-eaux",
  },
  {
    emoji: "🔥",
    title: "Incendie",
    description: "Biens détruits, fumée, eau des pompiers : défendez chaque poste d'indemnisation.",
    to: "/sinistres/incendie",
  },
  {
    emoji: "🌪️",
    title: "Tempête",
    description: "Toiture, grêle, dommages consécutifs : évitez les évaluations rapides et incomplètes.",
    to: "/sinistres/tempete",
  },
  {
    emoji: "🌊",
    title: "Catastrophe naturelle",
    description: "Arrêté, délais, franchise : activez les bons régimes et obtenez la juste indemnisation.",
    to: "/sinistres/catastrophe-naturelle",
  },
  {
    emoji: "⚡",
    title: "Dommages électriques",
    description: "Foudre, surtension : rassemblez les preuves et contestez la vétusté abusive.",
    to: "/sinistres/dommages-electriques",
  },
] as const;

export function SinistresIndexPage() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Sinistres assurance : expert d'assuré pour chaque type de sinistre | Vertual</title>
        <meta
          name="description"
          content="Dégât des eaux, incendie, tempête, catastrophe naturelle... Vertual défend les assurés sinistrés face à leurs assureurs. Analyse gratuite."
        />
        <link rel="canonical" href="https://vertual.fr/sinistres" />
      </Helmet>

      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8">
          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
            Votre sinistre, nos experts
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Quel que soit votre sinistre, Vertual défend votre indemnisation face à votre assureur.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap gap-[24px]">
            {sinistres.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="group flex min-w-0 flex-[1_1_100%] items-start justify-between gap-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6 transition-colors hover:border-[#5B50F0] md:min-w-[300px] md:max-w-[calc(50%-12px)] md:flex-[1_1_calc(50%-12px)]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl leading-none" aria-hidden>
                    {s.emoji}
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-[#5B50F0]">{s.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  </div>
                </div>
                <span className="mt-0.5 shrink-0 text-[#5B50F0]" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

