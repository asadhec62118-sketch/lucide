"""Génère les icônes PNG de LUCIDE (PWA, iOS, favicon) avec Pillow.

Motif : un anneau ambre et un point vert sur fond sombre,
une image de clarté, sans aucune iconographie médicale.
Usage : python3 scripts/generer-icones.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

FOND = (14, 14, 16, 255)
AMBRE = (245, 165, 36, 255)
VERT = (63, 182, 139, 255)
SORTIE = Path(__file__).resolve().parent.parent / "public" / "icons"
SUR_ECHANTILLON = 4  # dessin en haute résolution puis réduction (anticrénelage)


def icone(taille: int, marge: float, arrondi: bool) -> Image.Image:
    t = taille * SUR_ECHANTILLON
    img = Image.new("RGBA", (t, t), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if arrondi:
        d.rounded_rectangle([0, 0, t - 1, t - 1], radius=int(t * 0.22), fill=FOND)
    else:
        d.rectangle([0, 0, t, t], fill=FOND)
    # Anneau ambre
    zone = t * (1 - 2 * marge)
    c = t / 2
    r = zone * 0.36
    epaisseur = zone * 0.085
    d.ellipse([c - r, c - r, c + r, c + r], outline=AMBRE, width=int(epaisseur))
    # Point vert au centre, comme une lueur
    rp = zone * 0.09
    d.ellipse([c - rp, c - rp, c + rp, c + rp], fill=VERT)
    return img.resize((taille, taille), Image.LANCZOS)


def main() -> None:
    SORTIE.mkdir(parents=True, exist_ok=True)
    icone(192, 0.08, False).save(SORTIE / "icon-192.png")
    icone(512, 0.08, False).save(SORTIE / "icon-512.png")
    # Icône « maskable » : marge de sécurité pour les découpes Android
    icone(512, 0.2, False).save(SORTIE / "icon-maskable-512.png")
    # iOS applique lui-même l'arrondi : fond plein
    icone(180, 0.1, False).convert("RGB").save(SORTIE / "apple-touch-icon.png")
    icone(32, 0.02, True).save(SORTIE.parent / "favicon.png")
    print("Icônes générées dans", SORTIE)


if __name__ == "__main__":
    main()
