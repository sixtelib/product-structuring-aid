import { createFileRoute } from "@tanstack/react-router";
import { DeclarerSinistrePage } from "@/pages/guides/DeclarerSinistre";

export const Route = createFileRoute("/guides/declarer-sinistre-assurance")({
  head: () => ({
    meta: [
      { title: "Comment déclarer un sinistre assurance : guide complet 2026 | Vertual" },
      {
        name: "description",
        content:
          "Vous venez de subir un sinistre ? Découvrez comment le déclarer correctement à votre assureur, les délais à respecter, et les erreurs à éviter pour protéger votre indemnisation.",
      },
      {
        property: "og:title",
        content: "Comment déclarer un sinistre assurance : guide complet 2026 | Vertual",
      },
      {
        property: "og:description",
        content:
          "Délais, documents, erreurs à éviter : tout pour déclarer un sinistre correctement et protéger votre indemnisation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/declarer-sinistre-assurance" }],
  }),
  component: DeclarerSinistrePage,
});

