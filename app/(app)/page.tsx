"use client";

// ACCUEIL — compteur en temps réel, argent économisé, jalon suivant,
// et bouton « J'AI UNE ENVIE » toujours visible en bas d'écran.
// Tout est calculé localement : l'écran fonctionne hors ligne.

import Link from "next/link";
import { BlocAide } from "@/components/BlocAide";
import { Carte, Chargement } from "@/components/ui";
import { useEtatAvecProfil, useMaintenant } from "@/lib/hooks";
import { alerteSecurite, enviesEnSeances, enviesRestantes, estAbonne, prochainPalier, totalJoursPropres } from "@/lib/stats";
import { argentEconomise, deuxChiffres, dureeDepuis, dureeRestante, euros, pluriel } from "@/lib/temps";

export default function Accueil() {
  const etat = useEtatAvecProfil();
  const maintenant = useMaintenant(1000);
  if (!etat) return <Chargement />;

  const { profil } = etat;
  const duree = dureeDepuis(profil.dateDepart, maintenant);
  const economies = argentEconomise(profil.depenseHebdo, profil.dateDepart, maintenant);
  const palier = prochainPalier(profil.dateDepart, maintenant);
  const cumul = totalJoursPropres(etat, maintenant);
  const restantes = enviesRestantes(etat);
  const alerte = alerteSecurite(etat.envies, maintenant);

  return (
    <div className="pb-24">
      <header className="flex items-center justify-between pt-4">
        <span className="text-sm font-semibold tracking-[0.3em] text-texte-2">LUCIDE</span>
        {estAbonne(etat) && (
          <span className="rounded-full bg-vert/15 px-3 py-1 text-xs font-medium text-vert">Abonné·e</span>
        )}
      </header>

      {/* Compteur principal */}
      <section aria-label="Temps depuis ton départ" className="mt-8 text-center">
        <p className="text-sm text-texte-2">Tu tiens depuis</p>
        <p className="chiffres mt-2 text-[6.5rem] leading-none font-bold tracking-tight text-texte">
          {duree.jours}
        </p>
        <p className="mt-1 text-lg font-medium text-ambre">{duree.jours > 1 ? "jours" : "jour"}</p>
        <div className="chiffres mx-auto mt-6 grid max-w-xs grid-cols-3 gap-3" role="timer" aria-live="off">
          {[
            { v: duree.heures, l: "heures" },
            { v: duree.minutes, l: "minutes" },
            { v: duree.secondes, l: "secondes" },
          ].map(({ v, l }) => (
            <div key={l} className="rounded-2xl bg-surface py-3">
              <span className="block text-3xl font-bold">{deuxChiffres(v)}</span>
              <span className="text-xs text-texte-2">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {alerte && (
        <div className="mt-8">
          <BlocAide titre="Les dernières heures ont l'air difficiles. Tu n'es pas seul·e." accent />
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {/* Argent économisé */}
        <Carte>
          <p className="text-sm text-texte-2">Argent économisé</p>
          <p className="chiffres mt-1 text-4xl font-bold text-vert">{euros(economies)}</p>
          {profil.depenseHebdo > 0 && (
            <p className="mt-1 text-xs text-texte-2">
              Sur la base de {euros(profil.depenseHebdo, true)} par semaine.
            </p>
          )}
        </Carte>

        {/* Jalon suivant */}
        {palier && (
          <Carte>
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-texte-2">Prochain jalon</p>
              <p className="chiffres text-sm text-texte-2">dans {dureeRestante(palier.restant)}</p>
            </div>
            <p className="mt-1 text-2xl font-bold">
              Jour <span className="chiffres">{palier.jour}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-ambre transition-[width] duration-1000"
                style={{ width: `${Math.round(palier.progression * 100)}%` }}
              />
            </div>
            <Link href="/parcours" className="mt-3 inline-block text-sm text-ambre">
              Voir ton parcours →
            </Link>
          </Carte>
        )}

        {/* Cumul de jours propres (si une reprise a déjà eu lieu) */}
        {profil.totalJoursPropres > 0 && (
          <Carte>
            <p className="text-sm text-texte-2">Jours propres au total</p>
            <p className="chiffres mt-1 text-3xl font-bold">{cumul}</p>
            <p className="mt-1 text-xs text-texte-2">Toute ton expérience compte.</p>
          </Carte>
        )}

        {/* Mode Sport */}
        {profil.modeSport && (
          <Carte>
            <p className="text-lg font-semibold">
              Tu as transformé{" "}
              <span className="chiffres text-vert">{pluriel(enviesEnSeances(etat.envies), "envie")}</span> en
              séances.
            </p>
          </Carte>
        )}
      </div>

      {/* Bouton fixe « J'AI UNE ENVIE », juste au-dessus de la barre de navigation */}
      <div className="fixed inset-x-0 bottom-[calc(var(--hauteur-nav)+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-fond via-fond/90 to-transparent px-5 pt-6 pb-3">
        <div className="mx-auto max-w-lg">
          <Link
            href="/envie"
            className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-ambre text-lg font-extrabold tracking-wide text-fond shadow-[0_8px_30px_rgba(245,165,36,0.25)] transition active:scale-[0.99]"
          >
            J&apos;AI UNE ENVIE
          </Link>
          {Number.isFinite(restantes) && (
            <p className="mt-2 text-center text-xs text-texte-2">
              {restantes > 0
                ? `${pluriel(restantes, "utilisation gratuite", "utilisations gratuites")} restante${restantes > 1 ? "s" : ""} cette semaine`
                : "Tes 3 utilisations gratuites de la semaine sont faites"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
