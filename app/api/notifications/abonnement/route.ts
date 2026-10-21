// Inscription (POST) et désinscription (DELETE) d'un appareil aux rappels.
// Fonctionne avec ou sans compte : si un jeton est fourni, l'abonnement est
// rattaché à l'utilisateur (et supprimé avec son compte).

import { NextResponse } from "next/server";
import { supabaseAdmin, utilisateurDepuisRequete } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Corps = {
  subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  dateDepart?: unknown;
  fuseau?: unknown;
  vendredi?: unknown;
};

function texteValide(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

function fuseauValide(f: unknown): f is string {
  if (!texteValide(f, 64)) return false;
  try {
    new Intl.DateTimeFormat("fr-FR", { timeZone: f });
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const corps = (await req.json().catch(() => ({}))) as Corps;
  const endpoint = corps.subscription?.endpoint;
  const p256dh = corps.subscription?.keys?.p256dh;
  const auth = corps.subscription?.keys?.auth;
  const depart = typeof corps.dateDepart === "string" ? new Date(corps.dateDepart) : null;

  if (
    !texteValide(endpoint, 1000) ||
    !endpoint.startsWith("https://") ||
    !texteValide(p256dh, 200) ||
    !texteValide(auth, 100) ||
    !depart ||
    Number.isNaN(depart.getTime()) ||
    depart.getTime() > Date.now() + 24 * 60 * 60 * 1000
  ) {
    return NextResponse.json({ erreur: "Abonnement invalide." }, { status: 400 });
  }

  try {
    const user = await utilisateurDepuisRequete(req);
    const { error } = await supabaseAdmin()
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_id: user?.id ?? null,
          start_date: depart.toISOString(),
          timezone: fuseauValide(corps.fuseau) ? corps.fuseau : "Europe/Paris",
          friday_alert: corps.vendredi === true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" },
      );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notifications/abonnement]", e);
    return NextResponse.json({ erreur: "Impossible d'enregistrer les rappels." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const corps = (await req.json().catch(() => ({}))) as { endpoint?: unknown };
  if (!texteValide(corps.endpoint, 1000)) {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  try {
    await supabaseAdmin().from("push_subscriptions").delete().eq("endpoint", corps.endpoint);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notifications/desabonnement]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
