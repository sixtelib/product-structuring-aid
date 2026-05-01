import { createFileRoute } from "@tanstack/react-router";
import { DelaiPrescriptionPage } from "@/pages/guides/DelaiPrescription";

export const Route = createFileRoute("/guides/delai-prescription-assurance")({
  head: () => ({
    meta: [
      {
        title: "Délai de prescription assurance : définition et recours avant expiration | Vertual",
      },
      {
        name: "description",
        content:
          "En assurance, vous avez 2 ans pour agir après un sinistre. Passé ce délai, vous perdez tout droit. Découvrez comment calculer ce délai et comment agir à temps.",
      },
      {
        property: "og:title",
        content:
          "Délai de prescription assurance : définition et recours avant expiration | Vertual",
      },
      {
        property: "og:description",
        content:
          "En assurance, vous avez 2 ans pour agir après un sinistre. Découvrez comment calculer la prescription et comment l'interrompre à temps.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/delai-prescription-assurance" }],
  }),
  component: DelaiPrescriptionPage,
});
