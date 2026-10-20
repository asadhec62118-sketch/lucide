"use client";

// Petits hooks partagés.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEtat, type Etat } from "./store";

/** Heure courante rafraîchie à intervalle régulier (1 s par défaut). */
export function useMaintenant(intervalleMs = 1000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setMaintenant(Date.now()), intervalleMs);
    // Recalage immédiat au retour sur l'app (les minuteurs sont suspendus en arrière-plan).
    const auRetour = () => setMaintenant(Date.now());
    document.addEventListener("visibilitychange", auRetour);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", auRetour);
    };
  }, [intervalleMs]);
  return maintenant;
}

/**
 * Renvoie l'état local une fois chargé, avec un profil garanti.
 * Sans profil (onboarding non fait), redirige vers l'onboarding.
 */
export function useEtatAvecProfil(): (Etat & { profil: NonNullable<Etat["profil"]> }) | null {
  const etat = useEtat();
  const router = useRouter();
  const sansProfil = etat !== null && etat.profil === null;
  useEffect(() => {
    if (sansProfil) router.replace("/onboarding");
  }, [sansProfil, router]);
  if (!etat || !etat.profil) return null;
  return etat as Etat & { profil: NonNullable<Etat["profil"]> };
}
