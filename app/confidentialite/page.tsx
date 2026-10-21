import type { Metadata } from "next";
import { Info, PageLegale } from "@/components/PageLegale";
import { EDITEUR, PRESTATAIRES } from "@/lib/legal";

export const metadata: Metadata = { title: "Confidentialité · LUCIDE" };

// POLITIQUE DE CONFIDENTIALITÉ — RGPD. Les données de suivi sont des données
// de santé (article 9) : elles ne sont envoyées au serveur qu'avec un compte,
// créé avec un consentement explicite.
export default function Confidentialite() {
  return (
    <PageLegale titre="Confidentialité">
      <section>
        <h2>L&apos;essentiel</h2>
        <ul>
          <li>Sans compte, tes données restent uniquement sur ton téléphone.</li>
          <li>Avec un compte, elles sont sauvegardées pour que tu ne perdes jamais ton parcours.</li>
          <li>Elles ne sont jamais vendues, jamais utilisées pour de la publicité.</li>
          <li>Tu peux les télécharger ou tout supprimer à tout moment, depuis les réglages.</li>
        </ul>
      </section>

      <section>
        <h2>Qui est responsable de tes données ?</h2>
        <p>
          <Info valeur={EDITEUR.nom} />, éditeur de LUCIDE. Contact : <Info valeur={EDITEUR.email} />.
        </p>
      </section>

      <section>
        <h2>Quelles données ?</h2>
        <ul>
          <li>
            <strong>Ton compte</strong> : ton adresse e-mail.
          </li>
          <li>
            <strong>Ton suivi</strong> : tes réponses au départ (durée de consommation, dépense, joints par jour,
            raisons, déclencheurs, date de départ), ta phrase de décision, tes envies (intensité, déclencheur, lieu,
            émotion, activité choisie), tes reprises et tes réglages (Mode Foi, Mode Sport).
          </li>
          <li>
            <strong>Tes rappels</strong>, si tu les actives : l&apos;adresse technique de ton appareil, ta date de
            départ et ton fuseau horaire.
          </li>
          <li>
            <strong>Ton abonnement</strong> : son statut. Les données de paiement sont traitées directement par
            Stripe ; LUCIDE n&apos;a jamais accès à ta carte bancaire.
          </li>
        </ul>
        <p className="mt-2">
          Les informations sur ta consommation et tes envies sont des <strong>données de santé</strong>. Elles ne sont
          enregistrées sur nos serveurs qu&apos;avec ton <strong>consentement explicite</strong>, donné à la création
          du compte. Tu peux le retirer à tout moment en supprimant ton compte.
        </p>
      </section>

      <section>
        <h2>Pourquoi ?</h2>
        <ul>
          <li>Sauvegarder ton parcours et le retrouver sur tes appareils (consentement).</li>
          <li>Gérer ton abonnement (exécution du contrat).</li>
          <li>T&apos;envoyer tes rappels, si tu les actives (consentement).</li>
          <li>Respecter nos obligations légales, par exemple comptables.</li>
        </ul>
      </section>

      <section>
        <h2>Combien de temps ?</h2>
        <p>
          Tant que ton compte existe. Quand tu le supprimes, tes données de suivi sont effacées immédiatement. Les
          informations de facturation peuvent être conservées par Stripe pendant la durée exigée par la loi.
        </p>
      </section>

      <section>
        <h2>Qui y a accès ?</h2>
        <p>Uniquement les prestataires techniques nécessaires au service, tenus à la confidentialité :</p>
        <ul>
          {PRESTATAIRES.map((p) => (
            <li key={p.nom}>
              {p.nom} — {p.role}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          Certains de ces prestataires peuvent traiter des données hors de l&apos;Union européenne ; ces transferts
          sont encadrés par les garanties prévues par le RGPD (clauses contractuelles types ou décision
          d&apos;adéquation).
        </p>
      </section>

      <section>
        <h2>Tes droits</h2>
        <p>
          Tu peux accéder à tes données, les corriger, les télécharger, les supprimer, retirer ton consentement ou
          t&apos;opposer à un traitement. Le plus simple : la rubrique « Tes données » des réglages. Tu peux aussi
          écrire à <Info valeur={EDITEUR.email} />. Si tu estimes que tes droits ne sont pas respectés, tu peux
          saisir la CNIL (cnil.fr).
        </p>
      </section>

      <section>
        <h2>Cookies et mesure d&apos;audience</h2>
        <p>
          LUCIDE n&apos;utilise aucun cookie publicitaire. Le stockage de ton téléphone sert uniquement au
          fonctionnement de l&apos;application (ton compteur, ton journal, ta session). La mesure d&apos;audience est
          anonyme et sans cookie.
        </p>
        <p className="mt-2">
          Aux jours 7, 30 et 90, LUCIDE te propose un point d&apos;étape facultatif. Ta réponse est envoyée sans
          aucun identifiant : impossible de savoir qu&apos;elle vient de toi. Elle sert uniquement à mesurer si
          LUCIDE aide vraiment, et à l&apos;améliorer.
        </p>
      </section>

      <section>
        <h2>Âge</h2>
        <p>LUCIDE s&apos;adresse aux personnes majeures.</p>
      </section>
    </PageLegale>
  );
}
