// Ouverture du portail client Stripe (changer de formule, résilier, factures).

import { NextResponse } from "next/server";
import { supabaseAdmin, utilisateurDepuisRequete } from "@/lib/supabase/admin";
import { stripeServeur, urlSite } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await utilisateurDepuisRequete(req);
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  try {
    const { data: profil } = await supabaseAdmin()
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profil?.stripe_customer_id) {
      return NextResponse.json({ erreur: "Aucun abonnement trouvé." }, { status: 404 });
    }

    const session = await stripeServeur().billingPortal.sessions.create({
      customer: profil.stripe_customer_id,
      locale: "fr",
      return_url: `${urlSite(req)}/reglages`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[portail]", e);
    return NextResponse.json({ erreur: "Impossible d'ouvrir la gestion de l'abonnement." }, { status: 500 });
  }
}
