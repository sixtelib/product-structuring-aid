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
  ClipboardList,
  Upload,
  CircleDollarSign,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { QualificationChatbot } from "@/components/site/QualificationChatbot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Claimeur — Défense des assurés sinistrés face aux assureurs" },
      {
        name: "description",
        content:
          "Vous êtes mal indemnisé ? Claimeur combine IA et experts pour obtenir l'indemnisation que vous méritez. Évaluation gratuite, rémunération au succès uniquement.",
      },
      { property: "og:title", content: "Claimeur — La plateforme qui défend les assurés" },
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
    icon: ClipboardList,
    title: "Qualifiez votre dossier",
    text:
      "Quelques questions pour évaluer votre marge de négociation. Confidentiel, sans engagement.",
  },
  {
    icon: Upload,
    title: "Déposez vos pièces",
    text:
      "Police, courriers, devis, rapport d'expert : votre espace sécurisé centralise tout.",
  },
  {
    icon: Sparkles,
    title: "Notre IA + nos experts négocient",
    text:
      "Analyse de votre contrat, identification des leviers, courrier contradictoire, suivi complet.",
  },
  {
    icon: CircleDollarSign,
    title: "Vous récupérez plus",
    text:
      "Vous percevez l'indemnisation supplémentaire. Notre rémunération est de 10 % du gain obtenu.",
  },
];

function HeroIllustration() {
  return (
    <div
      className="relative mx-auto w-full max-w-lg rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
      aria-hidden
    >
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-accent/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="h-2 w-24 rounded bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-[55%] rounded bg-primary/20" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-[80%] rounded bg-muted" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-secondary p-3">
            <div className="h-2 w-12 rounded bg-primary/30" />
            <div className="mt-2 h-6 w-16 rounded bg-primary/15" />
          </div>
          <div className="rounded-lg border border-border bg-secondary p-3">
            <div className="h-2 w-10 rounded bg-accent/40" />
            <div className="mt-2 h-6 w-14 rounded bg-accent/15" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-8 flex-1 rounded-lg bg-primary/90" />
          <div className="h-8 w-20 rounded-lg border border-primary bg-transparent" />
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="bg-[#F8F9FF]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              IA + experts agréés
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[56px] lg:leading-[1.06]">
              Mal indemnisé ?<br />
              <span className="text-primary">On se bat pour vous.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Claimeur est la première plateforme française qui défend l'assuré, pas l'assureur. Notre IA analyse votre
              contrat, nos experts négocient, vous encaissez la différence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#chatbot"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                Évaluer mon dossier <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/comment-ca-marche"
                className="inline-flex items-center rounded-lg border-2 border-primary bg-transparent px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Comment ça marche
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-white px-5 py-5 shadow-[var(--shadow-soft)]"
                >
                  <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{s.value}</p>
                  <p className="mt-2 text-xs font-medium leading-snug text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Évaluation guidée */}
      <section className="border-b border-border bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Évaluation gratuite de votre dossier
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Répondez à quelques questions — environ 2 minutes, sans engagement.
            </p>
          </div>
          <QualificationChatbot />
        </div>
      </section>

      {/* SIGNAL */}
      <section className="border-y border-border bg-[#F8F9FF]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Signal fort
            </span>
            <p className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
              <span className="text-primary">71 %</span> des assureurs utilisent désormais l'IA pour décider de vos
              remboursements.{" "}
              <span className="font-normal text-muted-foreground">
                L'assuré se retrouve seul face à un algorithme — sans outil pour se défendre.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Notre méthode</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">4 étapes, zéro paperasse.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Vous nous confiez le dossier, nous gérons toutes les interactions avec l'assureur. Vous suivez
              l'avancement en temps réel.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elegant)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FF] text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SINISTRES */}
      <section className="border-t border-border bg-[#F8F9FF]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Sinistres traités</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Tous les sinistres où l'enjeu dépasse 3 000 €.
              </h2>
            </div>
            <Link
              to="/sinistres"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-glow"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {claims.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-6 text-center shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elegant)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#F8F9FF] text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-medium text-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
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
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Votre indemnisation mérite un défenseur.</h2>
            <p className="mt-3 text-base text-primary-foreground/85">Évaluation gratuite en 2 minutes. Vous décidez ensuite.</p>
          </div>
          <a
            href="#chatbot"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-4 text-base font-semibold text-primary transition-colors hover:bg-[#F8F9FF]"
          >
            Évaluer mon dossier <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
