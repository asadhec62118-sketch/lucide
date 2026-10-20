// Service worker de LUCIDE, servi à l'adresse /sw.js.
// Il est généré au moment du build pour embarquer un numéro de version :
// chaque déploiement invalide ainsi proprement l'ancien cache.

export const dynamic = "force-static";

const VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? String(Date.now());

// Pages pré-chargées à l'installation : elles restent disponibles hors ligne.
const PAGES = ["/", "/envie", "/journal", "/parcours", "/reglages", "/reprise", "/onboarding", "/connexion"];
const FICHIERS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const code = `
// LUCIDE — service worker (version ${VERSION})
const CACHE = "lucide-${VERSION}";
const PAGES = ${JSON.stringify(PAGES)};
const FICHIERS = ${JSON.stringify(FICHIERS)};

// Installation : mise en cache des pages et de toutes les ressources
// /_next/static qu'elles référencent (scripts, styles, polices).
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(FICHIERS.map((f) => cache.add(f).catch(() => null)));
    const ressources = new Set();
    for (const page of PAGES) {
      try {
        const rep = await fetch(page, { cache: "reload", credentials: "same-origin" });
        if (!rep.ok) continue;
        await cache.put(page, rep.clone());
        const html = await rep.text();
        for (const m of html.matchAll(/\\/_next\\/static\\/[^"'\\\\\\s)]+/g)) ressources.add(m[0]);
      } catch (e) { /* hors ligne pendant l'installation : on réessaiera */ }
    }
    await Promise.all([...ressources].map((r) => cache.add(r).catch(() => null)));
    await self.skipWaiting();
  })());
});

// Activation : suppression des caches des versions précédentes.
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cles = await caches.keys();
    await Promise.all(cles.filter((c) => c.startsWith("lucide-") && c !== CACHE).map((c) => caches.delete(c)));
    await self.clients.claim();
  })());
});

function delai(ms) {
  return new Promise((_, rejeter) => setTimeout(() => rejeter(new Error("délai")), ms));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Supabase, Stripe, etc. : jamais interceptés.
  if (url.origin !== self.location.origin) return;
  // Routes API et retour d'authentification : toujours en direct.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
  // Requêtes de navigation interne de Next.js (RSC) : en direct. Si elles
  // échouent hors ligne, Next.js bascule sur une navigation classique,
  // que l'on sert depuis le cache ci-dessous.
  if (req.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  // Pages : réseau d'abord (contenu à jour), cache en secours.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const rep = await Promise.race([fetch(req), delai(4000)]);
        if (rep.ok && rep.type === "basic" && !rep.redirected) {
          cache.put(url.pathname, rep.clone());
        }
        return rep;
      } catch (e) {
        return (await cache.match(url.pathname)) ||
               (await cache.match(url.pathname, { ignoreSearch: true })) ||
               (await cache.match("/")) ||
               new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  // Ressources versionnées de Next.js : cache d'abord (elles ne changent jamais).
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const enCache = await cache.match(req);
      if (enCache) return enCache;
      const rep = await fetch(req);
      if (rep.ok) cache.put(req, rep.clone());
      return rep;
    })());
    return;
  }

  // Autres fichiers (icônes, manifeste) : cache, puis mise à jour en arrière-plan.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const enCache = await cache.match(req);
    const reseau = fetch(req).then((rep) => {
      if (rep.ok) cache.put(req, rep.clone());
      return rep;
    }).catch(() => null);
    return enCache || (await reseau) || new Response("", { status: 504 });
  })());
});
`;

export function GET() {
  return new Response(code, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
