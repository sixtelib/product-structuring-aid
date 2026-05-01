import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/expert/dossiers")({
  component: ExpertDossiersLayout,
});

function ExpertDossiersLayout() {
  return <Outlet />;
}
