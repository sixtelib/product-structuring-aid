import { createFileRoute } from "@tanstack/react-router";
import { LyonLocalPage } from "@/pages/local/Lyon";

export const Route = createFileRoute("/expert-assure-lyon")({
  head: () => ({
    meta: [
      { title: "Expert d'assuré Lyon : défendez votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Sinistré à Lyon et sous-indemnisé par votre assureur ? Vertual défend vos droits. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:title", content: "Expert d'assuré Lyon : défendez votre indemnisation | Vertual" },
      {
        property: "og:description",
        content:
          "Sinistré à Lyon et sous-indemnisé par votre assureur ? Vertual défend vos droits. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:url", content: "https://vertual.fr/expert-assure-lyon" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/expert-assure-lyon" }],
  }),
  component: LyonLocalPage,
});

