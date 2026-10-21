"use client";

// JOURNAL — liste chronologique des envies enregistrées.
// Au-delà de 10 entrées, la section « Tes schémas » apparaît (réservée aux abonnés).

import { BlocAide } from "@/components/BlocAide";
import { Carte, Chargement, LienBouton, TitrePage } from "@/components/ui";
import { Verrou } from "@/components/Verrou";
import { SEUIL_SCHEMAS } from "@/lib/constants";
import { useEtatAvecProfil } from "@/lib/hooks";
import { alerteSecurite, calculerSchemas, estAbonne } from "@/lib/stats";
import type { Envie } from "@/lib/store";
import { dateLongue, heure, pluriel } from "@/lib/temps";

export default function Journal() {
  const etat = useEtatAvecProfil();
  if (!etat) return <Chargement />;

  const envies = [...etat.envies].sort((a, b) => new Date(b.creeLe).getTime() - new Date(a.creeLe).getTime());
  const abonne = estAbonne(etat);

  // Regroupement par jour pour une lecture chronologique.
  const parJour = new Map<string, Envie[]>();
  for (const e of envies) {
    const cle = new Date(e.creeLe).toDateString();
    parJour.set(cle, [...(parJour.get(cle) ?? []), e]);
  }

  return (
    <>
      <TitrePage sousTitre={envies.length ? `${pluriel(envies.length, "envie")} enregistrée${envies.length > 1 ? "s" : ""}` : undefined}>
        Journal
      </TitrePage>

      {alerteSecurite(etat.envies) && (
        <div className="mb-6">
          <BlocAide titre="Les dernières heures ont l'air difficiles. Tu n'es pas seul·e." accent />
        </div>
      )}

      {envies.length > SEUIL_SCHEMAS ? (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Tes schémas</h2>
          <Verrou verrouille={!abonne} message="Découvre quand et pourquoi tes envies arrivent.">
            <Schemas envies={envies} />
          </Verrou>
        </section>
      ) : envies.length > 0 ? (
        <p className="mb-6 rounded-2xl bg-surface p-4 text-sm text-texte-2">
          Encore {pluriel(SEUIL_SCHEMAS + 1 - envies.length, "envie")} à noter pour découvrir tes schémas.
        </p>
      ) : null}

      {envies.length === 0 ? (
        <Carte className="text-center">
          <p className="text-lg font-semibold">Ton journal est vide pour l&apos;instant.</p>
          <p className="mt-2 text-sm text-texte-2">
            Chaque fois que tu utilises le Mode Envie, tu peux noter ce qui s&apos;est passé en 4 taps.
          </p>
          <LienBouton href="/envie" className="mt-5 w-full">
            J&apos;ai une envie
          </LienBouton>
        </Carte>
      ) : (
        <div className="space-y-6">
          {[...parJour.entries()].map(([jour, liste]) => (
            <section key={jour}>
              <h2 className="mb-2 text-sm font-medium text-texte-2 first-letter:uppercase">
                {dateLongue(liste[0].creeLe)}
              </h2>
              <ul className="space-y-2">
                {liste.map((e) => (
                  <EntreeJournal key={e.id} envie={e} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function EntreeJournal({ envie }: { envie: Envie }) {
  const details = [envie.declencheur, envie.lieu, envie.emotion].filter(Boolean).join(" · ");
  return (
    <li className="flex items-center gap-4 rounded-2xl bg-surface p-4">
      <div
        className={`chiffres flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
          envie.intensite === null
            ? "bg-surface-2 text-texte-2"
            : envie.intensite >= 8
              ? "bg-ambre text-fond"
              : "bg-ambre/15 text-ambre"
        }`}
        aria-label={envie.intensite === null ? "Intensité non notée" : `Intensité ${envie.intensite} sur 10`}
      >
        {envie.intensite ?? "–"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{details || "Envie non détaillée"}</p>
        <p className="chiffres mt-0.5 text-xs text-texte-2">
          {heure(envie.creeLe)}
          {envie.activite && <span className="text-vert"> · {envie.activite}</span>}
        </p>
      </div>
      {envie.tenue && (
        <span className="shrink-0 rounded-full bg-vert/15 px-2.5 py-1 text-xs font-medium text-vert">Tenue</span>
      )}
    </li>
  );
}

function Schemas({ envies }: { envies: Envie[] }) {
  const s = calculerSchemas(envies);
  const tuiles = [
    { titre: "Moment le plus fréquent", valeur: s.trancheHoraire ?? "—" },
    { titre: "Déclencheur dominant", valeur: s.declencheurDominant ?? "—" },
    { titre: "Intensité moyenne", valeur: s.intensiteMoyenne !== null ? `${String(s.intensiteMoyenne).replace(".", ",")} / 10` : "—" },
    { titre: "Taux de résistance", valeur: `${s.tauxResistance} %` },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {tuiles.map((t) => (
        <div key={t.titre} className="rounded-2xl bg-surface p-4">
          <p className="text-xs text-texte-2">{t.titre}</p>
          <p className="chiffres mt-1 text-xl font-bold">{t.valeur}</p>
        </div>
      ))}
      <p className="col-span-2 text-xs text-texte-2">Calculé sur {pluriel(s.total, "envie")}.</p>
    </div>
  );
}
