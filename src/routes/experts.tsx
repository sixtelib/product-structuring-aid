import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/experts")({
  beforeLoad: () => {
    throw redirect({ to: "/a-propos" });
  },
});

