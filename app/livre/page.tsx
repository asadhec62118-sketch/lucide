"use client";

// LIVRE — page ouverte par le QR code imprimé dans le livre
// « Comment tu vas arrêter le cannabis ». Elle présente LUCIDE comme le
// compagnon de poche du livre, puis lance l'onboarding (ou l'accueil).

import Link from "next/link";
import { IconeCoche } from "@/components/Icones";
import { Chargement } from "@/components/ui";
import { MENTION_LEGALE } from "@/lib/constants";
import { useEtat } from "@/lib/store";

const POINTS = [
  {
    titre: "Le livre t'explique",
    texte: "Le pourquoi, le comment, l'histoire. LUCIDE ne le remplace pas : elle le prolonge dans ta vraie vie.",
  },
  {
    titre: "LUCIDE est là au moment de l'envie",
    texte: "Un bouton, et tu as un minuteur, une respiration, tes raisons en grand, une action à la place. Même sans internet.",
  },
  {
    titre: "Ton programme, au bon rythme",
    texte: "Chaque jour s'ouvre à partir de ta date d'arrêt, avec une action concrète et tes progrès en chiffres.",
  },
];

export default function Livre() {
  const etat = useEtat();
  if (!etat) return <Chargement />;
  const dejaCommence = etat.profil !== null;

  return (
    <main className="pt-securite pb-securite mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-8">
      <p className="text-sm font-semibold tracking-[0.3em] text-texte-2">LUCIDE</p>
      <h1 className="mt-8 text-4xl leading-tight font-bold">Tu as le livre. Voici ton compagnon de poche.</h1>
      <p className="mt-4 text-lg text-texte-2">
        « Comment tu vas arrêter le cannabis » t&apos;accompagne pendant trente jours. LUCIDE t&apos;accompagne dans
        chaque moment de ces trente jours.
      </p>

      <ul className="mt-10 space-y-5">
        {POINTS.map((p) => (
          <li key={p.titre} className="flex gap-4">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vert/15 text-vert">
              <IconeCoche className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-semibold">{p.titre}</span>
              <span className="mt-1 block text-sm leading-relaxed text-texte-2">{p.texte}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-12">
        <Link
          href={dejaCommence ? "/programme" : "/onboarding"}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-ambre text-lg font-bold text-fond"
        >
          {dejaCommence ? "Ouvrir mon programme" : "Commencer gratuitement"}
        </Link>
        <p className="mt-4 text-center text-xs text-texte-2">{MENTION_LEGALE}</p>
      </div>
    </main>
  );
}
