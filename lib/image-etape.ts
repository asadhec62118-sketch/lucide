"use client";

// Image « Libre depuis X jours » à partager (format portrait 1080 × 1350).
// Dessinée sur le téléphone (fonctionne hors ligne). Elle ne mentionne jamais
// le cannabis : chacun peut la partager sans se dévoiler.

const LARGEUR = 1080;
const HAUTEUR = 1350;
const POLICE = "'Inter Variable', Inter, system-ui, sans-serif";

export async function dessinerImageEtape(jours: number, economies: string | null): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = LARGEUR;
  canvas.height = HAUTEUR;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Dessin impossible.");

  // Fond sombre avec un halo ambre discret
  c.fillStyle = "#0E0E10";
  c.fillRect(0, 0, LARGEUR, HAUTEUR);
  const halo = c.createRadialGradient(LARGEUR / 2, 560, 50, LARGEUR / 2, 560, 620);
  halo.addColorStop(0, "rgba(245,165,36,0.18)");
  halo.addColorStop(1, "rgba(245,165,36,0)");
  c.fillStyle = halo;
  c.fillRect(0, 0, LARGEUR, HAUTEUR);

  c.textAlign = "center";
  c.textBaseline = "alphabetic";

  // Marque
  c.fillStyle = "#A1A1AA";
  c.font = `600 40px ${POLICE}`;
  c.letterSpacing = "16px";
  c.fillText("LUCIDE", LARGEUR / 2 + 8, 150);
  c.letterSpacing = "0px";

  // Anneau et point, comme l'icône de l'application
  c.strokeStyle = "#F5A524";
  c.lineWidth = 14;
  c.beginPath();
  c.arc(LARGEUR / 2, 290, 62, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = "#3FB68B";
  c.beginPath();
  c.arc(LARGEUR / 2, 290, 16, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = "#FAFAFA";
  c.font = `500 64px ${POLICE}`;
  c.fillText("Libre depuis", LARGEUR / 2, 500);

  // Grand nombre, réduit si besoin pour tenir dans la largeur
  let taille = 360;
  c.font = `700 ${taille}px ${POLICE}`;
  while (c.measureText(String(jours)).width > LARGEUR - 160 && taille > 120) {
    taille -= 20;
    c.font = `700 ${taille}px ${POLICE}`;
  }
  c.fillText(String(jours), LARGEUR / 2, 820);

  c.fillStyle = "#F5A524";
  c.font = `600 72px ${POLICE}`;
  c.fillText(jours > 1 ? "jours" : "jour", LARGEUR / 2, 930);

  if (economies) {
    c.fillStyle = "#3FB68B";
    c.font = `600 52px ${POLICE}`;
    c.fillText(`${economies} regagnés`, LARGEUR / 2, 1060);
  }

  c.fillStyle = "#A1A1AA";
  c.font = `400 40px ${POLICE}`;
  c.fillText("Chaque jour, un peu plus libre.", LARGEUR / 2, 1230);

  return new Promise((resoudre, rejeter) =>
    canvas.toBlob((b) => (b ? resoudre(b) : rejeter(new Error("Image impossible."))), "image/png"),
  );
}

/** Partage l'image (feuille de partage du téléphone) ou la télécharge à défaut. */
export async function partagerImageEtape(jours: number, economies: string | null): Promise<"partage" | "telecharge"> {
  const blob = await dessinerImageEtape(jours, economies);
  const fichier = new File([blob], `lucide-${jours}-jours.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], text: `Libre depuis ${jours} jours.` });
    } catch {
      // Partage annulé : rien à faire.
    }
    return "partage";
  }
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = fichier.name;
  lien.click();
  URL.revokeObjectURL(lien.href);
  return "telecharge";
}
