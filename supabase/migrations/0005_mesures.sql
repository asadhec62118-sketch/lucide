-- =============================================================================
-- LUCIDE — évolution 5 : mesure anonyme des résultats
-- Aux jours 7, 30 et 90, l'application propose une question facultative :
-- « Aujourd'hui, où en es-tu ? ». La réponse est envoyée sans aucun
-- identifiant (ni compte, ni appareil) : elle sert uniquement à savoir si
-- LUCIDE aide vraiment, et à l'améliorer.
-- Table réservée au serveur (RLS sans politique).
-- À exécuter après 0004_consentement.sql.
-- =============================================================================

create table if not exists public.mesures_anonymes (
  id          bigint generated always as identity primary key,
  etape       smallint not null check (etape in (7, 30, 90)),
  statut      text not null check (statut in ('libre', 'ecarts', 'reprise')),
  note        smallint check (note between 1 and 5),
  created_at  timestamptz not null default now()
);

alter table public.mesures_anonymes enable row level security;
revoke all on public.mesures_anonymes from anon, authenticated;

-- Pour lire les résultats (éditeur SQL de Supabase) :
--   select etape, statut, count(*) as personnes,
--          round(100.0 * count(*) / sum(count(*)) over (partition by etape), 1) as pourcentage,
--          round(avg(note), 2) as note_moyenne
--   from public.mesures_anonymes
--   group by etape, statut
--   order by etape, statut;
