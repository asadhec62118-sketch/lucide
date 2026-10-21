"use client";

// RÉGLAGES — compte, abonnement Stripe, repères, Mode Foi, Mode Sport, partage,
// bloc d'aide permanent et bouton discret « J'ai consommé ».

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { BlocAide } from "@/components/BlocAide";
import { ChoixFormules, usePaiement } from "@/components/Offre";
import { ReglageRappels } from "@/components/Rappels";
import { SelecteurNombre } from "@/components/SelecteurNombre";
import { Bouton, Carte, Chargement, Interrupteur, LienBouton, TitrePage } from "@/components/ui";
import { enregistrerReprise, modifierProfil } from "@/lib/actions";
import { SUGGESTIONS_FOI, TARIFS } from "@/lib/constants";
import { useEtatAvecProfil } from "@/lib/hooks";
import { estAbonne } from "@/lib/stats";
import { modifierEtat, type Etat, type Profil } from "@/lib/store";
import { supabaseNavigateur } from "@/lib/supabase/client";
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

        <ReglageRappels />

        <BlocReperes profil={profil} />

        {/* Mode Foi */}
        <Carte>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Mode Foi</h2>
              <p className="mt-1 text-sm text-texte-2">
                Tes propres rappels, affichés en grand pendant les envies. Ta foi, ou ce qui est plus grand que
                toi&nbsp;: ta famille, ceux que tu aides.
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
                Pendant une envie, le sport passe en premier&nbsp;: 20 pompes, 5 minutes de corde à sauter ou
                10 minutes de marche. L&apos;accueil compte les envies transformées en séances.
              </p>
            </div>
            <Interrupteur libelle="Activer le Mode Sport" actif={profil.modeSport} onChange={(v) => modifierProfil({ modeSport: v })} />
          </div>
        </Carte>

        <BlocPartage />

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
  const { chargement, erreur, sAbonner, gerer } = usePaiement("/reglages#abonnement");
  const abonne = estAbonne(etat);

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
          <Bouton variante="surface" onClick={gerer} disabled={!!chargement} className="mt-4 w-full">
            {chargement ? "Ouverture…" : "Gérer mon abonnement"}
          </Bouton>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-texte-2">
            Le programme complet de 30 jours, le Mode Envie illimité, le parcours jusqu&apos;à J90, tes bilans et tes
            schémas personnels.
          </p>
          {statut !== "free" && libelleStatut[statut] && (
            <p className="mt-2 text-xs text-ambre">{libelleStatut[statut]}</p>
          )}
          <div className="mt-4">
            <ChoixFormules onChoisir={sAbonner} desactive={!!chargement} />
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

  const suggestions = SUGGESTIONS_FOI.filter((x) => !rappels.includes(x));

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
      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-texte-2">Des idées, si tu veux (touche pour ajouter)&nbsp;:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => onChange([...rappels, x])}
                className="rounded-2xl border border-bord px-3 py-2 text-left text-xs text-texte-2 transition hover:border-ambre hover:text-texte"
              >
                + {x}
              </button>
            ))}
          </div>
        </div>
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

/** Repères de l'onboarding, modifiables : dépense par semaine et joints par jour. */
function BlocReperes({ profil }: { profil: Profil }) {
  const [depense, setDepense] = useState(String(profil.depenseHebdo).replace(".", ","));

  function enregistrerDepense() {
    const n = Number(depense.replace(",", "."));
    if (Number.isFinite(n) && n >= 0) modifierProfil({ depenseHebdo: Math.round(n * 100) / 100 });
    else setDepense(String(profil.depenseHebdo).replace(".", ","));
  }

  return (
    <section id="reperes" className="scroll-mt-6 rounded-2xl bg-surface p-5">
      <h2 className="text-base font-semibold">Tes repères</h2>
      <p className="mt-1 text-sm text-texte-2">Ils servent à calculer ce que tu as regagné.</p>

      <label className="mt-4 block text-sm text-texte-2" htmlFor="depense">
        Dépense par semaine avant l&apos;arrêt
      </label>
      <div className="mt-2 flex items-center rounded-2xl border border-bord bg-surface-2 px-4 focus-within:border-ambre">
        <input
          id="depense"
          type="text"
          inputMode="decimal"
          value={depense}
          onChange={(e) => setDepense(e.target.value.replace(/[^\d.,]/g, ""))}
          onBlur={enregistrerDepense}
          className="chiffres w-full bg-transparent py-3 text-lg font-semibold outline-none"
        />
        <span className="text-texte-2">€</span>
      </div>

      <p className="mt-5 text-sm text-texte-2">Joints par jour avant l&apos;arrêt</p>
      {profil.jointsParJour !== null ? (
        <div className="mt-2">
          <SelecteurNombre
            libelle="Joints par jour"
            valeur={profil.jointsParJour}
            onChange={(v) => modifierProfil({ jointsParJour: v })}
            unite="par jour"
          />
        </div>
      ) : (
        <button type="button" onClick={() => modifierProfil({ jointsParJour: 3 })} className="mt-2 text-sm text-ambre">
          Indiquer ce nombre
        </button>
      )}
    </section>
  );
}

/** Transmission (Jour 26) : partager LUCIDE discrètement, sans faire la leçon. */
function BlocPartage() {
  const [message, setMessage] = useState<string | null>(null);

  async function partager() {
    const url = window.location.origin;
    const texte = "Je sais ce que tu ressens. Moi, LUCIDE m'aide à arrêter le cannabis, jour après jour.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "LUCIDE", text: texte, url });
        return;
      }
      await navigator.clipboard.writeText(`${texte} ${url}`);
      setMessage("Lien copié. Tu peux le coller dans un message.");
    } catch {
      // Partage annulé par l'utilisateur : rien à faire.
    }
  }

  return (
    <Carte>
      <h2 className="text-base font-semibold">Aider quelqu&apos;un</h2>
      <p className="mt-1 text-sm text-texte-2">
        Tu connais quelqu&apos;un qui en a besoin&nbsp;? Pas de leçon, pas de morale&nbsp;: juste une main tendue.
      </p>
      <Bouton variante="surface" onClick={partager} className="mt-4 w-full">
        Partager LUCIDE
      </Bouton>
      {message && <p className="mt-2 text-center text-sm text-vert">{message}</p>}
    </Carte>
  );
}
