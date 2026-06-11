/**
 * Mapeo central de imágenes de oficios (public/assets/oficios/*).
 * Banco propio de imágenes realistas, 1168×784 (3:2), 150-450 KB c/u.
 * Evita hardcodear rutas: importar desde aquí.
 *
 * Pendiente Fase performance: generar variantes webp/responsive antes de
 * producción masiva (las JPG actuales pesan <450 KB y no bloquean el build).
 */

const base = "/assets/oficios";

/** Imagen representativa por categoría/rubro. */
export const categoryImages: Record<string, string> = {
  gasfiteria: `${base}/gasfiteria/gasfiteria-trabajo-01.jpg`,
  calefont: `${base}/calefont/calefont-mantencion-01.jpg`,
  electricidad: `${base}/electricidad/electricidad-tablero-01.jpg`,
  climatizacion: `${base}/climatizacion/aire-acondicionado-instalacion-01.jpg`,
  "climatizacion-refrigeracion": `${base}/climatizacion/aire-acondicionado-instalacion-01.jpg`,
  pintura: `${base}/pintura/pintura-fachada-01.jpg`,
  construccion: `${base}/pintura/terminaciones-ceramica-01.jpg`,
  jardineria: `${base}/jardineria/jardineria-poda-01.jpg`,
  piscinas: `${base}/piscinas/piscina-mantencion-01.jpg`,
  cerrajeria: `${base}/cerrajeria/cerrajeria-cerradura-01.jpg`,
  carpinteria: `${base}/carpinteria/carpinteria-maestro-01.jpg`,
  hogar: `${base}/gasfiteria/gasfiteria-trabajo-01.jpg`,
  comunidades: `${base}/piscinas/piscina-mantencion-01.jpg`,
  empresas: `${base}/climatizacion/aire-acondicionado-instalacion-01.jpg`,
  seguridad: `${base}/cerrajeria/cerrajeria-cerradura-01.jpg`,
  limpieza: `${base}/pintura/pintura-interior-01.jpg`,
  industria: `${base}/industria/industria-mantencion-01.jpg`,
  agroindustria: `${base}/agro/agro-packing-01.jpg`,
  agricultura: `${base}/agro/agro-cosecha-01.jpg`,
  emergencias: `${base}/cerrajeria/cerrajeria-puerta-01.jpg`,
};

/** Imágenes por servicio frecuente (ejemplos de uso de créditos, cards, etc.). */
export const serviceImages = {
  filtracion: `${base}/gasfiteria/gasfiteria-trabajo-01.jpg`,
  griferia: `${base}/gasfiteria/gasfiteria-griferia-01.jpg`,
  redExterior: `${base}/gasfiteria/gasfiteria-red-exterior-01.jpg`,
  medidorGas: `${base}/gasfiteria/gasfiteria-medidor-01.jpg`,
  calefont: `${base}/calefont/calefont-mantencion-01.jpg`,
  calefontRevision: `${base}/calefont/calefont-revision-01.jpg`,
  tableroElectrico: `${base}/electricidad/electricidad-tablero-01.jpg`,
  luminarias: `${base}/electricidad/electricidad-luminaria-01.jpg`,
  instalacionElectrica: `${base}/electricidad/electricidad-instalacion-01.jpg`,
  medidorElectrico: `${base}/electricidad/electricidad-medidor-01.jpg`,
  aireAcondicionado: `${base}/climatizacion/aire-acondicionado-instalacion-01.jpg`,
  aireMantencion: `${base}/climatizacion/aire-acondicionado-mantencion-01.jpg`,
  pinturaFachada: `${base}/pintura/pintura-fachada-01.jpg`,
  pinturaInterior: `${base}/pintura/pintura-interior-01.jpg`,
  pinturaCielo: `${base}/pintura/pintura-cielo-01.jpg`,
  ceramica: `${base}/pintura/terminaciones-ceramica-01.jpg`,
  poda: `${base}/jardineria/jardineria-poda-01.jpg`,
  pasto: `${base}/jardineria/jardineria-pasto-01.jpg`,
  plantacion: `${base}/jardineria/jardineria-plantacion-01.jpg`,
  piscina: `${base}/piscinas/piscina-mantencion-01.jpg`,
  cerradura: `${base}/cerrajeria/cerrajeria-cerradura-01.jpg`,
  puerta: `${base}/cerrajeria/cerrajeria-puerta-01.jpg`,
  carpinteria: `${base}/carpinteria/carpinteria-maestro-01.jpg`,
  taller: `${base}/carpinteria/carpinteria-taller-01.jpg`,
} as const;

/** Fallback de imagen por oficio cuando el especialista no tiene foto propia. */
export function fallbackSpecialistImage(serviceTypeId?: string, specialty?: string) {
  const key = (specialty ?? serviceTypeId ?? "").toLowerCase();
  if (key.includes("gasfiter") || key.includes("filtra")) return serviceImages.filtracion;
  if (key.includes("calefont")) return serviceImages.calefont;
  if (key.includes("electric")) return serviceImages.tableroElectrico;
  if (key.includes("clima") || key.includes("aire") || key.includes("refriger")) return serviceImages.aireAcondicionado;
  if (key.includes("pintur") || key.includes("termina")) return serviceImages.pinturaInterior;
  if (key.includes("jardin") || key.includes("paisaj")) return serviceImages.poda;
  if (key.includes("piscina")) return serviceImages.piscina;
  if (key.includes("cerraj") || key.includes("segur")) return serviceImages.cerradura;
  if (key.includes("carpin") || key.includes("mueble")) return serviceImages.carpinteria;
  if (key.includes("industria")) return categoryImages.industria;
  if (key.includes("agro") || key.includes("packing") || key.includes("riego")) return categoryImages.agroindustria;
  return serviceImages.filtracion;
}

/** Imágenes para la galería de trabajos realizados (proof gallery). */
export const workProofImages = {
  banoReparado: serviceImages.griferia,
  tableroRenovado: serviceImages.tableroElectrico,
  aireInstalado: serviceImages.aireAcondicionado,
  jardinRecuperado: serviceImages.poda,
  piscinaMantenida: serviceImages.piscina,
} as const;

/** Imágenes para casos de uso empresa/comunidades. */
export const businessUseCaseImages = {
  comunidades: serviceImages.piscina,
  oficinas: serviceImages.pinturaInterior,
  restaurantesFrio: `${base}/agro/agro-camara-frio-01.jpg`,
  industria: `${base}/industria/industria-bombas-01.jpg`,
  packing: `${base}/agro/agro-packing-01.jpg`,
  planta: `${base}/industria/industria-planta-01.jpg`,
} as const;

/** Collage del hero de la Home (solo desktop). */
export const heroCollageImages = [
  { src: serviceImages.filtracion, alt: "Gasfíter reparando una filtración bajo el lavaplatos" },
  { src: serviceImages.tableroElectrico, alt: "Electricista revisando un tablero eléctrico domiciliario" },
  { src: serviceImages.aireAcondicionado, alt: "Técnico instalando un aire acondicionado exterior" },
  { src: serviceImages.poda, alt: "Jardinero realizando mantención de áreas verdes" },
] as const;
