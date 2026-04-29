import { createFileRoute } from "@tanstack/react-router";
import { ExpertAssurePage } from "@/pages/guides/ExpertAssure";

export const Route = createFileRoute("/guides/expert-assure")({
  head: () => ({
    meta: [
      { title: "Expert d'assuré : rôle, honoraires et comment ça marche | Vertual" },
      {
        name: "description",
        content:
          "L'expert d'assuré défend vos intérêts face à votre assureur après un sinistre. Rôle, honoraires, différence avec l'expert de l'assureur : tout comprendre en 5 minutes.",
      },
      {
        property: "og:title",
        content: "Expert d'assuré : rôle, honoraires et comment ça marche | Vertual",
      },
      {
        property: "og:description",
        content:
          "L'expert d'assuré défend vos intérêts face à votre assureur après un sinistre. Rôle, honoraires, tableau comparatif et FAQ.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/expert-assure" }],
  }),
  component: ExpertAssurePage,
});
