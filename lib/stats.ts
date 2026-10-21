// Calculs dérivés des données locales : abonnement, limites gratuites,
// statistiques du journal et règle de sécurité.

import { LIMITE_ENVIES_GRATUIT, MINUTES_PAR_JOINT, PALIERS_JOURS, SECURITE } from "./constants";
import { NB_JOURS_PROGRAMME } from "./programme";
import type { Envie, Etat } from "./store";
import { debutMois, debutSemaine, joursDecimaux, joursDepuis, MS } from "./temps";

/** Statuts Stripe qui donnent accès aux fonctionnalités abonnées. */
export function estAbonne(etat: Etat): boolean {
  return ["active", "trialing"].includes(etat.abonnement.statut);
}

/** Utilisations du Mode Envie depuis lundi 00:00. */
export function enviesCetteSemaine(envies: Envie[], maintenant = new Date()): number {
  const debut = debutSemaine(maintenant).getTime();
  return envies.filter((e) => new Date(e.creeLe).getTime() >= debut).length;
}

/** Nombre d'utilisations gratuites restantes cette semaine (Infinity si abonné). */
export function enviesRestantes(etat: Etat): number {
  if (estAbonne(etat)) return Infinity;
  return Math.max(0, LIMITE_ENVIES_GRATUIT - enviesCetteSemaine(etat.envies));
}

/** Envies tenues depuis le 1er du mois. */
export function enviesTenuesCeMois(envies: Envie[], maintenant = new Date()): number {
  const debut = debutMois(maintenant).getTime();
  return envies.filter((e) => e.tenue && new Date(e.creeLe).getTime() >= debut).length;
}

/** Envies transformées en séance de sport. */
export function enviesEnSeances(envies: Envie[]): number {
  return envies.filter((e) => e.activite && e.typeActivite === "sport").length;
}

/** Envies transformées en une activité qui a de la valeur, quelle qu'elle soit. */
export function enviesTransformees(envies: Envie[]): number {
  return envies.filter((e) => e.activite).length;
}

/** « Ce que tu as regagné » : estimations à partir des réponses de l'onboarding. */
export function ceQueTuAsRegagne(etat: Etat, maintenant = Date.now()) {
  if (!etat.profil) return null;
  const jours = joursDecimaux(etat.profil.dateDepart, maintenant);
  const jointsEvites =
    etat.profil.jointsParJour !== null ? Math.floor(etat.profil.jointsParJour * jours) : null;
  return {
    jointsEvites,
    heures: jointsEvites !== null ? Math.floor((jointsEvites * MINUTES_PAR_JOINT) / 60) : null,
    enviesTraversees: etat.envies.filter((e) => e.tenue).length,
  };
}

/**
 * Règle de sécurité : au moins 3 envies d'intensité 9 ou 10
 * enregistrées sur les dernières 24 heures.
 */
export function alerteSecurite(envies: Envie[], maintenant = Date.now()): boolean {
  const limite = maintenant - SECURITE.fenetreHeures * MS.heure;
  const fortes = envies.filter(
    (e) =>
      e.intensite !== null &&
      e.intensite >= SECURITE.intensiteMin &&
      new Date(e.termineLe ?? e.creeLe).getTime() >= limite,
  );
  return fortes.length >= SECURITE.nombre;
}

/** Jours propres au total : cumul des séries passées + série en cours. */
export function totalJoursPropres(etat: Etat, maintenant = Date.now()): number {
  if (!etat.profil) return 0;
  return etat.profil.totalJoursPropres + joursDepuis(etat.profil.dateDepart, maintenant);
}

/** Prochain palier à atteindre depuis la date de départ. */
export function prochainPalier(dateDepart: string, maintenant = Date.now()) {
  const depart = new Date(dateDepart).getTime();
  const ecoule = maintenant - depart;
  const jour = PALIERS_JOURS.find((j) => j * MS.jour > ecoule) ?? null;
  if (jour === null) return null;
  const precedent = [...PALIERS_JOURS].reverse().find((j) => j < jour) ?? 0;
  const restant = depart + jour * MS.jour - maintenant;
  const progression = Math.min(
    1,
    Math.max(0, (ecoule - precedent * MS.jour) / ((jour - precedent) * MS.jour)),
  );
  return { jour, restant, progression };
}

// --------------------------------------------------------------------------
// « Tes schémas » : statistiques du journal
// --------------------------------------------------------------------------

function plusFrequent<T>(valeurs: T[]): { valeur: T; nombre: number } | null {
  const compte = new Map<T, number>();
  for (const v of valeurs) compte.set(v, (compte.get(v) ?? 0) + 1);
  let meilleur: { valeur: T; nombre: number } | null = null;
  for (const [valeur, nombre] of compte) {
    if (!meilleur || nombre > meilleur.nombre) meilleur = { valeur, nombre };
  }
  return meilleur;
}

/** Tranches de 3 heures : 0h-3h, 3h-6h… 21h-0h. */
function tranche(iso: string): string {
  const h = new Date(iso).getHours();
  const debut = Math.floor(h / 3) * 3;
  return `${debut}h – ${(debut + 3) % 24}h`;
}

export type Schemas = {
  trancheHoraire: string | null;
  declencheurDominant: string | null;
  intensiteMoyenne: number | null;
  tauxResistance: number;
  total: number;
};

export function calculerSchemas(envies: Envie[]): Schemas {
  const tranches = plusFrequent(envies.map((e) => tranche(e.creeLe)));
  const declencheur = plusFrequent(
    envies.map((e) => e.declencheur).filter((d): d is string => !!d),
  );
  const intensites = envies.map((e) => e.intensite).filter((i): i is number => i !== null);
  const tenues = envies.filter((e) => e.tenue).length;
  return {
    trancheHoraire: tranches?.valeur ?? null,
    declencheurDominant: declencheur?.valeur ?? null,
    intensiteMoyenne: intensites.length
      ? Math.round((intensites.reduce((a, b) => a + b, 0) / intensites.length) * 10) / 10
      : null,
    tauxResistance: envies.length ? Math.round((tenues / envies.length) * 100) : 0,
    total: envies.length,
  };
}

// --------------------------------------------------------------------------
// Programme de 30 jours
// --------------------------------------------------------------------------

/** Jour du programme correspondant au compteur (J1 pendant les premières 24 h). */
export function jourDuProgramme(etat: Etat, maintenant = Date.now()): number {
  if (!etat.profil) return 1;
  return Math.min(NB_JOURS_PROGRAMME, joursDepuis(etat.profil.dateDepart, maintenant) + 1);
}

/** Dernier jour ouvert : on ne perd jamais l'accès aux jours déjà atteints. */
export function jourDebloque(etat: Etat, maintenant = Date.now()): number {
  return Math.max(etat.programme.jourMax, jourDuProgramme(etat, maintenant));
}
