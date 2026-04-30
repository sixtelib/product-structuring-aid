import { Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, Scale } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export function GuidesIndexPage() {
  return (
    <SiteLayout>
      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Ressources</p>
          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Des contenus clairs pour y voir plus clair après un sinistre : refus d'indemnisation, expert d'assuré,
            recours et honoraires.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <ul className="grid gap-5 md:grid-cols-2">
            <li>
              <Link
                to="/guides/expert-assure"
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:gap-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F8F9FF] text-primary">
                  <BookOpen className="h-6 w-6" />
                </span>
                <div className="mt-4 sm:mt-0">
                  <h2 className="font-sans text-xl font-semibold tracking-tight text-primary group-hover:underline">
                    Qu'est-ce qu'un expert d'assuré ?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Rôle, honoraires, différence avec l'expert de l'assureur et déroulement d'une mission.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Lire le guide
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
            <li>
              <Link
                to="/guides/assureur-refuse-payer"
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:gap-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F8F9FF] text-primary">
                  <Scale className="h-6 w-6" />
                </span>
                <div className="mt-4 sm:mt-0">
                  <h2 className="font-sans text-xl font-semibold tracking-tight text-primary group-hover:underline">
                    Assureur refuse de payer : que faire ?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Les 5 recours concrets ,  contrat, contestation, expert d'assuré, médiateur, justice ,  et
                    l'ordre dans lequel les enchaîner.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Lire le guide
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          </ul>

          <section className="mt-10 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] p-6">
            <h2 className="text-[16px] font-semibold text-[#374151]">Nos pages par type de sinistre</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/sinistres/degat-des-eaux"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Dégât des eaux</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/sinistres/incendie"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Incendie</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/sinistres/tempete"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Tempête</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/sinistres/catastrophe-naturelle"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Catastrophe naturelle</span>
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/sinistres/dommages-electriques"
                className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-4 py-3 text-sm font-semibold text-[#5B50F0] hover:bg-white sm:w-auto"
              >
                <span>Dommages électriques</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </SiteLayout>
  );
}
