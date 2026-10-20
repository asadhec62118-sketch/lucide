// Création d'une session Stripe Checkout pour l'abonnement LUCIDE.
// 7 jours d'essai gratuit sur les deux formules (une seule fois par compte).

import { NextResponse } from "next/server";
import { supabaseAdmin, utilisateurDepuisRequete } from "@/lib/supabase/admin";
import { prixPourFormule, stripeServeur, urlSite, type Formule } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await utilisateurDepuisRequete(req);
  if (!user) {
    return NextResponse.json({ erreur: "Connecte-toi pour t'abonner." }, { status: 401 });
  }

  const corps = (await req.json().catch(() => ({}))) as { formule?: Formule };
  const formule: Formule = corps.formule === "annuel" ? "annuel" : "mensuel";

  try {
    const stripe = stripeServeur();
    const admin = supabaseAdmin();

    const { data: profil } = await admin
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id, subscription_status")
      .eq("id", user.id)
      .single();

    // Déjà abonné : on renvoie vers le portail plutôt que de créer un doublon.
    if (profil && ["active", "trialing"].includes(profil.subscription_status)) {
      return NextResponse.json({ erreur: "Tu as déjà un abonnement actif." }, { status: 409 });
    }

    // Client Stripe lié au compte Supabase (créé une seule fois).
    let clientId = profil?.stripe_customer_id as string | null;
    if (!clientId) {
      const client = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      clientId = client.id;
      await admin.from("profiles").update({ stripe_customer_id: clientId }).eq("id", user.id);
    }

    // L'essai gratuit n'est proposé qu'à ceux qui n'ont jamais été abonnés.
    const dejaAbonne = Boolean(profil?.stripe_subscription_id);
    const base = urlSite(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: clientId,
      client_reference_id: user.id,
      line_items: [{ price: prixPourFormule(formule), quantity: 1 }],
      subscription_data: {
        ...(dejaAbonne ? {} : { trial_period_days: 7 }),
        metadata: { supabase_user_id: user.id, formule },
      },
      metadata: { supabase_user_id: user.id, formule },
      locale: "fr",
      allow_promotion_codes: true,
      success_url: `${base}/reglages?abonnement=merci`,
      cancel_url: `${base}/reglages?abonnement=annule`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json({ erreur: "Impossible d'ouvrir le paiement pour le moment." }, { status: 500 });
  }
}
