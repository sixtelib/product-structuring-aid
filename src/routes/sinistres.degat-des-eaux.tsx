import { createFileRoute } from "@tanstack/react-router";
import { DegatDesEauxPage } from "@/pages/sinistres/DegatDesEaux";

export const Route = createFileRoute("/sinistres/degat-des-eaux")({
  head: () => ({
    meta: [
      { title: "Dégât des eaux : expert d'assuré pour maximiser votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Votre assureur sous-évalue votre dégât des eaux ? Un expert d'assuré indépendant analyse votre dossier gratuitement et défend vos intérêts. Sans avance de frais.",
      },
      {
        property: "og:title",
        content: "Dégât des eaux : expert d'assuré pour maximiser votre indemnisation | Vertual",
      },
      {
        property: "og:description",
        content:
          "Dégât des eaux : causes couvertes, étapes clés, délais, et comment un expert d'assuré maximise votre indemnisation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/sinistres/degat-des-eaux" }],
  }),
  component: DegatDesEauxPage,
});

