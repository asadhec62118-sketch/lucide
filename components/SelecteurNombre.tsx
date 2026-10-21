"use client";

// Sélecteur numérique tactile : − valeur +, sans clavier.

export function SelecteurNombre({
  valeur,
  onChange,
  min = 0,
  max = 50,
  libelle,
  unite,
}: {
  valeur: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  libelle: string;
  unite?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label={`${libelle} : un de moins`}
        onClick={() => onChange(Math.max(min, valeur - 1))}
        className="h-12 w-12 rounded-2xl bg-surface-2 text-xl font-bold hover:bg-bord"
      >
        −
      </button>
      <div className="min-w-16 text-center" aria-live="polite">
        <span className="chiffres text-3xl font-bold">{valeur}</span>
        {unite && <span className="block text-xs text-texte-2">{unite}</span>}
      </div>
      <button
        type="button"
        aria-label={`${libelle} : un de plus`}
        onClick={() => onChange(Math.min(max, valeur + 1))}
        className="h-12 w-12 rounded-2xl bg-surface-2 text-xl font-bold hover:bg-bord"
      >
        +
      </button>
    </div>
  );
}
