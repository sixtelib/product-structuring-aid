import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/expert/")({
  beforeLoad: () => {
    throw redirect({ to: "/expert/dossiers", replace: true });
  },
  component: () => null,
});
