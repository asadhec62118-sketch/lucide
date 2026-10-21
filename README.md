# LUCIDE

Application web progressive (PWA), en français, pour accompagner les personnes qui arrêtent le cannabis.

> LUCIDE est un outil de suivi, pas un soin. Il ne remplace pas un professionnel de santé.

**Stack** : Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Supabase (authentification + PostgreSQL), Stripe (abonnements), déploiement Vercel.

## Fonctionnalités

| Écran | Route | Hors ligne |
|---|---|---|
| Onboarding en 6 étapes | `/onboarding` | ✅ (sauf création du compte) |
| Accueil : compteur temps réel, argent économisé, jalon suivant | `/` | ✅ |
| Mode Envie : minuteur 10 min → respiration 4-7-8 → raisons → rappel → (sport) → journal en 4 taps | `/envie` | ✅ |
| Journal + « Tes schémas » (abonnés, au-delà de 10 entrées) | `/journal` | ✅ |
| Parcours J1 → J90 (flouté après J7 en gratuit) | `/parcours` | ✅ |
| Réglages : Mode Foi, Mode Sport, abonnement, aide, « J'ai consommé » | `/reglages` | ✅ (sauf paiement) |
| Reprise : cumul de jours propres conservé | `/reprise` | ✅ |
| Programme 30 jours tiré du livre (J1 à J7 gratuits) | `/programme` | ✅ |
| Connexion / lien magique | `/connexion`, `/auth/callback` | — |

Règle de sécurité : 3 envies d'intensité 9 ou 10 en 24 h affichent automatiquement le bloc d'aide (Drogues Info Service, Écoute Cannabis).

Limites de la version gratuite : 3 Modes Envie par semaine (du lundi au dimanche), Parcours visible jusqu'à J7, pas de « Tes schémas ».

## Architecture « local d'abord »

Pour que le compteur et le Mode Envie fonctionnent sans réseau, **toutes les données vivent d'abord sur l'appareil** (`localStorage`, voir `lib/store.ts`). Les actions (`lib/actions.ts`) modifient l'état local puis marquent les éléments à synchroniser. `lib/sync.ts` envoie ces modifications vers Supabase dès qu'une session et une connexion sont disponibles (au lancement, au retour en ligne, au retour sur l'app) et récupère le statut d'abonnement.

- Les envies et reprises ont un identifiant UUID généré côté client : l'envoi est idempotent (`upsert`).
- Le profil suit la règle « dernière modification gagne » (`updated_at`).
- Le service worker (`app/sw.js/route.ts`, servi en `/sw.js`) pré-charge toutes les pages et leurs ressources `/_next/static` à l'installation. Il est régénéré à chaque build avec un numéro de version, ce qui purge l'ancien cache.

```
app/
  (app)/            onglets avec barre basse : accueil, journal, parcours, réglages
  envie/            Mode Envie
  onboarding/       6 étapes
  reprise/          après « J'ai consommé »
  connexion/        connexion / inscription / lien magique
  auth/callback/    retour des liens magiques (PKCE)
  api/stripe/       checkout, portail, webhook
  sw.js/            service worker généré
components/         interface (boutons, bloc d'aide, respiration…)
lib/                magasin local, synchronisation, calculs, Supabase, Stripe
supabase/migrations/0001_schema_lucide.sql   schéma + RLS
public/             manifest.json, icônes
scripts/generer-icones.py                    régénère les icônes PNG
```

## Mise en route

### 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécute dans l'ordre `supabase/migrations/0001_schema_lucide.sql` puis `0002_regagne_activites.sql` (ou `supabase db push` avec la CLI).
   - Tables `profiles`, `cravings`, `reprises`, toutes avec RLS : chaque utilisateur n'accède qu'à ses lignes.
   - Un trigger crée le profil à l'inscription.
   - Les colonnes d'abonnement (`subscription_status`, `stripe_*`…) ne sont **pas** modifiables par l'utilisateur (privilèges par colonne) : seul le webhook, avec la clé `service_role`, les écrit.
3. **Authentication → URL Configuration** :
   - *Site URL* : `https://ton-domaine.fr`
   - *Redirect URLs* : `https://ton-domaine.fr/auth/callback` (et `http://localhost:3000/auth/callback` en local)
4. **Authentication → Email Templates** : traduis les modèles en français si tu le souhaites.

### 2. Stripe

1. Crée un produit « LUCIDE » avec deux prix récurrents :
   - **4,99 € / mois**
   - **34,99 € / an**
   L'essai gratuit de 7 jours est appliqué par le code au moment du paiement (`trial_period_days: 7`), une seule fois par compte.
2. Active le **portail client** (Settings → Billing → Customer portal) pour permettre la résiliation et le changement de formule.
3. Crée un **webhook** vers `https://ton-domaine.fr/api/stripe/webhook` avec les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`, `customer.subscription.resumed` (facultatifs)

En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 3. Variables d'environnement

Copie `.env.example` en `.env.local` et renseigne :

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé publique (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | clé serveur, **jamais exposée** |
| `STRIPE_SECRET_KEY` | clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | secret de signature du webhook |
| `STRIPE_PRICE_MENSUEL` | id du prix 4,99 €/mois |
| `STRIPE_PRICE_ANNUEL` | id du prix 34,99 €/an |
| `NEXT_PUBLIC_SITE_URL` | URL publique (redirections) |

Sans les variables Supabase, l'application fonctionne entièrement en local, sans compte.

### 4. Développement

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build && npm start   # le service worker n'est actif qu'en production
```

### 5. Déploiement Vercel

1. Importe le dépôt dans Vercel (framework détecté : Next.js).
2. Ajoute les variables d'environnement ci-dessus (Production et Preview).
3. Déploie, puis mets à jour l'URL du webhook Stripe et les URLs de redirection Supabase avec le domaine final.

## Installer l'application

- **iOS (Safari)** : bouton Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : menu ⋮ → « Installer l'application ».

Une fois ouverte au moins une fois en ligne, l'application fonctionne hors ligne pour le compteur, le Mode Envie, le journal et le parcours.

## Principes éditoriaux

- Tutoiement, aucun jargon médical, aucune iconographie médicale.
- Aucune promesse de résultat, de guérison ou de traitement : les jalons décrivent ce que « beaucoup de personnes » vivent.
- Le vocabulaire de l'échec est absent de l'interface : on parle de **reprise**, et le cumul de jours propres n'est jamais remis à zéro.
