import "server-only";

// Configuration de l'envoi des notifications Web Push (clés VAPID).

import webpush from "web-push";

let configure = false;

export function webPush() {
  if (!configure) {
    const publique = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privee = process.env.VAPID_PRIVATE_KEY;
    // Contact exigé par les services de notification : un « mailto: » ou l'URL du site.
    const sujet = process.env.VAPID_SUBJECT ?? process.env.NEXT_PUBLIC_SITE_URL;
    if (!publique || !privee || !sujet) throw new Error("Clés VAPID ou contact manquants.");
    webpush.setVapidDetails(sujet, publique, privee);
    configure = true;
  }
  return webpush;
}
