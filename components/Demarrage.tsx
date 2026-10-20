"use client";

// Tâches de démarrage communes à toutes les pages :
// - enregistrement du service worker (mode hors ligne) ;
// - synchronisation avec Supabase au lancement, au retour en ligne,
//   au retour sur l'application et à chaque changement de session.

import { useEffect } from "react";
import { synchroniser } from "@/lib/sync";
import { supabaseNavigateur } from "@/lib/supabase/client";

export function Demarrage() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }

    void synchroniser();
    const auRetourEnLigne = () => void synchroniser();
    const auRetourVisible = () => {
      if (document.visibilityState === "visible") void synchroniser();
    };
    window.addEventListener("online", auRetourEnLigne);
    document.addEventListener("visibilitychange", auRetourVisible);

    const sb = supabaseNavigateur();
    const abonnement = sb?.auth.onAuthStateChange((evenement) => {
      // Différé : Supabase déconseille d'appeler son client dans ce rappel.
      if (evenement === "SIGNED_IN" || evenement === "TOKEN_REFRESHED") {
        setTimeout(() => void synchroniser(), 0);
      }
    });

    return () => {
      window.removeEventListener("online", auRetourEnLigne);
      document.removeEventListener("visibilitychange", auRetourVisible);
      abonnement?.data.subscription.unsubscribe();
    };
  }, []);

  return null;
}
