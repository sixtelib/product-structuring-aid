import { createFileRoute } from "@tanstack/react-router";
import { ProcesVerbalExpertisePage } from "@/pages/guides/ProcesVerbalExpertise";

export const Route = createFileRoute("/guides/proces-verbal-expertise-assurance")({
  head: () => ({
    meta: [
      { title: "Procès-verbal d'expertise assurance : que signer et quand refuser ? | Vertual" },
      {
        name: "description",
        content:
          "L'expert de votre assureur vous demande de signer un procès-verbal. Que contient ce document ? Quelles sont les conséquences ? Quand refuser de signer ? Tout comprendre.",
      },
      {
        property: "og:title",
        content: "Procès-verbal d'expertise assurance : que signer et quand refuser ? | Vertual",
      },
      {
        property: "og:description",
        content:
          "Procès-verbal d'expertise : ce que contient le PV, les différents types, quand signer, quand refuser et comment se protéger.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/proces-verbal-expertise-assurance" }],
  }),
  component: ProcesVerbalExpertisePage,
});

