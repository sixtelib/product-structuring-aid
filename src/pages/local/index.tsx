import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const cities = [
  { label: "Paris", to: "/expert-assure-paris" as const },
  { label: "Lyon", to: "/expert-assure-lyon" as const },
  { label: "Marseille", to: "/expert-assure-marseille" as const },
  { label: "Bordeaux", to: "/expert-assure-bordeaux" as const },
  { label: "Toulouse", to: "/expert-assure-toulouse" as const },
] as const;

export function LocalCitiesIndexPage() {
  return (
    <SiteLayout>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Villes</p>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Nos experts d'assuré dans les principales villes
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Retrouvez nos pages locales pour comprendre les sinistres les plus fréquents et les leviers de négociation,
            selon votre ville.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {cities.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="flex items-center justify-between gap-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] px-5 py-5 transition-colors hover:border-[#5B50F0]/30 hover:bg-[#F0F2FF] sm:px-6 sm:py-6"
              >
                <span className="text-left text-base font-semibold leading-snug text-[#5B50F0] sm:text-lg">
                  Expert d'assuré {c.label}
                </span>
                <span className="text-[#5B50F0]" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

