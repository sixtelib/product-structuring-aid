import { createFileRoute } from "@tanstack/react-router";
import { GuidesIndexPage } from "@/pages/guides/index";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Guides assuré — Vertual" },
      {
        name: "description",
        content:
          "Guides pratiques pour comprendre l'expertise d'assuré, vos droits après un sinistre et comment maximiser votre indemnisation.",
      },
      { property: "og:title", content: "Guides assuré — Vertual" },
      {
        property: "og:description",
        content:
          "Guides pratiques pour comprendre l'expertise d'assuré et vos droits après un sinistre.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/guides" }],
  }),
  component: GuidesIndexPage,
});
