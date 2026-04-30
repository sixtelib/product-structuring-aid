import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/sinistres")({
  component: SinistresLayout,
});

function SinistresLayout() {
  return <Outlet />;
}
