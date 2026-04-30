import { createFileRoute } from "@tanstack/react-router";
import { SinistresIndexPage } from "@/pages/sinistres";

export const Route = createFileRoute("/sinistres/")({
  head: () => ({
    meta: [
      { title: "Sinistres assurance : expert d'assuré pour chaque type de sinistre | Vertual" },
      {
        name: "description",
        content:
          "Dégât des eaux, incendie, tempête, catastrophe naturelle... Vertual défend les assurés sinistrés face à leurs assureurs. Analyse gratuite.",
      },
      {
        property: "og:title",
        content: "Sinistres assurance : expert d'assuré pour chaque type de sinistre | Vertual",
      },
      {
        property: "og:description",
        content: "Vertual défend les assurés sinistrés face à leurs assureurs. Analyse gratuite.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/sinistres" }],
  }),
  component: SinistresIndexPage,
});

