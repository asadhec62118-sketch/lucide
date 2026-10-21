// Envoi quotidien des rappels, déclenché chaque matin par Vercel Cron (vercel.json).
// Protégé par CRON_SECRET : Vercel envoie automatiquement « Authorization: Bearer <CRON_SECRET> ».

import { NextResponse } from "next/server";
import { messageDuJour } from "@/lib/notifications/messages";
import { webPush } from "@/lib/notifications/serveur";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Abonnement = {
  endpoint: string;
  p256dh: string;
  auth: string;
  start_date: string;
  timezone: string;
  friday_alert: boolean;
  last_sent_on: string | null;
};

const PAR_PAGE = 500;
const EN_PARALLELE = 25;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const push = webPush();
  const maintenant = new Date();
  const aujourdhui = maintenant.toISOString().slice(0, 10);
  let envoyes = 0;
  // Supprimés après le parcours, pour ne pas décaler la pagination.
  const aSupprimer: string[] = [];

  for (let page = 0; ; page++) {
    const { data, error } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, start_date, timezone, friday_alert, last_sent_on")
      .order("endpoint")
      .range(page * PAR_PAGE, (page + 1) * PAR_PAGE - 1);
    if (error) {
      console.error("[notifications/envoi] lecture", error);
      return NextResponse.json({ erreur: "Lecture impossible." }, { status: 500 });
    }
    const abonnements = (data ?? []) as Abonnement[];

    // Envoi par petits groupes, pour rester dans le temps imparti.
    for (let i = 0; i < abonnements.length; i += EN_PARALLELE) {
      await Promise.all(
        abonnements.slice(i, i + EN_PARALLELE).map(async (a) => {
          if (a.last_sent_on === aujourdhui) return; // déjà reçu aujourd'hui
          const message = messageDuJour(a.start_date, a.timezone, a.friday_alert, maintenant);
          if (!message) return;
          try {
            await push.sendNotification(
              { endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
              JSON.stringify(message),
              { TTL: 12 * 60 * 60, urgency: "normal" },
            );
            envoyes++;
            await admin.from("push_subscriptions").update({ last_sent_on: aujourdhui }).eq("endpoint", a.endpoint);
          } catch (e) {
            const code = (e as { statusCode?: number }).statusCode;
            // Appareil désinscrit ou abonnement expiré : on l'oublie.
            if (code === 404 || code === 410) {
              aSupprimer.push(a.endpoint);
            } else {
              console.error("[notifications/envoi] envoi", code, e);
            }
          }
        }),
      );
    }
    if (abonnements.length < PAR_PAGE) break;
  }

  for (let i = 0; i < aSupprimer.length; i += 100) {
    await admin.from("push_subscriptions").delete().in("endpoint", aSupprimer.slice(i, i + 100));
  }

  return NextResponse.json({ envoyes, supprimes: aSupprimer.length });
}
