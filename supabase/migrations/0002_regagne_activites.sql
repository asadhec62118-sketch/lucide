-- =============================================================================
-- LUCIDE — évolution 2 : « Ce que tu as regagné » et « Remplacer pour acquérir »
-- À exécuter après 0001_schema_lucide.sql.
-- =============================================================================

-- Nombre de joints par jour avant l'arrêt (facultatif), pour estimer
-- les joints non fumés et le temps regagné.
alter table public.profiles
  add column if not exists joints_per_day smallint check (joints_per_day between 0 and 100);

-- L'utilisateur peut modifier cette valeur depuis les réglages.
grant update (joints_per_day) on public.profiles to authenticated;

-- Catégorie de l'activité choisie pour remplacer une envie :
-- sport | proches | apprendre | foi | quotidien.
-- La colonne sport_activity contient désormais le titre de l'activité, quelle qu'elle soit.
alter table public.cravings
  add column if not exists activity_kind text;
