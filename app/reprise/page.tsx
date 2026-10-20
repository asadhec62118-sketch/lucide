"use client";

// REPRISE — affichée juste après « J'ai consommé » (Réglages).
// Le compteur est déjà reparti de zéro, mais le cumul de jours propres est conservé.
// Une seule question ensuite : « Qu'est-ce qui s'est passé ? »

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlocAide } from "@/components/BlocAide";
import { Bouton, Chargement, Puce } from "@/components/ui";
import { completerReprise } from "@/lib/actions";
import { DECLENCHEURS } from "@/lib/constants";
import { useEtatAvecProfil } from "@/lib/hooks";
import { MS, pluriel } from "@/lib/temps";

export default function PageReprise() {
  const etat = useEtatAvecProfil();
  const router = useRouter();
  const [texte, setTexte] = useState("");
  const [contextes, setContextes] = useState<string[]>([]);

  // On n'affiche cette page que juste après une reprise (moins d'une heure).
  const reprise = etat?.reprises[0];
  const recente = reprise && Date.now() - new Date(reprise.creeLe).getTime() < MS.heure;
  useEffect(() => {
    if (etat && !recente) router.replace("/");
  }, [etat, recente, router]);

  if (!etat || !reprise || !recente) return <Chargement />;

  function terminer() {
    const reponse = [contextes.join(", "), texte.trim()].filter(Boolean).join(" — ");
    if (reponse && reprise) completerReprise(reprise.id, reponse);
    router.replace("/");
  }

  return (
    <main className="pt-securite pb-securite mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-8">
      <section className="pt-6">
        <p className="text-4xl leading-tight font-bold">
          Tu as{" "}
          <span className="chiffres text-vert">{pluriel(etat.profil.totalJoursPropres, "jour")} propre{etat.profil.totalJoursPropres > 1 ? "s" : ""}</span>{" "}
          au total.
        </p>
        <p className="mt-5 text-2xl leading-snug text-texte-2">
          Tu ne repars pas de zéro, tu repars avec de l&apos;expérience.
        </p>
      </section>

      <section className="mt-12">
        <h1 className="text-xl font-semibold">Qu&apos;est-ce qui s&apos;est passé ?</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {DECLENCHEURS.map((d) => (
            <Puce
              key={d}
              actif={contextes.includes(d)}
              onClick={() => setContextes((l) => (l.includes(d) ? l.filter((x) => x !== d) : [...l, d]))}
            >
              {d}
            </Puce>
          ))}
        </div>
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Si tu veux, raconte avec tes mots. Ça t'aidera à repérer ce moment la prochaine fois."
          className="mt-4 w-full resize-none rounded-2xl border border-bord bg-surface p-4 text-base outline-none placeholder:text-texte-2/60 focus:border-ambre"
        />
      </section>

      <div className="mt-8 space-y-3">
        <Bouton onClick={terminer} className="w-full">
          Continuer
        </Bouton>
      </div>

      <div className="mt-10">
        <BlocAide />
      </div>
    </main>
  );
}
