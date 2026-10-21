"use client";

// MODE ENVIE — séquence enchaînée, entièrement hors ligne :
//   a) minuteur de 10 minutes (démarre tout seul, reste visible ensuite)
//   b) respiration 4-7-8
//   c) raisons personnelles en très grand (+ rappels du Mode Foi)
//   d) rappel des jours tenus
//   (+) « Remplacer pour acquérir » : une activité qui a de la valeur
//   e) journal rapide en 4 taps
//   → écran final « Tu as tenu ».
// Version gratuite : 3 utilisations par semaine.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlocAide } from "@/components/BlocAide";
import { Respiration } from "@/components/Respiration";
import { Bouton, Chargement, LienBouton, Puce } from "@/components/ui";
import { demarrerEnvie, memoriserEtapeEnvie, modifierEnvie, quitterEnvie, terminerEnvie } from "@/lib/actions";
import {
  CATEGORIES_ACTIVITES,
  DECLENCHEURS,
  DUREE_ENVIE_SECONDES,
  EMOTIONS,
  LIEUX,
  LIMITE_ENVIES_GRATUIT,
  TARIFS,
  TEXTE_ALCOOL,
  type Activite,
  type CategorieActivite,
} from "@/lib/constants";
import { useEtatAvecProfil, useMaintenant } from "@/lib/hooks";
import { alerteSecurite, enviesRestantes, enviesTenuesCeMois } from "@/lib/stats";
import { lireEtat } from "@/lib/store";
import { deuxChiffres, joursDepuis, MS, ordinalFeminin, pluriel } from "@/lib/temps";

type Etape = "minuteur" | "respiration" | "raisons" | "rappel" | "remplacer" | "journal" | "fin" | "limite";

export default function ModeEnvie() {
  const etat = useEtatAvecProfil();
  const router = useRouter();
  const [etape, setEtape] = useState<Etape | null>(null);
  const [session, setSession] = useState<{ envieId: string; debut: string } | null>(null);
  const initialise = useRef(false);

  // Démarrage (ou reprise) de la session, une seule fois.
  useEffect(() => {
    if (!etat || initialise.current) return;
    initialise.current = true;
    const s = etat.sessionEnvie;
    const sessionActive = s !== null && Date.now() - new Date(s.debut).getTime() < 30 * MS.minute;
    if (!sessionActive && enviesRestantes(etat) <= 0) {
      setEtape("limite");
      return;
    }
    setSession(demarrerEnvie());
    // « sport » : nom de l'étape « remplacer » dans les versions précédentes.
    setEtape(sessionActive ? ((s.etape === "sport" ? "remplacer" : s.etape) as Etape) : "minuteur");
  }, [etat]);

  const aller = useCallback((suivante: Etape) => {
    setEtape(suivante);
    if (suivante !== "fin") memoriserEtapeEnvie(suivante);
    window.scrollTo({ top: 0 });
  }, []);

  if (!etat || !etape) return <Chargement />;
  const { profil } = etat;

  function quitter() {
    if (etape !== "fin" && etape !== "limite") quitterEnvie();
    router.replace("/");
  }

  const ordre: Etape[] = ["minuteur", "respiration", "raisons", "rappel", "remplacer", "journal"];
  const suivante = (e: Etape) => ordre[Math.min(ordre.indexOf(e) + 1, ordre.length - 1)];

  return (
    <main className="pt-securite pb-securite mx-auto flex min-h-dvh max-w-lg flex-col px-5">
      <header className="flex items-center justify-between py-4">
        {session && etape !== "fin" ? <MiniMinuteur debut={session.debut} /> : <span />}
        <button type="button" onClick={quitter} className="rounded-2xl px-3 py-2 text-sm text-texte-2 hover:text-texte">
          {etape === "fin" || etape === "limite" ? "Fermer" : "Quitter"}
        </button>
      </header>

      <div className="flex flex-1 flex-col pb-6">
        {etape === "limite" && <EcranLimite />}

        {etape === "minuteur" && session && (
          <EtapeMinuteur debut={session.debut} onSuivant={() => aller(suivante("minuteur"))} />
        )}

        {etape === "respiration" && (
          <section className="flex flex-1 flex-col">
            <h1 className="text-center text-2xl font-bold">Respire avec le cercle</h1>
            <p className="mt-2 text-center text-texte-2">4 secondes, 7 secondes, 8 secondes.</p>
            <div className="mt-10 flex justify-center">
              <Respiration />
            </div>
            <div className="mt-auto pt-8">
              <Bouton onClick={() => aller(suivante("respiration"))} className="w-full">
                Continuer
              </Bouton>
            </div>
          </section>
        )}

        {etape === "raisons" && (
          <EtapeRaisons
            raisons={[
              ...profil.raisons,
              ...(profil.raisonsTexte ? [profil.raisonsTexte] : []),
              ...(profil.modeFoi ? profil.rappelsFoi : []),
            ]}
            onSuivant={() => aller(suivante("raisons"))}
          />
        )}

        {etape === "rappel" && (
          <section className="flex flex-1 flex-col justify-center text-center">
            <p className="text-4xl leading-tight font-bold">
              Tu es à <span className="chiffres text-ambre">{pluriel(joursDepuis(profil.dateDepart), "jour")}</span>.
            </p>
            <p className="mt-6 text-2xl leading-snug text-texte-2">
              Tu les perds dans 10 minutes, ou tu les gardes.
            </p>
            <div className="mt-auto pt-10">
              <Bouton variante="vert" onClick={() => aller(suivante("rappel"))} className="w-full text-lg">
                Je les garde
              </Bouton>
            </div>
          </section>
        )}

        {etape === "remplacer" && session && (
          <EtapeRemplacer
            modeSport={profil.modeSport}
            modeFoi={profil.modeFoi}
            onFait={(activite, type) => {
              modifierEnvie(session.envieId, { activite, typeActivite: type });
              aller("journal");
            }}
            onPasser={() => aller("journal")}
          />
        )}

        {etape === "journal" && session && (
          <JournalRapide
            envieId={session.envieId}
            onTermine={() => {
              terminerEnvie(session.envieId);
              aller("fin");
            }}
          />
        )}

        {etape === "fin" && session && <EcranFinal envieId={session.envieId} />}
      </div>
    </main>
  );
}

/** Minuteur discret en haut de l'écran, visible pendant toute la séquence. */
function MiniMinuteur({ debut }: { debut: string }) {
  const maintenant = useMaintenant(1000);
  const restant = Math.max(0, DUREE_ENVIE_SECONDES - Math.floor((maintenant - new Date(debut).getTime()) / 1000));
  return (
    <span className="chiffres rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-ambre">
      {restant > 0 ? `${deuxChiffres(Math.floor(restant / 60))}:${deuxChiffres(restant % 60)}` : "10 min passées"}
    </span>
  );
}

/** a) Minuteur de 10 minutes, démarré automatiquement. */
function EtapeMinuteur({ debut, onSuivant }: { debut: string; onSuivant: () => void }) {
  const maintenant = useMaintenant(250);
  const ecoule = Math.min(DUREE_ENVIE_SECONDES, (maintenant - new Date(debut).getTime()) / 1000);
  const restant = Math.max(0, Math.ceil(DUREE_ENVIE_SECONDES - ecoule));
  const rayon = 120;
  const circonference = 2 * Math.PI * rayon;

  return (
    <section className="flex flex-1 flex-col items-center text-center">
      <div className="relative mt-4 h-72 w-72">
        <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="140" cy="140" r={rayon} fill="none" stroke="#18181B" strokeWidth="14" />
          <circle
            cx="140"
            cy="140"
            r={rayon}
            fill="none"
            stroke="#F5A524"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circonference}
            strokeDashoffset={circonference * (ecoule / DUREE_ENVIE_SECONDES)}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" role="timer">
          <span className="chiffres text-6xl font-bold">
            {deuxChiffres(Math.floor(restant / 60))}:{deuxChiffres(restant % 60)}
          </span>
        </div>
      </div>
      <p className="mt-8 text-2xl leading-snug font-semibold">
        Une envie dure rarement plus de 10 minutes. Reste avec moi.
      </p>
      <p className="mt-4 leading-relaxed text-texte-2">
        Une envie, c&apos;est une vague&nbsp;: elle monte, elle atteint un sommet, puis elle redescend. Chaque
        minute que tu tiens, c&apos;est du chemin parcouru.
      </p>
      <div className="mt-auto w-full pt-10">
        <Bouton onClick={onSuivant} className="w-full">
          Respirer avec moi
        </Bouton>
      </div>
    </section>
  );
}

/** c) Raisons personnelles, une par écran, en très grand. */
function EtapeRaisons({ raisons, onSuivant }: { raisons: string[]; onSuivant: () => void }) {
  const [index, setIndex] = useState(0);
  const liste = raisons.length ? raisons : ["Tu as choisi d'arrêter. Ce choix t'appartient."];
  const derniere = index >= liste.length - 1;

  return (
    <section className="flex flex-1 flex-col">
      <p className="text-center text-sm text-texte-2">Pourquoi tu fais ça</p>
      <button
        type="button"
        onClick={() => (derniere ? onSuivant() : setIndex((i) => i + 1))}
        className="flex flex-1 items-center justify-center py-8 text-center"
      >
        <span key={index} className="text-5xl leading-tight font-bold tracking-tight break-words text-texte">
          {liste[index]}
        </span>
      </button>
      <div className="mb-6 flex justify-center gap-2" aria-hidden>
        {liste.map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i === index ? "bg-ambre" : "bg-bord"}`} />
        ))}
      </div>
      <Bouton onClick={() => (derniere ? onSuivant() : setIndex((i) => i + 1))} className="w-full">
        {derniere ? "Continuer" : "Raison suivante"}
      </Bouton>
    </section>
  );
}

/**
 * « Remplacer pour acquérir » : au lieu de rester face à l'envie, on va vers
 * une activité qui a de la valeur. Le Mode Sport met le sport en avant,
 * la catégorie foi n'apparaît que si le Mode Foi est actif.
 */
function EtapeRemplacer({
  modeSport,
  modeFoi,
  onFait,
  onPasser,
}: {
  modeSport: boolean;
  modeFoi: boolean;
  onFait: (activite: string, type: CategorieActivite) => void;
  onPasser: () => void;
}) {
  const [choix, setChoix] = useState<{ activite: Activite; type: CategorieActivite } | null>(null);
  const categories = CATEGORIES_ACTIVITES.filter((c) => c.id !== "foi" || modeFoi);

  if (choix) {
    return (
      <section className="flex flex-1 flex-col text-center">
        <p className="text-sm text-texte-2">C&apos;est parti</p>
        <h1 className="mt-4 text-4xl font-bold">{choix.activite.titre}</h1>
        <p className="mt-3 text-texte-2">{choix.activite.detail}</p>
        <p className="mt-8 text-lg">
          Une fois que c&apos;est fait, tu seras content que ce soit fait. Reviens ici quand tu as terminé.
        </p>
        <div className="mt-auto space-y-3 pt-10">
          <Bouton variante="vert" onClick={() => onFait(choix.activite.titre, choix.type)} className="w-full">
            C&apos;est fait
          </Bouton>
          <Bouton variante="discret" onClick={() => setChoix(null)} className="w-full">
            Choisir autre chose
          </Bouton>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <h1 className="text-3xl leading-tight font-bold">L&apos;envie, c&apos;est le canapé devant lequel tu passes.</h1>
      <p className="mt-3 text-texte-2">
        Ne t&apos;assois pas. Va vers quelque chose qui a de la valeur&nbsp;: tu ne remplis pas un vide, tu gagnes
        quelque chose.
      </p>
      <div className="mt-6 space-y-6">
        {categories.map((c) => (
          <div key={c.id}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-texte-2">
              {c.titre}
              {c.id === "sport" && modeSport && (
                <span className="rounded-full bg-vert/15 px-2 py-0.5 text-[11px] text-vert">Mode Sport</span>
              )}
            </h2>
            <div className="space-y-2">
              {c.activites.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setChoix({ activite: a, type: c.id })}
                  className="w-full rounded-2xl border border-bord bg-surface p-4 text-left transition hover:border-vert"
                >
                  <span className="block font-semibold">{a.titre}</span>
                  <span className="mt-0.5 block text-sm text-texte-2">{a.detail}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-8">
        <Bouton variante="discret" onClick={onPasser} className="w-full">
          Pas maintenant
        </Bouton>
      </div>
    </section>
  );
}

/** e) Journal rapide : 4 taps, aucune saisie clavier. */
function JournalRapide({ envieId, onTermine }: { envieId: string; onTermine: () => void }) {
  const [question, setQuestion] = useState(0);

  const questions: { titre: string; options: readonly string[]; champ: "declencheur" | "lieu" | "emotion" }[] = [
    { titre: "Qu'est-ce qui l'a déclenchée ?", options: [...DECLENCHEURS, "Autre"], champ: "declencheur" },
    { titre: "Où étais-tu ?", options: LIEUX, champ: "lieu" },
    { titre: "Comment tu te sentais ?", options: EMOTIONS, champ: "emotion" },
  ];

  function repondre(changes: Parameters<typeof modifierEnvie>[1]) {
    modifierEnvie(envieId, changes);
    if (question >= 3) onTermine();
    else setQuestion((q) => q + 1);
  }

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex gap-1.5" aria-label={`Question ${question + 1} sur 4`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= question ? "bg-ambre" : "bg-surface"}`} />
        ))}
      </div>

      {question === 0 ? (
        <>
          <h1 className="mt-8 text-3xl font-bold">Elle était forte comment ?</h1>
          <p className="mt-2 text-texte-2">De 1 (légère) à 10 (très forte)</p>
          <div className="mt-8 grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => repondre({ intensite: n })}
                className="chiffres aspect-square rounded-2xl bg-surface text-2xl font-bold transition hover:bg-ambre hover:text-fond active:scale-95"
                style={{ boxShadow: `inset 0 -4px 0 rgba(245,165,36,${0.08 + n * 0.07})` }}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-8 text-3xl font-bold">{questions[question - 1].titre}</h1>
          <div className="mt-8 flex flex-wrap gap-2">
            {questions[question - 1].options.map((o) => (
              <Puce key={o} grande actif={false} onClick={() => repondre({ [questions[question - 1].champ]: o })}>
                {o}
              </Puce>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/** Écran final, avec le bloc d'aide si la règle de sécurité se déclenche. */
function EcranFinal({ envieId }: { envieId: string }) {
  // Lecture ponctuelle : l'envie vient d'être marquée comme tenue.
  const [etat] = useState(() => lireEtat());
  const fois = enviesTenuesCeMois(etat.envies);
  const alerte = alerteSecurite(etat.envies);
  const envie = etat.envies.find((e) => e.id === envieId);

  return (
    <section className="flex flex-1 flex-col text-center">
      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-vert/15">
          <div className="h-8 w-8 rounded-full bg-vert" />
        </div>
        <h1 className="mt-8 text-5xl font-bold">Tu as tenu.</h1>
        <p className="mt-4 text-xl text-texte-2">
          C&apos;est la <span className="chiffres font-semibold text-texte">{ordinalFeminin(fois)}</span> fois ce mois-ci.
        </p>
        {envie?.activite && (
          <p className="mt-4 text-texte-2">
            Et tu l&apos;as transformée&nbsp;: <span className="text-vert">{envie.activite.toLowerCase()}</span>.
          </p>
        )}
        <p className="mt-6 max-w-xs text-sm text-texte-2">
          Chaque envie traversée rend ton mental plus fort, marche après marche.
        </p>
      </div>
      {envie?.declencheur === "Alcool" && (
        <div className="mb-6 rounded-2xl border border-ambre/40 bg-ambre/10 p-5 text-left">
          <h2 className="font-semibold">Un mot sur l&apos;alcool</h2>
          <p className="mt-2 text-sm leading-relaxed text-texte-2">{TEXTE_ALCOOL}</p>
        </div>
      )}
      {alerte && (
        <div className="mb-6 text-left">
          <BlocAide titre="Tes envies sont très fortes en ce moment. Parler à quelqu'un peut aider." accent />
        </div>
      )}
      <LienBouton href="/" className="w-full">
        Retour à l&apos;accueil
      </LienBouton>
    </section>
  );
}

/** Limite hebdomadaire atteinte en version gratuite. */
function EcranLimite() {
  return (
    <section className="flex flex-1 flex-col">
      <h1 className="text-3xl leading-tight font-bold">
        Tu as utilisé tes {LIMITE_ENVIES_GRATUIT} Modes Envie gratuits cette semaine.
      </h1>
      <p className="mt-3 text-texte-2">Ils reviennent lundi. En attendant, l&apos;envie va passer :</p>
      <ul className="mt-5 space-y-2 text-lg">
        <li className="rounded-2xl bg-surface p-4">Bois un grand verre d&apos;eau.</li>
        <li className="rounded-2xl bg-surface p-4">Sors marcher 10 minutes.</li>
        <li className="rounded-2xl bg-surface p-4">Inspire 4 secondes, retiens 7, expire 8.</li>
      </ul>
      <Link
        href="/reglages#abonnement"
        className="mt-6 flex min-h-14 items-center justify-center rounded-2xl bg-ambre px-5 text-base font-semibold text-fond"
      >
        Mode Envie illimité — {TARIFS.essaiJours} jours gratuits
      </Link>
      <div className="mt-6">
        <BlocAide />
      </div>
    </section>
  );
}
