"use client";

// Choix de la formule d'abonnement et ouverture de Stripe (paiement ou gestion).
// Partagé entre la page /offre (après l'onboarding) et les réglages.

import { useState } from "react";
import { TARIFS } from "@/lib/constants";
import { jetonAcces } from "@/lib/supabase/client";

/** Appels aux routes Stripe, avec redirection vers la connexion si nécessaire. */
export function usePaiement(suite: string) {
  const [chargement, setChargement] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function appeler(route: string, corps?: object) {
    setErreur(null);
    if (!navigator.onLine) return setErreur("Tu es hors ligne. Réessaie une fois connecté·e.");
    const jeton = await jetonAcces();
    if (!jeton) {
      // Un compte est nécessaire pour s'abonner : on revient ici après la connexion.
      window.location.href = `/connexion?suite=${encodeURIComponent(suite)}`;
      return;
    }
    setChargement(route);
    try {
      const rep = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jeton}` },
        body: JSON.stringify(corps ?? {}),
      });
      const json = (await rep.json()) as { url?: string; erreur?: string };
      if (json.url) window.location.href = json.url;
      else setErreur(json.erreur ?? "Une erreur est survenue.");
    } catch {
      setErreur("Impossible de joindre le serveur.");
    } finally {
      setChargement(null);
    }
  }

  return {
    chargement,
    erreur,
    sAbonner: (formule: "mensuel" | "annuel") => appeler("/api/stripe/checkout", { formule }),
    gerer: () => appeler("/api/stripe/portail"),
  };
}

/**
 * Les deux formules, l'annuelle mise en avant.
 * Avec `choisie`, les cartes servent à sélectionner (la page /offre a son propre bouton) ;
 * sans, un toucher lance directement le paiement.
 */
export function ChoixFormules({
  onChoisir,
  desactive,
  choisie,
}: {
  onChoisir: (formule: "mensuel" | "annuel") => void;
  desactive: boolean;
  choisie?: "mensuel" | "annuel";
}) {
  const active = (f: "mensuel" | "annuel") => (choisie ? choisie === f : f === "annuel");
  return (
    <div className="grid gap-3">
      <button
        type="button"
        disabled={desactive}
        onClick={() => onChoisir("annuel")}
        aria-pressed={choisie ? choisie === "annuel" : undefined}
        className={`relative rounded-2xl p-4 text-left transition disabled:opacity-50 ${
          active("annuel") ? "border-2 border-ambre bg-ambre/10" : "border border-bord bg-surface-2"
        }`}
      >
        <span className="absolute -top-2.5 right-4 rounded-full bg-ambre px-2 py-0.5 text-[11px] font-bold text-fond">
          LE PLUS AVANTAGEUX
        </span>
        <span className="flex items-baseline justify-between">
          <span className="font-semibold">Annuel</span>
          <span className="chiffres text-lg font-bold">
            {TARIFS.annuel.montant}
            <span className="text-sm font-normal text-texte-2"> / an</span>
          </span>
        </span>
        <span className="mt-1 block text-xs text-texte-2">{TARIFS.annuel.note}</span>
      </button>
      <button
        type="button"
        disabled={desactive}
        onClick={() => onChoisir("mensuel")}
        aria-pressed={choisie ? choisie === "mensuel" : undefined}
        className={`rounded-2xl p-4 text-left transition disabled:opacity-50 ${
          active("mensuel") && choisie ? "border-2 border-ambre bg-ambre/10" : "border border-bord bg-surface-2"
        }`}
      >
        <span className="flex items-baseline justify-between">
          <span className="font-semibold">Mensuel</span>
          <span className="chiffres text-lg font-bold">
            {TARIFS.mensuel.montant}
            <span className="text-sm font-normal text-texte-2"> / mois</span>
          </span>
        </span>
      </button>
    </div>
  );
}
