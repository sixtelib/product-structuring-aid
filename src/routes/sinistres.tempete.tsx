import { createFileRoute } from "@tanstack/react-router";
import { TempetePage } from "@/pages/sinistres/Tempete";

export const Route = createFileRoute("/sinistres/tempete")({
  head: () => ({
    meta: [
      { title: "Sinistre tempête : expert d'assuré pour maximiser votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Votre assureur minimise les dommages après une tempête ? Un expert d'assuré indépendant défend vos intérêts. Analyse gratuite, sans avance de frais.",
      },
      {
        property: "og:title",
        content: "Sinistre tempête : expert d'assuré pour maximiser votre indemnisation | Vertual",
      },
      {
        property: "og:description",
        content:
          "Tempête : garantie couverte, Cat Nat, dommages cachés, étapes à suivre et FAQ pour maximiser votre indemnisation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/sinistres/tempete" }],
  }),
  component: TempetePage,
});

