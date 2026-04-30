import { createFileRoute } from "@tanstack/react-router";
import { SousIndemnisationPage } from "@/pages/guides/SousIndemnisation";

export const Route = createFileRoute("/guides/sous-indemnisation")({
  head: () => ({
    meta: [
      { title: "Sous-indemnisation assurance : comment le détecter et que faire ? | Vertual" },
      {
        name: "description",
        content:
          "Votre assureur vous a-t-il vraiment remboursé ce à quoi vous aviez droit ? Découvrez les signes d'une sous-indemnisation et les recours pour obtenir la différence.",
      },
      {
        property: "og:title",
        content: "Sous-indemnisation assurance : comment le détecter et que faire ? | Vertual",
      },
      {
        property: "og:description",
        content:
          "Signes de sous-indemnisation, mécanismes fréquents (vétusté, règle proportionnelle), méthode de calcul et recours efficaces.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/sous-indemnisation" }],
  }),
  component: SousIndemnisationPage,
});

