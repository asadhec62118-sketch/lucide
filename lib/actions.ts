"use client";

// Actions métier : chaque action modifie l'état local (fonctionne hors ligne),
// marque les éléments à synchroniser, puis tente une synchronisation.

import { lireEtat, modifierEtat, nouvelId, type Envie, type Profil } from "./store";
import { actualiserRappels } from "./notifications/client";
import { synchroniser } from "./sync";
import { joursDepuis, MS } from "./temps";

function maintenantISO() {
  return new Date().toISOString();
}

/** Fin de l'onboarding : création du profil local. */
export function creerProfil(
  p: Omit<Profil, "majLe" | "totalJoursPropres" | "modeFoi" | "rappelsFoi" | "modeSport" | "pourquoi">,
) {
  modifierEtat((e) => ({
    ...e,
    profil: {
      ...p,
      pourquoi: "",
      totalJoursPropres: 0,
      modeFoi: false,
      rappelsFoi: [],
      modeSport: false,
      majLe: maintenantISO(),
    },
    aSynchroniser: { ...e.aSynchroniser, profil: true },
  }));
  void synchroniser();
}

/** Modification partielle du profil (réglages). */
export function modifierProfil(changes: Partial<Omit<Profil, "majLe">>) {
  modifierEtat((e) =>
    e.profil
      ? {
          ...e,
          profil: { ...e.profil, ...changes, majLe: maintenantISO() },
          aSynchroniser: { ...e.aSynchroniser, profil: true },
        }
      : e,
  );
  void synchroniser();
}

/**
 * Démarre (ou reprend) une session du Mode Envie.
 * L'envie est enregistrée dès le démarrage : c'est ce qui compte pour la
 * limite hebdomadaire de la version gratuite.
 */
export function demarrerEnvie(): { envieId: string; debut: string } {
  const etat = lireEtat();
  const s = etat.sessionEnvie;
  // Une session de moins de 30 minutes est reprise là où elle en était.
  if (s && Date.now() - new Date(s.debut).getTime() < 30 * MS.minute) {
    return { envieId: s.envieId, debut: s.debut };
  }
  const id = nouvelId();
  const debut = maintenantISO();
  const envie: Envie = {
    id,
    creeLe: debut,
    termineLe: null,
    intensite: null,
    declencheur: null,
    lieu: null,
    emotion: null,
    tenue: false,
    activite: null,
    typeActivite: null,
    majLe: debut,
  };
  modifierEtat((e) => ({
    ...e,
    envies: [envie, ...e.envies],
    sessionEnvie: { envieId: id, debut, etape: "minuteur" },
    aSynchroniser: { ...e.aSynchroniser, envies: [...new Set([...e.aSynchroniser.envies, id])] },
  }));
  void synchroniser();
  return { envieId: id, debut };
}

/** Mémorise l'étape courante du Mode Envie (reprise après fermeture). */
export function memoriserEtapeEnvie(etape: string) {
  modifierEtat((e) => (e.sessionEnvie ? { ...e, sessionEnvie: { ...e.sessionEnvie, etape } } : e));
}

/** Met à jour une envie (journal rapide, activité sport, fin de séquence). */
export function modifierEnvie(id: string, changes: Partial<Omit<Envie, "id" | "creeLe">>) {
  modifierEtat((e) => ({
    ...e,
    envies: e.envies.map((x) => (x.id === id ? { ...x, ...changes, majLe: maintenantISO() } : x)),
    aSynchroniser: { ...e.aSynchroniser, envies: [...new Set([...e.aSynchroniser.envies, id])] },
  }));
  void synchroniser();
}

/** Fin de la séquence : l'envie est marquée comme tenue et la session est close. */
export function terminerEnvie(id: string) {
  modifierEnvie(id, { tenue: true, termineLe: maintenantISO() });
  modifierEtat((e) => ({ ...e, sessionEnvie: null }));
}

/** Ferme la session sans la marquer comme tenue (bouton « Quitter »). */
export function quitterEnvie() {
  modifierEtat((e) => ({ ...e, sessionEnvie: null }));
}

/**
 * Reprise : le compteur repart de maintenant, mais les jours de la série
 * qui se termine sont ajoutés au cumul, qui n'est jamais remis à zéro.
 * Renvoie le nouveau cumul de jours propres.
 */
export function enregistrerReprise(): { repriseId: string; totalJours: number } {
  const etat = lireEtat();
  if (!etat.profil) return { repriseId: "", totalJours: 0 };
  const maintenant = maintenantISO();
  const joursSerie = joursDepuis(etat.profil.dateDepart);
  const totalJours = etat.profil.totalJoursPropres + joursSerie;
  const repriseId = nouvelId();

  // Une envie démarrée dans les 24 dernières heures et non terminée
  // n'a pas été tenue : on la laisse telle quelle (tenue = false).
  modifierEtat((e) => ({
    ...e,
    profil: e.profil
      ? { ...e.profil, dateDepart: maintenant, totalJoursPropres: totalJours, majLe: maintenant }
      : e.profil,
    reprises: [{ id: repriseId, creeLe: maintenant, joursPropres: joursSerie, ceQuiSestPasse: "" }, ...e.reprises],
    sessionEnvie: null,
    aSynchroniser: {
      ...e.aSynchroniser,
      profil: true,
      reprises: [...e.aSynchroniser.reprises, repriseId],
    },
  }));
  void synchroniser();
  // Les rappels suivent la nouvelle date de départ.
  void actualiserRappels();
  return { repriseId, totalJours };
}

/** Réponse à « Qu'est-ce qui s'est passé ? ». */
export function completerReprise(id: string, texte: string) {
  modifierEtat((e) => ({
    ...e,
    reprises: e.reprises.map((r) => (r.id === id ? { ...r, ceQuiSestPasse: texte } : r)),
    aSynchroniser: { ...e.aSynchroniser, reprises: [...new Set([...e.aSynchroniser.reprises, id])] },
  }));
  void synchroniser();
}

/** Mémorise le jour le plus loin atteint dans le programme (local uniquement). */
export function memoriserJourProgramme(jour: number) {
  modifierEtat((e) =>
    jour > e.programme.jourMax ? { ...e, programme: { ...e.programme, jourMax: jour } } : e,
  );
}

/** Coche ou décoche l'action d'un jour du programme. */
export function basculerActionProgramme(jour: number) {
  modifierEtat((e) => {
    const faites = e.programme.actionsFaites;
    return {
      ...e,
      programme: {
        ...e.programme,
        actionsFaites: faites.includes(jour) ? faites.filter((j) => j !== jour) : [...faites, jour],
      },
    };
  });
}
