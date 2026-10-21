// Suppression du compte et de toutes les données (droit à l'effacement, RGPD).
// L'abonnement Stripe en cours est d'abord résilié pour ne plus rien facturer ;
// la suppression de l'utilisateur efface en cascade profil, envies, reprises et rappels.

import { NextResponse } from "next/server";
import { supabaseAdmin, utilisateurDepuisRequete } from "@/lib/supabase/admin";
import { stripeServeur } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const user = await utilisateurDepuisRequete(req);
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  try {
    const admin = supabaseAdmin();
    const { data: profil } = await admin
      .from("profiles")
      .select("stripe_subscription_id, subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profil?.stripe_subscription_id && !["canceled", "incomplete_expired"].includes(profil.subscription_status)) {
      await stripeServeur().subscriptions.cancel(profil.stripe_subscription_id);
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[compte/suppression]", e);
    return NextResponse.json(
      { erreur: "La suppression n'a pas pu aboutir. Réessaie, ou écris-nous pour qu'on le fasse pour toi." },
      { status: 500 },
    );
  }
}
