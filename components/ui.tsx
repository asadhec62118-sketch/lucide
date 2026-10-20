"use client";

// Composants d'interface de base : boutons, puces, cartes, interrupteurs.

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "ambre" | "vert" | "surface" | "discret";

const VARIANTES: Record<Variante, string> = {
  ambre: "bg-ambre text-fond hover:bg-ambre-fonce active:scale-[0.99]",
  vert: "bg-vert text-fond hover:brightness-110 active:scale-[0.99]",
  surface: "bg-surface-2 text-texte hover:bg-bord active:scale-[0.99]",
  discret: "bg-transparent text-texte-2 hover:text-texte underline-offset-4 hover:underline",
};

export function Bouton({
  variante = "ambre",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

export function LienBouton({
  href,
  variante = "ambre",
  className = "",
  children,
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </Link>
  );
}

/** Puce cochable (sélection simple ou multiple). */
export function Puce({
  actif,
  onClick,
  children,
  grande = false,
}: {
  actif: boolean;
  onClick: () => void;
  children: ReactNode;
  grande?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={`rounded-2xl border font-medium transition active:scale-[0.98] ${
        grande ? "min-h-14 px-4 py-3 text-base" : "min-h-11 px-4 py-2 text-sm"
      } ${
        actif
          ? "border-ambre bg-ambre/15 text-ambre"
          : "border-bord bg-surface text-texte hover:border-texte-2/40"
      }`}
    >
      {children}
    </button>
  );
}

export function Carte({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-2xl bg-surface p-5 ${className}`}>{children}</section>;
}

export function Interrupteur({
  actif,
  onChange,
  libelle,
}: {
  actif: boolean;
  onChange: (v: boolean) => void;
  libelle: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={libelle}
      onClick={() => onChange(!actif)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${actif ? "bg-vert" : "bg-bord"}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-texte transition-all ${actif ? "left-7" : "left-1"}`}
      />
    </button>
  );
}

/** Écran d'attente pendant la lecture des données locales (quelques millisecondes). */
export function Chargement() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <div className="h-10 w-10 animate-pulse rounded-full border-4 border-ambre/60" />
    </div>
  );
}

export function TitrePage({ children, sousTitre }: { children: ReactNode; sousTitre?: ReactNode }) {
  return (
    <header className="mb-6 pt-6">
      <h1 className="text-2xl font-bold tracking-tight">{children}</h1>
      {sousTitre && <p className="mt-1 text-sm text-texte-2">{sousTitre}</p>}
    </header>
  );
}
