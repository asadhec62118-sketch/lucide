"use client";

// Barre de navigation basse à 4 onglets : Accueil, Journal, Parcours, Réglages.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconeAccueil, IconeJournal, IconeParcours, IconeReglages } from "./Icones";

const ONGLETS = [
  { href: "/", libelle: "Accueil", Icone: IconeAccueil },
  { href: "/journal", libelle: "Journal", Icone: IconeJournal },
  { href: "/parcours", libelle: "Parcours", Icone: IconeParcours },
  { href: "/reglages", libelle: "Réglages", Icone: IconeReglages },
];

export function BarreNavigation() {
  const chemin = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="pb-securite fixed inset-x-0 bottom-0 z-40 border-t border-bord bg-fond/95 backdrop-blur"
    >
      <ul className="mx-auto grid h-[var(--hauteur-nav)] max-w-lg grid-cols-4">
        {ONGLETS.map(({ href, libelle, Icone }) => {
          const actif = href === "/" ? chemin === "/" : chemin.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actif ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                  actif ? "text-ambre" : "text-texte-2 hover:text-texte"
                }`}
              >
                <Icone className="h-6 w-6" />
                {libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
