"use client";

// Retour des liens magiques et des confirmations d'email Supabase.
// Le code PKCE présent dans l'URL est échangé contre une session,
// puis les données locales sont synchronisées avec le compte.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LienBouton } from "@/components/ui";
import { supabaseNavigateur } from "@/lib/supabase/client";
import { synchroniser } from "@/lib/sync";

export default function RetourAuthentification() {
  const router = useRouter();
  const [erreur, setErreur] = useState(false);
  const fait = useRef(false);

  useEffect(() => {
    if (fait.current) return;
    fait.current = true;
    (async () => {
      const sb = supabaseNavigateur();
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const suite = params.get("suite");
      if (!sb) return setErreur(true);

      // detectSessionInUrl peut avoir déjà échangé le code : on vérifie d'abord.
      let { data } = await sb.auth.getSession();
      if (!data.session && code) {
        const r = await sb.auth.exchangeCodeForSession(code);
        if (r.error) return setErreur(true);
        data = { session: r.data.session };
      }
      if (!data.session) return setErreur(true);

      await synchroniser();
      router.replace(suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : "/");
    })();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 text-center">
      {erreur ? (
        <>
          <p className="text-xl font-semibold">Ce lien n&apos;est plus valable.</p>
          <p className="mt-2 text-sm text-texte-2">
            Ouvre-le sur l&apos;appareil où tu l&apos;as demandé, ou demande-en un nouveau.
          </p>
          <LienBouton href="/connexion" className="mt-6">
            Recevoir un nouveau lien
          </LienBouton>
        </>
      ) : (
        <>
          <div className="h-10 w-10 animate-pulse rounded-full border-4 border-ambre/60" />
          <p className="mt-4 text-texte-2">Connexion en cours…</p>
        </>
      )}
    </main>
  );
}
