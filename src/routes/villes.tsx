import { createFileRoute } from "@tanstack/react-router";
import { LocalCitiesIndexPage } from "@/pages/local";

export const Route = createFileRoute("/villes")({
  head: () => ({
    meta: [
      { title: "Villes : nos experts d'assuré | Vertual" },
      {
        name: "description",
        content:
          "Paris, Lyon, Marseille, Bordeaux, Toulouse… découvrez nos pages locales et qualifiez votre sinistre en quelques minutes.",
      },
      { property: "og:title", content: "Villes : nos experts d'assuré | Vertual" },
      {
        property: "og:description",
        content:
          "Paris, Lyon, Marseille, Bordeaux, Toulouse… découvrez nos pages locales et qualifiez votre sinistre en quelques minutes.",
      },
      { property: "og:url", content: "https://vertual.fr/villes" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/villes" }],
  }),
  component: LocalCitiesIndexPage,
});

