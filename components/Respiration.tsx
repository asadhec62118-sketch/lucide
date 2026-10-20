"use client";

// Respiration 4-7-8 : inspire 4 s, retiens 7 s, expire 8 s.
// Le cercle se dilate à l'inspiration, reste plein pendant la rétention,
// puis se contracte à l'expiration.

import { useEffect, useState } from "react";

const PHASES = [
  { id: "inspire", libelle: "Inspire", duree: 4, echelle: 1 },
  { id: "retiens", libelle: "Retiens", duree: 7, echelle: 1 },
  { id: "expire", libelle: "Expire", duree: 8, echelle: 0.45 },
] as const;

export function Respiration() {
  const [phase, setPhase] = useState(-1); // -1 : cercle au repos avant le premier cycle
  const [restant, setRestant] = useState(0);
  const [cycles, setCycles] = useState(0);

  // Démarrage après un court instant pour que la première transition soit visible.
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(0);
      setRestant(PHASES[0].duree);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Décompte seconde par seconde et enchaînement des phases.
  useEffect(() => {
    if (phase < 0) return;
    const t = setTimeout(() => {
      if (restant > 1) {
        setRestant((r) => r - 1);
        return;
      }
      const suivante = (phase + 1) % PHASES.length;
      if (suivante === 0) setCycles((c) => c + 1);
      setPhase(suivante);
      setRestant(PHASES[suivante].duree);
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, restant]);

  const courante = phase >= 0 ? PHASES[phase] : null;
  const echelle = courante ? courante.echelle : 0.45;
  // La durée de transition correspond à la phase : 4 s pour gonfler, 8 s pour dégonfler.
  const dureeTransition = courante && courante.id !== "retiens" ? courante.duree : 0.6;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-72 w-72 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-bord" />
        <div
          className="cercle-respiration absolute inset-0 rounded-full bg-ambre/20"
          style={{
            transform: `scale(${echelle})`,
            transitionDuration: `${dureeTransition}s`,
            boxShadow: courante?.id === "retiens" ? "0 0 60px rgba(245,165,36,0.35)" : "none",
          }}
        />
        <div
          className="cercle-respiration absolute inset-[18%] rounded-full bg-ambre/40"
          style={{ transform: `scale(${echelle})`, transitionDuration: `${dureeTransition}s` }}
        />
        <div className="relative text-center" aria-live="polite">
          <p className="text-2xl font-bold">{courante?.libelle ?? "Prépare-toi"}</p>
          {courante && <p className="chiffres mt-1 text-5xl font-bold text-ambre">{restant}</p>}
        </div>
      </div>
      <p className="chiffres mt-6 text-sm text-texte-2">
        {cycles === 0 ? "Inspire par le nez, expire par la bouche." : `${cycles} cycle${cycles > 1 ? "s" : ""} terminé${cycles > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
