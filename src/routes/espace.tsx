import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/espace")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Espace assuré — Claimeur" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EspaceRedirect,
});

function EspaceRedirect() {
  return null;
}
