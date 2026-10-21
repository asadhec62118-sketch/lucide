// Lien de confiance entre le site et l'application Android publiée sur le
// Google Play Store (Trusted Web Activity) : sans ce fichier, l'application
// Android afficherait une barre d'adresse.
// Les valeurs viennent de PWABuilder au moment de créer le paquet Android.

export const dynamic = "force-static";

export function GET() {
  const paquet = process.env.ANDROID_PACKAGE_NAME;
  const empreintes = (process.env.ANDROID_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const liens =
    paquet && empreintes.length
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: { namespace: "android_app", package_name: paquet, sha256_cert_fingerprints: empreintes },
          },
        ]
      : [];

  return Response.json(liens);
}
