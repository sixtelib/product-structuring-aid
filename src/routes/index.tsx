import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Clock,
  Building2,
  Home,
  Car,
  Droplets,
  Flame,
  CloudRain,
  ArrowRight,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { QualificationChatbot } from "@/components/site/QualificationChatbot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Recours — Défense des assurés sinistrés face aux assureurs" },
      {
        name: "description",
        content:
          "Vous êtes mal indemnisé ? Recours combine IA et experts pour obtenir l'indemnisation que vous méritez. Évaluation gratuite, rémunération au succès uniquement.",
      },
      { property: "og:title", content: "Recours — La plateforme qui défend les assurés" },
      {
        property: "og:description",
        content:
          "Indemnisation maximale grâce à l'IA et nos experts. Vous ne payez que si nous obtenons plus.",
      },
    ],
  }),
  component: HomePage,
});

const claims = [
  { icon: Home, label: "Habitation" },
  { icon: Droplets, label: "Dégât des eaux" },
  { icon: Car, label: "Auto" },
  { icon: Flame, label: "Incendie" },
  { icon: CloudRain, label: "Catastrophe naturelle" },
  { icon: Building2, label: "Pertes d'exploitation" },
];

const stats = [
  { value: "+27 %", label: "Indemnisation moyenne récupérée" },
  { value: "48 h", label: "Pour analyser votre dossier" },
  { value: "0 €", label: "Si nous n'obtenons rien" },
];

const steps = [
  {
    n: "01",
    title: "Qualifiez votre dossier",
    text:
      "2 minutes de chat pour évaluer votre marge de négociation. Confidentiel, sans engagement.",
  },
  {
    n: "02",
    title: "Déposez vos pièces",
    text:
      "Police, courriers, devis, rapport d'expert : votre espace sécurisé centralise tout.",
  },
  {
    n: "03",
    title: "Notre IA + nos experts négocient",
    text:
      "Analyse de votre contrat, identification des leviers, courrier contradictoire, suivi complet.",
  },
  {
    n: "04",
    title: "Vous récupérez plus",
    text:
      "Vous percevez l'indemnisation supplémentaire. Notre rémunération est de 10 % du gain obtenu.",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center text-primary-foreground">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground/90">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              IA + experts agréés
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Mal indemnisé ?<br />
              <span className="text-accent">On se bat pour vous.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
              Recours est la première plateforme française qui défend l'assuré, pas
              l'assureur. Notre IA analyse votre contrat, nos experts négocient, vous
              encaissez la différence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#chatbot"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition hover:brightness-105"
              >
                Évaluer mon dossier <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/comment-ca-marche"
                className="inline-flex items-center rounded-md border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition"
              >
                Comment ça marche
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-semibold text-accent sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-primary-foreground/70">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chatbot inline */}
          <div className="lg:pt-2">
            <QualificationChatbot />
          </div>
        </div>
      </section>

      {/* SIGNAL — IA contre l'assuré */}
      <section className="border-y border-border bg-sand">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_2fr]">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <TrendingUp className="h-3.5 w-3.5" /> Signal fort
            </span>
            <p className="font-display text-2xl leading-snug text-primary sm:text-3xl">
              <span className="font-semibold">71 %</span> des assureurs utilisent désormais
              l'IA pour décider de vos remboursements.{" "}
              <span className="text-muted-foreground">
                L'assuré se retrouve seul face à un algorithme — sans outil pour se défendre.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Notre méthode
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-primary sm:text-4xl">
              4 étapes, zéro paperasse.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Vous nous confiez le dossier, nous gérons toutes les interactions avec
              l'assureur. Vous suivez l'avancement en temps réel.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group rounded-2xl border border-border bg-card p-6 transition hover:border-accent hover:shadow-[var(--shadow-elegant)]"
              >
                <p className="font-display text-sm font-semibold text-accent">
                  {s.n}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold text-primary">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SINISTRES */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                Sinistres traités
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-primary sm:text-4xl">
                Tous les sinistres où l'enjeu dépasse 3 000 €.
              </h2>
            </div>
            <Link
              to="/sinistres"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {claims.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition hover:border-accent hover:shadow-[var(--shadow-soft)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Zéro risque pour vous",
                text:
                  "Vous ne payez rien si nous n'obtenons rien. Notre rémunération est un % du gain supplémentaire obtenu.",
              },
              {
                icon: Sparkles,
                title: "L'IA de votre côté",
                text:
                  "Notre modèle analyse votre police, identifie les marges, prépare le courrier contradictoire. Précision et rapidité.",
              },
              {
                icon: Clock,
                title: "Sous 48h, vous êtes fixé",
                text:
                  "Un expert dédié vous est attribué. Vous suivez l'avancement en temps réel sur votre espace.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-primary">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Votre indemnisation mérite un défenseur.
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Évaluation gratuite en 2 minutes. Vous décidez ensuite.
            </p>
          </div>
          <a
            href="#chatbot"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-7 py-4 text-base font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition hover:brightness-105"
          >
            Évaluer mon dossier <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
