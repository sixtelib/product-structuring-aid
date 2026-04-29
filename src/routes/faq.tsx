import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Questions fréquentes — Vertual" },
      {
        name: "description",
        content:
          "Qui est l'expert d'assuré ? Est-ce légal ? Combien de temps ça prend ? Toutes les réponses pour comprendre comment nous défendons vos droits.",
      },
      { property: "og:title", content: "FAQ — Vertual" },
      {
        property: "og:description",
        content: "Vos questions sur la défense des assurés, nos délais et notre méthode.",
      },
    ],
  }),
  component: FaqPage,
});

const faq = [
  {
    q: "Qu'est-ce qu'un expert d'assuré ?",
    a: "C'est un professionnel mandaté par vous, l'assuré, pour défendre vos intérêts face à l'expert mandaté par votre assureur. Sa mission : obtenir l'indemnisation la plus juste, au regard de votre contrat et du préjudice réel.",
  },
  {
    q: "Est-ce que c'est légal ?",
    a: "Oui, totalement. Le droit de mandater un expert d'assuré est inscrit dans le Code des assurances. Votre assureur ne peut pas s'y opposer. C'est même une pratique recommandée dans les sinistres significatifs.",
  },
  {
    q: "Combien de temps dure une procédure ?",
    a: "L'analyse de votre dossier est rendue sous 48h. La négociation avec l'assureur dure en moyenne 4 à 12 semaines. Pour les sinistres complexes (incendies majeurs, catastrophes), comptez 3 à 6 mois.",
  },
  {
    q: "Combien ça coûte vraiment ?",
    a: "Notre rémunération est de 10 % du gain supplémentaire que nous obtenons. Si nous ne récupérons rien de plus, vous ne payez rien. Aucun frais d'ouverture, aucune mensualité, aucun engagement.",
  },
  {
    q: "Que se passe-t-il si j'ai déjà accepté la proposition de l'assureur ?",
    a: "Tant que vous n'avez pas signé d'accord transactionnel définitif, une renégociation est souvent possible. Envoyez-nous votre dossier, nous vous le dirons honnêtement.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Oui. Stockage chiffré, conformité RGPD, accès restreint à votre expert dédié uniquement. Vous pouvez supprimer vos données à tout moment.",
  },
  {
    q: "L'IA remplace-t-elle l'expert humain ?",
    a: "Non. L'IA accélère l'analyse de votre contrat et identifie les leviers de négociation. C'est toujours un expert humain qui valide la stratégie, signe les courriers et négocie avec l'assureur.",
  },
  {
    q: "Quels sinistres traitez-vous ?",
    a: "Tout sinistre dont l'enjeu dépasse 3 000 € : habitation, dégât des eaux, incendie, catastrophe naturelle, auto, santé/prévoyance, multirisque pro, garantie décennale.",
  },
  {
    q: "L'indemnisation supplémentaire est-elle imposable ?",
    a: "L'indemnité d'assurance répare un préjudice et n'est en principe pas imposable pour un particulier. Pour les cas spécifiques (location meublée, biens professionnels), nous vous orientons vers un conseil fiscal.",
  },
  {
    q: "Puis-je retirer mon dossier en cours de procédure ?",
    a: "Oui, à tout moment. Aucun engagement de durée. Vous récupérez vos documents et conservez la main sur votre dossier.",
  },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SiteLayout>
      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-foreground sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Questions fréquentes
          </p>
          <h1 className="mt-3 font-sans tracking-tight text-4xl font-semibold sm:text-5xl">
            Tout ce que vous devez savoir.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Une question manque ? Écrivez-nous, nous l'ajoutons.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faq.map((item, idx) => {
              const isOpen = open === idx;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-sans tracking-tight text-base font-semibold text-primary sm:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-primary transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border bg-secondary/40 px-5 py-4 text-sm leading-relaxed text-foreground">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-xl border border-border bg-white p-8 text-center shadow-[var(--shadow-soft)]">
            <h3 className="font-sans tracking-tight text-xl font-semibold text-primary">
              Votre question n'est pas ici ?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Notre équipe répond à toutes les questions, même les plus précises.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
            >
              Nous contacter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
