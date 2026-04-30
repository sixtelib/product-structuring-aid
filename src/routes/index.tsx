import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import {
  ShieldCheck,
  Shield,
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
  ChevronRight,
  ClipboardList,
  Upload,
  CircleDollarSign,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { QualificationChatbot } from "@/components/site/QualificationChatbot";
import appMockup from "../assets/app-mockup.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vertual ,  Expert d'assuré en ligne" },
      {
        name: "description",
        content:
          "Vertual défend les assurés sinistrés face à leurs assureurs. Analyse gratuite de votre dossier, success fee uniquement.",
      },
      { property: "og:title", content: "Vertual ,  Expert d'assuré en ligne" },
      {
        property: "og:description",
        content: "Vertual défend les assurés sinistrés face à leurs assureurs.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr" }],
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
  { value: "+27%", label: "Indemnisation moyenne récupérée", icon: TrendingUp },
  { value: "48h", label: "Pour analyser votre dossier", icon: Clock },
  { value: "0€", label: "Si nous n'obtenons rien, vous ne payez rien.", icon: Shield },
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

function HomePage() {
  const chatbotRef = useRef<HTMLDivElement | null>(null);

  function scrollToChatbot() {
    chatbotRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) {
      window.setTimeout(() => {
        const el = document.getElementById("chatbot-input") as HTMLInputElement | null;
        el?.focus();
      }, 350);
    }
  }

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="bg-white py-16 sm:py-[100px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div className="flex flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                IA + experts agréés
              </span>
              <h1 className="mt-6 max-w-[600px] tracking-tight">
                <span className="block text-[clamp(2.4rem,5vw,5.5rem)] font-black leading-[1.05] text-foreground">
                  Mal indemnisé ?
                </span>
                <span className="block text-[clamp(2.4rem,5vw,5.5rem)] font-black leading-[1.05] text-[#5B50F0]">
                  On se bat pour vous.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Vertual est la première plateforme française qui défend l'assuré, pas l'assureur. Notre IA analyse votre
                contrat, nos experts négocient, vous encaissez la différence.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToChatbot}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
                >
                  Évaluer mon dossier <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/comment-ca-marche"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Comment ça marche <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            <div className="w-full">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span aria-hidden>✨</span> Évaluez votre dossier gratuitement
              </p>
              <div ref={chatbotRef} className="min-h-[300px] w-full">
                <QualificationChatbot />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#E5E1FF] bg-[#F0EFFE] py-16 sm:py-[100px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((s) => {
              const Icon = s.icon;
              const withDivider = s.value !== stats[stats.length - 1]?.value;
              return (
                <div
                  key={s.label}
                  className={`px-2 py-2 text-center sm:px-8 ${withDivider ? "sm:border-r sm:border-[#E5E1FF]" : ""}`}
                >
                  <Icon className="mx-auto h-6 w-6 text-[#5B50F0]" aria-hidden />
                  <p className="mt-3 text-[clamp(2.8rem,5vw,4rem)] font-black leading-none tracking-tight text-[#5B50F0]">
                    {s.value}
                  </p>
                  <p className="mt-2 text-[0.95rem] font-medium leading-snug text-[#6B7280]">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ESPACE CLIENT */}
      <section className="bg-[#F8F7FF] py-16 sm:py-[100px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-1 flex justify-center lg:order-2">
              <img
                src={appMockup}
                alt="Aperçu de l'espace client Vertual"
                className="w-full max-w-[300px] rotate-0 lg:max-w-[480px] lg:rotate-[2deg]"
                style={{ filter: "drop-shadow(0 24px 48px rgba(91, 80, 240, 0.2))" }}
              />
            </div>

            <div className="order-2 lg:order-1">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-[#5B50F0]">
                Votre espace client
              </p>
              <h2 className="mt-3 text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.1] text-[#111827]">
                Suivez votre dossier en temps réel.
              </h2>
              <p className="mt-4 text-[1.1rem] leading-[1.7] text-[#6B7280]">
                Chaque étape, chaque document, chaque échange avec votre assureur, tout est centralisé dans votre espace
                personnel. Vous n'avez rien à gérer.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Avancement en temps réel de votre dossier",
                  "Tous vos documents sécurisés au même endroit",
                  "Messagerie directe avec votre expert dédié",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 font-bold text-[#5B50F0]" aria-hidden>
                      ✓
                    </span>
                    <span className="text-[1rem] text-[#374151]">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={scrollToChatbot}
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#5B50F0] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
                >
                  Évaluer mon dossier →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="bg-white py-16 sm:py-[100px]">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-foreground">
            Ils ont fait valoir leurs droits.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "Marie L., Paris",
                quote: "Mon assureur m'avait proposé 4 200€. Vertual a obtenu 11 800€. Je n'en revenais pas.",
              },
              {
                name: "Thomas B., Lyon",
                quote: "Dégât des eaux refusé par la MAAF. En 6 semaines, on a obtenu 8 500€ de dédommagements.",
              },
              {
                name: "Sophie M., Bordeaux",
                quote: "Je ne savais pas que je pouvais contester. L'expert a tout géré, je n'ai rien eu à faire.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
              >
                <p className="text-[3rem] font-black leading-none text-[#5B50F0]" aria-hidden>
                  “
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground">{t.quote}</p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNAL */}
      <section className="bg-[#5B50F0] px-10 py-[120px] text-white">
        <div className="mx-auto max-w-7xl text-center">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-white">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Signal fort
          </span>
          <p className="mx-auto mt-6 max-w-[700px] text-[1.25rem] leading-relaxed text-white/90">
            <span className="mb-2 block text-[clamp(3rem,6vw,5rem)] font-black leading-[1.05] text-white">71%</span>
            des assureurs utilisent désormais l'IA pour décider de vos remboursements. L'assuré se retrouve seul face à
            un algorithme, sans outil pour se défendre.
          </p>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-[#F5F0EB]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-[100px]">
          <div className="max-w-2xl">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-[#5B50F0]">Notre méthode</p>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-foreground">
              4 étapes, zéro paperasse.
            </h2>
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
                  className="rounded-2xl bg-white p-8 shadow-[0_4px_24px_rgba(91,80,240,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(91,80,240,0.15)]"
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
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-[100px]">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-[#5B50F0]">Sinistres traités</p>
              <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-foreground">
                Tous les sinistres où une renégociation peut faire la différence.
              </h2>
            </div>
            <Link
              to="/sinistres"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-glow"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
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
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-[100px]">
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
      <section className="bg-primary py-16 text-primary-foreground sm:py-[100px]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight">
              Votre indemnisation mérite un défenseur.
            </h2>
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

      {/* GUIDES */}
      <section aria-labelledby="guides-home-heading" className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-[100px]">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-[#5B50F0]">Nos guides gratuits</p>
          <h2
            id="guides-home-heading"
            className="mt-3 max-w-3xl text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-foreground"
          >
            Tout comprendre sur vos droits face à l'assureur
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              to="/guides/expert-assure"
              className="flex items-center justify-between gap-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] px-5 py-5 transition-colors hover:border-[#5B50F0]/30 hover:bg-[#F0F2FF] sm:px-6 sm:py-6"
            >
              <span className="text-left text-base font-semibold leading-snug text-[#5B50F0] sm:text-lg">
                Qu'est-ce qu'un expert d'assuré ?
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />
            </Link>
            <Link
              to="/guides/assureur-refuse-payer"
              className="flex items-center justify-between gap-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FF] px-5 py-5 transition-colors hover:border-[#5B50F0]/30 hover:bg-[#F0F2FF] sm:px-6 sm:py-6"
            >
              <span className="text-left text-base font-semibold leading-snug text-[#5B50F0] sm:text-lg">
                Que faire si mon assureur refuse de payer ?
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
