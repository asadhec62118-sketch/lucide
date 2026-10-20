// Bloc d'aide permanent : lignes d'écoute et mention « outil de suivi, pas un soin ».

import { AIDE, MENTION_LEGALE } from "@/lib/constants";
import { IconeTelephone } from "./Icones";

export function BlocAide({ titre = "Besoin de parler à quelqu'un ?", accent = false }: { titre?: string; accent?: boolean }) {
  return (
    <section
      className={`rounded-2xl border p-5 ${accent ? "border-ambre bg-ambre/10" : "border-bord bg-surface"}`}
      aria-label="Aide et écoute"
    >
      <h2 className="text-base font-semibold">{titre}</h2>
      <p className="mt-1 text-sm text-texte-2">
        Des personnes formées t&apos;écoutent, sans jugement.
      </p>
      <ul className="mt-4 space-y-3">
        {AIDE.map((ligne) => (
          <li key={ligne.tel}>
            <a
              href={`tel:${ligne.tel}`}
              className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4 transition hover:bg-bord"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vert/15 text-vert">
                <IconeTelephone className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm text-texte-2">{ligne.nom}</span>
                <span className="chiffres block text-lg font-bold">{ligne.numero}</span>
                <span className="block text-xs text-texte-2">{ligne.detail}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-texte-2">{MENTION_LEGALE}</p>
    </section>
  );
}
