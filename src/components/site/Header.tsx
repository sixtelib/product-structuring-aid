import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/guides", label: "Guides" },
  { to: "/sinistres", label: "Sinistres" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/partenaires", label: "Partenaires" },
  { to: "/faq", label: "FAQ" },
  { to: "/a-propos", label: "À propos" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Logo variant="dark" className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-secondary text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Mon espace
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
              Connexion
            </Link>
          )}
          <Link
            to="/"
            hash="chatbot"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
          >
            Évaluer mon dossier
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-secondary lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-secondary text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
            >
              {user ? "Mon espace" : "Connexion"}
            </Link>
            <Link
              to="/"
              hash="chatbot"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Évaluer mon dossier
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
