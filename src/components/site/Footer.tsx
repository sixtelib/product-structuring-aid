import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#F8F9FF]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-10">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              La première plateforme française qui défend l'assuré, pas l'assureur. Indemnisation maximale, rémunération
              au succès.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Produit</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/comment-ca-marche" className="transition-colors hover:text-primary">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/sinistres" className="transition-colors hover:text-primary">
                  Sinistres traités
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="transition-colors hover:text-primary">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Société</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/a-propos" className="transition-colors hover:text-primary">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/inscription-expert" className="transition-colors hover:text-primary">
                  Vous êtes expert d'assuré ? Rejoignez-nous
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Démarrer</h4>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Évaluation gratuite et sans engagement de votre dossier en moins de 3 minutes.
            </p>
            <Link
              to="/"
              hash="chatbot"
              className="mt-5 inline-flex items-center justify-center rounded-lg border-2 border-primary bg-transparent px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Évaluer mon dossier
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Vertual. Tous droits réservés.</p>
          <p>Document de travail — version pilote</p>
        </div>
      </div>
    </footer>
  );
}
