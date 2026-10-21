"use client";

// OFFRE — proposée une fois, juste après l'onboarding, au moment où la motivation
// est la plus forte. Comparaison gratuit / complet, déroulé de l'essai, puis
// choix de la formule. La version gratuite reste toujours accessible.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconeCoche } from "@/components/Icones";
import { ChoixFormules, usePaiement } from "@/components/Offre";
import { Bouton, Chargement } from "@/components/ui";
import { TARIFS } from "@/lib/constants";
import { estAbonne } from "@/lib/stats";
import { useEtat } from "@/lib/store";

const COMPARAISON: { quoi: string; gratuit: string; complet: string }[] = [
  { quoi: "Programme de 30 jours", gratuit: "Jours 1 à 7", complet: "Les 30 jours + tes bilans" },
  { quoi: "Mode Envie", gratuit: "3 fois par semaine", complet: "Illimité" },
  { quoi: "Parcours", gratuit: "Jusqu'à J7", complet: "Jusqu'à J90" },
  { quoi: "Tes schémas", gratuit: "—", complet: "Quand et pourquoi tes envies arrivent" },
  { quoi: "Compteur, rappels, aide", gratuit: "Inclus", complet: "Inclus" },
];

export default function Offre() {
  const etat = useEtat();
  const router = useRouter();
  const [formule, setFormule] = useState<"mensuel" | "annuel">("annuel");
  const { chargement, erreur, sAbonner } = usePaiement("/offre");

  // Déjà abonné, ou onboarding pas fait : rien à proposer ici.
  const rienAProposer = etat !== null && (!etat.profil || estAbonne(etat));
  useEffect(() => {
    if (rienAProposer) router.replace("/");
  }, [rienAProposer, router]);

  if (!etat || rienAProposer) return <Chargement />;

  return (
    <main className="pt-securite pb-securite mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-6">
      <p className="text-sm font-semibold tracking-[0.3em] text-texte-2">LUCIDE</p>
      <h1 className="mt-6 text-3xl leading-tight font-bold">Ton compteur tourne. Donne-toi toutes les chances.</h1>
      <p className="mt-3 text-texte-2">
        LUCIDE a été créée par un ancien fumeur&nbsp;: vingt ans de cannabis, libre depuis dix ans. Tout ce qui
        l&apos;a aidé est ici, jour après jour.
      </p>

      {/* Gratuit ou complet */}
      <section className="mt-8 overflow-hidden rounded-2xl bg-surface" aria-label="Comparaison des versions">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 border-b border-bord px-4 py-3 text-xs font-semibold text-texte-2">
          <span />
          <span>Gratuit</span>
          <span className="text-ambre">Complet</span>
        </div>
        {COMPARAISON.map((l) => (
          <div key={l.quoi} className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 border-b border-bord/60 px-4 py-3 text-sm last:border-0">
            <span className="font-medium">{l.quoi}</span>
            <span className="text-texte-2">{l.gratuit}</span>
            <span>{l.complet}</span>
          </div>
        ))}
      </section>

      {/* Déroulé de l'essai : aucune surprise */}
      <section className="mt-8" aria-label="Comment marche l'essai">
        <ol className="space-y-3">
          {[
            { quand: "Aujourd'hui", quoi: "Tu as tout, sans rien payer." },
            { quand: `Pendant ${TARIFS.essaiJours} jours`, quoi: "Tu testes le programme complet et le Mode Envie illimité." },
            {
              quand: `Jour ${TARIFS.essaiJours}`,
              quoi: "L'abonnement démarre. Tu peux l'annuler avant, en deux clics depuis les réglages : tu ne paies rien.",
            },
          ].map((e) => (
            <li key={e.quand} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vert/15 text-vert">
                <IconeCoche className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm">
                <span className="font-semibold">{e.quand}</span> <span className="text-texte-2">— {e.quoi}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8">
        <ChoixFormules onChoisir={setFormule} desactive={!!chargement} choisie={formule} />
      </div>

      <Bouton onClick={() => sAbonner(formule)} disabled={!!chargement} className="mt-5 w-full text-lg">
        {chargement ? "Ouverture du paiement…" : `Commencer mes ${TARIFS.essaiJours} jours gratuits`}
      </Bouton>
      {erreur && <p className="mt-3 text-center text-sm text-ambre">{erreur}</p>}
      <p className="mt-3 text-center text-xs text-texte-2">
        Paiement sécurisé par Stripe. L&apos;essai gratuit est réservé à un premier abonnement. En t&apos;abonnant, tu
        acceptes les{" "}
        <Link href="/conditions" className="underline underline-offset-2">
          conditions
        </Link>
        .
      </p>

      <Link href="/" className="mt-6 py-3 text-center text-sm text-texte-2 hover:text-texte">
        Continuer avec la version gratuite
      </Link>
    </main>
  );
}
