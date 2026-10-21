// Choix du rappel du jour, envoyé chaque matin par le serveur.
// Fonction pure : elle ne dépend que de la date de départ, du fuseau horaire
// et de la préférence « vendredi soir ». Un seul message par jour au maximum.

import { NB_JOURS_PROGRAMME, PROGRAMME, RENDEZ_VOUS } from "../programme";

export type MessageRappel = { titre: string; corps: string; url: string };

const MS_JOUR = 24 * 60 * 60 * 1000;

/** Paliers après le programme, où l'on envoie un mot de félicitations. */
const PALIERS_APRES_PROGRAMME = [45, 60, 90, 120, 180, 270, 365];

/** Première phrase d'un texte, pour tenir dans une notification. */
function premierePhrase(texte: string): string {
  const fin = texte.search(/[.!?…](\s|$)/);
  return fin > 0 ? texte.slice(0, fin + 1) : texte;
}

/** Jour de la semaine dans le fuseau de l'utilisateur (0 = dimanche). */
function jourSemaine(maintenant: Date, fuseau: string): number {
  const nom = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: fuseau }).format(maintenant);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(nom);
}

export function messageDuJour(
  dateDepart: string,
  fuseau: string,
  alerteVendredi: boolean,
  maintenant: Date = new Date(),
): MessageRappel | null {
  const ecoule = maintenant.getTime() - new Date(dateDepart).getTime();
  if (ecoule < 0) return null;
  const jour = Math.floor(ecoule / MS_JOUR) + 1;

  // Le vendredi, pour ceux dont les envies viennent des soirées : le piège du Jour 11.
  if (alerteVendredi && jour > 1 && jourSemaine(maintenant, fuseau) === 5) {
    return {
      titre: "C'est vendredi",
      corps:
        "Le piège du vendredi soir n'existe que si tu arrives les mains vides. Prévois dès maintenant quelque chose d'exceptionnel et de sain pour ce soir.",
      url: "/",
    };
  }

  // Pendant le programme : le jour qui s'ouvre.
  if (jour <= NB_JOURS_PROGRAMME) {
    const j = PROGRAMME[jour - 1];
    return {
      titre: `Jour ${jour} · ${j.titre}`,
      corps: premierePhrase(j.pensee),
      url: `/programme?jour=${jour}`,
    };
  }

  // Mois 2 et 3 : le rendez-vous de la semaine.
  const jours = jour - 1;
  const rdv = RENDEZ_VOUS.find((r) => r.jour === jours);
  if (rdv) {
    return {
      titre: `Ton rendez-vous de la semaine · ${rdv.titre}`,
      corps: premierePhrase(rdv.pensee),
      url: "/programme#rendez-vous",
    };
  }

  // Ensuite : un mot aux grands paliers, puis chaque année.
  if (PALIERS_APRES_PROGRAMME.includes(jours) || (jours > 365 && jours % 365 === 0)) {
    return {
      titre: `Libre depuis ${jours} jours`,
      corps: "Ta liberté continue de grandir, jour après jour. Prends une seconde pour en être fier.",
      url: "/",
    };
  }
  return null;
}
