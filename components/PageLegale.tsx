// Mise en page commune des documents légaux.

import Link from "next/link";
import type { ReactNode } from "react";
import { MISE_A_JOUR_LEGALE } from "@/lib/legal";

export function PageLegale({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <main className="pt-securite pb-securite mx-auto min-h-dvh max-w-lg px-5 py-6">
      <Link href="/reglages" className="text-sm text-texte-2 hover:text-texte">
        ← Réglages
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{titre}</h1>
      <p className="mt-2 text-xs text-texte-2">Dernière mise à jour : {MISE_A_JOUR_LEGALE}</p>
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-texte-2 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-texte [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-texte">
        {children}
      </div>
    </main>
  );
}

/** Valeur d'une information légale, signalée tant qu'elle n'est pas renseignée. */
export function Info({ valeur }: { valeur: string }) {
  return valeur ? <>{valeur}</> : <span className="text-ambre">[à compléter]</span>;
}
