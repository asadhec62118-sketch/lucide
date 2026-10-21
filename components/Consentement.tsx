"use client";

// Case de consentement explicite, obligatoire pour créer un compte :
// les données de suivi sont des données de santé (RGPD, article 9).

import Link from "next/link";

export function CaseConsentement({ coche, onChange }: { coche: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface p-4 text-sm text-texte-2">
      <input
        type="checkbox"
        checked={coche}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#F5A524]"
      />
      <span>
        J&apos;accepte que mes données de suivi (consommation, envies, journal) soient sauvegardées avec mon compte,
        pour retrouver mon parcours. Je peux tout supprimer à tout moment.{" "}
        <Link href="/confidentialite" className="text-ambre underline-offset-2 hover:underline">
          En savoir plus
        </Link>
        {" · "}
        <Link href="/conditions" className="text-ambre underline-offset-2 hover:underline">
          Conditions
        </Link>
      </span>
    </label>
  );
}

/** Métadonnées d'inscription : la date du consentement est recopiée sur le profil. */
export function metadonneesConsentement() {
  return { consentement_sante: new Date().toISOString() };
}
