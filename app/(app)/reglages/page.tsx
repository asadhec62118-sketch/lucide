"use client";

// RÉGLAGES — compte, abonnement Stripe, Mode Foi, Mode Sport,
// bloc d'aide permanent et bouton discret « J'ai consommé ».

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { BlocAide } from "@/components/BlocAide";
import { Bouton, Carte, Chargement, Interrupteur, LienBouton, TitrePage } from "@/components/ui";
import { enregistrerReprise, modifierProfil } from "@/lib/actions";
import { TARIFS } from "@/lib/constants";
import { useEtatAvecProfil } from "@/lib/hooks";
import { estAbonne } from "@/lib/stats";
import { modifierEtat, type Etat } from "@/lib/store";
import { jetonAcces, supabaseNavigateur } from "@/lib/supabase/client";
import { synchroniser } from "@/lib/sync";

/** Session Supabase courante (null si non connecté ou Supabase non configuré). */
function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const sb = supabaseNavigateur();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export default function Reglages() {
  const etat = useEtatAvecProfil();
  const session = useSession();
  const router = useRouter();
  const [retourPaiement, setRetourPaiement] = useState<string | null>(null);

  // Retour de Stripe Checkout : message et rafraîchissement du statut.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("abonnement");
    if (!p) return;
    setRetourPaiement(p);
    window.history.replaceState(null, "", "/reglages");
    // Le webhook peut mettre quelques secondes : on resynchronise un peu plus tard aussi.
    void synchroniser();
    const t = setTimeout(() => void synchroniser(), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!etat) return <Chargement />;
  const { profil } = etat;

  return (
    <>
      <TitrePage>Réglages</TitrePage>

      <div className="space-y-4">
        <BlocCompte session={session} />

        <BlocAbonnement etat={etat} session={session} retour={retourPaiement} />

        {/* Mode Foi */}
        <Carte>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Mode Foi</h2>
              <p className="mt-1 text-sm text-texte-2">
                Tes propres rappels, affichés pendant les envies.
              </p>
            </div>
            <Interrupteur libelle="Activer le Mode Foi" actif={profil.modeFoi} onChange={(v) => modifierProfil({ modeFoi: v })} />
          </div>
          {profil.modeFoi && (
            <RappelsFoi rappels={profil.rappelsFoi} onChange={(rappelsFoi) => modifierProfil({ rappelsFoi })} />
          )}
        </Carte>

        {/* Mode Sport */}
        <Carte>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Mode Sport</h2>
              <p className="mt-1 text-sm text-texte-2">
                Pendant une envie, LUCIDE te propose une alternative physique : 20 pompes, 5 minutes de
                corde à sauter ou 10 minutes de marche.
              </p>
            </div>
            <Interrupteur libelle="Activer le Mode Sport" actif={profil.modeSport} onChange={(v) => modifierProfil({ modeSport: v })} />
          </div>
        </Carte>

        <BlocAide />

        {/* Reprise : volontairement discret. Au clic, le compteur repart de maintenant
            et les jours de la série sont ajoutés au cumul. */}
        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={() => {
              enregistrerReprise();
              router.push("/reprise");
            }}
            className="px-4 py-2 text-sm text-texte-2 underline-offset-4 hover:text-texte hover:underline"
          >
            J&apos;ai consommé
          </button>
        </div>
      </div>
    </>
  );
}

function BlocCompte({ session }: { session: Session | null }) {
  const sb = supabaseNavigateur();
  if (!sb) return null;

  async function deconnexion() {
    await sb?.auth.signOut();
    // Les données restent sur l'appareil ; on oublie seulement le lien au compte.
    modifierEtat((e) => ({ ...e, utilisateurId: null, email: null }));
  }

  return (
    <Carte>
      <h2 className="text-base font-semibold">Compte</h2>
      {session ? (
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="truncate text-sm text-texte-2">{session.user.email}</p>
          <Bouton variante="discret" onClick={deconnexion} className="min-h-10 px-0">
            Se déconnecter
          </Bouton>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-texte-2">
            Tes données sont enregistrées sur ce téléphone. Crée un compte pour les sauvegarder.
          </p>
          <LienBouton href="/connexion" variante="surface" className="mt-4 w-full">
            Se connecter ou créer un compte
          </LienBouton>
        </>
      )}
    </Carte>
  );
}

function BlocAbonnement({ etat, session, retour }: { etat: Etat; session: Session | null; retour: string | null }) {
  const [chargement, setChargement] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const abonne = estAbonne(etat);

  async function appeler(route: string, corps?: object) {
    setErreur(null);
    if (!navigator.onLine) return setErreur("Tu es hors ligne. Réessaie une fois connecté·e.");
    const jeton = await jetonAcces();
    if (!jeton) {
      window.location.href = "/connexion?suite=/reglages";
      return;
    }
    setChargement(route);
    try {
      const rep = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jeton}` },
        body: JSON.stringify(corps ?? {}),
      });
      const json = (await rep.json()) as { url?: string; erreur?: string };
      if (json.url) window.location.href = json.url;
      else setErreur(json.erreur ?? "Une erreur est survenue.");
    } catch {
      setErreur("Impossible de joindre le serveur.");
    } finally {
      setChargement(null);
    }
  }

  const statut = etat.abonnement.statut;
  const libelleStatut: Record<string, string> = {
    trialing: "Essai gratuit en cours",
    active: "Abonnement actif",
    past_due: "Paiement en attente",
    unpaid: "Paiement en attente",
    canceled: "Abonnement terminé",
  };
  const fin = etat.abonnement.finPeriode
    ? new Date(etat.abonnement.finPeriode).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <section id="abonnement" className="scroll-mt-6 rounded-2xl bg-surface p-5">
      <h2 className="text-base font-semibold">Abonnement</h2>

      {retour === "merci" && (
        <p className="mt-3 rounded-2xl bg-vert/10 p-3 text-sm text-vert">
          Merci ! Ton abonnement s&apos;active, cela peut prendre quelques secondes.
        </p>
      )}

      {abonne ? (
        <>
          <p className="mt-2 text-sm text-texte-2">
            {libelleStatut[statut] ?? statut}
            {etat.abonnement.formule && ` · formule ${etat.abonnement.formule}`}
            {fin && ` · jusqu'au ${fin}`}
          </p>
          <Bouton variante="surface" onClick={() => appeler("/api/stripe/portail")} disabled={!!chargement} className="mt-4 w-full">
            {chargement ? "Ouverture…" : "Gérer mon abonnement"}
          </Bouton>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-texte-2">
            Mode Envie illimité, parcours complet jusqu&apos;à J90 et tes schémas personnels.
          </p>
          {statut !== "free" && libelleStatut[statut] && (
            <p className="mt-2 text-xs text-ambre">{libelleStatut[statut]}</p>
          )}
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              disabled={!!chargement}
              onClick={() => appeler("/api/stripe/checkout", { formule: "annuel" })}
              className="relative rounded-2xl border-2 border-ambre bg-ambre/10 p-4 text-left transition hover:bg-ambre/15 disabled:opacity-50"
            >
              <span className="absolute -top-2.5 right-4 rounded-full bg-ambre px-2 py-0.5 text-[11px] font-bold text-fond">
                LE PLUS AVANTAGEUX
              </span>
              <span className="flex items-baseline justify-between">
                <span className="font-semibold">Annuel</span>
                <span className="chiffres text-lg font-bold">{TARIFS.annuel.montant}<span className="text-sm font-normal text-texte-2"> / an</span></span>
              </span>
              <span className="mt-1 block text-xs text-texte-2">{TARIFS.annuel.note}</span>
            </button>
            <button
              type="button"
              disabled={!!chargement}
              onClick={() => appeler("/api/stripe/checkout", { formule: "mensuel" })}
              className="rounded-2xl border border-bord bg-surface-2 p-4 text-left transition hover:border-texte-2/40 disabled:opacity-50"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-semibold">Mensuel</span>
                <span className="chiffres text-lg font-bold">{TARIFS.mensuel.montant}<span className="text-sm font-normal text-texte-2"> / mois</span></span>
              </span>
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-texte-2">
            {TARIFS.essaiJours} jours d&apos;essai gratuit, sans engagement. {!session && "Un compte est nécessaire."}
          </p>
          {chargement && <p className="mt-2 text-center text-sm text-texte-2">Ouverture du paiement…</p>}
        </>
      )}
      {erreur && <p className="mt-3 text-sm text-ambre">{erreur}</p>}
    </section>
  );
}

/** Éditeur des rappels du Mode Foi : l'utilisateur saisit lui-même ses textes. */
function RappelsFoi({ rappels, onChange }: { rappels: string[]; onChange: (r: string[]) => void }) {
  const [texte, setTexte] = useState("");

  function ajouter(e: React.FormEvent) {
    e.preventDefault();
    const t = texte.trim();
    if (!t) return;
    onChange([...rappels, t]);
    setTexte("");
  }

  return (
    <div className="mt-4">
      {rappels.length > 0 ? (
        <ul className="space-y-2">
          {rappels.map((r, i) => (
            <li key={`${i}-${r}`} className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3">
              <p className="flex-1 text-sm">{r}</p>
              <button
                type="button"
                onClick={() => onChange(rappels.filter((_, j) => j !== i))}
                className="text-xs text-texte-2 hover:text-texte"
                aria-label={`Retirer le rappel ${r}`}
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-texte-2">Ajoute une phrase, un verset, une intention qui te porte.</p>
      )}
      <form onSubmit={ajouter} className="mt-3 flex gap-2">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          maxLength={280}
          placeholder="Ton rappel…"
          className="min-w-0 flex-1 rounded-2xl border border-bord bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ambre"
          aria-label="Nouveau rappel"
        />
        <Bouton type="submit" variante="surface" disabled={!texte.trim()} className="min-h-11 px-4 text-sm">
          Ajouter
        </Bouton>
      </form>
    </div>
  );
}
