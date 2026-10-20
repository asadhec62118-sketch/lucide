import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { Demarrage } from "@/components/Demarrage";

// Métadonnées : installation sur l'écran d'accueil iOS et Android.
export const metadata: Metadata = {
  title: "LUCIDE",
  description: "Ton compagnon pour arrêter le cannabis, à ton rythme.",
  applicationName: "LUCIDE",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LUCIDE",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0E10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-fond text-texte">
        <Demarrage />
        {children}
      </body>
    </html>
  );
}
