"use client";

// Rappels (notifications) : réglage et carte d'invitation sur l'accueil.

import { useEffect, useState } from "react";
import { activerRappels, desactiverRappels, iPhoneNonInstalle, rappelsDisponibles, type ResultatActivation } from "@/lib/notifications/client";
import { modifierEtat, useEtat } from "@/lib/store";
import { Bouton, Interrupteur } from "./ui";

const MESSAGES: Record<Exclude<ResultatActivation, "ok">, string> = {
  refuse: "Les notifications sont bloquées pour LUCIDE. Tu peux les autoriser dans les réglages de ton téléphone.",
  indisponible: "Les rappels ne sont pas disponibles sur cet appareil pour le moment.",
  erreur: "Impossible d'activer les rappels. Vérifie ta connexion et réessaie.",
};

/** Disponibilité des rappels, connue seulement côté navigateur. */
function useDisponibilite() {
  const [dispo, setDispo] = useState<{ ok: boolean; iphone: boolean } | null>(null);
  useEffect(() => setDispo({ ok: rappelsDisponibles(), iphone: iPhoneNonInstalle() }), []);
  return dispo;
}

const DESCRIPTION =
  "Chaque matin, ton jour du programme. Et le vendredi, un mot avant la soirée si c'est un moment à risque pour toi.";

/** Section des réglages. */
export function ReglageRappels() {
  const etat = useEtat();
  const dispo = useDisponibilite();
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  if (!etat || !dispo) return null;
  const actives = etat.notifications.actives;

  async function basculer(v: boolean) {
    setMessage(null);
    setEnCours(true);
    if (v) {
      const r = await activerRappels();
      if (r !== "ok") setMessage(MESSAGES[r]);
    } else {
      await desactiverRappels();
    }
    setEnCours(false);
  }

  return (
    <section className="rounded-2xl bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Tes rappels</h2>
          <p className="mt-1 text-sm text-texte-2">{DESCRIPTION}</p>
        </div>
        {dispo.ok && !dispo.iphone && (
          <Interrupteur libelle="Activer les rappels" actif={actives} onChange={(v) => !enCours && basculer(v)} />
        )}
      </div>
      {dispo.iphone && (
        <p className="mt-3 text-sm text-ambre">
          Sur iPhone, installe d&apos;abord LUCIDE sur ton écran d&apos;accueil (bouton Partager, puis « Sur
          l&apos;écran d&apos;accueil »), puis ouvre-la depuis son icône.
        </p>
      )}
      {!dispo.ok && !dispo.iphone && <p className="mt-3 text-sm text-texte-2">{MESSAGES.indisponible}</p>}
      {message && <p className="mt-3 text-sm text-ambre">{message}</p>}
    </section>
  );
}

/** Invitation sur l'accueil, tant que les rappels ne sont pas activés (masquable). */
export function CarteRappels() {
  const etat = useEtat();
  const dispo = useDisponibilite();
  const [message, setMessage] = useState<string | null>(null);
  if (!etat || !dispo || !dispo.ok || dispo.iphone) return null;
  if (etat.notifications.actives || etat.notifications.carteMasquee) return null;

  function masquer() {
    modifierEtat((e) => ({ ...e, notifications: { ...e.notifications, carteMasquee: true } }));
  }

  return (
    <section className="rounded-2xl border border-ambre/30 bg-surface p-5">
      <p className="font-semibold">Je t&apos;accompagne chaque matin&nbsp;?</p>
      <p className="mt-1 text-sm text-texte-2">{DESCRIPTION}</p>
      <div className="mt-4 flex gap-2">
        <Bouton
          className="flex-1 text-sm"
          onClick={async () => {
            const r = await activerRappels();
            if (r !== "ok") setMessage(MESSAGES[r]);
          }}
        >
          Activer mes rappels
        </Bouton>
        <Bouton variante="discret" className="text-sm" onClick={masquer}>
          Plus tard
        </Bouton>
      </div>
      {message && <p className="mt-3 text-sm text-ambre">{message}</p>}
    </section>
  );
}
