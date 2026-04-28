import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Sparkles, Users, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Claimeur" },
      {
        name: "description",
        content:
          "Claimeur est née d'un constat : l'IA est utilisée massivement par les assureurs. Notre mission : remettre l'équilibre du côté de l'assuré.",
      },
      { property: "og:title", content: "Notre mission — Claimeur" },
      {
        property: "og:description",
        content: "Pourquoi nous existons et ce qui nous différencie.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Compass,
    title: "100 % côté assuré",
    text:
      "Nous ne travaillons jamais pour les assureurs. Aucun conflit d'intérêts, jamais.",
  },
  {
    icon: Sparkles,
    title: "Technologie au service de l'humain",
    text:
      "L'IA accélère l'analyse, l'expert décide. Cette combinaison nous rend imbattables.",
  },
  {
    icon: Users,
    title: "Transparence radicale",
    text:
      "Vous voyez tout : courriers, calculs, étapes. Aucune surprise, aucun frais caché.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-foreground sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Notre mission
          </p>
          <h1 className="mt-3 font-sans tracking-tight text-4xl font-semibold sm:text-5xl">
            Rétablir l'équilibre entre l'assuré et son assureur.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            71 % des assureurs utilisent l'IA pour décider de vos remboursements.
            Claimeur met cette même technologie au service de votre défense.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-sans tracking-tight text-3xl font-semibold text-primary">
              Pourquoi Claimeur existe
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-foreground">
              <p>
                Le marché de l'expert d'assuré est ancien, mais resté artisanal.
                Moins de 5 % des assurés savent qu'ils peuvent mandater leur propre
                expert face à celui de l'assureur. Résultat : des centaines de
                milliers de dossiers sous-indemnisés chaque année.
              </p>
              <p>
                Pendant ce temps, les assureurs s'équipent. L'IA décisionnelle se
                généralise dans le traitement des sinistres. L'asymétrie entre
                l'assuré seul et un système algorithmique devient insoutenable.
              </p>
              <p>
                Claimeur combine deux forces : une <strong>IA propriétaire</strong>{" "}
                qui analyse les contrats et identifie les marges de négociation, et
                un <strong>réseau d'experts certifiés</strong> qui pilote chaque
                dossier de bout en bout. Notre seule mesure de succès : ce que nous
                vous faisons gagner en plus.
              </p>
            </div>

            <h2 className="mt-16 font-sans tracking-tight text-3xl font-semibold text-primary">
              Nos engagements
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F8F9FF] text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-sans tracking-tight text-lg font-semibold text-primary">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-xl border border-border bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
            <h3 className="font-sans tracking-tight text-2xl font-semibold text-primary">
              Une équipe à taille humaine, des moyens technologiques sérieux.
            </h3>
            <p className="mt-3 text-muted-foreground">
              Nous sommes basés en France et travaillons exclusivement avec des
              experts agréés. Notre infrastructure est conforme RGPD et hébergée en
              Europe.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
            >
              Nous rencontrer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
