"use client";

// Point d'étape anonyme aux jours 7, 30 et 90 : deux questions facultatives.
// La réponse part sans aucun identifiant ; elle sert à savoir si LUCIDE aide vraiment.

import { useState } from "react";
import { pointEtapeAProposer } from "@/lib/stats";
import { modifierEtat, useEtat } from "@/lib/store";
import { Puce } from "./ui";

const STATUTS = [
  { id: "libre", libelle: "Je n'ai pas consommé depuis mon départ" },
  { id: "ecarts", libelle: "J'ai fait des écarts, mais je continue" },
  { id: "reprise", libelle: "J'ai consommé de nouveau" },
] as const;

function marquer(etape: number) {
  modifierEtat((e) => ({ ...e, pointsEtape: [...new Set([...e.pointsEtape, etape])] }));
}

export function PointEtape() {
  const etat = useEtat();
  const [statut, setStatut] = useState<string | null>(null);
  const [merci, setMerci] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  if (merci) {
    return (
      <section className="rounded-2xl border border-vert/40 bg-vert/10 p-5 text-sm">
        Merci. Ta réponse aide à rendre LUCIDE meilleure pour toutes celles et ceux qui arrêtent.
      </section>
    );
  }
  const proposee = etat ? pointEtapeAProposer(etat) : null;
  if (proposee === null) return null;
  const etape: number = proposee;

  async function envoyer(note: number | null) {
    setErreur(null);
    if (!navigator.onLine) return setErreur("Tu es hors ligne. Tu pourras répondre une fois connecté·e.");
    try {
      const rep = await fetch("/api/mesure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etape, statut, note }),
      });
      if (!rep.ok) throw new Error();
      marquer(etape);
      setMerci(true);
    } catch {
      setErreur("Envoi impossible pour le moment. Réessaie plus tard.");
    }
  }

  return (
    <section className="rounded-2xl border border-ambre/30 bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-ambre">POINT D&apos;ÉTAPE · JOUR {etape}</p>
        <button type="button" onClick={() => marquer(etape)} className="text-xs text-texte-2 hover:text-texte">
          Passer
        </button>
      </div>
      {!statut ? (
        <>
          <p className="mt-2 font-semibold">Aujourd&apos;hui, où en es-tu&nbsp;?</p>
          <div className="mt-3 flex flex-col gap-2">
            {STATUTS.map((s) => (
              <Puce key={s.id} actif={false} onClick={() => setStatut(s.id)}>
                {s.libelle}
              </Puce>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 font-semibold">Est-ce que LUCIDE t&apos;aide&nbsp;?</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => void envoyer(n)}
                className="chiffres min-h-12 rounded-2xl bg-surface-2 text-lg font-bold transition hover:bg-ambre hover:text-fond"
                aria-label={`${n} sur 5`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 flex justify-between text-xs text-texte-2">
            <span>Pas du tout</span>
            <span>Énormément</span>
          </p>
        </>
      )}
      <p className="mt-3 text-xs text-texte-2">Réponse anonyme : aucune information sur toi n&apos;est envoyée.</p>
      {erreur && <p className="mt-2 text-sm text-ambre">{erreur}</p>}
    </section>
  );
}
