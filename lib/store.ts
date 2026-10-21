"use client";

// Magasin local de LUCIDE.
// L'application est « local d'abord » : toutes les données vivent dans le
// localStorage de l'appareil, ce qui permet au compteur et au Mode Envie de
// fonctionner hors ligne. La synchronisation avec Supabase (lib/sync.ts)
// pousse ensuite les modifications marquées « à synchroniser ».

import { useSyncExternalStore } from "react";

export type Profil = {
  anneesConso: number;
  depenseHebdo: number;
  /** Nombre de joints par jour avant l'arrêt (facultatif, pour « Ce que tu as regagné »). */
  jointsParJour: number | null;
  raisons: string[];
  raisonsTexte: string;
  /** La phrase du Jour 1 : « J'arrête le cannabis, et voici pourquoi… ». */
  pourquoi: string;
  declencheurs: string[];
  /** Début de la série en cours (ISO). */
  dateDepart: string;
  /** Cumul des jours propres des séries précédentes. */
  totalJoursPropres: number;
  modeFoi: boolean;
  rappelsFoi: string[];
  modeSport: boolean;
  /** Horodatage de la dernière modification locale (résolution des conflits). */
  majLe: string;
};

export type Envie = {
  id: string;
  creeLe: string;
  termineLe: string | null;
  intensite: number | null;
  declencheur: string | null;
  lieu: string | null;
  emotion: string | null;
  /** true quand la séquence du Mode Envie est allée jusqu'au bout. */
  tenue: boolean;
  /** Activité choisie pour remplacer l'envie (« Remplacer pour acquérir »). */
  activite: string | null;
  typeActivite: string | null;
  majLe: string;
};

export type Reprise = {
  id: string;
  creeLe: string;
  joursPropres: number;
  ceQuiSestPasse: string;
};

export type Abonnement = {
  statut: string;
  formule: string | null;
  finPeriode: string | null;
};

/** Session du Mode Envie en cours, pour la reprendre si l'app est fermée. */
export type SessionEnvie = {
  envieId: string;
  debut: string;
  etape: string;
};

/** Avancement dans le programme de 30 jours (gardé sur l'appareil). */
export type AvancementProgramme = {
  /** Jour le plus loin atteint : les jours déjà ouverts restent lisibles après une reprise. */
  jourMax: number;
  /** Jours dont l'action a été cochée. */
  actionsFaites: number[];
};

export type Etat = {
  version: 1;
  profil: Profil | null;
  envies: Envie[];
  reprises: Reprise[];
  abonnement: Abonnement;
  sessionEnvie: SessionEnvie | null;
  programme: AvancementProgramme;
  /** Début de l'utilisation de LUCIDE (ne change pas après une reprise). */
  commenceLe: string | null;
  /** Points d'étape anonymes (jours 7, 30, 90) déjà répondus ou écartés. */
  pointsEtape: number[];
  /** Rappels (notifications) activés sur cet appareil ; carte d'invitation masquée sur l'accueil. */
  notifications: { actives: boolean; carteMasquee: boolean };
  /** Identifiant Supabase de l'utilisateur à qui appartiennent ces données. */
  utilisateurId: string | null;
  email: string | null;
  /** Éléments modifiés hors ligne, en attente d'envoi vers Supabase. */
  aSynchroniser: { profil: boolean; envies: string[]; reprises: string[] };
};

const CLE = "lucide:v1";

export const ETAT_INITIAL: Etat = {
  version: 1,
  profil: null,
  envies: [],
  reprises: [],
  abonnement: { statut: "free", formule: null, finPeriode: null },
  sessionEnvie: null,
  programme: { jourMax: 1, actionsFaites: [] },
  notifications: { actives: false, carteMasquee: false },
  commenceLe: null,
  pointsEtape: [],
  utilisateurId: null,
  email: null,
  aSynchroniser: { profil: false, envies: [], reprises: [] },
};

let etat: Etat | null = null;
const abonnes = new Set<() => void>();

function charger(): Etat {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return ETAT_INITIAL;
    const lu = JSON.parse(brut) as Partial<Etat>;
    // Fusion avec l'état initial pour tolérer les champs ajoutés plus tard.
    return {
      ...ETAT_INITIAL,
      ...lu,
      profil: lu.profil
        ? { ...lu.profil, jointsParJour: lu.profil.jointsParJour ?? null, pourquoi: lu.profil.pourquoi ?? "" }
        : null,
      notifications: { ...ETAT_INITIAL.notifications, ...lu.notifications },
      // Anciennes versions : l'activité s'appelait « activiteSport ».
      envies: (lu.envies ?? []).map((e) => {
        const ancienne = e as Envie & { activiteSport?: string | null };
        return {
          ...e,
          activite: e.activite ?? ancienne.activiteSport ?? null,
          typeActivite: e.typeActivite ?? (ancienne.activiteSport ? "sport" : null),
        };
      }),
      abonnement: { ...ETAT_INITIAL.abonnement, ...lu.abonnement },
      programme: { ...ETAT_INITIAL.programme, ...lu.programme },
      aSynchroniser: { ...ETAT_INITIAL.aSynchroniser, ...lu.aSynchroniser },
    };
  } catch {
    return ETAT_INITIAL;
  }
}

/** Lecture synchrone de l'état courant (côté navigateur uniquement). */
export function lireEtat(): Etat {
  if (etat === null) etat = charger();
  return etat;
}

/** Applique une modification, la persiste et prévient les composants abonnés. */
export function modifierEtat(fn: (e: Etat) => Etat): Etat {
  etat = fn(lireEtat());
  try {
    window.localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // Stockage plein ou navigation privée : l'état reste en mémoire.
  }
  abonnes.forEach((f) => f());
  return etat;
}

/** Efface toutes les données de LUCIDE sur cet appareil. */
export function effacerDonneesLocales() {
  etat = ETAT_INITIAL;
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // Stockage indisponible : l'état en mémoire est tout de même remis à zéro.
  }
  abonnes.forEach((f) => f());
}

function sAbonner(f: () => void) {
  abonnes.add(f);
  // Synchronisation entre onglets ouverts en parallèle.
  const surStockage = (ev: StorageEvent) => {
    if (ev.key === CLE) {
      etat = charger();
      f();
    }
  };
  window.addEventListener("storage", surStockage);
  return () => {
    abonnes.delete(f);
    window.removeEventListener("storage", surStockage);
  };
}

/**
 * Hook principal : renvoie l'état local, ou null pendant le rendu serveur
 * et la première hydratation (le localStorage n'existe pas côté serveur).
 */
export function useEtat(): Etat | null {
  return useSyncExternalStore(sAbonner, lireEtat, () => null);
}

/** Identifiant unique, compatible avec les colonnes uuid de Supabase. */
export function nouvelId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Repli pour les navigateurs anciens.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
