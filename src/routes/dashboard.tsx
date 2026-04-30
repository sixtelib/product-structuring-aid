import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppGuard } from "@/components/app/AppGuard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

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
      <DashboardMandatGate />
    </AppGuard>
  );
}

function DashboardMandatGate() {
  const navigate = useNavigate();
  const { user, loading, isAdmin, isExpert } = useAuth();
  const [mandatChecked, setMandatChecked] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (isAdmin || isExpert) {
      setMandatChecked(true);
      return;
    }

    const meta = user.user_metadata as { mandat_signe?: boolean } | undefined;
    if (meta?.mandat_signe === true) {
      setMandatChecked(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data } = await supabase.from("profiles").select("mandat_signe").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      const signed = data?.mandat_signe === true || meta?.mandat_signe === true;
      if (!signed) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }
      setMandatChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, isAdmin, isExpert, navigate]);

  if (loading || !mandatChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <Outlet />;
}
