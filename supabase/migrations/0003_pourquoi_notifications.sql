-- =============================================================================
-- LUCIDE — évolution 3 : « Ta décision » du Jour 1 et rappels (notifications)
-- À exécuter après 0002_regagne_activites.sql.
-- =============================================================================

-- La phrase écrite au Jour 1 : « J'arrête le cannabis, et voici pourquoi… »
alter table public.profiles
  add column if not exists why_statement text not null default '';

grant update (why_statement) on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Abonnements aux notifications (Web Push)
-- Un appareil peut recevoir ses rappels même sans compte : on ne garde que
-- le strict nécessaire pour choisir le bon message (date de départ, fuseau,
-- préférence « vendredi soir »).
-- Table réservée au serveur : RLS activé sans aucune politique, donc
-- inaccessible avec la clé publique ; seules les routes API (service_role)
-- la lisent et l'écrivent.
-- -----------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  endpoint      text primary key,
  p256dh        text not null,
  auth          text not null,
  user_id       uuid references auth.users (id) on delete cascade,
  start_date    timestamptz not null,
  timezone      text not null default 'Europe/Paris',
  friday_alert  boolean not null default false,
  last_sent_on  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
