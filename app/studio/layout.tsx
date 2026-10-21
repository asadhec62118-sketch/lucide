import type { Metadata } from "next";

// Le studio est un outil de l'auteur : il n'apparaît pas dans les moteurs de recherche.
export const metadata: Metadata = { title: "Studio · LUCIDE", robots: { index: false, follow: false } };

export default function GabaritStudio({ children }: { children: React.ReactNode }) {
  return children;
}
