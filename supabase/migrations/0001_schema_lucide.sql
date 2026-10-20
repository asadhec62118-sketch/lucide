-- =============================================================================
-- LUCIDE — schéma Supabase (PostgreSQL) et politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase, ou via `supabase db push`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profils : une ligne par utilisateur, créée automatiquement à l'inscription
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                      uuid primary key references auth.users (id) on delete cascade,
  email                   text,

  -- Réponses de l'onboarding
  years_using             integer check (years_using between 0 and 80),
  weekly_spend            numeric(10, 2) not null default 0 check (weekly_spend >= 0),
  reasons                 text[] not null default '{}',
  reasons_text            text not null default '',
  triggers                text[] not null default '{}',

  -- Compteur : date de départ de la série en cours
  start_date              timestamptz,
  -- Cumul des jours propres des séries précédentes (jamais remis à zéro)
  total_clean_days        integer not null default 0 check (total_clean_days >= 0),

  -- Modes optionnels
  faith_mode              boolean not null default false,
  faith_reminders         text[] not null default '{}',
  sport_mode              boolean not null default false,

  -- Abonnement (écrit uniquement par le webhook Stripe, via la clé service_role)
  subscription_status     text not null default 'free',
  subscription_plan       text,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  current_period_end      timestamptz,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on column public.profiles.total_clean_days is
  'Cumul des jours propres des séries terminées. Incrémenté à chaque reprise, jamais réinitialisé.';
comment on column public.profiles.subscription_status is
  'free | trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired | paused';

-- -----------------------------------------------------------------------------
-- 2. Envies : chaque utilisation du Mode Envie et son journal rapide
--    L'identifiant est généré côté client pour permettre la saisie hors ligne
--    puis une synchronisation idempotente (upsert).
-- -----------------------------------------------------------------------------
create table if not exists public.cravings (
  id              uuid primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz,
  intensity       smallint check (intensity between 1 and 10),
  trigger         text,
  location        text,
  emotion         text,
  resisted        boolean not null default false,
  sport_activity  text,
  updated_at      timestamptz not null default now()
);

create index if not exists cravings_user_created_idx
  on public.cravings (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 3. Reprises : historique des remises à zéro du compteur
-- -----------------------------------------------------------------------------
create table if not exists public.reprises (
  id             uuid primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now(),
  clean_days     integer not null default 0 check (clean_days >= 0),
  what_happened  text not null default ''
);

create index if not exists reprises_user_created_idx
  on public.reprises (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 4. Création automatique du profil à l'inscription
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. Mise à jour automatique de updated_at (cravings uniquement : pour les
--    profils, le client envoie son propre horodatage afin de résoudre les
--    conflits de synchronisation hors ligne « dernier écrit gagnant »)
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cravings_touch on public.cravings;
create trigger cravings_touch
  before update on public.cravings
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 6. Sécurité : Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cravings enable row level security;
alter table public.reprises enable row level security;

-- Profils : chacun ne voit et ne modifie que le sien
drop policy if exists "profil_lecture" on public.profiles;
create policy "profil_lecture" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profil_modification" on public.profiles;
create policy "profil_modification" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Pas de politique insert/delete : la ligne est créée par le trigger,
-- et supprimée en cascade avec le compte.

-- Protection des colonnes d'abonnement : l'utilisateur ne peut modifier que
-- ses données de suivi. Les colonnes Stripe ne sont écrites que par le
-- webhook (clé service_role, qui contourne RLS et ces privilèges).
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (
  years_using, weekly_spend, reasons, reasons_text, triggers,
  start_date, total_clean_days,
  faith_mode, faith_reminders, sport_mode,
  updated_at
) on public.profiles to authenticated;

-- Envies : lecture / écriture limitées à ses propres lignes
drop policy if exists "envies_lecture" on public.cravings;
create policy "envies_lecture" on public.cravings
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "envies_ajout" on public.cravings;
create policy "envies_ajout" on public.cravings
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "envies_modification" on public.cravings;
create policy "envies_modification" on public.cravings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "envies_suppression" on public.cravings;
create policy "envies_suppression" on public.cravings
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.cravings from anon;
grant select, insert, update, delete on public.cravings to authenticated;

-- Reprises : lecture, ajout et complément (« Qu'est-ce qui s'est passé ? »)
drop policy if exists "reprises_lecture" on public.reprises;
create policy "reprises_lecture" on public.reprises
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "reprises_ajout" on public.reprises;
create policy "reprises_ajout" on public.reprises
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "reprises_modification" on public.reprises;
create policy "reprises_modification" on public.reprises
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.reprises from anon;
grant select, insert, update on public.reprises to authenticated;
