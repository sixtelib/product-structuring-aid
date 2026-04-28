import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Plus } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/dashboard"
              activeProps={{ className: "bg-secondary text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              Mes dossiers
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden md:inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
          >
            <Plus className="h-4 w-4" />
            Mon dashboard
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline-block">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
