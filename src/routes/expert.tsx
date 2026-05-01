import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { FolderOpen, LogOut, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImpersonationBanner } from "@/components/expert/ImpersonationBanner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { clearImpersonation, getImpersonatedExpertDisplayName, getImpersonatedExpertId } from "@/lib/expertImpersonation";

export const Route = createFileRoute("/expert")({
  component: ExpertLayout,
});

function ExpertLayout() {
  const { user, isAdmin, isExpert, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [impersonationName, setImpersonationName] = useState<string | null>(null);

  useEffect(() => {
    setImpersonationName(getImpersonatedExpertDisplayName());
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    const imp = getImpersonatedExpertId();
    if (isAdmin && !imp) {
      void navigate({ to: "/admin", replace: true });
      return;
    }
    if (!isAdmin && !isExpert) {
      void navigate({ to: "/dashboard", replace: true });
      return;
    }
  }, [loading, user, isAdmin, isExpert, navigate]);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = "/login";
          return;
        }
        await supabase.auth.refreshSession();
      },
      10 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  const showImpersonationBanner = isAdmin && Boolean(getImpersonatedExpertId());
  const bannerName = impersonationName ?? getImpersonatedExpertDisplayName() ?? "Expert";

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  async function handleSignOut() {
    clearImpersonation();
    await signOut();
    void navigate({ to: "/login", replace: true });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
      </div>
    );
  }

  if (!user) return null;
  if (isAdmin && !getImpersonatedExpertId()) return null;
  if (!isAdmin && !isExpert) return null;

  const Sidebar = (
    <aside className="flex h-full w-[240px] flex-col bg-[#111827] text-white">
      <div className="p-6">
        <img src="/logo-vertual.png" alt="Vertual" className="h-8 w-auto" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        <Link
          to="/expert/dossiers"
          className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
          activeOptions={{ exact: false }}
          activeProps={{ className: "bg-[#1F2937] text-white", style: { borderLeft: "3px solid #5B50F0" } }}
          inactiveProps={{ className: "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white" }}
        >
          <FolderOpen className="h-4 w-4 shrink-0" aria-hidden />
          Dossiers
        </Link>
        <Link
          to="/expert/profil"
          className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
          activeProps={{ className: "bg-[#1F2937] text-white", style: { borderLeft: "3px solid #5B50F0" } }}
          inactiveProps={{ className: "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white" }}
        >
          <User className="h-4 w-4 shrink-0" aria-hidden />
          Profil
        </Link>
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <p className="truncate text-xs text-[#9CA3AF]">{user.email}</p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="mt-3 inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-[#1F2937] hover:text-red-200"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Se déconnecter
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="flex min-h-screen">
        <div className="sticky top-0 h-screen shrink-0">{Sidebar}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-[60px] shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 sm:px-8">
            <p className="text-sm font-semibold text-[#111827]">
              {pathname.startsWith("/expert/profil") ? "Profil" : "Dossiers"}
            </p>
            <p className="text-sm text-[#6B7280]">{todayLabel}</p>
          </header>
          {showImpersonationBanner ? <ImpersonationBanner expertName={bannerName} /> : null}
          <main className="min-h-0 flex-1 overflow-y-auto bg-[#F8F9FF]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
