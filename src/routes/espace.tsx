import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppGuard } from "@/components/app/AppGuard";
import { AppHeader } from "@/components/app/AppHeader";

export const Route = createFileRoute("/espace")({
  head: () => ({
    meta: [
      { title: "Espace assuré — Recours" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EspaceLayout,
});

function EspaceLayout() {
  return (
    <AppGuard>
      <div className="min-h-screen bg-secondary/30">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </AppGuard>
  );
}
