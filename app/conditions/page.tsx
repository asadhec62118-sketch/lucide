import type { Metadata } from "next";
import { Info, PageLegale } from "@/components/PageLegale";
import { TARIFS } from "@/lib/constants";
import { EDITEUR } from "@/lib/legal";

export const metadata: Metadata = { title: "Conditions d'utilisation · LUCIDE" };

// CONDITIONS GÉNÉRALES D'UTILISATION ET DE VENTE — service, abonnement, résiliation.
export default function Conditions() {
  return (
    <PageLegale titre="Conditions d'utilisation et de vente">
      <section>
        <h2>Le service</h2>
        <p>
          LUCIDE accompagne les personnes qui arrêtent le cannabis : compteur, Mode Envie, programme de 30 jours,
          journal et parcours. C&apos;est un outil de suivi et de motivation, pas un soin ni un dispositif médical.
          Il ne promet aucun résultat et ne remplace pas un professionnel de santé.
        </p>
      </section>

      <section>
        <h2>Version gratuite et version complète</h2>
        <p>
          La version gratuite donne accès au compteur, aux 7 premiers jours du programme, au Mode Envie trois fois
          par semaine, aux rappels et à l&apos;aide. La version complète ajoute le programme de 30 jours, le Mode
          Envie illimité, le parcours jusqu&apos;à J90 et les analyses personnelles.
        </p>
      </section>

      <section>
        <h2>Prix et essai gratuit</h2>
        <ul>
          <li>
            {TARIFS.mensuel.montant} par mois, ou {TARIFS.annuel.montant} par an, toutes taxes comprises.
          </li>
          <li>
            Un premier abonnement commence par {TARIFS.essaiJours} jours d&apos;essai gratuit. Sans résiliation
            pendant l&apos;essai, l&apos;abonnement démarre automatiquement à la fin de celui-ci.
          </li>
          <li>L&apos;abonnement se renouvelle automatiquement à chaque échéance (mois ou année).</li>
          <li>Le paiement est géré par Stripe, de manière sécurisée.</li>
        </ul>
      </section>

      <section>
        <h2>Résiliation</h2>
        <p>
          Tu peux résilier à tout moment depuis les réglages (« Gérer mon abonnement »), en quelques clics.
          L&apos;accès à la version complète reste ouvert jusqu&apos;à la fin de la période déjà payée.
        </p>
      </section>

      <section>
        <h2>Droit de rétractation</h2>
        <p>
          Conformément au Code de la consommation, tu disposes d&apos;un délai de 14 jours à compter de la
          souscription pour te rétracter, en écrivant à <Info valeur={EDITEUR.email} />. Tu es alors remboursé des
          sommes payées.
        </p>
      </section>

      <section>
        <h2>Ton compte</h2>
        <p>
          Tu es responsable de la confidentialité de tes accès. Tu peux supprimer ton compte et toutes tes données à
          tout moment depuis les réglages.
        </p>
      </section>

      <section>
        <h2>Contact et litiges</h2>
        <p>
          Pour toute question : <Info valeur={EDITEUR.email} />. Ces conditions sont soumises au droit français. En
          cas de litige, une solution amiable sera recherchée en priorité ; tu peux aussi recourir gratuitement à un
          médiateur de la consommation.
        </p>
      </section>
    </PageLegale>
  );
}
