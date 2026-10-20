// Gabarit des 4 onglets principaux : contenu + barre de navigation basse.

import { BarreNavigation } from "@/components/BarreNavigation";

export default function GabaritOnglets({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pt-securite mx-auto min-h-dvh max-w-lg px-5 pb-[calc(var(--hauteur-nav)+env(safe-area-inset-bottom)+2rem)]">
        {children}
      </main>
      <BarreNavigation />
    </>
  );
}
