"use client";

// Client Supabase côté navigateur.
// La session est conservée dans le localStorage et le flux PKCE est utilisé
// pour les liens magiques. Si les variables d'environnement sont absentes,
// l'application continue de fonctionner en local, sans compte.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function supabaseNavigateur(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client =
    url && cle
      ? createClient(url, cle, {
          auth: {
            flowType: "pkce",
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: "lucide-auth",
          },
        })
      : null;
  return client;
}

/** Jeton d'accès de la session courante, pour appeler nos routes API. */
export async function jetonAcces(): Promise<string | null> {
  const sb = supabaseNavigateur();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
