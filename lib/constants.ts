// Contenus et listes de référence de LUCIDE.
// Tout le vocabulaire visible est ici : tutoiement, pas de jargon médical,
// aucune promesse de résultat.

/** Raisons proposées à l'étape 3 de l'onboarding. */
export const RAISONS = [
  "Ma santé",
  "Ma foi",
  "Mon argent",
  "Mon sport",
  "Ma famille",
  "Ma clarté mentale",
  "Ma liberté",
] as const;

/** Déclencheurs proposés à l'onboarding et dans le journal rapide. */
export const DECLENCHEURS = [
  "Soirée",
  "Stress",
  "Ennui",
  "Amis",
  "Après le travail",
  "Avant de dormir",
  "Seul chez moi",
] as const;

/** Lieux proposés dans le journal rapide du Mode Envie. */
export const LIEUX = [
  "Chez moi",
  "Au travail",
  "Dehors",
  "Chez des amis",
  "En soirée",
  "Dans les transports",
] as const;

/** Émotions proposées dans le journal rapide du Mode Envie. */
export const EMOTIONS = [
  "Stressé·e",
  "Anxieux·se",
  "Triste",
  "En colère",
  "Ennuyé·e",
  "Fatigué·e",
  "Seul·e",
  "Bien, juste l'habitude",
] as const;

/** Alternatives physiques proposées quand le Mode Sport est actif. */
export const ACTIVITES_SPORT = [
  { id: "pompes", titre: "20 pompes", detail: "À ton rythme, en plusieurs séries si besoin." },
  { id: "corde", titre: "5 minutes de corde à sauter", detail: "Ou des sauts sur place sans corde." },
  { id: "marche", titre: "Marche de 10 minutes", detail: "Sors, change d'air, marche d'un bon pas." },
] as const;

/** Nombre d'utilisations du Mode Envie par semaine en version gratuite. */
export const LIMITE_ENVIES_GRATUIT = 3;

/** Durée du minuteur du Mode Envie, en secondes. */
export const DUREE_ENVIE_SECONDES = 10 * 60;

/** Jour (inclus) au-delà duquel le Parcours est réservé aux abonnés. */
export const JOUR_LIMITE_PARCOURS_GRATUIT = 7;

/** Dernier jour du programme de 30 jours accessible en version gratuite. */
export const JOUR_LIMITE_PROGRAMME_GRATUIT = 7;

/** Nombre d'entrées au-delà duquel la section « Tes schémas » apparaît. */
export const SEUIL_SCHEMAS = 10;

/** Règle de sécurité : 3 envies d'intensité ≥ 9 sur 24 heures. */
export const SECURITE = { intensiteMin: 9, nombre: 3, fenetreHeures: 24 } as const;

/** Tarifs affichés (les prix réels sont configurés dans Stripe). */
export const TARIFS = {
  mensuel: { libelle: "4,99 € / mois", montant: "4,99 €", periode: "par mois" },
  annuel: { libelle: "34,99 € / an", montant: "34,99 €", periode: "par an", note: "soit 2,92 € par mois" },
  essaiJours: 7,
} as const;

/** Lignes d'écoute affichées dans le bloc d'aide permanent. */
export const AIDE = [
  {
    nom: "Drogues Info Service",
    numero: "0 800 23 13 13",
    tel: "0800231313",
    detail: "Anonyme et gratuit, 7j/7 de 8h à 2h.",
  },
  {
    nom: "Écoute Cannabis",
    numero: "0 980 980 940",
    tel: "0980980940",
    detail: "Une écoute dédiée au cannabis.",
  },
] as const;

export const MENTION_LEGALE =
  "LUCIDE est un outil de suivi, pas un soin. Il ne remplace pas un professionnel de santé.";

/** Un jalon du Parcours. */
export type Jalon = {
  id: string;
  /** Libellé court affiché dans la pastille (J1, J2-3…). */
  libelle: string;
  /** Premier jour concerné par le jalon (J1 = les premières 24 heures). */
  jour: number;
  /** Nombre de jours écoulés à partir duquel le jalon est atteint. */
  fin: number;
  titre: string;
  texte: string;
};

/**
 * Chronologie du Parcours. Les descriptions restent prudentes :
 * elles décrivent ce que beaucoup de personnes vivent, sans rien promettre.
 */
export const JALONS: Jalon[] = [
  {
    id: "j1",
    libelle: "J1",
    jour: 1,
    fin: 1,
    titre: "Le premier jour",
    texte:
      "Les envies arrivent surtout aux moments où tu consommais d'habitude : le soir, après le travail, avant de dormir. C'est l'habitude qui parle, plus que le besoin. Tu peux te sentir un peu nerveux ou agité.",
  },
  {
    id: "j2-3",
    libelle: "J2-3",
    jour: 2,
    fin: 3,
    titre: "Les jours les plus intenses",
    texte:
      "Pour beaucoup, c'est le moment le plus inconfortable : irritabilité, sommeil agité, moins d'appétit, humeur en dents de scie. Ton corps se réajuste. Ça passe, et c'est souvent ici que le Mode Envie sert le plus.",
  },
  {
    id: "j4-7",
    libelle: "J4-7",
    jour: 4,
    fin: 7,
    titre: "Les rêves reviennent",
    texte:
      "Beaucoup de personnes remarquent des rêves très présents, parfois intenses ou étranges. Le sommeil peut rester irrégulier. Les envies sont souvent encore là, mais un peu moins longues.",
  },
  {
    id: "j7",
    libelle: "J7",
    jour: 7,
    fin: 7,
    titre: "Une semaine",
    texte:
      "Une semaine entière. Les sensations les plus fortes commencent en général à baisser. Regarde ce que tu as déjà économisé : c'est concret, et c'est à toi.",
  },
  {
    id: "j14",
    libelle: "J14",
    jour: 14,
    fin: 14,
    titre: "Deux semaines",
    texte:
      "Le sommeil se stabilise progressivement pour beaucoup. L'énergie du matin revient souvent, l'humeur devient plus régulière. Les envies restent possibles, surtout dans les situations où tu consommais avant.",
  },
  {
    id: "j30",
    libelle: "J30",
    jour: 30,
    fin: 30,
    titre: "Un mois",
    texte:
      "Les zones du cerveau sur lesquelles agit le cannabis ont eu le temps de retrouver une grande partie de leur fonctionnement habituel. Beaucoup décrivent une tête plus claire, une meilleure mémoire au quotidien et plus de facilité à se concentrer.",
  },
  {
    id: "j90",
    libelle: "J90",
    jour: 90,
    fin: 90,
    titre: "Trois mois",
    texte:
      "Tes nouvelles habitudes ont pris leur place. Les envies sont souvent plus rares et plus faciles à reconnaître. Tu sais maintenant ce qui les déclenche et comment les traverser.",
  },
];

/** Paliers utilisés pour le « jalon suivant » de l'accueil. */
export const PALIERS_JOURS = [1, 3, 7, 14, 30, 60, 90, 180, 365, 730, 1095];
