import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/sinistres", label: "Sinistres traités" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/faq", label: "FAQ" },
  { to: "/a-propos", label: "À propos" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-primary bg-secondary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link
              to="/espace/dossiers"
              className="text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              Connexion
            </Link>
          )}
          <Link
            to="/"
            hash="chatbot"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition hover:brightness-105"
          >
            Évaluer mon dossier
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-secondary"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-secondary text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2.5 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/espace/dossiers" : "/auth"}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground"
            >
              {user ? "Mon espace" : "Connexion"}
            </Link>
            <Link
              to="/"
              hash="chatbot"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              Évaluer mon dossier
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
