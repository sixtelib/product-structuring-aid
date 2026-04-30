import { Link } from "@tanstack/react-router";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { cn } from "@/lib/utils";

type FaqItem = {
  q: string;
  a: string;
};

type FaqSection = {
  id: string;
  title: string;
  items: Array<FaqItem>;
};

const sections: Array<FaqSection> = [
  {
    id: "expert-assure",
    title: "Sur l'expert d'assuré",
    items: [
      {
        q: "Qu'est-ce qu'un expert d'assuré ?",
        a: "Un expert d'assuré est un professionnel indépendant mandaté par l'assuré — et non par l'assureur — pour défendre ses intérêts lors du règlement d'un sinistre. Il évalue les dommages, analyse le contrat, et négocie avec l'expert de l'assureur pour obtenir une indemnisation juste.",
      },
      {
        q: "Quelle est la différence entre l'expert de l'assureur et l'expert d'assuré ?",
        a: "L'expert de l'assureur est mandaté et payé par votre compagnie d'assurance. Son rôle est d'évaluer les dommages dans l'intérêt de l'assureur. L'expert d'assuré, lui, travaille exclusivement pour vous. Il est votre représentant technique face à l'assureur.",
      },
      {
        q: "L'expert d'assuré est-il réglementé ?",
        a: "Oui. En France, les experts en assurance exercent dans un cadre réglementé. Les plateformes sérieuses vérifient les certifications, l'expérience, et l'indépendance de leurs experts partenaires.",
      },
      {
        q: "Mon assureur peut-il refuser la présence d'un expert d'assuré ?",
        a: "Non. Vous avez le droit de vous faire représenter par un expert de votre choix lors de la procédure contradictoire. Ce droit est reconnu dans la quasi-totalité des contrats d'assurance et ne peut pas être refusé par votre assureur.",
      },
      {
        q: "Pour quels types de sinistres peut intervenir un expert d'assuré ?",
        a: "Un expert d'assuré intervient sur tous les sinistres couverts par une assurance : dégât des eaux, incendie, tempête, catastrophe naturelle, dommages électriques, sinistres professionnels, pertes d'exploitation, et bien d'autres.",
      },
    ],
  },
  {
    id: "honoraires",
    title: "Sur les honoraires et le modèle économique",
    items: [
      {
        q: "Combien coûte un expert d'assuré ?",
        a: "La grande majorité des experts d'assuré travaillent au succès fee : ils perçoivent un pourcentage de l'indemnisation obtenue, généralement 10%. Si aucune amélioration n'est obtenue, vous ne payez rien.",
      },
      {
        q: "Si mon dossier n'aboutit pas, je ne paie rien ?",
        a: "Correct. Le modèle success fee signifie que l'expert d'assuré n'est rémunéré que si votre indemnisation est obtenue ou améliorée. Zéro résultat = zéro honoraires. C'est ce qui aligne ses intérêts sur les vôtres.",
      },
      {
        q: "Y a-t-il des frais cachés ou une avance à payer ?",
        a: "Non. Avec Vertual, l'analyse de votre dossier est gratuite, et aucune avance n'est demandée. Les honoraires sont prélevés uniquement à la clôture du dossier, sur l'indemnisation obtenue.",
      },
      {
        q: "Est-ce que ça vaut le coup financièrement ?",
        a: "Dans la grande majorité des dossiers traités avec un expert d'assuré, l'indemnisation finale est significativement supérieure à l'offre initiale de l'assureur — souvent le double ou plus. Sur un sinistre de 15 000 €, un expert qui obtient 5 000 € supplémentaires vous laisse 4 500 € nets après ses honoraires.",
      },
    ],
  },
  {
    id: "procedure",
    title: "Sur la procédure",
    items: [
      {
        q: "Comment se déroule une mission d'expertise ?",
        a: "La mission se déroule en 5 étapes : analyse du dossier et du contrat, visite des lieux pour constater les dommages, chiffrage indépendant, réunion contradictoire avec l'expert de l'assureur, puis accord et versement de l'indemnisation.",
      },
      {
        q: "Combien de temps dure une mission ?",
        a: "Un dossier simple peut être résolu en 4 à 8 semaines. Un dossier complexe (montant élevé, désaccord profond, sinistre professionnel) peut prendre 3 à 6 mois. Un expert d'assuré permet souvent d'accélérer le processus en structurant le dossier dès le départ.",
      },
      {
        q: "Dois-je être présent lors de l'expertise ?",
        a: "Votre présence n'est pas obligatoire — c'est précisément l'intérêt de mandater un expert d'assuré. Il vous représente lors de toutes les étapes techniques, y compris la réunion contradictoire avec l'expert de l'assureur.",
      },
      {
        q: "Puis-je faire appel à un expert d'assuré après avoir signé le procès-verbal ?",
        a: "C'est beaucoup plus difficile une fois le PV signé. Dans certains cas exceptionnels (vice du consentement, erreur manifeste), un recours reste possible. C'est pourquoi il est crucial d'intervenir avant toute signature.",
      },
      {
        q: "Que se passe-t-il si les deux experts ne trouvent pas d'accord ?",
        a: "En cas de désaccord persistant entre les deux experts, un troisième expert peut être désigné d'un commun accord (tierce expertise). Si le désaccord persiste, le recours au médiateur de l'assurance ou à la justice devient l'étape suivante.",
      },
    ],
  },
  {
    id: "droits",
    title: "Sur vos droits face à l'assureur",
    items: [
      {
        q: "Dans quel délai dois-je déclarer mon sinistre ?",
        a: "Le délai légal est de 5 jours ouvrés après constatation du sinistre. Pour les catastrophes naturelles (après publication de l'arrêté), ce délai est de 10 jours. Respecter ces délais est crucial — un retard peut réduire ou annuler votre indemnisation.",
      },
      {
        q: "Mon assureur peut-il refuser de m'indemniser ?",
        a: "Oui, sous certaines conditions. Un refus doit être motivé par une clause précise de votre contrat. Un refus mal motivé, ou s'appuyant sur une clause ambiguë ou mal appliquée, est contestable. Une clause ambiguë s'interprète toujours en faveur de l'assuré.",
      },
      {
        q: "Quel est le délai de prescription pour contester mon assureur ?",
        a: "En droit des assurances français, le délai de prescription est de 2 ans à compter de l'événement qui donne naissance à l'action. Passé ce délai, vous perdez tout droit de recours. N'attendez pas.",
      },
      {
        q: "Puis-je contester une indemnisation que j'ai déjà acceptée ?",
        a: "Si vous avez signé une quittance pour solde de tout compte, c'est très difficile — sauf en cas de vice du consentement prouvable. Si vous n'avez pas encore signé, vous pouvez encore contester. Ne signez jamais sous pression.",
      },
      {
        q: "Mon assureur peut-il résilier mon contrat si je conteste ?",
        a: "Non. Contester une décision de votre assureur ne peut pas justifier une résiliation de contrat. Une résiliation pour ce motif serait abusive et contestable en justice.",
      },
      {
        q: "Qu'est-ce que la règle proportionnelle ?",
        a: "C'est un mécanisme peu connu mais très pénalisant. Si votre bien est assuré pour une valeur inférieure à sa valeur réelle (sous-assurance), l'assureur réduit toutes les indemnisations proportionnellement à l'écart. Par exemple, un bien assuré à 70% de sa valeur réelle ne sera indemnisé qu'à 70% de ses dommages réels.",
      },
    ],
  },
  {
    id: "sous-indemnisation",
    title: "Sur la sous-indemnisation",
    items: [
      {
        q: "Comment savoir si mon assureur m'a sous-indemnisé ?",
        a: "Les signes les plus fréquents : l'expertise a duré moins d'une heure, certains biens endommagés ne sont pas mentionnés dans le rapport, l'indemnisation est inférieure aux devis d'artisans, des garanties prévues dans votre contrat n'ont pas été activées, ou une vétusté élevée a été appliquée sur tous les postes.",
      },
      {
        q: "Qu'est-ce que la vétusté et comment est-elle calculée ?",
        a: "La vétusté est une déduction appliquée sur la valeur des biens pour tenir compte de leur ancienneté et de leur usure. Elle est calculée selon des barèmes définis dans votre contrat. Si votre contrat inclut une garantie « valeur à neuf », la vétusté peut être partiellement ou totalement compensée.",
      },
      {
        q: "Mon assureur a appliqué une vétusté de 50% sur mes meubles — est-ce normal ?",
        a: "Ça dépend de l'âge des meubles et des barèmes de votre contrat. Une vétusté de 50% peut être légitime sur des meubles très anciens, mais abusive sur des meubles de 5 ans. Un expert d'assuré vérifie poste par poste que les taux appliqués sont conformes au contrat.",
      },
      {
        q: "Qu'est-ce que la sous-assurance ?",
        a: "La sous-assurance survient quand la valeur déclarée dans votre contrat est inférieure à la valeur réelle de vos biens. C'est fréquent car les valeurs ne sont pas toujours mises à jour. La sous-assurance déclenche la règle proportionnelle et réduit toutes vos indemnisations.",
      },
    ],
  },
  {
    id: "vertual",
    title: "Sur Vertual",
    items: [
      {
        q: "Comment fonctionne Vertual ?",
        a: "Vertual est une plateforme qui combine technologie IA et expertise humaine pour défendre les assurés sinistrés. Vous décrivez votre sinistre via notre chatbot, nous analysons gratuitement votre dossier, et si un recours est justifié, un expert d'assuré certifié prend en charge votre dossier de A à Z.",
      },
      {
        q: "Vertual intervient dans quelles régions ?",
        a: "Vertual intervient sur tout le territoire français métropolitain.",
      },
      {
        q: "Comment Vertual est-il rémunéré ?",
        a: "Uniquement au succès : 10% de l'indemnisation obtenue, prélevés à la clôture du dossier. Si votre dossier n'aboutit pas, vous ne payez rien.",
      },
      {
        q: "Mes données personnelles sont-elles protégées ?",
        a: "Oui. Vertual respecte le RGPD. Vos données sont utilisées exclusivement dans le cadre du traitement de votre dossier et ne sont jamais transmises à des tiers sans votre accord explicite.",
      },
      {
        q: "Comment démarrer avec Vertual ?",
        a: "Décrivez votre situation via le chatbot sur notre homepage. L'analyse est gratuite et sans engagement. En quelques minutes, vous savez si votre dossier mérite un recours.",
      },
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: sections.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
} as const;

function FaqAccordionItem({
  value,
  question,
  answer,
}: {
  value: string;
  question: string;
  answer: string;
}) {
  return (
    <AccordionPrimitive.Item value={value} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
            "font-semibold text-[#111827]",
            "transition-colors hover:bg-[#F8F9FF]",
          )}
        >
          <span className="text-base">{question}</span>
          <span className="relative h-5 w-5 shrink-0 text-[#5B50F0]">
            <Plus className="absolute inset-0 h-5 w-5 transition-opacity data-[state=open]:opacity-0" />
            <Minus className="absolute inset-0 h-5 w-5 opacity-0 transition-opacity data-[state=open]:opacity-100" />
          </span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="border-t border-[#E5E7EB] bg-white px-5 py-4 text-sm leading-relaxed text-[#374151]">
          {answer}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

export function FaqSeoPage() {
  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[#F8F9FF]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h1 className="mt-3 font-sans tracking-tight text-4xl font-semibold sm:text-5xl">
            FAQ — toutes vos questions
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            Tout ce que vous devez savoir sur l'expert d'assuré, vos droits face à votre assureur, et les recours en
            cas de sinistre.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.id}>
                <h2 className="text-[16px] font-semibold text-[#111827]">{section.title}</h2>
                <AccordionPrimitive.Root type="single" collapsible className="mt-4 space-y-3">
                  {section.items.map((item, idx) => (
                    <FaqAccordionItem
                      key={item.q}
                      value={`${section.id}-${idx}`}
                      question={item.q}
                      answer={item.a}
                    />
                  ))}
                </AccordionPrimitive.Root>
              </div>
            ))}

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
              <h3 className="font-sans tracking-tight text-xl font-semibold text-primary">
                Prêt à faire analyser votre dossier ?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Décrivez votre situation : l'analyse est gratuite, sans engagement.
              </p>
              <Link
                to="/"
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#5B50F0] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
              >
                Qualifier mon sinistre gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

