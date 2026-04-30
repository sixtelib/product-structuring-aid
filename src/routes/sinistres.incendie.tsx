import { createFileRoute } from "@tanstack/react-router";
import { IncendiePage } from "@/pages/sinistres/Incendie";

export const Route = createFileRoute("/sinistres/incendie")({
  head: () => ({
    meta: [
      { title: "Sinistre incendie : expert d'assuré pour obtenir la juste indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Après un incendie, votre assureur minimise les dommages ? Un expert d'assuré indépendant défend vos intérêts et maximise votre indemnisation. Sans avance de frais.",
      },
      {
        property: "og:title",
        content: "Sinistre incendie : expert d'assuré pour obtenir la juste indemnisation | Vertual",
      },
      {
        property: "og:description",
        content:
          "Incendie : garanties couvertes, étapes critiques, responsabilités, et comment un expert d'assuré maximise votre indemnisation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/sinistres/incendie" }],
  }),
  component: IncendiePage,
});

