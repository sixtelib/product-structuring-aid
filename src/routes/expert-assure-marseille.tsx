import { createFileRoute } from "@tanstack/react-router";
import { MarseilleLocalPage } from "@/pages/local/Marseille";

export const Route = createFileRoute("/expert-assure-marseille")({
  head: () => ({
    meta: [
      { title: "Expert d'assuré Marseille : défendez votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Sinistré à Marseille et mal indemnisé par votre assureur ? Vertual défend vos droits. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:title", content: "Expert d'assuré Marseille : défendez votre indemnisation | Vertual" },
      {
        property: "og:description",
        content:
          "Sinistré à Marseille et mal indemnisé par votre assureur ? Vertual défend vos droits. Analyse gratuite, expert dédié, success fee 10%, zéro risque.",
      },
      { property: "og:url", content: "https://vertual.fr/expert-assure-marseille" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/expert-assure-marseille" }],
  }),
  component: MarseilleLocalPage,
});

