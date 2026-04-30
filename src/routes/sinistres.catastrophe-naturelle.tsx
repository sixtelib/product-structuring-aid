import { createFileRoute } from "@tanstack/react-router";
import { CatastropheNaturellePage } from "@/pages/sinistres/CatastropheNaturelle";

export const Route = createFileRoute("/sinistres/catastrophe-naturelle")({
  head: () => ({
    meta: [
      { title: "Catastrophe naturelle : expert d'assuré pour votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Victime d'une catastrophe naturelle ? Votre assureur sous-indemnise votre sinistre ? Un expert d'assuré défend vos droits. Analyse gratuite, sans avance de frais.",
      },
      {
        property: "og:title",
        content: "Catastrophe naturelle : expert d'assuré pour votre indemnisation | Vertual",
      },
      {
        property: "og:description",
        content:
          "Cat Nat : arrêté, délais, franchise, couverture, sécheresse/fissures et comment un expert d'assuré maximise votre indemnisation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/sinistres/catastrophe-naturelle" }],
  }),
  component: CatastropheNaturellePage,
});

