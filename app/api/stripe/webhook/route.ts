// Webhook Stripe : tient à jour profiles.subscription_status.
// Événements à activer dans le tableau de bord Stripe :
//   checkout.session.completed
//   customer.subscription.created
//   customer.subscription.updated
//   customer.subscription.deleted

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formulePourPrix, stripeServeur } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fin de la période en cours (champ déplacé sur les items dans les API récentes). */
function finDePeriode(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const ts =
    item?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

/** Enregistre l'état d'un abonnement sur le profil correspondant. */
async function enregistrerAbonnement(sub: Stripe.Subscription, statutForce?: string) {
  const admin = supabaseAdmin();
  const clientId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const utilisateurId = sub.metadata?.supabase_user_id;

  const valeurs = {
    subscription_status: statutForce ?? sub.status,
    subscription_plan: formulePourPrix(sub.items?.data?.[0]?.price?.id),
    stripe_customer_id: clientId,
    stripe_subscription_id: sub.id,
    current_period_end: finDePeriode(sub),
  };

  // On cible d'abord l'identifiant Supabase porté par les métadonnées,
  // sinon le client Stripe déjà associé au profil.
  const requete = admin.from("profiles").update(valeurs);
  const { error } = utilisateurId
    ? await requete.eq("id", utilisateurId)
    : await requete.eq("stripe_customer_id", clientId);
  if (error) throw error;
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ erreur: "Signature absente." }, { status: 400 });
  }

  const stripe = stripeServeur();
  let evenement: Stripe.Event;
  try {
    // Le corps brut est indispensable à la vérification de la signature.
    const corps = await req.text();
    evenement = stripe.webhooks.constructEvent(corps, signature, secret);
  } catch (e) {
    console.error("[webhook] signature invalide", e);
    return NextResponse.json({ erreur: "Signature invalide." }, { status: 400 });
  }

  try {
    switch (evenement.type) {
      case "checkout.session.completed": {
        const session = evenement.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          // Les métadonnées de la session complètent celles de l'abonnement.
          if (!sub.metadata?.supabase_user_id && session.client_reference_id) {
            sub.metadata = { ...sub.metadata, supabase_user_id: session.client_reference_id };
          }
          await enregistrerAbonnement(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        await enregistrerAbonnement(evenement.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await enregistrerAbonnement(evenement.data.object as Stripe.Subscription, "canceled");
        break;
      }
      default:
        // Les autres événements ne nous concernent pas.
        break;
    }
  } catch (e) {
    console.error("[webhook] traitement", e);
    // 500 : Stripe réessaiera automatiquement.
    return NextResponse.json({ erreur: "Erreur de traitement." }, { status: 500 });
  }

  return NextResponse.json({ recu: true });
}
