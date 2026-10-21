"use client";

// ONBOARDING — 6 étapes, une question par écran, barre de progression en haut.
// Les réponses sont enregistrées localement dès la fin de l'étape 5 :
// la création du compte (étape 6) peut se faire plus tard, même hors ligne.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SelecteurNombre } from "@/components/SelecteurNombre";
import { Bouton, Chargement, Puce } from "@/components/ui";
import { creerProfil } from "@/lib/actions";
import { DECLENCHEURS, MENTION_LEGALE, RAISONS } from "@/lib/constants";
import { useEtat } from "@/lib/store";
import { supabaseNavigateur } from "@/lib/supabase/client";
import { traduireErreur } from "@/lib/erreurs";
import { dateLocaleISO } from "@/lib/temps";

const NB_ETAPES = 6;

/** Durée de consommation maximale proposée (affichée « 70 ans et plus »). */
const ANNEES_MAX = 70;

/** Ajoute ou retire une valeur d'une liste (puces multiples). */
function basculer(liste: string[], valeur: string) {
  return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
}

export default function Onboarding() {
  const etat = useEtat();
  const router = useRouter();
  const [etape, setEtape] = useState(1);

  // Réponses
  const [annees, setAnnees] = useState(3);
  const [depense, setDepense] = useState("");
  const [joints, setJoints] = useState<number | null>(3);
  const [raisons, setRaisons] = useState<string[]>([]);
  const [raisonsTexte, setRaisonsTexte] = useState("");
  const [declencheurs, setDeclencheurs] = useState<string[]>([]);
  const [date, setDate] = useState(() => dateLocaleISO());

  // Profil déjà créé (retour sur la page) : direction l'accueil,
  // sauf si l'on est en train de finir l'étape du compte.
  const dejaInscrit = etat?.profil && etape < NB_ETAPES;
  useEffect(() => {
    if (dejaInscrit) router.replace("/");
  }, [dejaInscrit, router]);

  if (!etat || dejaInscrit) return <Chargement />;

  const depenseNombre = Number(depense.replace(",", "."));
  const peutContinuer =
    (etape === 1) ||
    (etape === 2 && depense !== "" && Number.isFinite(depenseNombre) && depenseNombre >= 0) ||
    (etape === 3 && (raisons.length > 0 || raisonsTexte.trim().length > 0)) ||
    (etape === 4 && declencheurs.length > 0) ||
    (etape === 5 && date !== "" && date <= dateLocaleISO());

  function suivant() {
    // Passage à l'étape suivante avant la création du profil, pour ne pas
    // être redirigé vers l'accueil avant l'étape du compte.
    setEtape((e) => Math.min(NB_ETAPES, e + 1));
    if (etape === 5) {
      // Aujourd'hui : le compteur part de maintenant. Date passée : de minuit ce jour-là.
      const aujourdhui = date === dateLocaleISO();
      const [a, m, j] = date.split("-").map(Number);
      const depart = aujourdhui ? new Date() : new Date(a, m - 1, j);
      creerProfil({
        anneesConso: annees,
        depenseHebdo: Math.round(depenseNombre * 100) / 100,
        jointsParJour: joints,
        raisons,
        raisonsTexte: raisonsTexte.trim(),
        declencheurs,
        dateDepart: depart.toISOString(),
      });
    }
  }

  return (
    <main className="pt-securite pb-securite mx-auto flex min-h-dvh max-w-lg flex-col px-5">
      {/* Barre de progression */}
      <div className="pt-5">
        <div className="flex items-center justify-between text-xs text-texte-2">
          {etape > 1 && etape < NB_ETAPES ? (
            <button type="button" onClick={() => setEtape((e) => e - 1)} className="py-2 pr-4 hover:text-texte">
              ← Retour
            </button>
          ) : (
            <span className="py-2 font-semibold tracking-[0.3em]">LUCIDE</span>
          )}
          <span className="chiffres">
            {etape} / {NB_ETAPES}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={NB_ETAPES}
          aria-valuenow={etape}
        >
          <div className="h-full rounded-full bg-ambre transition-all duration-500" style={{ width: `${(etape / NB_ETAPES) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-10">
        {etape === 1 && (
          <Etape titre="Depuis combien de temps consommes-tu ?" aide="Une estimation suffit.">
            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label="Une année de moins"
                onClick={() => setAnnees((a) => Math.max(0, a - 1))}
                className="h-14 w-14 rounded-2xl bg-surface text-2xl font-bold hover:bg-surface-2"
              >
                −
              </button>
              <div className="min-w-32 text-center">
                <p className="chiffres text-7xl font-bold">{annees === 0 ? "<1" : annees}</p>
                <p className="mt-1 text-texte-2">{annees === 0 ? "an" : annees >= ANNEES_MAX ? "ans et plus" : annees === 1 ? "an" : "ans"}</p>
              </div>
              <button
                type="button"
                aria-label="Une année de plus"
                onClick={() => setAnnees((a) => Math.min(ANNEES_MAX, a + 1))}
                className="h-14 w-14 rounded-2xl bg-surface text-2xl font-bold hover:bg-surface-2"
              >
                +
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={ANNEES_MAX}
              value={annees}
              onChange={(e) => setAnnees(Number(e.target.value))}
              aria-label="Nombre d'années"
              className="mt-10 w-full accent-[#F5A524]"
            />
            <div className="mt-2 flex justify-between text-xs text-texte-2">
              <span>Moins d&apos;un an</span>
              <span>{ANNEES_MAX} ans et plus</span>
            </div>
          </Etape>
        )}

        {etape === 2 && (
          <Etape titre="Combien dépenses-tu par semaine ?" aide="Pour calculer l'argent que tu vas garder.">
            <label className="mt-10 flex items-center rounded-2xl border border-bord bg-surface px-5 focus-within:border-ambre">
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0"
                value={depense}
                onChange={(e) => setDepense(e.target.value.replace(/[^\d.,]/g, ""))}
                className="chiffres w-full bg-transparent py-5 text-5xl font-bold outline-none placeholder:text-bord"
                aria-label="Dépense par semaine en euros"
              />
              <span className="text-3xl font-bold text-texte-2">€</span>
            </label>
            <p className="mt-3 text-sm text-texte-2">par semaine</p>

            {/* Facultatif : sert à estimer les joints non fumés et le temps regagné */}
            <div className="mt-10 rounded-2xl bg-surface p-5">
              <p className="font-semibold">Et combien de joints par jour, environ ?</p>
              {joints !== null ? (
                <>
                  <div className="mt-4">
                    <SelecteurNombre libelle="Joints par jour" valeur={joints} onChange={setJoints} unite="par jour" />
                  </div>
                  <button type="button" onClick={() => setJoints(null)} className="mt-4 text-sm text-texte-2 hover:text-texte">
                    Je préfère ne pas répondre
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setJoints(3)} className="mt-3 text-sm text-ambre">
                  Répondre finalement
                </button>
              )}
            </div>
          </Etape>
        )}

        {etape === 3 && (
          <Etape titre="Pourquoi tu veux arrêter ?" aide="Ces raisons s'afficheront en grand quand une envie arrivera.">
            <div className="mt-6 flex flex-wrap gap-2">
              {RAISONS.map((r) => (
                <Puce key={r} actif={raisons.includes(r)} onClick={() => setRaisons((l) => basculer(l, r))}>
                  {r}
                </Puce>
              ))}
            </div>
            <textarea
              value={raisonsTexte}
              onChange={(e) => setRaisonsTexte(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Avec tes mots à toi… (facultatif)"
              className="mt-5 w-full resize-none rounded-2xl border border-bord bg-surface p-4 text-base outline-none placeholder:text-texte-2/60 focus:border-ambre"
            />
          </Etape>
        )}

        {etape === 4 && (
          <Etape titre="Qu'est-ce qui déclenche tes consommations ?" aide="Plusieurs choix possibles.">
            <div className="mt-6 flex flex-wrap gap-2">
              {DECLENCHEURS.map((d) => (
                <Puce key={d} grande actif={declencheurs.includes(d)} onClick={() => setDeclencheurs((l) => basculer(l, d))}>
                  {d}
                </Puce>
              ))}
            </div>
          </Etape>
        )}

        {etape === 5 && (
          <Etape titre="Quelle est ta date de départ ?" aide="Aujourd'hui, ou le jour où tu as déjà arrêté.">
            <input
              type="date"
              value={date}
              max={dateLocaleISO()}
              onChange={(e) => setDate(e.target.value)}
              className="mt-10 w-full rounded-2xl border border-bord bg-surface p-5 text-xl font-semibold text-texte outline-none [color-scheme:dark] focus:border-ambre"
              aria-label="Date de départ"
            />
            {date !== dateLocaleISO() && (
              <button type="button" onClick={() => setDate(dateLocaleISO())} className="mt-3 text-sm text-ambre">
                Revenir à aujourd&apos;hui
              </button>
            )}
          </Etape>
        )}

        {etape === 6 && <EtapeCompte />}

        {etape < NB_ETAPES && (
          <div className="mt-auto pt-8 pb-6">
            <Bouton onClick={suivant} disabled={!peutContinuer} className="w-full">
              {etape === 5 ? "Lancer mon compteur" : "Continuer"}
            </Bouton>
          </div>
        )}
      </div>
    </main>
  );
}

function Etape({ titre, aide, children }: { titre: string; aide?: string; children: React.ReactNode }) {
  return (
    <section>
      <h1 className="text-3xl leading-tight font-bold tracking-tight">{titre}</h1>
      {aide && <p className="mt-2 text-texte-2">{aide}</p>}
      {children}
    </section>
  );
}

/** Étape 6 : création du compte Supabase (mot de passe) ou lien magique. */
function EtapeCompte() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const sb = supabaseNavigateur();
  const redirection = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  async function creerCompte(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    setEnvoi(true);
    setErreur(null);
    const { data, error } = await sb.auth.signUp({
      email,
      password: motDePasse,
      options: { emailRedirectTo: redirection },
    });
    setEnvoi(false);
    if (error) return setErreur(traduireErreur(error.message));
    if (data.session) router.replace("/offre");
    else setMessage("Vérifie ta boîte mail pour confirmer ton adresse. Ton compteur tourne déjà.");
  }

  async function lienMagique() {
    if (!sb || !email) return setErreur("Indique ton adresse email.");
    setEnvoi(true);
    setErreur(null);
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirection } });
    setEnvoi(false);
    if (error) return setErreur(traduireErreur(error.message));
    setMessage("C'est envoyé. Ouvre le lien reçu par email sur ce téléphone.");
  }

  return (
    <section className="flex flex-1 flex-col">
      <h1 className="text-3xl leading-tight font-bold tracking-tight">Ton compteur est lancé.</h1>
      <p className="mt-2 text-texte-2">
        Crée ton compte pour retrouver tes données sur tous tes appareils.
      </p>

      {message ? (
        <div className="mt-8 rounded-2xl border border-vert/40 bg-vert/10 p-5 text-sm">{message}</div>
      ) : sb ? (
        <form onSubmit={creerCompte} className="mt-8 space-y-3">
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
            autoComplete="new-password"
            minLength={8}
            placeholder="Mot de passe (8 caractères minimum)"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full rounded-2xl border border-bord bg-surface p-4 text-base outline-none focus:border-ambre"
            aria-label="Mot de passe"
          />
          {erreur && <p className="text-sm text-ambre">{erreur}</p>}
          <Bouton type="submit" disabled={envoi || !email || motDePasse.length < 8} className="w-full">
            Créer mon compte
          </Bouton>
          <Bouton type="button" variante="surface" disabled={envoi} onClick={lienMagique} className="w-full">
            Recevoir un lien magique
          </Bouton>
        </form>
      ) : (
        <p className="mt-8 text-sm text-texte-2">La création de compte n&apos;est pas disponible pour le moment.</p>
      )}

      <div className="mt-auto pt-8 pb-6 text-center">
        <Bouton variante={message ? "ambre" : "discret"} onClick={() => router.replace("/offre")} className="w-full">
          {message ? "Aller à mon compteur" : "Plus tard, aller à mon compteur"}
        </Bouton>
        <p className="mt-4 text-xs text-texte-2">{MENTION_LEGALE}</p>
      </div>
    </section>
  );
}
