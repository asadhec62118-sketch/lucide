// Calculs de temps, d'argent et mise en forme en français.

const MS_SECONDE = 1000;
const MS_MINUTE = 60 * MS_SECONDE;
const MS_HEURE = 60 * MS_MINUTE;
const MS_JOUR = 24 * MS_HEURE;

export type Duree = { jours: number; heures: number; minutes: number; secondes: number };

/** Décompose le temps écoulé depuis une date en jours / heures / minutes / secondes. */
export function dureeDepuis(depuis: string | Date, maintenant: number = Date.now()): Duree {
  const ecart = Math.max(0, maintenant - new Date(depuis).getTime());
  return {
    jours: Math.floor(ecart / MS_JOUR),
    heures: Math.floor((ecart % MS_JOUR) / MS_HEURE),
    minutes: Math.floor((ecart % MS_HEURE) / MS_MINUTE),
    secondes: Math.floor((ecart % MS_MINUTE) / MS_SECONDE),
  };
}

/** Nombre de jours entiers écoulés depuis une date. */
export function joursDepuis(depuis: string | Date, maintenant: number = Date.now()): number {
  return Math.floor(Math.max(0, maintenant - new Date(depuis).getTime()) / MS_JOUR);
}

/** Jours écoulés en valeur décimale (pour un calcul d'argent continu). */
export function joursDecimaux(depuis: string | Date, maintenant: number = Date.now()): number {
  return Math.max(0, maintenant - new Date(depuis).getTime()) / MS_JOUR;
}

/** Argent économisé depuis le départ, à partir de la dépense hebdomadaire déclarée. */
export function argentEconomise(depenseHebdo: number, depart: string, maintenant: number = Date.now()): number {
  return (depenseHebdo / 7) * joursDecimaux(depart, maintenant);
}

const formatEuros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const formatEurosRond = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function euros(montant: number, arrondi = false): string {
  return (arrondi ? formatEurosRond : formatEuros).format(montant);
}

/** Ordinal français féminin : 1re, 2e, 3e… (« C'est la 3e fois »). */
export function ordinalFeminin(n: number): string {
  return n === 1 ? "1re" : `${n}e`;
}

/** « 1 jour », « 12 jours ». */
export function pluriel(n: number, singulier: string, plurielMot = `${singulier}s`): string {
  return `${n} ${n > 1 ? plurielMot : singulier}`;
}

/** Début de la semaine en cours (lundi 00:00, heure locale). */
export function debutSemaine(maintenant: Date = new Date()): Date {
  const d = new Date(maintenant);
  const jour = (d.getDay() + 6) % 7; // lundi = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - jour);
  return d;
}

/** Début du mois en cours (1er à 00:00, heure locale). */
export function debutMois(maintenant: Date = new Date()): Date {
  return new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
}

/** Date au format AAAA-MM-JJ en heure locale (pour les champs <input type="date">). */
export function dateLocaleISO(d: Date = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const jj = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${jj}`;
}

/** Durée restante lisible : « 2 j 4 h », « 3 h 12 min », « 8 min ». */
export function dureeRestante(ms: number): string {
  if (ms <= 0) return "maintenant";
  // Arrondi à la minute supérieure avant découpage (évite « 23 h 60 min »).
  const totalMinutes = Math.ceil(ms / MS_MINUTE);
  const j = Math.floor(totalMinutes / (24 * 60));
  const h = Math.floor((totalMinutes % (24 * 60)) / 60);
  const m = totalMinutes % 60;
  if (j > 0) return `${j} j ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

export const MS = { seconde: MS_SECONDE, minute: MS_MINUTE, heure: MS_HEURE, jour: MS_JOUR };

const formatDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const formatHeure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function dateLongue(iso: string): string {
  return formatDate.format(new Date(iso));
}

export function heure(iso: string): string {
  return formatHeure.format(new Date(iso));
}

/** Deux chiffres pour l'affichage du compteur. */
export function deuxChiffres(n: number): string {
  return String(n).padStart(2, "0");
}
