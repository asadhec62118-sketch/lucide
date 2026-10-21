"use client";

// Synchronisation entre le magasin local et Supabase.
// - Envoi : profil modifié, envies et reprises en attente (upsert idempotent).
// - Réception : statut d'abonnement, profil plus récent, envies d'un autre appareil.
// Tout échec réseau est silencieux : on réessaiera au prochain retour en ligne.

import { lireEtat, modifierEtat, ETAT_INITIAL, type Envie, type Etat, type Profil } from "./store";
import { supabaseNavigateur } from "./supabase/client";

type LigneProfil = {
  id: string;
  email: string | null;
  years_using: number | null;
  weekly_spend: number | string;
  joints_per_day: number | null;
  reasons: string[];
  reasons_text: string;
  triggers: string[];
  start_date: string | null;
  total_clean_days: number;
  faith_mode: boolean;
  faith_reminders: string[];
  sport_mode: boolean;
  subscription_status: string;
  subscription_plan: string | null;
  current_period_end: string | null;
  updated_at: string;
};

type LigneEnvie = {
  id: string;
  created_at: string;
  completed_at: string | null;
  intensity: number | null;
  trigger: string | null;
  location: string | null;
  emotion: string | null;
  resisted: boolean;
  sport_activity: string | null;
  activity_kind: string | null;
  updated_at: string;
};

function profilVersLigne(p: Profil) {
  return {
    years_using: p.anneesConso,
    weekly_spend: p.depenseHebdo,
    joints_per_day: p.jointsParJour,
    reasons: p.raisons,
    reasons_text: p.raisonsTexte,
    triggers: p.declencheurs,
    start_date: p.dateDepart,
    total_clean_days: p.totalJoursPropres,
    faith_mode: p.modeFoi,
    faith_reminders: p.rappelsFoi,
    sport_mode: p.modeSport,
    updated_at: p.majLe,
  };
}

function ligneVersProfil(l: LigneProfil): Profil | null {
  if (!l.start_date) return null; // onboarding pas encore terminé
  return {
    anneesConso: l.years_using ?? 0,
    depenseHebdo: Number(l.weekly_spend) || 0,
    jointsParJour: l.joints_per_day ?? null,
    raisons: l.reasons ?? [],
    raisonsTexte: l.reasons_text ?? "",
    declencheurs: l.triggers ?? [],
    dateDepart: l.start_date,
    totalJoursPropres: l.total_clean_days ?? 0,
    modeFoi: l.faith_mode,
    rappelsFoi: l.faith_reminders ?? [],
    modeSport: l.sport_mode,
    majLe: l.updated_at,
  };
}

function envieVersLigne(e: Envie, utilisateurId: string) {
  return {
    id: e.id,
    user_id: utilisateurId,
    created_at: e.creeLe,
    completed_at: e.termineLe,
    intensity: e.intensite,
    trigger: e.declencheur,
    location: e.lieu,
    emotion: e.emotion,
    resisted: e.tenue,
    sport_activity: e.activite,
    activity_kind: e.typeActivite,
  };
}

function ligneVersEnvie(l: LigneEnvie): Envie {
  return {
    id: l.id,
    creeLe: l.created_at,
    termineLe: l.completed_at,
    intensite: l.intensity,
    declencheur: l.trigger,
    lieu: l.location,
    emotion: l.emotion,
    tenue: l.resisted,
    activite: l.sport_activity,
    typeActivite: l.activity_kind ?? (l.sport_activity ? "sport" : null),
    majLe: l.updated_at,
  };
}

let enCours: Promise<void> | null = null;
let relance = false;

/** Lance une synchronisation (une seule à la fois ; les demandes suivantes sont regroupées). */
export function synchroniser(): Promise<void> {
  if (enCours) {
    relance = true;
    return enCours;
  }
  enCours = executer()
    .catch(() => undefined)
    .finally(() => {
      enCours = null;
      if (relance) {
        relance = false;
        void synchroniser();
      }
    });
  return enCours;
}

async function executer(): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const sb = supabaseNavigateur();
  if (!sb) return;
  const { data: sessionData } = await sb.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;

  // Données locales appartenant à un autre compte : on repart de zéro
  // pour ne jamais mélanger les données de deux personnes.
  const avant = lireEtat();
  if (avant.utilisateurId && avant.utilisateurId !== user.id) {
    modifierEtat(() => ({ ...ETAT_INITIAL, utilisateurId: user.id, email: user.email ?? null }));
  } else if (!avant.utilisateurId) {
    modifierEtat((e) => ({ ...e, utilisateurId: user.id, email: user.email ?? null }));
  }

  // 1. Lecture du profil serveur
  const { data: ligne, error: errProfil } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<LigneProfil>();
  if (errProfil) return;

  let etat = lireEtat();
  const profilServeur = ligne ? ligneVersProfil(ligne) : null;

  // 2. Résolution du profil : le plus récent gagne
  if (etat.profil && (etat.aSynchroniser.profil || !profilServeur ||
      new Date(etat.profil.majLe) > new Date(profilServeur.majLe))) {
    const { error } = await sb.from("profiles").update(profilVersLigne(etat.profil)).eq("id", user.id);
    if (!error) {
      modifierEtat((e) => ({ ...e, aSynchroniser: { ...e.aSynchroniser, profil: false } }));
    }
  } else if (profilServeur) {
    modifierEtat((e) => ({ ...e, profil: profilServeur }));
  }

  // 3. Abonnement : le serveur fait toujours foi
  if (ligne) {
    modifierEtat((e) => ({
      ...e,
      abonnement: {
        statut: ligne.subscription_status,
        formule: ligne.subscription_plan,
        finPeriode: ligne.current_period_end,
      },
    }));
  }

  // 4. Envoi des envies en attente
  etat = lireEtat();
  const enviesAEnvoyer = etat.envies.filter((e) => etat.aSynchroniser.envies.includes(e.id));
  if (enviesAEnvoyer.length) {
    const { error } = await sb
      .from("cravings")
      .upsert(enviesAEnvoyer.map((e) => envieVersLigne(e, user.id)), { onConflict: "id" });
    if (!error) {
      const envoyees = new Set(enviesAEnvoyer.map((e) => e.id));
      modifierEtat((e) => ({
        ...e,
        aSynchroniser: {
          ...e.aSynchroniser,
          envies: e.aSynchroniser.envies.filter((id) => !envoyees.has(id)),
        },
      }));
    }
  }

  // 5. Envoi des reprises en attente
  etat = lireEtat();
  const reprisesAEnvoyer = etat.reprises.filter((r) => etat.aSynchroniser.reprises.includes(r.id));
  if (reprisesAEnvoyer.length) {
    const { error } = await sb.from("reprises").upsert(
      reprisesAEnvoyer.map((r) => ({
        id: r.id,
        user_id: user.id,
        created_at: r.creeLe,
        clean_days: r.joursPropres,
        what_happened: r.ceQuiSestPasse,
      })),
      { onConflict: "id" },
    );
    if (!error) {
      const envoyees = new Set(reprisesAEnvoyer.map((r) => r.id));
      modifierEtat((e) => ({
        ...e,
        aSynchroniser: {
          ...e.aSynchroniser,
          reprises: e.aSynchroniser.reprises.filter((id) => !envoyees.has(id)),
        },
      }));
    }
  }

  // 6. Réception des envies saisies sur un autre appareil (fusion par identifiant)
  const { data: lignesEnvies } = await sb
    .from("cravings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (lignesEnvies) {
    modifierEtat((e) => fusionnerEnvies(e, (lignesEnvies as LigneEnvie[]).map(ligneVersEnvie)));
  }
}

function fusionnerEnvies(e: Etat, distantes: Envie[]): Etat {
  const parId = new Map(e.envies.map((x) => [x.id, x]));
  const enAttente = new Set(e.aSynchroniser.envies);
  for (const d of distantes) {
    const locale = parId.get(d.id);
    // Une modification locale non envoyée est prioritaire.
    if (!locale || (!enAttente.has(d.id) && new Date(d.majLe) > new Date(locale.majLe))) {
      parId.set(d.id, d);
    }
  }
  const envies = [...parId.values()].sort(
    (a, b) => new Date(b.creeLe).getTime() - new Date(a.creeLe).getTime(),
  );
  return { ...e, envies };
}
