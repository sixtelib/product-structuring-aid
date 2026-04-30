# Plateforme d'expertise pour assurés sinistrés : MVP B2C

Plateforme qui défend l'assuré particulier face à son assureur, de la qualification du sinistre à l'indemnisation finale, combinant IA et expert humain. Rémunération au succès uniquement.

## Architecture en 3 espaces

```text
┌─────────────────────────────────────────────────────────────┐
│  SITE PUBLIC (visiteurs)                                    │
│  Landing • Comment ça marche • Tarifs • FAQ • Chatbot       │
└──────────────────────┬──────────────────────────────────────┘
                       │ qualification → création de compte
┌──────────────────────▼─────────────┐  ┌──────────────────────┐
│  ESPACE ASSURÉ (client)            │  │  BACK-OFFICE EXPERT  │
│  Mes dossiers • Upload pièces      │  │  File de dossiers    │
│  Suivi temps réel • Messagerie     │  │  Analyse IA • Édition│
│  Notifications • Documents générés │  │  Courriers • Chat    │
└────────────────────────────────────┘  └──────────────────────┘
```

## 1. Site public

Pages séparées (routes TanStack distinctes pour le SEO) :
- **Accueil** : hero "Vous êtes mal indemnisé ? On se bat pour vous", proposition de valeur, social proof, CTA chatbot
- **Comment ça marche** : 4 étapes (qualifier · uploader · on négocie · vous êtes payé)
- **Sinistres traités** : habitation, auto, dégât des eaux, incendie, climatique, santé/prévoyance
- **Tarifs** : succès fee ~10 %, gratuit si échec, exemples chiffrés
- **FAQ** : qui est l'expert d'assuré, légalité, délais, fiscalité
- **À propos** : mission, équipe, partenaires
- **Contact**

Design : palette confiance (bleu nuit + accent corail / sable), typographie sérieuse mais chaleureuse, ton "défenseur de l'assuré".

## 2. Chatbot de qualification (porte d'entrée principale)

Conversationnel, alimenté par l'IA. Étapes :
1. Type de sinistre (habitation, auto, etc.)
2. Date, contexte court
3. Statut actuel (proposition reçue ? refus ? expertise en cours ?)
4. Montant demandé vs proposé (si connu)
5. Estimation rapide de la marge de négociation
6. **Mur de qualification** : si dossier éligible → invitation à créer un compte pour uploader les pièces

Conversion optimisée : le compte n'est créé **qu'après engagement** (le visiteur a déjà investi du temps).

## 3. Espace assuré

- **Inscription / connexion** (email + Google)
- **Tableau de bord** : mes dossiers avec statut visuel (Qualifié → En analyse → Négociation → Clôturé)
- **Détail dossier** :
  - Timeline d'avancement temps réel
  - Upload de pièces (police, courriers, devis, photos, rapport d'expert)
  - Messagerie avec l'expert assigné
  - Documents générés visibles (courrier contradictoire, mémoire, contre-expertise)
  - Indemnisation obtenue + honoraires
- **Profil & notifications** (email + in-app)
- **Facturation** : facture générée automatiquement à la clôture si succès

## 4. Back-office expert

Espace réservé aux experts internes (rôle séparé) :
- **File de dossiers** : tri par priorité, ancienneté, montant en jeu, statut
- **Vue dossier 360°** : pièces uploadées, historique, messagerie client, notes internes
- **Module IA** (cœur de la valeur) :
  - Analyse de la police d'assurance uploadée → extraction des garanties, exclusions, plafonds
  - Comparaison avec le rapport d'expert assureur → identification des postes sous-évalués
  - Suggestion de marge de négociation chiffrée
  - **Génération de courrier contradictoire** structuré (faits, garanties applicables, calcul, demande)
- **Édition** : l'expert relit, corrige, valide avant envoi
- **Changement de statut** + déclenchement notification client
- **Clôture** : saisie de l'indemnisation finale → calcul automatique du success fee → facturation

## 5. Module IA : détails fonctionnels

Edge functions branchées sur Lovable AI Gateway (Gemini par défaut) :
- `analyze-policy` : extrait garanties / exclusions / plafonds depuis la police PDF
- `analyze-claim` : croise rapport d'expert + police pour identifier les leviers
- `draft-letter` : produit un courrier contradictoire prêt à éditer
- `qualify-chat` : alimente le chatbot public avec extraction structurée

Toutes les analyses sont **stockées par dossier** : la base de connaissance s'enrichit à chaque traitement (avantage compétitif "effet cumulatif").

## 6. Rôles & sécurité

- `assuré` (par défaut à l'inscription) : accès uniquement à ses dossiers
- `expert` : accès à la file et aux dossiers attribués
- `admin` : gestion utilisateurs, attribution dossiers, paramètres

Table `user_roles` séparée + RLS strict (jamais de rôle stocké sur le profil). Storage privé pour les pièces uploadées.

## 7. Périmètre exclu du MVP

À garder pour plus tard : segment B2B, paiement en ligne du success fee (facture envoyée par email pour le MVP), application mobile, intégration directe avec les assureurs, signature électronique, multilingue.

---

## Détails techniques

- **Stack** : TanStack Start + Tailwind (déjà en place), Lovable Cloud (auth, base de données Postgres, storage, edge functions), Lovable AI Gateway pour toute la couche IA.
- **Auth** : email/mot de passe + Google. Pas de profil étendu pour le MVP au-delà de nom/téléphone.
- **Base de données** : `profiles`, `cases` (dossiers), `case_documents` (pièces), `case_events` (timeline), `case_messages` (messagerie), `case_analyses` (sorties IA), `user_roles`, `invoices`.
- **Storage** : bucket privé `case-files` avec policies par `case_id` + rôle expert.
- **Routes protégées** : layout `_authenticated` (espace assuré) et `_authenticated/_expert` (back-office).
- **Chatbot public** : edge function streaming + persistance de la session de qualification pour la convertir en `case` à la création de compte.

---

## Ordre de construction recommandé

1. Site public + design system + chatbot de qualification (sans persistance)
2. Auth + rôles + tables `cases` + espace assuré minimal (lister, créer, uploader)
3. Back-office expert + attribution + messagerie bidirectionnelle
4. Module IA (analyse police + génération courrier)
5. Notifications, facturation au succès, polish

À la validation, je commence par l'étape 1.