"use client";

// PARCOURS — chronologie verticale des jalons, de J1 à J90.
// Les jalons dépassés sont marqués comme atteints. En version gratuite,
// le contenu au-delà de J7 est flouté avec une incitation à l'abonnement.

import { IconeCoche } from "@/components/Icones";
import { Chargement, TitrePage } from "@/components/ui";
import { Verrou } from "@/components/Verrou";
import { JALONS, JOUR_LIMITE_PARCOURS_GRATUIT, type Jalon } from "@/lib/constants";
import { useEtatAvecProfil, useMaintenant } from "@/lib/hooks";
import { estAbonne } from "@/lib/stats";
import { joursDepuis, pluriel } from "@/lib/temps";

export default function Parcours() {
  const etat = useEtatAvecProfil();
  const maintenant = useMaintenant(60_000);
  if (!etat) return <Chargement />;

  // Jours entiers écoulés ; le jour en cours est le suivant (J1 pendant les premières 24 h).
  const ecoules = joursDepuis(etat.profil.dateDepart, maintenant);
  const jourCourant = ecoules + 1;
  const abonne = estAbonne(etat);
  const libres = JALONS.filter((j) => abonne || j.jour <= JOUR_LIMITE_PARCOURS_GRATUIT);
  const reserves = JALONS.filter((j) => !abonne && j.jour > JOUR_LIMITE_PARCOURS_GRATUIT);

  return (
    <>
      <TitrePage sousTitre={`Tu en es au jour ${jourCourant}.`}>Ton parcours</TitrePage>

      <ol className="relative">
        {libres.map((j, i) => (
          <EtapeJalon key={j.id} jalon={j} ecoules={ecoules} dernier={i === libres.length - 1 && reserves.length === 0} />
        ))}
      </ol>

      {reserves.length > 0 && (
        <Verrou verrouille message="La suite de ton parcours, de J14 à J90, est réservée aux abonnés.">
          <ol className="relative">
            {reserves.map((j, i) => (
              <EtapeJalon key={j.id} jalon={j} ecoules={ecoules} dernier={i === reserves.length - 1} />
            ))}
          </ol>
        </Verrou>
      )}

      <p className="mt-8 text-xs leading-relaxed text-texte-2">
        Chaque parcours est différent. Ces repères décrivent ce que beaucoup de personnes vivent :
        ce n&apos;est ni une règle, ni une promesse.
      </p>
    </>
  );
}

function EtapeJalon({ jalon, ecoules, dernier }: { jalon: Jalon; ecoules: number; dernier: boolean }) {
  // Atteint : toute la période du jalon est derrière toi. En cours : tu es dedans.
  const atteint = ecoules >= jalon.fin;
  const enCours = !atteint && ecoules + 1 >= jalon.jour;

  return (
    <li className="relative flex gap-4 pb-8">
      {/* Ligne verticale reliant les jalons */}
      {!dernier && (
        <span aria-hidden className={`absolute top-12 bottom-0 left-6 w-0.5 -translate-x-1/2 ${atteint ? "bg-vert/60" : "bg-bord"}`} />
      )}
      <div
        className={`chiffres relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
          atteint ? "bg-vert text-fond" : enCours ? "bg-ambre text-fond" : "bg-surface text-texte-2"
        }`}
      >
        {atteint ? <IconeCoche className="h-5 w-5" /> : jalon.libelle}
      </div>
      <div className={`flex-1 rounded-2xl p-4 ${enCours ? "border border-ambre/50 bg-surface" : "bg-surface"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-texte-2">{jalon.libelle}</p>
          {atteint && <span className="text-xs font-medium text-vert">Atteint</span>}
          {enCours && <span className="text-xs font-medium text-ambre">En ce moment</span>}
          {!atteint && !enCours && (
            <span className="chiffres text-xs text-texte-2">dans {pluriel(jalon.jour - ecoules - 1, "jour")}</span>
          )}
        </div>
        <h2 className="mt-1 text-lg font-semibold">{jalon.titre}</h2>
        <p className="mt-2 text-sm leading-relaxed text-texte-2">{jalon.texte}</p>
      </div>
    </li>
  );
}
