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
2. Dans **SQL Editor**, exécute dans l'ordre `supabase/migrations/0001_schema_lucide.sql`, `0002_regagne_activites.sql`, `0003_pourquoi_notifications.sql`, `0004_consentement.sql` puis `0005_mesures.sql` (ou `supabase db push` avec la CLI).
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
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | clé publique des rappels (`npx web-push generate-vapid-keys`) |
| `VAPID_PRIVATE_KEY` | clé privée des rappels, **jamais exposée** |
| `VAPID_SUBJECT` | contact pour les services de notification (`mailto:…`) |
| `CRON_SECRET` | secret protégeant l'envoi quotidien des rappels |

Sans les variables Supabase, l'application fonctionne entièrement en local, sans compte.

### Données personnelles et pages légales

Les données de suivi sont des **données de santé** (RGPD, article 9) :
- sans compte, elles restent sur le téléphone ;
- la création d'un compte exige une case de consentement explicite, dont la date est enregistrée (`profiles.health_data_consent_at`) ;
- les réglages permettent de télécharger ses données et de supprimer son compte (route `DELETE /api/compte`, qui résilie aussi l'abonnement Stripe).

Les pages `/confidentialite`, `/conditions` et `/mentions-legales` lisent les informations de l'éditeur dans `lib/legal.ts`, **à compléter avant le lancement**. Ces textes sont une base de travail : les faire relire par un professionnel du droit avant le lancement est recommandé.

### Mesurer les résultats

- **Audience** : Vercel Web Analytics (anonyme, sans cookie). À activer dans le projet Vercel, onglet *Analytics*.
- **Résultats** : aux jours 7, 30 et 90 (comptés depuis le début d'utilisation), l'accueil propose un point d'étape anonyme : « Aujourd'hui, où en es-tu ? » puis « Est-ce que LUCIDE t'aide ? ». Les réponses arrivent dans la table `mesures_anonymes`, sans aucun identifiant. La requête pour lire les résultats est en commentaire dans `supabase/migrations/0005_mesures.sql`.

### Rappels (notifications)

Chaque matin vers 8 h–9 h (heure de Paris), Vercel Cron appelle `/api/notifications/envoi` (voir `vercel.json`) : chaque appareil abonné reçoit son jour du programme, une alerte le vendredi s'il a coché soirée, alcool ou amis comme déclencheurs, puis un mot aux grands paliers après le jour 30. Sur iPhone, les notifications ne fonctionnent que si LUCIDE est installée sur l'écran d'accueil (iOS 16.4 ou plus récent).

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

## La voix de l'auteur

1. Sur son téléphone, l'auteur ouvre `/studio` (page non référencée), lit la pensée de chaque jour, réécoute et recommence si besoin. Les enregistrements restent dans le téléphone jusqu'à l'envoi.
2. Le bouton « Envoyer mes enregistrements » partage les fichiers `jour-N.m4a` (ou `.webm`).
3. Conversion en MP3 avec volume harmonisé : `bash scripts/convertir-audio.sh dossier-des-fichiers` (nécessite `ffmpeg`), qui écrit dans `public/audio/`.
4. Ajouter les numéros des jours dans `AUDIOS_DISPONIBLES` (`lib/programme.ts`) : le lecteur apparaît sous la pensée du jour.

## Publier sur le Google Play Store

LUCIDE peut être publiée telle quelle sur le Play Store, sans réécrire l'application :

1. Créer un compte développeur Google Play (frais uniques de 25 $, la seule dépense).
2. Sur [pwabuilder.com](https://www.pwabuilder.com), entrer l'adresse du site puis *Package for stores* → *Android*. PWABuilder fournit le paquet à envoyer sur Google Play, le **nom du paquet** et l'**empreinte SHA-256**.
3. Dans Vercel, renseigner `ANDROID_PACKAGE_NAME` et `ANDROID_SHA256_FINGERPRINTS`, puis redéployer : la route `/.well-known/assetlinks.json` prouve à Android que l'application et le site vont ensemble.
4. Envoyer le paquet dans la Google Play Console (fiche, captures d'écran, questionnaire de contenu).

L'App Store d'Apple demande un compte développeur payant (99 $ par an) ; PWABuilder sait aussi produire un paquet iOS, le moment venu.

## Installer l'application

- **iOS (Safari)** : bouton Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : menu ⋮ → « Installer l'application ».

Une fois ouverte au moins une fois en ligne, l'application fonctionne hors ligne pour le compteur, le Mode Envie, le journal et le parcours.

## Principes éditoriaux

- Tutoiement, aucun jargon médical, aucune iconographie médicale.
- Aucune promesse de résultat, de guérison ou de traitement : les jalons décrivent ce que « beaucoup de personnes » vivent.
- Le vocabulaire de l'échec est absent de l'interface : on parle de **reprise**, et le cumul de jours propres n'est jamais remis à zéro.
