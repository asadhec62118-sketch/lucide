// Traduction des erreurs d'authentification Supabase.

/** Messages d'erreur Supabase les plus courants, en français. */
export function traduireErreur(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Un compte existe déjà avec cette adresse. Connecte-toi depuis les réglages.";
  if (m.includes("invalid login")) return "Email ou mot de passe incorrect.";
  if (m.includes("password")) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  if (m.includes("fetch") || m.includes("network")) return "Pas de connexion. Réessaie quand tu seras en ligne.";
  return "Une erreur est survenue. Réessaie.";
}
