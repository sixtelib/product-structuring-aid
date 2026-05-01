import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Component, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Star,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    console.error("AdminErrorBoundary caught:", error);
    const err =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : "Erreur inconnue");
    return { hasError: true, error: err };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "#F8F9FF",
            minHeight: "100vh",
          }}
        >
          <p style={{ color: "#EF4444", marginBottom: "16px" }}>
            Erreur : {this.state.error?.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: "#5B50F0",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminLayout() {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  console.log("AdminLayout render, pathname:", pathname);

  useEffect(() => {
    if (loading) return;
    const isAdmin = roles.includes("admin");
    if (!user || !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, roles, user, navigate]);

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
    ); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  const isAdmin = roles.includes("admin");
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        Chargement...
      </div>
    );

  // Ne pas retourner null si pas admin pendant une navigation - attendre que loading soit false
  if (!loading && (!user || !isAdmin)) {
    navigate({ to: "/login" });
    return null;
  }

  // Pendant la navigation, afficher le layout même si user n'est pas encore chargé
  if (!user) return <div style={{ minHeight: "100vh", background: "#F8F9FF" }} />;

  const navItems = [
    { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
    { to: "/admin/dossiers", label: "Dossiers", icon: FolderOpen },
    { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
    { to: "/admin/experts", label: "Experts", icon: Star },
    { to: "/admin/reporting", label: "Reporting", icon: BarChart2 },
    { to: "/admin/facturation", label: "Facturation", icon: CreditCard },
  ] as const;

  const sectionTitle = useMemo(() => {
    if (pathname === "/admin" || pathname === "/admin/") return "Vue d'ensemble";
    if (pathname.startsWith("/admin/dossiers")) return "Dossiers";
    if (pathname.startsWith("/admin/utilisateurs")) return "Utilisateurs";
    if (pathname.startsWith("/admin/experts")) return "Experts";
    if (pathname.startsWith("/admin/reporting")) return "Reporting";
    if (pathname.startsWith("/admin/facturation")) return "Facturation";
    return "Admin";
  }, [pathname]);

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
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  const Sidebar = (
    <aside className="flex h-full w-[240px] flex-col bg-[#111827] text-white">
      <div className="p-6">
        <img src="/logo-vertual.png" alt="Vertual" className="h-8 w-auto" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
              activeProps={{
                className: "bg-[#1F2937] text-white",
                style: { borderLeft: "3px solid #5B50F0" },
              }}
              inactiveProps={{ className: "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white" }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <a
        href="/expert"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: "0 12px 8px",
          padding: "10px 16px",
          background: "rgba(91, 80, 240, 0.15)",
          border: "1px solid rgba(91, 80, 240, 0.3)",
          borderRadius: "8px",
          color: "#A89FF5",
          fontSize: "0.875rem",
          fontWeight: 500,
          textDecoration: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(91, 80, 240, 0.25)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(91, 80, 240, 0.15)";
          e.currentTarget.style.color = "#A89FF5";
        }}
      >
        <span>⚡</span>
        Vue expert
      </a>

      <div className="border-t border-white/10 p-4">
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
        {!isMobile ? (
          <div className="sticky top-0 h-screen shrink-0">{Sidebar}</div>
        ) : (
          sidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <button
                type="button"
                aria-label="Fermer la navigation"
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative h-full">{Sidebar}</div>
            </div>
          )
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 h-[60px] border-b border-[#E5E7EB] bg-white">
            <div className="flex h-full items-center justify-between gap-4 px-8">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#111827] hover:bg-gray-100"
                    aria-label="Ouvrir la navigation"
                  >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                )}
                <p className="text-sm font-semibold text-[#111827]">{sectionTitle}</p>
              </div>

              <p className="text-sm text-[#6B7280]">{todayLabel}</p>
            </div>
          </header>

          <main className="min-h-[calc(100vh-60px)] flex-1 overflow-y-auto bg-[#F8F9FF] p-8">
            <AdminErrorBoundary>
              <Outlet />
            </AdminErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
