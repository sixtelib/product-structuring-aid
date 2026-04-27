import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              La première plateforme française qui défend l'assuré, pas l'assureur.
              Indemnisation maximale, rémunération au succès.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Produit
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/70">
              <li><Link to="/comment-ca-marche" className="hover:text-accent transition-colors">Comment ça marche</Link></li>
              <li><Link to="/sinistres" className="hover:text-accent transition-colors">Sinistres traités</Link></li>
              <li><Link to="/tarifs" className="hover:text-accent transition-colors">Tarifs</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Société
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/70">
              <li><Link to="/a-propos" className="hover:text-accent transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Démarrer
            </h4>
            <p className="mt-4 text-sm text-primary-foreground/70">
              Évaluation gratuite et sans engagement de votre dossier en moins de 3 minutes.
            </p>
            <Link
              to="/"
              hash="chatbot"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
            >
              Évaluer mon dossier
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Recours. Tous droits réservés.</p>
          <p>Document de travail — version pilote</p>
        </div>
      </div>
    </footer>
  );
}
