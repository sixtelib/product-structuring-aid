import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cgu")({
  component: CGUPage,
});

function CGUPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-[#5B50F0] font-bold text-lg">
            Vertual
          </a>
          <span className="text-sm text-[#6B7280]">Version 0.1 – Mai 2026</span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-[#5B50F0] uppercase tracking-wide mb-2">Vertual</p>
          <h1 className="text-4xl font-black text-[#111827] mb-3">Conditions Générales d'Utilisation</h1>
          <p className="text-[#6B7280] text-sm">
            Version 0.1 – Mai 2026 · Applicable à vertual.fr et à l'application mobile Vertual
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>⚠️ Document de travail —</strong> Ce document est une base de travail destinée à être
            examinée et validée par un avocat spécialisé en droit du numérique et en droit des assurances avant
            toute publication.
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-[#374151]">
          {/* Article 1 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 1 – Présentation de la société et de la plateforme
            </h2>
            <p>
              Vertual (ci-après « la Société ») est une société [forme juridique à compléter], immatriculée au
              Registre du Commerce et des Sociétés de [ville] sous le numéro [RCS], dont le siège social est
              situé [adresse complète].
            </p>
            <p className="mt-3">
              La Société exploite la plateforme accessible à l'adresse vertual.fr (ci-après « la Plateforme »),
              qui permet à des particuliers et à des entreprises (ci-après « les Utilisateurs ») de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>qualifier leur sinistre et évaluer leurs droits à indemnisation ;</li>
              <li>soumettre leur dossier à des experts d'assuré partenaires ;</li>
              <li>suivre l'avancement de leurs démarches auprès de leur assureur ;</li>
              <li>accéder à des informations sur les procédures de réclamation en assurance.</li>
            </ul>
            <p className="mt-3">
              Vertual intervient en qualité d'intermédiaire en opérations d'assurance au sens des dispositions
              applicables du Code des assurances. La Société dispose [ou s'engage à obtenir avant tout lancement
              commercial] de l'immatriculation ORIAS requise pour l'exercice de cette activité.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 2 – Champ d'application et acceptation des CGU
            </h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et
              l'utilisation de la Plateforme, qu'il s'agisse d'une navigation libre, d'un usage du chatbot de
              qualification, d'une création de compte ou de toute autre interaction avec les services proposés.
            </p>
            <p className="mt-3">
              L'utilisation de la Plateforme vaut acceptation sans réserve des présentes CGU. L'Utilisateur qui
              n'accepte pas les CGU doit cesser immédiatement toute utilisation de la Plateforme.
            </p>
            <p className="mt-3">
              Les présentes CGU sont susceptibles d'évoluer. Toute modification sera notifiée aux Utilisateurs
              disposant d'un compte actif par courriel ou notification sur la Plateforme au minimum 30 jours avant
              son entrée en vigueur.
            </p>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 3 – Description des services
            </h2>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">3.1 Accès libre (sans création de compte)</h3>
            <p>
              L'Utilisateur peut accéder librement au chatbot de qualification de sinistre, aux pages
              d'information et aux ressources documentaires mises à disposition.
            </p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>ℹ️ Important —</strong> Tout document transmis via le chatbot ou le formulaire de
              qualification, même en l'absence de création de compte finalisée, est traité conformément à
              l'Article 6 des présentes CGU.
            </div>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">3.2 Espace client (avec création de compte)</h3>
            <p>Après création d'un compte, l'Utilisateur accède à un espace personnel sécurisé lui permettant de :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>déposer et gérer ses pièces justificatives ;</li>
              <li>suivre l'état d'avancement de son dossier ;</li>
              <li>communiquer avec l'expert d'assuré en charge de son dossier ;</li>
              <li>recevoir les comptes-rendus et courriers préparés en son nom.</li>
            </ul>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">3.3 Mission de défense</h3>
            <p>
              Sur mandat exprès de l'Utilisateur, Vertual coordonne l'intervention d'un expert d'assuré
              partenaire chargé de défendre les intérêts de l'Utilisateur face à son assureur.
            </p>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 4 – Création de compte et obligations de l'Utilisateur
            </h2>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">4.1 Éligibilité</h3>
            <p>
              La création d'un compte est réservée aux personnes physiques majeures capables juridiquement et aux
              personnes morales légalement constituées, ayant leur résidence ou siège social en France ou dans
              l'Espace Économique Européen.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">4.2 Informations transmises</h3>
            <p>
              L'Utilisateur s'engage à fournir des informations exactes, complètes et à jour. Toute fausse
              déclaration est susceptible d'entraîner la résiliation immédiate du compte.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">4.3 Sécurité des accès</h3>
            <p>
              L'Utilisateur est responsable de la confidentialité de ses identifiants d'accès. Il s'engage à
              notifier immédiatement la Société de toute utilisation non autorisée de son compte.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">4.4 Comportements prohibés</h3>
            <p>Il est notamment interdit de :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>téléverser des documents falsifiés ou frauduleux ;</li>
              <li>utiliser la Plateforme à des fins autres que la gestion de ses propres sinistres ;</li>
              <li>tenter d'accéder aux données d'autres Utilisateurs ;</li>
              <li>automatiser des interactions avec la Plateforme sans autorisation écrite préalable.</li>
            </ul>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 5 – Conditions financières
            </h2>
            <p>
              Vertual applique un modèle de rémunération exclusivement à la performance (success fee). Aucun
              frais n'est dû par l'Utilisateur en l'absence d'indemnisation effectivement obtenue de la part de
              l'assureur.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">5.1 B2C – Particuliers</h3>
            <p>
              La rémunération de Vertual est fixée à 10 % hors taxes du montant d'indemnisation supplémentaire
              obtenu par rapport à l'offre initiale de l'assureur, dans la limite d'un plafond défini dans le
              mandat individuel.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">5.2 B2B – Entreprises</h3>
            <p>
              Un barème dégressif est appliqué selon le montant du sinistre. Ce barème fait l'objet d'une
              proposition commerciale et d'un contrat-cadre distincts.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">5.3 Facturation et TVA</h3>
            <p>
              La facture est émise à la clôture du dossier, après encaissement de l'indemnisation par
              l'Utilisateur. Les sommes sont exprimées en euros et soumises à la TVA au taux en vigueur.
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 6 – Protection des données personnelles et entraînement de l'IA
            </h2>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mb-4">
              <strong>⚠️ Clause sensible —</strong> Cette section doit être soumise à relecture juridique
              approfondie avant publication.
            </div>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.1 Responsable du traitement</h3>
            <p>
              Vertual, [adresse], [email DPO ou contact], est le responsable du traitement des données à caractère
              personnel collectées via la Plateforme.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.2 Catégories de données collectées</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Données d'identification : nom, prénom, adresse électronique, numéro de téléphone ;</li>
              <li>Données relatives au sinistre : description des faits, montants invoqués, police d'assurance ;</li>
              <li>Documents téléversés : tout fichier déposé sur la Plateforme ;</li>
              <li>Données de navigation : logs, adresses IP, cookies ;</li>
              <li>Données d'authentification : identifiants de connexion via Google OAuth ou Apple Sign-In.</li>
            </ul>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.3 Finalités et bases légales</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Exécution du contrat</strong> (art. 6.1.b RGPD) : qualification du sinistre, gestion du
                dossier, facturation.
              </li>
              <li>
                <strong>Consentement explicite</strong> (art. 6.1.a RGPD) : communications marketing ; entraînement
                du modèle d'IA.
              </li>
              <li>
                <strong>Intérêt légitime</strong> (art. 6.1.f RGPD) : prévention de la fraude, sécurité de la
                Plateforme.
              </li>
              <li>
                <strong>Obligation légale</strong> (art. 6.1.c RGPD) : conservation des pièces comptables.
              </li>
            </ul>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.4 Utilisation des données pour l'entraînement du modèle d'IA</h3>
            <p>
              Vertual a pour ambition de développer un modèle d'intelligence artificielle propriétaire. Les
              documents transmis via la Plateforme sont susceptibles d'être utilisés comme données d'entraînement
              sous réserve du consentement préalable et explicite de l'Utilisateur, de la pseudonymisation des
              données, et de la possibilité de retrait du consentement à tout moment.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.5 Durée de conservation</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Données de compte actif : durée de la relation contractuelle + 5 ans.</li>
              <li>Documents de sinistre : durée de la mission + 5 ans après clôture.</li>
              <li>Données comptables : 10 ans conformément au Code de commerce.</li>
            </ul>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.6 Droits des personnes concernées</h3>
            <p>
              Conformément au RGPD, tout Utilisateur dispose des droits d'accès, de rectification, d'effacement, de
              limitation, de portabilité, d'opposition et de retrait du consentement. Ces droits s'exercent par
              courriel à :{" "}
              <a href="mailto:privacy@vertual.fr" className="text-[#5B50F0] underline">
                privacy@vertual.fr
              </a>
              .
            </p>
            <p className="mt-2">
              En cas de réponse insatisfaisante, l'Utilisateur peut saisir la <strong>CNIL</strong>, 3 place de
              Fontenoy, 75007 Paris –{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5B50F0] underline"
              >
                www.cnil.fr
              </a>
              .
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.7 Transferts hors Union Européenne</h3>
            <p>
              Les données sont hébergées par Supabase Inc. (infrastructure AWS), dont certains serveurs peuvent
              être situés en dehors de l'Union Européenne. Ces transferts sont encadrés par des Clauses
              Contractuelles Types (CCT) adoptées par la Commission européenne.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">6.8 Cookies et traceurs</h3>
            <p>
              Vertual utilise des cookies strictement nécessaires au fonctionnement de la Plateforme et, sous
              réserve du consentement de l'Utilisateur, des cookies analytiques.
            </p>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 7 – Propriété intellectuelle
            </h2>
            <p>
              L'ensemble des éléments constituant la Plateforme (interface, code source, textes, marques, logos, base
              de données, modèle IA) est la propriété exclusive de Vertual ou de ses partenaires et est protégé par
              le droit de la propriété intellectuelle.
            </p>
            <p className="mt-3">
              Aucun élément de la Plateforme ne peut être reproduit, copié, distribué ou exploité sans
              l'autorisation écrite préalable de Vertual.
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 8 – Responsabilité
            </h2>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">8.1 Responsabilité de Vertual</h3>
            <p>
              Vertual s'engage à mettre en œuvre tous les moyens raisonnables pour assurer la disponibilité et la
              sécurité de la Plateforme. La responsabilité de Vertual ne peut être engagée du fait des décisions
              prises par l'assureur de l'Utilisateur.
            </p>

            <h3 className="font-semibold text-[#111827] mt-4 mb-2">8.2 Responsabilité de l'Utilisateur</h3>
            <p>
              L'Utilisateur est seul responsable de l'exactitude et de la légalité des documents et informations
              qu'il transmet à Vertual.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 9 – Résiliation
            </h2>
            <p>
              L'Utilisateur peut clôturer son compte à tout moment depuis son espace personnel ou sur simple
              demande adressée à{" "}
              <a href="mailto:support@vertual.fr" className="text-[#5B50F0] underline">
                support@vertual.fr
              </a>
              .
            </p>
            <p className="mt-3">
              Vertual se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes CGU,
              après mise en demeure restée sans effet pendant 15 jours.
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 10 – Droit applicable et règlement des litiges
            </h2>
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, l'Utilisateur consommateur est
              informé de la possibilité de recourir gratuitement à un médiateur de la consommation. À défaut de
              résolution amiable, tout litige sera soumis aux juridictions compétentes du ressort du siège social
              de Vertual.
            </p>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Article 11 – Dispositions diverses
            </h2>
            <p>
              Si l'une quelconque des stipulations des présentes CGU était déclarée nulle ou inapplicable, les
              autres stipulations demeureront pleinement en vigueur.
            </p>
          </section>

          {/* Annexe A */}
          <section>
            <h2 className="text-xl font-bold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-4">
              Annexe A – Récapitulatif des traitements et bases légales
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#E5E7EB] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#F0EFFE]">
                    <th className="text-left p-3 font-semibold text-[#111827] border-b border-[#E5E7EB]">
                      Finalité
                    </th>
                    <th className="text-left p-3 font-semibold text-[#111827] border-b border-[#E5E7EB]">
                      Base légale
                    </th>
                    <th className="text-left p-3 font-semibold text-[#111827] border-b border-[#E5E7EB]">
                      Conservation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  <tr>
                    <td className="p-3">Qualification du sinistre (chatbot)</td>
                    <td className="p-3">Intérêt légitime / Consentement (IA)</td>
                    <td className="p-3">X mois si non converti</td>
                  </tr>
                  <tr className="bg-[#F8F9FF]">
                    <td className="p-3">Gestion du dossier client</td>
                    <td className="p-3">Exécution du contrat</td>
                    <td className="p-3">5 ans post-clôture</td>
                  </tr>
                  <tr>
                    <td className="p-3">Entraînement modèle IA</td>
                    <td className="p-3">Consentement explicite</td>
                    <td className="p-3">Durée du modèle</td>
                  </tr>
                  <tr className="bg-[#F8F9FF]">
                    <td className="p-3">Facturation</td>
                    <td className="p-3">Obligation légale</td>
                    <td className="p-3">10 ans</td>
                  </tr>
                  <tr>
                    <td className="p-3">Marketing / newsletter</td>
                    <td className="p-3">Consentement explicite</td>
                    <td className="p-3">3 ans post-dernière interaction</td>
                  </tr>
                  <tr className="bg-[#F8F9FF]">
                    <td className="p-3">Sécurité / lutte contre la fraude</td>
                    <td className="p-3">Intérêt légitime</td>
                    <td className="p-3">12 mois</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer note */}
          <div className="pt-8 border-t border-[#E5E7EB] text-xs text-[#9CA3AF] text-center">
            Vertual – Document de travail confidentiel – Mai 2026 ·{" "}
            <a href="https://vertual.fr" className="text-[#5B50F0]">
              vertual.fr
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
