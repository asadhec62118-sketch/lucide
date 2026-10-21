// Réception d'un point d'étape anonyme (jours 7, 30, 90).
// Aucun identifiant n'est reçu ni enregistré.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ETAPES = [7, 30, 90];
const STATUTS = ["libre", "ecarts", "reprise"];

export async function POST(req: Request) {
  const corps = (await req.json().catch(() => ({}))) as { etape?: unknown; statut?: unknown; note?: unknown };
  const note = corps.note === null || corps.note === undefined ? null : corps.note;
  if (
    !ETAPES.includes(corps.etape as number) ||
    !STATUTS.includes(corps.statut as string) ||
    (note !== null && !(Number.isInteger(note) && (note as number) >= 1 && (note as number) <= 5))
  ) {
    return NextResponse.json({ erreur: "Réponse invalide." }, { status: 400 });
  }
  try {
    const { error } = await supabaseAdmin()
      .from("mesures_anonymes")
      .insert({ etape: corps.etape, statut: corps.statut, note });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[mesure]", e);
    return NextResponse.json({ erreur: "Enregistrement impossible." }, { status: 500 });
  }
}
