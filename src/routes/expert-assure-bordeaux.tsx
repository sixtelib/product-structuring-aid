import { createFileRoute } from "@tanstack/react-router";
import { BordeauxLocalPage } from "@/pages/local/Bordeaux";

export const Route = createFileRoute("/expert-assure-bordeaux")({
  head: () => ({
    meta: [
      { title: "Expert d'assuré Bordeaux : défendez votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Sinistré à Bordeaux et sous-indemnisé ? Vertual défend vos droits face à votre assureur. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:title", content: "Expert d'assuré Bordeaux : défendez votre indemnisation | Vertual" },
      {
        property: "og:description",
        content:
          "Sinistré à Bordeaux et sous-indemnisé ? Vertual défend vos droits face à votre assureur. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:url", content: "https://vertual.fr/expert-assure-bordeaux" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/expert-assure-bordeaux" }],
  }),
  component: BordeauxLocalPage,
});

