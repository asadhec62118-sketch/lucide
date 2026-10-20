import "server-only";

// Client Stripe côté serveur.
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function stripeServeur(): Stripe {
  if (stripe) return stripe;
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) throw new Error("Variable STRIPE_SECRET_KEY manquante.");
  stripe = new Stripe(cle, { appInfo: { name: "LUCIDE" } });
  return stripe;
}

export type Formule = "mensuel" | "annuel";

/** Identifiant du prix Stripe correspondant à une formule. */
export function prixPourFormule(formule: Formule): string {
  const id = formule === "annuel" ? process.env.STRIPE_PRICE_ANNUEL : process.env.STRIPE_PRICE_MENSUEL;
  if (!id) throw new Error(`Prix Stripe manquant pour la formule ${formule}.`);
  return id;
}

/** Retrouve la formule à partir d'un identifiant de prix. */
export function formulePourPrix(prixId: string | undefined | null): Formule | null {
  if (!prixId) return null;
  if (prixId === process.env.STRIPE_PRICE_ANNUEL) return "annuel";
  if (prixId === process.env.STRIPE_PRICE_MENSUEL) return "mensuel";
  return null;
}

/** URL publique du site (redirections Stripe). */
export function urlSite(req: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
}
