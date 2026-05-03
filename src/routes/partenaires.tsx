import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState, type FormEvent } from "react";
import { Building2, Handshake, Scale, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/partenaires")({
  head: () => ({
    meta: [
      { title: "Réseau partenaires Vertual | Artisans, experts, cabinets" },
      {
        name: "description",
        content:
          "Rejoignez le réseau Vertual : contre-devis, contre-expertises et accompagnement des assurés après sinistre.",
      },
      { property: "og:title", content: "Réseau partenaires Vertual" },
    ],
    links: [{ rel: "canonical", href: "https://vertual.fr/partenaires" }],
  }),
  component: PartenairesPage,
});

const PARTNER_TYPES = [
  { value: "artisan_batiment", label: "Artisan / Bâtiment" },
  { value: "expert_independant", label: "Expert indépendant" },
  { value: "cabinet_conseil", label: "Cabinet de conseil" },
  { value: "autre", label: "Autre" },
] as const;

const quiCards = [
  {
    icon: Building2,
    title: "Artisan / Entreprise du bâtiment",
    text: "Plombier, électricien, maçon, couvreur… Produisez un contre-devis qui contredit l'estimation de l'assureur.",
  },
  {
    icon: Scale,
    title: "Expert indépendant",
    text: "Réalisez des contre-expertises formelles pour renforcer le dossier de l'assuré.",
  },
  {
    icon: Handshake,
    title: "Cabinet de conseil",
    text: "Accompagnez les assurés dans la lecture et la contestation de leur police.",
  },
];

const etapes = [
  {
    n: 1,
    title: "Vous vous inscrivez",
    text: "Profil, zone géographique, spécialités.",
  },
  {
    n: 2,
    title: "Vous recevez une alerte",
    text: "Dès qu'un dossier correspond à votre profil et zone.",
  },
  {
    n: 3,
    title: "Vous contactez l'assuré",
    text: "Et proposez votre intervention.",
  },
];

function PartenairesPage() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [type, setType] = useState<(typeof PARTNER_TYPES)[number]["value"]>("artisan_batiment");
  const [specialite, setSpecialite] = useState("");
  const [zone, setZone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const scrollToForm = useCallback(() => {
    document.getElementById("inscription")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("partenaires").insert({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        type,
        specialite: specialite.trim(),
        zone: zone.trim(),
        message: message.trim() ? message.trim() : null,
        statut: "en_attente",
      });
      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "L'envoi a échoué. Réessayez plus tard.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8">
          <span className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F8F7FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5B50F0]">
            Réseau partenaires
          </span>
          <h1 className="mt-4 font-sans text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl">
            Vous intervenez après sinistre ?
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#6B7280]">
            Rejoignez le réseau Vertual et accédez à des clients qui ont besoin d&apos;un devis ou d&apos;une
            contre-expertise.
          </p>
          <div className="mt-8">
            <Button
              type="button"
              size="lg"
              className="rounded-[12px] bg-[#5B50F0] px-6 text-base font-semibold text-white hover:bg-[#4B42D6]"
              onClick={scrollToForm}
            >
              Rejoindre le réseau
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#F0EFFE]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-center font-sans text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
            Qui peut rejoindre ?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {quiCards.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F0EFFE] text-[#5B50F0]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-sans text-lg font-semibold text-[#111827]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-center font-sans text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
            Comment ça marche ?
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {etapes.map(({ n, title, text }) => (
              <li key={n} className="relative flex flex-col items-center text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5B50F0] font-sans text-lg font-bold text-white">
                  {n}
                </span>
                <h3 className="mt-4 font-sans text-lg font-semibold text-[#111827]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="inscription" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
            Candidature partenaire
          </h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Complétez le formulaire ci-dessous. Nous étudions chaque dossier sous 48 h ouvrées.
          </p>

          {success ? (
            <div className="mt-8 flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F8F7FF] p-6">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#5B50F0]" aria-hidden />
              <p className="font-sans text-base font-medium leading-relaxed text-[#111827]">
                Merci ! Nous reviendrons vers vous sous 48h.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="part-prenom" className="block text-sm font-medium text-[#374151]">
                    Prénom
                  </label>
                  <input
                    id="part-prenom"
                    name="prenom"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow focus:ring-2"
                  />
                </div>
                <div>
                  <label htmlFor="part-nom" className="block text-sm font-medium text-[#374151]">
                    Nom
                  </label>
                  <input
                    id="part-nom"
                    name="nom"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="part-email" className="block text-sm font-medium text-[#374151]">
                  Email professionnel
                </label>
                <input
                  id="part-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="part-tel" className="block text-sm font-medium text-[#374151]">
                  Téléphone
                </label>
                <input
                  id="part-tel"
                  name="telephone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="part-type" className="block text-sm font-medium text-[#374151]">
                  Type de partenaire
                </label>
                <select
                  id="part-type"
                  name="type"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value as (typeof PARTNER_TYPES)[number]["value"])}
                  className="mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow focus:ring-2"
                >
                  {PARTNER_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="part-spec" className="block text-sm font-medium text-[#374151]">
                  Spécialité
                </label>
                <input
                  id="part-spec"
                  name="specialite"
                  type="text"
                  required
                  placeholder="ex. Plomberie, Toiture, Électricité…"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow placeholder:text-[#9CA3AF] focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="part-zone" className="block text-sm font-medium text-[#374151]">
                  Zone d&apos;intervention
                </label>
                <input
                  id="part-zone"
                  name="zone"
                  type="text"
                  required
                  placeholder="Ville, département ou région"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow placeholder:text-[#9CA3AF] focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="part-msg" className="block text-sm font-medium text-[#374151]">
                  Message <span className="font-normal text-[#9CA3AF]">(optionnel)</span>
                </label>
                <textarea
                  id="part-msg"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full resize-y rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none ring-[#5B50F0]/20 transition-shadow focus:ring-2"
                />
              </div>
              {error ? (
                <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full rounded-[12px] bg-[#5B50F0] py-3 text-base font-semibold text-white hover:bg-[#4B42D6] sm:w-auto"
              >
                {submitting ? "Envoi…" : "Envoyer ma candidature"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
