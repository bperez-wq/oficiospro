"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getMockSession } from "@/lib/storage";
import { canAccess, type SecurityResource } from "@/lib/security";

/**
 * Guard de ruta de cliente para páginas internas (admin, agenda, etc.).
 * Si la sesión actual no tiene permiso de lectura sobre `resource`, redirige a
 * /login (preservando el destino en ?next=) en vez de renderizar el contenido.
 * Mientras valida muestra un placeholder accesible; nunca expone el contenido
 * interno a un visitante sin sesión.
 */
export function RouteAuthGuard({
  resource,
  children,
}: {
  resource: SecurityResource;
  children: ReactNode;
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const session = getMockSession();
    if (canAccess(session?.role, resource, "read")) {
      setAuthorized(true);
      return;
    }
    setAuthorized(false);
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login?next=${next}`);
  }, [resource]);

  if (authorized === true) return <>{children}</>;

  return (
    <main className="section" aria-busy="true">
      <section className="panel" role="status" aria-live="polite">
        <p className="eyebrow">Acceso protegido</p>
        <h1 className="text-2xl font-black text-ink">
          {authorized === null ? "Validando tu sesión…" : "Redirigiendo al inicio de sesión…"}
        </h1>
        <p className="mt-3 font-semibold leading-7 text-muted">
          Esta sección es interna. Necesitas iniciar sesión con el rol adecuado para verla.
        </p>
      </section>
    </main>
  );
}
