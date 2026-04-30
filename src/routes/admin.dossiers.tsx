import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dossiers")({
  component: AdminDossiersLayout,
});

function AdminDossiersLayout() {
  return <Outlet />;
}
