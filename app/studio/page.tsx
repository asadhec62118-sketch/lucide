"use client";

// STUDIO — l'auteur enregistre la pensée de chaque jour avec son téléphone.
// Les enregistrements restent dans le téléphone jusqu'à l'envoi ; ils sont ensuite
// convertis en MP3 et ajoutés à l'application (public/audio/jour-N.mp3).

import { useEffect, useRef, useState } from "react";
import { IconeCoche } from "@/components/Icones";
import { Bouton } from "@/components/ui";
import { PROGRAMME } from "@/lib/programme";
import { enregistrerAudio, extensionPour, formatEnregistrement, lireAudios, supprimerAudio } from "@/lib/studio";
import { deuxChiffres } from "@/lib/temps";

type Etat = "pret" | "enregistrement" | "ecoute";

export default function Studio() {
  const [audios, setAudios] = useState<Map<number, Blob>>(new Map());
  const [jour, setJour] = useState(1);
  const [etat, setEtat] = useState<Etat>("pret");
  const [secondes, setSecondes] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState<string | null>(null);
  const enregistreur = useRef<MediaRecorder | null>(null);
  const morceaux = useRef<Blob[]>([]);
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);

  // Chargement des enregistrements déjà faits ; on reprend au premier jour manquant.
  useEffect(() => {
    lireAudios()
      .then((a) => {
        setAudios(a);
        const premierManquant = PROGRAMME.find((j) => !a.has(j.jour));
        setJour(premierManquant?.jour ?? 1);
      })
      .catch(() => setErreur("Le stockage du téléphone n'est pas disponible (navigation privée ?)."));
  }, []);

  const audioDuJour = audios.get(jour);
  const urlAudio = useUrl(audioDuJour);
  const texte = PROGRAMME[jour - 1];

  async function demarrer() {
    setErreur(null);
    try {
      const flux = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const { type } = formatEnregistrement();
      const rec = new MediaRecorder(flux, type ? { mimeType: type, audioBitsPerSecond: 128000 } : undefined);
      morceaux.current = [];
      rec.ondataavailable = (e) => e.data.size && morceaux.current.push(e.data);
      rec.onstop = async () => {
        flux.getTracks().forEach((p) => p.stop());
        const blob = new Blob(morceaux.current, { type: rec.mimeType || type || "audio/webm" });
        await enregistrerAudio(jour, blob);
        setAudios((a) => new Map(a).set(jour, blob));
        setEtat("ecoute");
      };
      rec.start();
      enregistreur.current = rec;
      setSecondes(0);
      minuteur.current = setInterval(() => setSecondes((s) => s + 1), 1000);
      setEtat("enregistrement");
    } catch {
      setErreur("Impossible d'accéder au micro. Autorise le micro pour LUCIDE dans les réglages du navigateur.");
    }
  }

  function arreter() {
    if (minuteur.current) clearInterval(minuteur.current);
    enregistreur.current?.stop();
  }

  async function recommencer() {
    await supprimerAudio(jour);
    setAudios((a) => {
      const copie = new Map(a);
      copie.delete(jour);
      return copie;
    });
    setEtat("pret");
  }

  function aller(n: number) {
    if (etat === "enregistrement") return;
    setJour(n);
    setEtat(audios.has(n) ? "ecoute" : "pret");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function envoyer() {
    setEnvoi(null);
    const fichiers = [...audios.entries()]
      .sort(([a], [b]) => a - b)
      .map(([j, blob]) => new File([blob], `jour-${j}.${extensionPour(blob)}`, { type: blob.type }));
    if (!fichiers.length) return;
    if (navigator.canShare?.({ files: fichiers })) {
      try {
        await navigator.share({ files: fichiers, title: "Enregistrements LUCIDE" });
        setEnvoi("Envoyé. Tu peux maintenant me les transmettre dans la conversation.");
      } catch {
        // Partage annulé.
      }
      return;
    }
    // Sans partage de fichiers : téléchargement un par un.
    for (const f of fichiers) {
      const lien = document.createElement("a");
      lien.href = URL.createObjectURL(f);
      lien.download = f.name;
      lien.click();
      URL.revokeObjectURL(lien.href);
    }
    setEnvoi("Les fichiers sont dans tes téléchargements.");
  }

  const faits = audios.size;

  return (
    <main className="pt-securite pb-securite mx-auto min-h-dvh max-w-lg px-5 py-6">
      <p className="text-sm font-semibold tracking-[0.3em] text-texte-2">LUCIDE · STUDIO</p>
      <h1 className="mt-4 text-3xl font-bold">Ta voix</h1>
      <p className="mt-2 text-sm leading-relaxed text-texte-2">
        Mets-toi dans un endroit calme, le téléphone à une vingtaine de centimètres. Lis lentement, comme si tu
        parlais à quelqu&apos;un qui commence. Tu peux recommencer autant de fois que tu veux.
      </p>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface" aria-label={`${faits} sur 30 enregistrés`}>
        <div className="h-full rounded-full bg-vert transition-all" style={{ width: `${(faits / 30) * 100}%` }} />
      </div>
      <p className="chiffres mt-2 text-xs text-texte-2">{faits} / 30 enregistrés</p>

      {/* Le texte à lire, en grand */}
      <section className="mt-6 rounded-2xl bg-surface p-5">
        <p className="text-xs font-semibold tracking-wide text-ambre">
          JOUR {jour} · {texte.titre.toUpperCase()}
        </p>
        <p className="mt-4 text-2xl leading-relaxed font-medium">{texte.pensee}</p>
      </section>

      {/* Commandes d'enregistrement */}
      <section className="mt-6 flex flex-col items-center">
        {etat === "enregistrement" ? (
          <>
            <button
              type="button"
              onClick={arreter}
              aria-label="Arrêter l'enregistrement"
              className="flex h-24 w-24 items-center justify-center rounded-full bg-ambre shadow-[0_0_40px_rgba(245,165,36,0.45)]"
            >
              <span className="h-8 w-8 rounded-md bg-fond" />
            </button>
            <p className="chiffres mt-3 text-lg font-semibold text-ambre">
              {deuxChiffres(Math.floor(secondes / 60))}:{deuxChiffres(secondes % 60)}
            </p>
            <p className="text-sm text-texte-2">Enregistrement… touche pour arrêter</p>
          </>
        ) : audioDuJour && urlAudio ? (
          <>
            <audio controls src={urlAudio} className="w-full" />
            <div className="mt-4 grid w-full grid-cols-2 gap-3">
              <Bouton variante="surface" onClick={recommencer}>
                Recommencer
              </Bouton>
              <Bouton variante="vert" onClick={() => aller(Math.min(30, jour + 1))} disabled={jour === 30}>
                Jour suivant
              </Bouton>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={demarrer}
              aria-label="Commencer l'enregistrement"
              className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-ambre bg-surface transition active:scale-95"
            >
              <span className="h-10 w-10 rounded-full bg-ambre" />
            </button>
            <p className="mt-3 text-sm text-texte-2">Touche pour enregistrer</p>
          </>
        )}
        {erreur && <p className="mt-3 text-center text-sm text-ambre">{erreur}</p>}
      </section>

      {/* Les 30 jours */}
      <section className="mt-10" aria-label="Choisir un jour">
        <div className="grid grid-cols-6 gap-2">
          {PROGRAMME.map((j) => (
            <button
              key={j.jour}
              type="button"
              onClick={() => aller(j.jour)}
              aria-label={`Jour ${j.jour}${audios.has(j.jour) ? ", enregistré" : ""}`}
              className={`chiffres flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition ${
                j.jour === jour
                  ? "bg-ambre text-fond"
                  : audios.has(j.jour)
                    ? "bg-vert/20 text-vert"
                    : "bg-surface text-texte-2"
              }`}
            >
              {audios.has(j.jour) && j.jour !== jour ? <IconeCoche className="h-4 w-4" /> : j.jour}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-bord p-5">
        <h2 className="font-semibold">Quand tu as fini (ou en cours de route)</h2>
        <p className="mt-1 text-sm text-texte-2">
          Envoie-toi les fichiers (par exemple par e-mail ou sur ton Drive), puis transmets-les dans notre
          conversation. Je les prépare et je les ajoute à l&apos;application.
        </p>
        <Bouton onClick={envoyer} disabled={!faits} className="mt-4 w-full">
          Envoyer mes {faits > 1 ? `${faits} enregistrements` : "enregistrements"}
        </Bouton>
        {envoi && <p className="mt-3 text-sm text-vert">{envoi}</p>}
      </section>
    </main>
  );
}

/** URL de lecture d'un enregistrement, libérée quand il change. */
function useUrl(blob: Blob | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) return setUrl(null);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}
