// Contenu réservé aux abonnés : affiché flouté, avec une incitation à l'abonnement.

import Link from "next/link";
import type { ReactNode } from "react";
import { TARIFS } from "@/lib/constants";
import { IconeCadenas } from "./Icones";

export function Verrou({
  verrouille,
  message,
  children,
}: {
  verrouille: boolean;
  message: string;
  children: ReactNode;
}) {
  if (!verrouille) return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none blur-md">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-xs rounded-2xl border border-ambre/40 bg-fond/90 p-5 text-center shadow-xl">
          <IconeCadenas className="mx-auto h-6 w-6 text-ambre" />
          <p className="mt-2 text-sm font-medium">{message}</p>
          <Link
            href="/reglages#abonnement"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-ambre px-4 text-sm font-semibold text-fond"
          >
            Essayer {TARIFS.essaiJours} jours gratuits
          </Link>
        </div>
      </div>
    </div>
  );
}
