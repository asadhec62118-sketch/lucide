import "server-only";

// Client Supabase « service_role » : uniquement côté serveur.
// Il contourne RLS et sert au webhook Stripe et à la vérification des jetons.

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) {
    throw new Error("Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes.");
  }
  admin = createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/** Vérifie le jeton « Bearer » envoyé par le navigateur et renvoie l'utilisateur. */
export async function utilisateurDepuisRequete(req: Request): Promise<User | null> {
  const entete = req.headers.get("authorization") ?? "";
  const jeton = entete.startsWith("Bearer ") ? entete.slice(7) : null;
  if (!jeton) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(jeton);
  if (error) return null;
  return data.user;
}
