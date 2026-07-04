import { specialists as demoCatalogSpecialists, type Specialist } from "@/data/mock";

const demoSpecialistKeys = new Set(
  demoCatalogSpecialists.flatMap((specialist) => [specialist.id, specialist.slug].filter(Boolean) as string[]),
);

/* Un especialista es "referencial" si pertenece al catálogo demo estático y no
 * fue publicado por el flujo real de admin. Los publicados reales siempre
 * llevan publishedFromAdmin: true, así que un id repetido no los reclasifica. */
export function isDemoSpecialist(specialist: Pick<Specialist, "id" | "slug" | "publishedFromAdmin"> | null | undefined) {
  if (!specialist) return false;
  if (specialist.publishedFromAdmin) return false;
  return demoSpecialistKeys.has(specialist.id) || (specialist.slug ? demoSpecialistKeys.has(specialist.slug) : false);
}

export const DEMO_PROFILE_BADGE = "Perfil referencial";

export const DEMO_PROFILE_NOTICE =
  "Este perfil muestra cómo se verá un especialista en OficiosPro. La disponibilidad real depende de la revisión y cobertura.";
