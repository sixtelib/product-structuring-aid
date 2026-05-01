import { createFileRoute } from "@tanstack/react-router";
import { VetusteAssurancePage } from "@/pages/guides/VetusteAssurance";

export const Route = createFileRoute("/guides/vetuste-assurance")({
  head: () => ({
    meta: [
      { title: "Vétusté assurance : définition, calcul et comment la contester | Vertual" },
      {
        name: "description",
        content:
          "Votre assureur applique une vétusté sur votre indemnisation ? Découvrez comment elle est calculée, quand elle est contestable, et comment récupérer la différence.",
      },
      {
        property: "og:title",
        content: "Vétusté assurance : définition, calcul et comment la contester | Vertual",
      },
      {
        property: "og:description",
        content:
          "Votre assureur applique une vétusté sur votre indemnisation ? Calcul, garantie valeur à neuf, contestation et FAQ.",
      },
      { property: "og:url", content: "https://vertual.fr/guides/vetuste-assurance" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides/vetuste-assurance" }],
  }),
  component: VetusteAssurancePage,
});

