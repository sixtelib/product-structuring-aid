import { createFileRoute } from "@tanstack/react-router";
import { ToulouseLocalPage } from "@/pages/local/Toulouse";

export const Route = createFileRoute("/expert-assure-toulouse")({
  head: () => ({
    meta: [
      { title: "Expert d'assuré Toulouse : défendez votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Sinistré à Toulouse et mal indemnisé ? Vertual défend vos droits face à votre assureur. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:title", content: "Expert d'assuré Toulouse : défendez votre indemnisation | Vertual" },
      {
        property: "og:description",
        content:
          "Sinistré à Toulouse et mal indemnisé ? Vertual défend vos droits face à votre assureur. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:url", content: "https://vertual.fr/expert-assure-toulouse" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/expert-assure-toulouse" }],
  }),
  component: ToulouseLocalPage,
});

