import { createFileRoute } from "@tanstack/react-router";
import { AssureurRefusePayerPage } from "@/pages/guides/AssureurRefusePayer";

export const Route = createFileRoute("/guides/assureur-refuse-payer")({
  head: () => ({
    meta: [
      { title: "Assureur refuse de payer : que faire ? Recours et solutions | Vertual" },
      {
        name: "description",
        content:
          "Votre assureur refuse de rembourser votre sinistre ? Découvrez les 5 recours concrets pour contester un refus d'indemnisation et obtenir ce à quoi vous avez droit.",
      },
      {
        property: "og:title",
        content: "Assureur refuse de payer : que faire ? Recours et solutions | Vertual",
      },
      {
        property: "og:description",
        content:
          "Refus total, partiel ou offre insuffisante : contrat, lettre, expert d'assuré, médiateur, justice ,  et dans quel ordre agir.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/assureur-refuse-payer" }],
  }),
  component: AssureurRefusePayerPage,
});
