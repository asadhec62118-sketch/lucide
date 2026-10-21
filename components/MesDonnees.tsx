"use client";

// « Tes données » : téléchargement (portabilité) et suppression (effacement), RGPD.

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { desactiverRappels } from "@/lib/notifications/client";
import { effacerDonneesLocales, lireEtat } from "@/lib/store";
import { jetonAcces, supabaseNavigateur } from "@/lib/supabase/client";
import { Bouton } from "./ui";

export function MesDonnees({ session }: { session: Session | null }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function telecharger() {
    const { sessionEnvie, aSynchroniser, ...donnees } = lireEtat();
    void sessionEnvie;
    void aSynchroniser;
    const fichier = new Blob([JSON.stringify({ exporteLe: new Date().toISOString(), ...donnees }, null, 2)], {
      type: "application/json",
    });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(fichier);
    lien.download = `lucide-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    lien.click();
    URL.revokeObjectURL(lien.href);
  }

  async function supprimer() {
    setErreur(null);
    setEnCours(true);
    try {
      if (session) {
        if (!navigator.onLine) throw new Error("Tu es hors ligne. Réessaie une fois connecté·e.");
        const jeton = await jetonAcces();
        const rep = await fetch("/api/compte", { method: "DELETE", headers: { Authorization: `Bearer ${jeton}` } });
        if (!rep.ok) {
          const json = (await rep.json().catch(() => ({}))) as { erreur?: string };
          throw new Error(json.erreur ?? "La suppression n'a pas pu aboutir.");
        }
        await supabaseNavigateur()?.auth.signOut();
      }
      await desactiverRappels();
      effacerDonneesLocales();
      router.replace("/onboarding");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Une erreur est survenue.");
      setEnCours(false);
    }
  }

  return (
    <section className="rounded-2xl bg-surface p-5">
      <h2 className="text-base font-semibold">Tes données</h2>
      <p className="mt-1 text-sm text-texte-2">
        Elles t&apos;appartiennent. Tu peux les récupérer ou tout effacer, quand tu veux.
      </p>
      <Bouton variante="surface" onClick={telecharger} className="mt-4 w-full text-sm">
        Télécharger mes données
      </Bouton>
      {!confirmation ? (
        <Bouton variante="discret" onClick={() => setConfirmation(true)} className="mt-2 w-full text-sm">
          {session ? "Supprimer mon compte et mes données" : "Effacer les données de ce téléphone"}
        </Bouton>
      ) : (
        <div className="mt-4 rounded-2xl border border-ambre/40 bg-ambre/10 p-4">
          <p className="text-sm">
            {session
              ? "Ton compte, ton suivi, ton journal et tes rappels seront supprimés définitivement. Ton abonnement en cours sera résilié."
              : "Ton compteur, ton journal et tes réglages seront effacés de ce téléphone, définitivement."}
          </p>
          <div className="mt-3 flex gap-2">
            <Bouton onClick={supprimer} disabled={enCours} className="flex-1 text-sm">
              {enCours ? "Suppression…" : "Oui, tout supprimer"}
            </Bouton>
            <Bouton variante="discret" onClick={() => setConfirmation(false)} disabled={enCours} className="text-sm">
              Annuler
            </Bouton>
          </div>
        </div>
      )}
      {erreur && <p className="mt-3 text-sm text-ambre">{erreur}</p>}
    </section>
  );
}
