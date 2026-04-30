import { createFileRoute } from "@tanstack/react-router";
import { FaqSeoPage } from "@/pages/FAQ";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ Expert d'assuré : toutes vos questions | Vertual" },
      {
        name: "description",
        content:
          "Tout ce que vous devez savoir sur l'expert d'assuré, vos droits face à votre assureur, et les recours en cas de sinistre. Réponses claires et complètes.",
      },
      { property: "og:title", content: "FAQ Expert d'assuré : toutes vos questions | Vertual" },
      {
        property: "og:description",
        content:
          "Tout ce que vous devez savoir sur l'expert d'assuré, vos droits face à votre assureur, et les recours en cas de sinistre.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/faq" }],
  }),
  component: FaqSeoPage,
});
