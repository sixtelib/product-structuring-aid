import { createFileRoute } from "@tanstack/react-router";
import { ParisLocalPage } from "@/pages/local/Paris";

export const Route = createFileRoute("/expert-assure-paris")({
  head: () => ({
    meta: [
      { title: "Expert d'assuré Paris : défendez votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Vous êtes sinistré à Paris et votre assureur minimise les dommages ? Vertual défend votre indemnisation. Analyse gratuite, success fee 10%, zéro risque.",
      },
      { property: "og:title", content: "Expert d'assuré Paris : défendez votre indemnisation | Vertual" },
      {
        property: "og:description",
        content:
          "Vous êtes sinistré à Paris et votre assureur minimise les dommages ? Vertual défend votre indemnisation. Analyse gratuite, success fee 10%, zéro risque.",
      },
      { property: "og:url", content: "https://vertual.fr/expert-assure-paris" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/expert-assure-paris" }],
  }),
  component: ParisLocalPage,
});

