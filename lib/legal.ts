// Informations légales de LUCIDE.
// ⚠️ À compléter par l'éditeur avant le lancement public : tant qu'un champ
// est vide, les pages légales affichent « à compléter ».

export const EDITEUR = {
  /** Nom et prénom (entrepreneur individuel) ou raison sociale. */
  nom: "",
  /** Statut : « Entrepreneur individuel », « SAS », etc. */
  statut: "",
  /** Adresse postale. */
  adresse: "",
  /** Adresse e-mail de contact (questions, exercice des droits RGPD). */
  email: "",
  /** Numéro SIREN ou SIRET, si l'activité est déclarée. */
  siret: "",
};

/** Prestataires techniques (sous-traitants au sens du RGPD). */
export const PRESTATAIRES = [
  { nom: "Vercel Inc.", role: "Hébergement de l'application", site: "https://vercel.com" },
  { nom: "Supabase Inc.", role: "Base de données et comptes", site: "https://supabase.com" },
  { nom: "Stripe Payments Europe, Ltd.", role: "Paiement des abonnements", site: "https://stripe.com" },
];

/** Date de dernière mise à jour des documents légaux. */
export const MISE_A_JOUR_LEGALE = "21 octobre 2026";
