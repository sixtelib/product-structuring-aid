import { createFileRoute } from "@tanstack/react-router";
import { CommentCaMarchePage } from "@/pages/CommentCaMarche";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche : expert d'assuré en ligne | Vertual" },
      {
        name: "description",
        content:
          "Vertual gère 100% de votre dossier sinistre face à votre assureur. Qualification en 2 minutes, analyse IA, expert dédié, négociation jusqu'à l'indemnisation finale.",
      },
      { property: "og:title", content: "Comment ça marche : expert d'assuré en ligne | Vertual" },
      {
        property: "og:description",
        content:
          "Vertual gère 100% de votre dossier sinistre face à votre assureur. Qualification en 2 minutes, analyse IA, expert dédié, négociation jusqu'à l'indemnisation finale.",
      },
      { property: "og:url", content: "https://vertual.fr/comment-ca-marche" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/comment-ca-marche" }],
  }),
  component: CommentCaMarchePage,
});
