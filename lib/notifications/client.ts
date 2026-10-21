"use client";

// Rappels côté téléphone : demande d'autorisation, abonnement Web Push,
// et mise à jour de la date de départ côté serveur (par exemple après une reprise).

import { lireEtat, modifierEtat } from "../store";
import { jetonAcces } from "../supabase/client";

const CLE_PUBLIQUE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** Déclencheurs pour lesquels on envoie l'alerte du vendredi (piège du Jour 11). */
const DECLENCHEURS_VENDREDI = ["Soirée", "Alcool", "Amis"];

/** Les rappels sont-ils possibles sur cet appareil ? */
export function rappelsDisponibles(): boolean {
  return (
    typeof window !== "undefined" &&
    !!CLE_PUBLIQUE &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Sur iPhone, les notifications n'existent que pour l'application installée sur l'écran d'accueil. */
export function iPhoneNonInstalle(): boolean {
  if (typeof window === "undefined") return false;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const installee =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !installee;
}

function cleVersOctets(base64: string): Uint8Array<ArrayBuffer> {
  const remplissage = "=".repeat((4 - (base64.length % 4)) % 4);
  const brut = atob((base64 + remplissage).replace(/-/g, "+").replace(/_/g, "/"));
  const octets = new Uint8Array(new ArrayBuffer(brut.length));
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

/** Envoie l'abonnement et les infos utiles au serveur. */
async function enregistrer(abonnement: PushSubscription): Promise<boolean> {
  const etat = lireEtat();
  if (!etat.profil) return false;
  const jeton = await jetonAcces();
  const rep = await fetch("/api/notifications/abonnement", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}) },
    body: JSON.stringify({
      subscription: abonnement.toJSON(),
      dateDepart: etat.profil.dateDepart,
      fuseau: Intl.DateTimeFormat().resolvedOptions().timeZone,
      vendredi: etat.profil.declencheurs.some((d) => DECLENCHEURS_VENDREDI.includes(d)),
    }),
  });
  return rep.ok;
}

export type ResultatActivation = "ok" | "refuse" | "indisponible" | "erreur";

/** Active les rappels : autorisation, abonnement, enregistrement côté serveur. */
export async function activerRappels(): Promise<ResultatActivation> {
  if (!rappelsDisponibles() || !CLE_PUBLIQUE) return "indisponible";
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "refuse";
    const sw = await navigator.serviceWorker.ready;
    const abonnement =
      (await sw.pushManager.getSubscription()) ??
      (await sw.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: cleVersOctets(CLE_PUBLIQUE) }));
    if (!(await enregistrer(abonnement))) return "erreur";
    modifierEtat((e) => ({ ...e, notifications: { ...e.notifications, actives: true } }));
    return "ok";
  } catch {
    return "erreur";
  }
}

/** Désactive les rappels sur cet appareil. */
export async function desactiverRappels(): Promise<void> {
  modifierEtat((e) => ({ ...e, notifications: { ...e.notifications, actives: false } }));
  try {
    const sw = await navigator.serviceWorker.ready;
    const abonnement = await sw.pushManager.getSubscription();
    if (!abonnement) return;
    await fetch("/api/notifications/abonnement", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: abonnement.endpoint }),
    });
    await abonnement.unsubscribe();
  } catch {
    // Hors ligne : l'abonnement expirera de lui-même côté serveur.
  }
}

/**
 * Remet à jour l'abonnement côté serveur (date de départ après une reprise,
 * fuseau horaire, déclencheurs). Appelé au lancement et après une reprise.
 */
export async function actualiserRappels(): Promise<void> {
  if (!lireEtat().notifications.actives || !rappelsDisponibles() || !navigator.onLine) return;
  try {
    if (Notification.permission !== "granted") {
      modifierEtat((e) => ({ ...e, notifications: { ...e.notifications, actives: false } }));
      return;
    }
    const sw = await navigator.serviceWorker.ready;
    const abonnement = await sw.pushManager.getSubscription();
    if (abonnement) await enregistrer(abonnement);
  } catch {
    // Nouvelle tentative au prochain lancement.
  }
}
