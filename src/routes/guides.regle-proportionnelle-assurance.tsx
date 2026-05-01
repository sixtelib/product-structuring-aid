import { createFileRoute } from "@tanstack/react-router";
import { RegleProportionnellePage } from "@/pages/guides/RegleProportionnelle";

export const Route = createFileRoute("/guides/regle-proportionnelle-assurance")({
  head: () => ({
    meta: [
      { title: "Règle proportionnelle assurance : définition, calcul et comment l'éviter | Vertual" },
      {
        name: "description",
        content:
          "La règle proportionnelle peut réduire drastiquement votre indemnisation. Découvrez comment elle fonctionne, comment détecter une sous-assurance, et comment vous protéger.",
      },
      {
        property: "og:title",
        content: "Règle proportionnelle assurance : définition, calcul et comment l'éviter | Vertual",
      },
      {
        property: "og:description",
        content:
          "La règle proportionnelle peut réduire drastiquement votre indemnisation. Fonctionnement, calcul, sous-assurance, prévention et questions fréquentes.",
      },
      { property: "og:url", content: "https://vertual.fr/guides/regle-proportionnelle-assurance" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/regle-proportionnelle-assurance" }],
  }),
  component: RegleProportionnellePage,
});

