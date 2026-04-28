import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/expert")({
  component: ExpertLayout,
});

function ExpertLayout() {
  const { user, isAdmin, isExpert, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    if (isAdmin) {
      navigate({ to: "/admin", replace: true });
      return;
    }
    if (!isExpert) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, isAdmin, isExpert, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (isAdmin) return null;
  if (!isExpert) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Outlet />
    </div>
  );
}

