// Génère le QR code à imprimer dans le livre, qui ouvre la page /livre de LUCIDE.
// Usage : node scripts/generer-qr.mjs https://ton-domaine.fr
// Produit public/qr-livre.png (écran) et public/qr-livre.svg (impression, net à toute taille).

import QRCode from "qrcode";

const site = process.argv[2];
if (!site || !/^https:\/\//.test(site)) {
  console.error("Indique l'adresse du site, par exemple : node scripts/generer-qr.mjs https://lucide.fr");
  process.exit(1);
}
const url = `${site.replace(/\/$/, "")}/livre`;
const options = { errorCorrectionLevel: "M", margin: 2, color: { dark: "#0E0E10", light: "#FFFFFF" } };

await QRCode.toFile("public/qr-livre.png", url, { ...options, width: 1024 });
await QRCode.toFile("public/qr-livre.svg", url, { ...options, type: "svg" });
console.log(`QR code généré pour ${url} : public/qr-livre.png et public/qr-livre.svg`);
