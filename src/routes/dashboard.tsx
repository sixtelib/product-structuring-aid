import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppGuard } from "@/components/app/AppGuard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mon espace ,  Vertual" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <AppGuard signInRedirect="/login">
      <Outlet />
    </AppGuard>
  );
}
