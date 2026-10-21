import type { Metadata } from "next";
import { Info, PageLegale } from "@/components/PageLegale";
import { EDITEUR, PRESTATAIRES } from "@/lib/legal";

export const metadata: Metadata = { title: "Mentions légales · LUCIDE" };

// MENTIONS LÉGALES — éditeur, hébergement, nature du service.
export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales">
      <section>
        <h2>Éditeur</h2>
        <p>
          <Info valeur={EDITEUR.nom} /> — <Info valeur={EDITEUR.statut} />
          <br />
          Adresse : <Info valeur={EDITEUR.adresse} />
          <br />
          SIREN / SIRET : <Info valeur={EDITEUR.siret} />
          <br />
          Contact : <Info valeur={EDITEUR.email} />
          <br />
          Directeur de la publication : <Info valeur={EDITEUR.nom} />
        </p>
      </section>

      <section>
        <h2>Hébergement et prestataires</h2>
        <ul>
          {PRESTATAIRES.map((p) => (
            <li key={p.nom}>
              <strong>{p.nom}</strong> — {p.role} ({p.site})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Nature du service</h2>
        <p>
          LUCIDE est un outil de suivi et de motivation pour les personnes qui arrêtent le cannabis. Ce n&apos;est pas
          un dispositif médical, ni un soin, ni un avis médical. Il ne remplace pas un professionnel de santé. En cas
          de difficulté, tu peux appeler Drogues Info Service au 0 800 23 13 13 (anonyme et gratuit, 7j/7 de 8h à 2h).
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes du programme sont tirés du livre « Comment tu vas arrêter le cannabis ». L&apos;ensemble des
          contenus de LUCIDE (textes, interface, logo) est protégé. Toute reproduction sans autorisation est
          interdite.
        </p>
      </section>
    </PageLegale>
  );
}
