import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home,
  Droplets,
  Car,
  Flame,
  CloudRain,
  HeartPulse,
  Building2,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/sinistres")({
  head: () => ({
    meta: [
      { title: "Sinistres traités ,  Vertual" },
      {
        name: "description",
        content:
          "Habitation, dégât des eaux, incendie, auto, catastrophe naturelle, santé : nous défendons les assurés sur tous les sinistres dont l'enjeu dépasse 3 000 €.",
      },
      { property: "og:title", content: "Sinistres traités ,  Vertual" },
      {
        property: "og:description",
        content: "Tous les sinistres où une renégociation peut faire la différence.",
      },
    ],
  }),
  component: ClaimsPage,
});

const claims = [
  {
    icon: Home,
    title: "Habitation",
    text:
      "Cambriolage, vandalisme, bris de glace, dommages divers : la sous-évaluation des biens mobiliers et de la valeur à neuf est fréquente.",
    typical: "Gain moyen : 18 à 35 %",
  },
  {
    icon: Droplets,
    title: "Dégât des eaux",
    text:
      "Recherche de fuite, séchage, peintures, sols, mobilier endommagé : l'expert d'assurance néglige souvent les frais annexes et la perte de jouissance.",
    typical: "Gain moyen : 22 à 40 %",
  },
  {
    icon: Flame,
    title: "Incendie",
    text:
      "Reconstruction, mobilier, déblaiement, frais de relogement : sinistres lourds où chaque ligne du contrat compte.",
    typical: "Gain moyen : 15 à 30 %",
  },
  {
    icon: CloudRain,
    title: "Catastrophe naturelle",
    text:
      "Tempête, inondation, sécheresse, retrait-gonflement : les arrêtés de catastrophe naturelle ouvrent des droits souvent mal appliqués.",
    typical: "Gain moyen : 20 à 45 %",
  },
  {
    icon: Car,
    title: "Auto",
    text:
      "Vol, incendie, accident, vétusté contestable : la valeur de remplacement à dire d'expert est négociable.",
    typical: "Gain moyen : 10 à 25 %",
  },
  {
    icon: HeartPulse,
    title: "Santé / Prévoyance",
    text:
      "Refus de prise en charge, contestation d'invalidité, indemnités journalières : dossiers où la lecture du contrat est cruciale.",
    typical: "Gain moyen : variable",
  },
  {
    icon: Building2,
    title: "Multirisque pro",
    text:
      "Pour TPE, commerçants, artisans : pertes d'exploitation, dommages aux biens professionnels.",
    typical: "Tickets élevés",
  },
  {
    icon: Wrench,
    title: "Garantie décennale",
    text:
      "Malfaçons, désordres affectant la solidité : dossiers techniques où l'expertise contradictoire fait la différence.",
    typical: "Gain moyen : variable",
  },
];

function ClaimsPage() {
  return (
    <SiteLayout>
      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-foreground sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Sinistres traités
          </p>
          <h1 className="mt-3 font-sans tracking-tight text-4xl font-semibold sm:text-5xl">
            Tous les sinistres où l'enjeu dépasse 3 000 €.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Si vous estimez que votre assureur sous-évalue votre indemnisation, nous
            avons probablement une marge à récupérer.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {claims.map(({ icon: Icon, title, text, typical }) => (
              <article
                key={title}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-sans tracking-tight text-xl font-semibold text-primary">
                  {title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent">
                  {typical}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-14 rounded-xl border border-border bg-white p-8 text-center shadow-[var(--shadow-soft)] sm:p-12">
            <h3 className="font-sans tracking-tight text-2xl font-semibold text-primary sm:text-3xl">
              Votre cas n'est pas listé ?
            </h3>
            <p className="mt-3 text-muted-foreground">
              C'est normal ,  la liste n'est pas exhaustive. Décrivez-nous votre
              situation, nous vous dirons en 48h si une renégociation est possible.
            </p>
            <Link
              to="/"
              hash="chatbot"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
            >
              Évaluer mon dossier <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
