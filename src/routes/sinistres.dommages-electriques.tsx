import { createFileRoute } from "@tanstack/react-router";
import { DommagesElectriquesPage } from "@/pages/sinistres/DommagesElectriques";

export const Route = createFileRoute("/sinistres/dommages-electriques")({
  head: () => ({
    meta: [
      { title: "Dommages électriques : expert d'assuré pour votre indemnisation | Vertual" },
      {
        name: "description",
        content:
          "Votre assureur refuse ou minimise votre sinistre électrique ? Un expert d'assuré indépendant défend vos intérêts. Analyse gratuite, sans avance de frais.",
      },
      { property: "og:title", content: "Dommages électriques : expert d'assuré pour votre indemnisation | Vertual" },
      {
        property: "og:description",
        content:
          "Dommages électriques : foudre, surtension, preuves à réunir, vétusté, exclusions et étapes clés pour maximiser votre indemnisation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/sinistres/dommages-electriques" }],
  }),
  component: DommagesElectriquesPage,
});

