-- =============================================================================
-- LUCIDE — évolution 4 : preuve du consentement (RGPD, article 9)
-- Les données de suivi (consommation, envies) sont des données de santé.
-- Le consentement explicite est donné à la création du compte ; sa date est
-- transmise dans les métadonnées d'inscription et conservée sur le profil.
-- À exécuter après 0003_pourquoi_notifications.sql.
-- =============================================================================

alter table public.profiles
  add column if not exists health_data_consent_at timestamptz;

-- Le trigger d'inscription recopie la date de consentement envoyée par l'application.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  consentement timestamptz;
begin
  begin
    consentement := (new.raw_user_meta_data ->> 'consentement_sante')::timestamptz;
  exception when others then
    consentement := null;
  end;

  insert into public.profiles (id, email, health_data_consent_at)
  values (new.id, new.email, consentement)
  on conflict (id) do nothing;
  return new;
end;
$$;
