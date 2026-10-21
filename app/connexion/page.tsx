"use client";

// CONNEXION — se connecter (mot de passe ou lien magique) ou créer un compte.
// Accessible depuis les Réglages, par exemple avant de s'abonner.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaseConsentement, metadonneesConsentement } from "@/components/Consentement";
import { Bouton } from "@/components/ui";
import { traduireErreur } from "@/lib/erreurs";
import { supabaseNavigateur } from "@/lib/supabase/client";
import { synchroniser } from "@/lib/sync";

/** Destination après connexion (chemin interne uniquement). */
function destination(): string {
  if (typeof window === "undefined") return "/";
  const suite = new URLSearchParams(window.location.search).get("suite");
  return suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : "/";
}

export default function Connexion() {
  const router = useRouter();
  const sb = supabaseNavigateur();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [consentement, setConsentement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const redirection = () => {
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("suite", destination());
    return url.toString();
  };

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    setEnvoi(true);
    setErreur(null);
    if (mode === "connexion") {
      const { error } = await sb.auth.signInWithPassword({ email, password: motDePasse });
      setEnvoi(false);
      if (error) return setErreur(traduireErreur(error.message));
      await synchroniser();
      router.replace(destination());
    } else {
      const { data, error } = await sb.auth.signUp({
        email,
        password: motDePasse,
        options: { emailRedirectTo: redirection(), data: metadonneesConsentement() },
      });
      setEnvoi(false);
      if (error) return setErreur(traduireErreur(error.message));
      if (data.session) {
        await synchroniser();
        router.replace(destination());
      } else {
        setMessage("Vérifie ta boîte mail pour confirmer ton adresse.");
      }
    }
  }

  async function lienMagique() {
    if (!sb) return;
    if (!email) return setErreur("Indique ton adresse email.");
    setEnvoi(true);
    setErreur(null);
    // En mode connexion, le lien magique ne crée jamais de compte (pas de consentement recueilli).
    const { error } = await sb.auth.signInWithOtp({
      email,
      options:
        mode === "inscription"
          ? { emailRedirectTo: redirection(), data: metadonneesConsentement() }
          : { emailRedirectTo: redirection(), shouldCreateUser: false },
    });
    setEnvoi(false);
    if (error) return setErreur(traduireErreur(error.message));
    setMessage("C'est envoyé. Ouvre le lien reçu par email sur ce téléphone.");
  }

  return (
    <main className="pt-securite pb-securite mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-6">
      <Link href="/reglages" className="self-start py-2 text-sm text-texte-2 hover:text-texte">
        ← Retour
      </Link>
      <h1 className="mt-8 text-3xl font-bold">{mode === "connexion" ? "Se connecter" : "Créer un compte"}</h1>
      <p className="mt-2 text-texte-2">Pour sauvegarder ton parcours et gérer ton abonnement.</p>

      {!sb ? (
        <p className="mt-8 text-sm text-texte-2">Les comptes ne sont pas disponibles pour le moment.</p>
      ) : message ? (
        <div className="mt-8 rounded-2xl border border-vert/40 bg-vert/10 p-5 text-sm">{message}</div>
      ) : (
        <form onSubmit={soumettre} className="mt-8 space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="ton@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-bord bg-surface p-4 text-base outline-none focus:border-ambre"
            aria-label="Adresse email"
          />
          <input
            type="password"
            autoComplete={mode === "connexion" ? "current-password" : "new-password"}
            minLength={mode === "inscription" ? 8 : undefined}
            placeholder={mode === "connexion" ? "Mot de passe" : "Mot de passe (8 caractères minimum)"}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full rounded-2xl border border-bord bg-surface p-4 text-base outline-none focus:border-ambre"
            aria-label="Mot de passe"
          />
          {erreur && <p className="text-sm text-ambre">{erreur}</p>}
          {mode === "inscription" && <CaseConsentement coche={consentement} onChange={setConsentement} />}
          <Bouton
            type="submit"
            disabled={envoi || !email || !motDePasse || (mode === "inscription" && !consentement)}
            className="w-full"
          >
            {mode === "connexion" ? "Se connecter" : "Créer mon compte"}
          </Bouton>
          <Bouton
            type="button"
            variante="surface"
            disabled={envoi || (mode === "inscription" && !consentement)}
            onClick={lienMagique}
            className="w-full"
          >
            Recevoir un lien magique
          </Bouton>
          <Bouton
            type="button"
            variante="discret"
            onClick={() => {
              setMode((m) => (m === "connexion" ? "inscription" : "connexion"));
              setErreur(null);
            }}
            className="w-full"
          >
            {mode === "connexion" ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
          </Bouton>
        </form>
      )}
    </main>
  );
}
