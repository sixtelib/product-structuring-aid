import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const isAdmin = roles.includes("admin");
    if (!user || !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, roles, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const isAdmin = roles.includes("admin");
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Outlet />
    </div>
  );
}

