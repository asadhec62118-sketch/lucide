"use client";

// PROGRAMME — les 30 jours du livre, en version courte.
// Un jour s'ouvre chaque jour à partir de la date de départ. Les jours déjà
// atteints restent lisibles, même après une reprise. En version gratuite,
// les jours au-delà de J7 sont floutés avec une incitation à l'abonnement.

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconeCadenas, IconeCoche } from "@/components/Icones";
import { Chargement, TitrePage } from "@/components/ui";
import { Verrou } from "@/components/Verrou";
import { basculerActionProgramme, memoriserJourProgramme } from "@/lib/actions";
import { JOUR_LIMITE_PROGRAMME_GRATUIT } from "@/lib/constants";
import { useEtatAvecProfil } from "@/lib/hooks";
import { NB_JOURS_PROGRAMME, PILIERS, PROGRAMME, pilierDuJour, type JourProgramme } from "@/lib/programme";
import { estAbonne, jourDebloque, jourDuProgramme } from "@/lib/stats";
import { pluriel } from "@/lib/temps";

export default function Programme() {
  const etat = useEtatAvecProfil();
  const [choisi, setChoisi] = useState<number | null>(null);

  const aujourdhui = etat ? jourDuProgramme(etat) : 1;
  const debloque = etat ? jourDebloque(etat) : 1;

  // Mémorise l'avancement, et ouvre le jour demandé dans l'adresse (?jour=12) s'il est accessible.
  useEffect(() => {
    if (!etat) return;
    memoriserJourProgramme(aujourdhui);
    if (choisi !== null) return;
    const demande = Number(new URLSearchParams(window.location.search).get("jour"));
    setChoisi(demande >= 1 && demande <= debloque ? demande : aujourdhui);
  }, [etat, aujourdhui, debloque, choisi]);

  if (!etat || choisi === null) return <Chargement />;

  const abonne = estAbonne(etat);
  const jour = PROGRAMME[choisi - 1];
  const reserve = !abonne && choisi > JOUR_LIMITE_PROGRAMME_GRATUIT;
  const actionFaite = etat.programme.actionsFaites.includes(choisi);

  function ouvrir(n: number) {
    setChoisi(n);
    window.history.replaceState(null, "", `/programme?jour=${n}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <Link href="/parcours" className="mt-4 inline-block text-sm text-texte-2 hover:text-texte">
        ← Parcours
      </Link>
      <TitrePage sousTitre={`Semaine ${pilierDuJour(choisi).numero} · ${pilierDuJour(choisi).titre}`}>
        Ton programme 30 jours
      </TitrePage>

      <Verrou verrouille={reserve} message="Les jours 8 à 30 du programme sont réservés aux abonnés.">
        {/* Aperçu limité en hauteur, pour que l'incitation reste visible à l'écran */}
        <div className={reserve ? "max-h-96 overflow-hidden" : ""}>
          <FicheJour
            jour={jour}
            estAujourdhui={choisi === aujourdhui}
            actionFaite={actionFaite}
            onAction={() => basculerActionProgramme(choisi)}
          />
        </div>
      </Verrou>

      {/* Navigation entre les jours */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={choisi <= 1}
          onClick={() => ouvrir(choisi - 1)}
          className="min-h-12 rounded-2xl bg-surface text-sm font-medium transition hover:bg-surface-2 disabled:opacity-30"
        >
          ← Jour {choisi - 1 || ""}
        </button>
        <button
          type="button"
          disabled={choisi >= debloque}
          onClick={() => ouvrir(choisi + 1)}
          className="min-h-12 rounded-2xl bg-surface text-sm font-medium transition hover:bg-surface-2 disabled:opacity-30"
        >
          {choisi >= NB_JOURS_PROGRAMME ? "Fin du programme" : choisi >= debloque ? "Demain" : `Jour ${choisi + 1} →`}
        </button>
      </div>

      {/* Les 30 jours, par semaine */}
      <section className="mt-10 space-y-6" aria-label="Tous les jours du programme">
        {PILIERS.map((p) => (
          <div key={p.numero}>
            <h2 className="mb-2 text-sm font-medium text-texte-2">
              Semaine {p.numero} · {p.titre}
            </h2>
            <ul className="space-y-2">
              {PROGRAMME.filter((j) => j.jour >= p.jours[0] && j.jour <= p.jours[1]).map((j) => {
                const ouvert = j.jour <= debloque;
                const fait = etat.programme.actionsFaites.includes(j.jour);
                const premium = !abonne && j.jour > JOUR_LIMITE_PROGRAMME_GRATUIT;
                return (
                  <li key={j.jour}>
                    <button
                      type="button"
                      disabled={!ouvert}
                      onClick={() => ouvrir(j.jour)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                        j.jour === choisi ? "border border-ambre/50 bg-surface" : "bg-surface hover:bg-surface-2"
                      } disabled:cursor-default disabled:opacity-50`}
                    >
                      <span
                        className={`chiffres flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          fait ? "bg-vert text-fond" : j.jour === aujourdhui ? "bg-ambre text-fond" : "bg-surface-2 text-texte-2"
                        }`}
                      >
                        {fait ? <IconeCoche className="h-4 w-4" /> : j.jour}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{j.titre}</span>
                        <span className="block text-xs text-texte-2">
                          {!ouvert
                            ? `Dans ${pluriel(j.jour - aujourdhui, "jour")}`
                            : j.jour === aujourdhui
                              ? "Aujourd'hui"
                              : fait
                                ? "Action faite"
                                : `Jour ${j.jour}`}
                        </span>
                      </span>
                      {premium && <IconeCadenas className="h-4 w-4 shrink-0 text-texte-2" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <p className="mt-8 text-xs leading-relaxed text-texte-2">
        Ces textes sont tirés du livre « Comment tu vas arrêter le cannabis », qui raconte chaque jour plus en
        détail. C&apos;est le témoignage d&apos;un ancien fumeur, pas un avis médical.
      </p>
    </>
  );
}

/** Contenu d'un jour : pensée, récit, message, action, et « pour tenir jusqu'à demain ». */
function FicheJour({
  jour,
  estAujourdhui,
  actionFaite,
  onAction,
}: {
  jour: JourProgramme;
  estAujourdhui: boolean;
  actionFaite: boolean;
  onAction: () => void;
}) {
  return (
    <article className="space-y-4">
      <header className="rounded-2xl bg-surface p-5">
        <p className="text-xs font-semibold tracking-wide text-ambre">
          JOUR {jour.jour}
          {estAujourdhui && " · AUJOURD'HUI"}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{jour.titre}</h2>
        <blockquote className="mt-4 border-l-2 border-ambre pl-4 text-lg leading-relaxed font-medium">
          {jour.pensee}
        </blockquote>
      </header>

      <Bloc titre="Ce que j'ai vécu">{jour.recit}</Bloc>
      <Bloc titre="Ce que je veux te dire">{jour.message}</Bloc>

      <section className={`rounded-2xl border p-5 ${actionFaite ? "border-vert/50 bg-vert/10" : "border-bord bg-surface"}`}>
        <h3 className="text-sm font-semibold text-texte-2">Ton action aujourd&apos;hui</h3>
        <p className="mt-2 leading-relaxed">{jour.action}</p>
        <button
          type="button"
          aria-pressed={actionFaite}
          onClick={onAction}
          className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
            actionFaite ? "bg-vert text-fond" : "bg-surface-2 text-texte hover:bg-bord"
          }`}
        >
          {actionFaite && <IconeCoche className="h-4 w-4" />}
          {actionFaite ? "C'est fait" : "Je l'ai fait"}
        </button>
      </section>

      <Bloc titre="Pour tenir jusqu'à demain">{jour.demain}</Bloc>
    </article>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface p-5">
      <h3 className="text-sm font-semibold text-texte-2">{titre}</h3>
      <p className="mt-2 leading-relaxed">{children}</p>
    </section>
  );
}
