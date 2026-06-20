"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function FounderStickyCta({ href }: { href: string }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-brand/20 bg-white/95 p-3 shadow-lift backdrop-blur md:hidden">
      <Link
        href={href}
        className="btn-sun w-full justify-center text-center"
        onClick={() => {
          void trackEvent({
            eventName: "founder_sticky_cta_clicked",
            sourceComponent: "FounderStickyCta",
            sourceButton: "Crear perfil sin costo sticky",
            metadata: { funnel: "specialist_acquisition" },
          });
        }}
      >
        Crear perfil sin costo
      </Link>
    </div>
  );
}
