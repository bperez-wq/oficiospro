import type { Specialist } from "@/data/mock";
import type { FlexibleService } from "@/data/flexiblePricing";
import { getTradeCategoryById, getTradeSpecialtyBySlugOrLabel, tradeSearchTermsForCategory } from "@/data/tradeTaxonomy";
import { normalizeSearch } from "@/lib/catalog";
import { getPrimaryFlexibleService, pricingSummary } from "@/lib/flexiblePricing";

export type CategoryRouteConfig = {
  categoryId: string;
  label: string;
  title: string;
  subtitle: string;
  terms: string[];
  suggestions: string[];
};

export type SpecialtyRouteConfig = {
  label: string;
  terms: string[];
  categoryId?: string;
};

export type SpecialistSearchIntent = {
  categoryParam?: string;
  specialtyParam?: string;
  query?: string;
  explicitCategory?: string;
  explicitSpecialty?: string;
};

export const categoryRoutes: Record<string, CategoryRouteConfig> = {
  hogar: {
    categoryId: "hogar",
    label: "Hogar",
    title: "Especialistas para el hogar",
    subtitle: "Gasfiteria, electricidad, calefont, filtraciones, jardin, climatizacion, pintura y reparaciones menores.",
    terms: [
      "hogar",
      "casa",
      "departamento",
      "gasfiter",
      "calefont",
      "filtracion",
      "electric",
      "cerraj",
      "pintura",
      "jardin",
      "piscina",
      "muebles",
      "reparaciones menores",
      "aire acondicionado",
      "climatizacion",
    ],
    suggestions: ["Gasfiteria", "Electricidad", "Calefont", "Jardineria", "Climatizacion", "Reparaciones"],
  },
  comunidades: {
    categoryId: "empresas",
    label: "Comunidades",
    title: "Especialistas para comunidades y edificios",
    subtitle: "Salas de bombas, portones, camaras, calderas, piscinas, electricidad comun y mantencion preventiva.",
    terms: [
      "comunidad",
      "comunidades",
      "edificio",
      "condominio",
      "sala de bombas",
      "bomba",
      "porton",
      "camara",
      "cctv",
      "caldera",
      "piscina",
      "mantencion preventiva",
      "control de acceso",
    ],
    suggestions: ["Bombas", "Portones", "Camaras", "Piscinas", "Electricidad", "Mantencion"],
  },
  empresas: {
    categoryId: "empresas",
    label: "Empresas y comercios",
    title: "Especialistas para empresas y comercios",
    subtitle: "Mantencion para oficinas, retail, restaurantes, bodegas, sucursales y operacion comercial.",
    terms: [
      "empresa",
      "comercial",
      "oficina",
      "retail",
      "restaurante",
      "bodega",
      "local",
      "sucursal",
      "proveedor residente",
      "mantencion oficinas",
      "refrigeracion comercial",
      "seguridad electronica",
    ],
    suggestions: ["Mantencion oficinas", "Refrigeracion", "Seguridad", "Electricidad", "Climatizacion", "Sucursales"],
  },
  industria: {
    categoryId: "industria",
    label: "Industria",
    title: "Especialistas en mantenimiento industrial",
    subtitle: "Motores, bombas, soldadura, tableros, hidraulica, neumatica, montaje y paradas de planta.",
    terms: ["industria", "industrial", "motores", "bombas", "soldadura", "hidraulica", "neumatica", "plc", "tablero", "montaje", "paradas de planta"],
    suggestions: ["Motores", "Bombas", "Soldadura", "Tableros", "PLC", "Montaje"],
  },
  agricultura: {
    categoryId: "agroindustria",
    label: "Agricultura y campos",
    title: "Especialistas para agricultura y campos",
    subtitle: "Riego tecnificado, maquinaria agricola, contratistas, poda, cosecha, bombas, fertirriego y telemetria.",
    terms: [
      "agricultura",
      "agricola",
      "campo",
      "riego",
      "riego tecnificado",
      "maquinaria agricola",
      "tractor",
      "contratistas",
      "poda",
      "cosecha",
      "fertirriego",
      "telemetria",
      "bomba de riego",
    ],
    suggestions: ["Riego tecnificado", "Maquinaria agricola", "Contratistas", "Bombas de riego", "Poda y cosecha"],
  },
  agroindustria: {
    categoryId: "agroindustria",
    label: "Agroindustria y packing",
    title: "Especialistas para agroindustria y packing",
    subtitle: "Packing, frio alimentario, camaras, lineas de proceso, bombas, automatizacion y mantencion de planta.",
    terms: ["agroindustria", "packing", "frio", "frigor", "camara", "lineas de proceso", "proceso", "caldera", "compresor", "bomba", "planta"],
    suggestions: ["Packing", "Frio", "Camaras", "Lineas de proceso", "Bombas", "Automatizacion"],
  },
  emergencias: {
    categoryId: "emergencias",
    label: "Emergencias",
    title: "Especialistas para emergencias",
    subtitle: "Fugas, cortes electricos, calefont detenido, portones, cerraduras, refrigeracion critica y urgencias operativas.",
    terms: ["emergencia", "urgente", "fuga", "corte", "calefont detenido", "cerrajero", "porton", "destape", "refrigeracion critica", "bomba detenida"],
    suggestions: ["Fugas", "Cortes electricos", "Calefont", "Cerrajeria", "Portones", "Refrigeracion critica"],
  },
  climatizacion: {
    categoryId: "climatizacion-refrigeracion",
    label: "Climatizacion",
    title: "Especialistas en climatizacion y refrigeracion",
    subtitle: "Aire acondicionado, bombas de calor, frio comercial, camaras y mantencion HVAC.",
    terms: ["climatizacion", "aire acondicionado", "calefaccion", "hvac", "bomba de calor", "frio", "refrigeracion", "camara"],
    suggestions: ["Aire acondicionado", "Calefaccion", "Bombas de calor", "HVAC", "Refrigeracion"],
  },
  "climatizacion-refrigeracion": {
    categoryId: "climatizacion-refrigeracion",
    label: "Climatizacion y refrigeracion",
    title: "Especialistas en climatizacion y refrigeracion",
    subtitle: "Aire acondicionado, bombas de calor, frio comercial, camaras y mantencion HVAC.",
    terms: ["climatizacion", "aire acondicionado", "calefaccion", "hvac", "bomba de calor", "frio", "refrigeracion", "camara"],
    suggestions: ["Aire acondicionado", "Calefaccion", "Bombas de calor", "HVAC", "Refrigeracion"],
  },
  construccion: {
    categoryId: "construccion",
    label: "Construccion",
    title: "Especialistas en construccion y remodelacion",
    subtitle: "Remodelaciones, terminaciones, tabiqueria, pintura, reparaciones y maestros especialistas.",
    terms: ["construccion", "remodelacion", "maestro", "tabiqueria", "terminaciones", "pintura", "reparacion"],
    suggestions: ["Remodelaciones", "Pintura", "Terminaciones", "Reparaciones"],
  },
  seguridad: {
    categoryId: "automatizacion",
    label: "Seguridad y tecnologia",
    title: "Especialistas en seguridad y tecnologia",
    subtitle: "Camaras, alarmas, control de acceso, redes y automatizacion.",
    terms: ["seguridad", "camara", "cctv", "alarma", "control de acceso", "red", "wifi", "automatizacion"],
    suggestions: ["Camaras", "Alarmas", "Control de acceso", "Redes"],
  },
  limpieza: {
    categoryId: "all",
    label: "Limpieza y mantencion",
    title: "Especialistas en limpieza y mantencion",
    subtitle: "Limpieza, sanitizacion, mantencion preventiva y apoyo operativo.",
    terms: ["limpieza", "aseo", "sanitizacion", "mantencion"],
    suggestions: ["Limpieza", "Sanitizacion", "Mantencion"],
  },
};

categoryRoutes["comunidades-edificios"] = {
  ...categoryRoutes.comunidades,
  label: "Comunidades y edificios",
};

categoryRoutes["empresas-industria"] = {
  categoryId: "empresas",
  label: "Empresas e industria",
  title: "Especialistas para empresas e industria",
  subtitle: "Mantencion comercial, refrigeracion, seguridad, limpieza, motores, soldadura, tableros y operacion industrial.",
  terms: [...categoryRoutes.empresas.terms, ...categoryRoutes.industria.terms, "empresas industria", "operacion industrial"],
  suggestions: ["Mantencion comercial", "Refrigeracion comercial", "Seguridad", "Limpieza", "Soldadura", "Tableros"],
};

categoryRoutes["agroindustria-campos"] = {
  categoryId: "agroindustria",
  label: "Agroindustria y campos",
  title: "Especialistas para agroindustria y campos",
  subtitle: "Riego tecnificado, maquinaria agricola, packing, bombas, contratistas, poda, cosecha y lineas de proceso.",
  terms: [...categoryRoutes.agricultura.terms, ...categoryRoutes.agroindustria.terms, "agroindustria campos", "campo"],
  suggestions: ["Riego tecnificado", "Maquinaria agricola", "Packing y frio", "Bombas de riego", "Poda y cosecha"],
};

export const specialtyRoutes: Record<string, SpecialtyRouteConfig> = {
  gasfiteria: { label: "Gasfiteria", terms: ["gasfiter", "filtracion", "calefont", "redes de agua", "destape", "griferia", "agua", "gas"], categoryId: "hogar" },
  electricidad: { label: "Electricidad", terms: ["electric", "sec", "tablero", "luminaria", "enchufe", "cortocircuito", "normalizacion"], categoryId: "electricidad" },
  "riego-tecnificado": { label: "Riego tecnificado", terms: ["riego tecnificado", "riego", "bombas de riego", "automatizacion agricola", "fertirriego", "telemetria"], categoryId: "agroindustria" },
  "maquinaria-agricola": { label: "Maquinaria agricola", terms: ["maquinaria agricola", "mecanica agricola", "tractores", "operador maquinaria", "implementos"], categoryId: "agroindustria" },
  "packing-frio": { label: "Packing y frio", terms: ["packing", "frio", "frigor", "camara", "lineas de proceso", "refrigeracion"], categoryId: "agroindustria" },
  "aire-acondicionado-calefaccion": { label: "Aire acondicionado y calefaccion", terms: ["aire acondicionado", "calefaccion", "bombas de calor", "hvac", "climatizacion"], categoryId: "climatizacion-refrigeracion" },
  remodelaciones: { label: "Remodelaciones", terms: ["remodelacion", "maestro", "tabiqueria", "terminaciones"], categoryId: "construccion" },
  "jardineria-piscinas": { label: "Jardineria y piscinas", terms: ["jardineria", "jardin", "piscina", "riego", "paisajismo"], categoryId: "jardineria" },
  "edificios-condominios": { label: "Edificios y condominios", terms: ["comunidades", "edificios", "condominio", "portones", "salas de bombas", "bomba"], categoryId: "empresas" },
  "mantencion-comercial": { label: "Mantencion comercial", terms: ["mantencion oficinas", "retail", "restaurantes", "bodegas", "sucursal"], categoryId: "empresas" },
  "camaras-alarmas-control-acceso": { label: "Camaras, alarmas y control de acceso", terms: ["camaras", "camara", "alarmas", "control de acceso", "cctv"], categoryId: "automatizacion" },
  "limpieza-mantencion": { label: "Limpieza y mantencion", terms: ["limpieza", "aseo", "sanitizacion", "mantencion"] },
  "mantencion-industrial": { label: "Mantencion industrial", terms: ["industrial", "motores", "bombas", "soldadura", "hidraulica", "neumatica"], categoryId: "industria" },
  "urgencias-hogar-empresa": { label: "Urgencias hogar y empresa", terms: ["emergencia", "urgente", "fuga", "corte", "porton", "destape"], categoryId: "emergencias" },
};

Object.assign(specialtyRoutes, {
  calefont: { label: "Calefont", terms: ["calefont", "calentador", "gas", "agua caliente"], categoryId: "hogar" },
  filtraciones: { label: "Filtraciones", terms: ["filtracion", "humedad", "gotera", "fuga", "agua"], categoryId: "hogar" },
  cerrajeria: { label: "Cerrajeria", terms: ["cerraj", "cerradura", "llave", "chapas"], categoryId: "hogar" },
  pintura: { label: "Pintura", terms: ["pintura", "pintor", "terminaciones", "muro"], categoryId: "construccion" },
  jardineria: { label: "Jardineria", terms: ["jardineria", "jardin", "poda", "paisajismo", "riego"], categoryId: "jardineria" },
  piscinas: { label: "Piscinas", terms: ["piscina", "piscinas", "bomba piscina", "mantencion piscina"], categoryId: "hogar" },
  "reparaciones-menores": { label: "Reparaciones menores", terms: ["reparaciones menores", "maestro", "arreglo", "mantencion hogar"], categoryId: "hogar" },
  "salas-de-bombas": { label: "Salas de bombas", terms: ["sala de bombas", "bombas", "presurizacion", "bomba agua"], categoryId: "empresas" },
  portones: { label: "Portones", terms: ["porton", "portones", "motor porton", "control de acceso"], categoryId: "empresas" },
  camaras: { label: "Camaras", terms: ["camara", "camaras", "cctv", "seguridad electronica"], categoryId: "automatizacion" },
  calderas: { label: "Calderas", terms: ["caldera", "calderas", "calefaccion central"], categoryId: "empresas" },
  "electricidad-comun": { label: "Electricidad comun", terms: ["electricidad comun", "tablero", "luminaria", "edificio", "condominio"], categoryId: "empresas" },
  "mantencion-preventiva": { label: "Mantencion preventiva", terms: ["mantencion preventiva", "mantencion", "preventiva", "operacion"], categoryId: "empresas" },
  "refrigeracion-comercial": { label: "Refrigeracion comercial", terms: ["refrigeracion comercial", "frio", "camara", "vitrina", "congelador", "frigor"], categoryId: "empresas" },
  "seguridad-electronica": { label: "Seguridad electronica", terms: ["seguridad electronica", "camara", "cctv", "alarma", "control de acceso"], categoryId: "automatizacion" },
  limpieza: { label: "Limpieza", terms: ["limpieza", "aseo", "sanitizacion", "mantencion"], categoryId: "all" },
  soldadura: { label: "Soldadura", terms: ["soldadura", "soldador", "estructura metalica"], categoryId: "industria" },
  "bombas-motores": { label: "Bombas y motores", terms: ["bombas", "motores", "motor", "bomba", "hidraulica"], categoryId: "industria" },
  "tableros-plc": { label: "Tableros / PLC", terms: ["tablero", "plc", "automatizacion", "control", "industrial"], categoryId: "industria" },
  "bombas-de-riego": { label: "Bombas de riego", terms: ["bomba de riego", "bombas de riego", "riego", "bomba"], categoryId: "agroindustria" },
  "contratistas-agricolas": { label: "Contratistas agricolas", terms: ["contratistas", "contratista agricola", "agricola", "campo"], categoryId: "agroindustria" },
  "poda-cosecha": { label: "Poda y cosecha", terms: ["poda", "cosecha", "temporada", "campo"], categoryId: "agroindustria" },
  "lineas-proceso": { label: "Lineas de proceso", terms: ["lineas de proceso", "proceso", "packing", "planta"], categoryId: "agroindustria" },
  "fuga-de-agua": { label: "Fuga de agua", terms: ["fuga", "fuga de agua", "filtracion", "agua", "urgente"], categoryId: "emergencias" },
  "corte-electrico": { label: "Corte electrico", terms: ["corte electrico", "corte", "electric", "cortocircuito", "urgente"], categoryId: "emergencias" },
  "calefont-detenido": { label: "Calefont detenido", terms: ["calefont detenido", "calefont", "gas", "emergencia"], categoryId: "emergencias" },
  cerrajero: { label: "Cerrajero", terms: ["cerrajero", "cerraj", "cerradura", "llave", "urgente"], categoryId: "emergencias" },
  "porton-detenido": { label: "Porton detenido", terms: ["porton detenido", "porton", "motor porton", "emergencia"], categoryId: "emergencias" },
  "destape-urgente": { label: "Destape urgente", terms: ["destape urgente", "destape", "alcantarillado", "desague", "emergencia"], categoryId: "emergencias" },
  "refrigeracion-critica": { label: "Refrigeracion critica", terms: ["refrigeracion critica", "refrigeracion", "frio", "camara", "emergencia"], categoryId: "emergencias" },
} satisfies Record<string, SpecialtyRouteConfig>);

export function specialistSearchText(specialist: Specialist) {
  const servicePricingText = (specialist.servicePricing ?? [])
    .map((service) =>
      [
        service.id,
        service.serviceId,
        service.name,
        service.serviceTypeId,
        service.categoryId,
        service.specialty,
        service.description,
        service.pricingMode,
        service.conditions,
        service.emergency ? "emergencia urgente" : "",
        service.active === false ? "pausado" : "activo",
        service.materialsIncluded ? "materiales incluidos" : "",
        service.materialsChargedSeparately ? "materiales aparte" : "",
      ].join(" "),
    )
    .join(" ");
  const looseServices = (specialist as Specialist & { services?: unknown[] }).services;
  const servicesText = Array.isArray(looseServices) ? looseServices.map((service) => JSON.stringify(service)).join(" ") : "";

  return normalizeSearch(
    [
      specialist.name,
      specialist.specialty,
      specialist.serviceTypeId,
      specialist.serviceType,
      specialist.category,
      specialist.commune,
      specialist.zone,
      specialist.description,
      ...(specialist.specialties ?? []),
      ...(specialist.servicesOffered ?? []),
      ...(specialist.badges ?? []),
      ...(specialist.certifications ?? []),
      servicePricingText,
      servicesText,
    ].join(" "),
  );
}

export function matchesRouteCategory(specialist: Specialist, categoryParam: string) {
  if (!categoryParam) return true;
  const route = categoryRoutes[categoryParam];
  const taxonomyCategory = getTradeCategoryById(categoryParam);
  const terms = route?.terms ?? tradeSearchTermsForCategory(categoryParam) ?? [categoryParam.replace(/-/g, " ")];
  const text = specialistSearchText(specialist);
  const normalizedCategory = normalizeSearch(route?.categoryId ?? taxonomyCategory?.id ?? categoryParam);
  const matchesPrimaryType = normalizeSearch(specialist.serviceTypeId ?? "") === normalizedCategory;
  const matchesServiceType = (specialist.servicePricing ?? []).some(
    (service) => service.active !== false && normalizeSearch(service.serviceTypeId) === normalizedCategory,
  );
  const taxonomyIdMatch = taxonomyCategory
    ? [specialist.serviceTypeId, specialist.serviceType, specialist.category].some((value) => normalizeSearch(value ?? "") === normalizeSearch(taxonomyCategory.id))
    : false;
  return matchesPrimaryType || matchesServiceType || taxonomyIdMatch || terms.some((term) => text.includes(normalizeSearch(term)));
}

export function matchesRouteSpecialty(specialist: Specialist, specialtyParam: string) {
  if (!specialtyParam || specialtyParam === "todas") return true;
  const route = specialtyRoutes[specialtyParam];
  const taxonomySpecialty = getTradeSpecialtyBySlugOrLabel(specialtyParam);
  const terms = route?.terms ?? taxonomySpecialty?.keywords ?? [specialtyParam.replace(/-/g, " ")];
  const text = specialistSearchText(specialist);
  const normalizedSpecialty = normalizeSearch(taxonomySpecialty?.label ?? specialtyParam.replace(/-/g, " "));
  return text.includes(normalizedSpecialty) || terms.some((term) => text.includes(normalizeSearch(term)));
}

export function findMatchingService(specialist: Specialist, intent: SpecialistSearchIntent = {}) {
  const activeServices = specialist.servicePricing?.filter((service) => service.active !== false);
  const services = activeServices?.length ? activeServices : [getPrimaryFlexibleService(specialist)];
  const explicitSpecialty = intent.explicitSpecialty && intent.explicitSpecialty !== "all" ? intent.explicitSpecialty : "";
  const explicitCategory = intent.explicitCategory && intent.explicitCategory !== "all" ? intent.explicitCategory : "";
  const specialtyTerms = intent.specialtyParam
    ? specialtyRoutes[intent.specialtyParam]?.terms ?? getTradeSpecialtyBySlugOrLabel(intent.specialtyParam)?.keywords ?? [intent.specialtyParam.replace(/-/g, " ")]
    : [];
  const categoryTerms = intent.categoryParam ? categoryRoutes[intent.categoryParam]?.terms ?? tradeSearchTermsForCategory(intent.categoryParam) ?? [intent.categoryParam.replace(/-/g, " ")] : [];
  const queryTerms = intent.query ? normalizeSearch(intent.query).split(/\s+/).filter((term) => term.length > 2) : [];
  const allTerms = [...specialtyTerms, explicitSpecialty, ...queryTerms, ...categoryTerms].filter(Boolean);

  const scored = services.map((service, index) => {
    const text = normalizeSearch(
      [
        service.id,
        service.serviceId,
        service.name,
        service.serviceTypeId,
        service.categoryId,
        service.specialty,
        service.description,
        service.conditions,
        service.pricingMode,
        service.emergency ? "emergencia urgente" : "",
      ].join(" "),
    );
    let score = 0;
    if (explicitCategory && service.serviceTypeId === explicitCategory) score += 6;
    if (intent.categoryParam && service.serviceTypeId === categoryRoutes[intent.categoryParam]?.categoryId) score += 3;
    if (explicitSpecialty && normalizeSearch(service.specialty) === normalizeSearch(explicitSpecialty)) score += 8;
    for (const term of allTerms) {
      if (text.includes(normalizeSearch(term))) score += 3;
    }
    return { service, score, index };
  });

  const best = scored.sort((a, b) => b.score - a.score || a.index - b.index)[0];
  return best?.service ?? services[0];
}

export function serviceCreditValue(service: FlexibleService | undefined, fallbackCredits = 999) {
  if (!service) return fallbackCredits;
  if (service.emergency && service.emergencyCredits) return Number(service.emergencyCredits);
  if (service.creditPrice) return Number(service.creditPrice);
  if (service.pricingMode === "fixed") return Number(service.fixedCredits ?? fallbackCredits);
  if (service.pricingMode === "hourly") return Number(service.hourlyCredits ?? fallbackCredits);
  if (service.pricingMode === "range") return Number(service.minCredits ?? service.visitCredits ?? fallbackCredits);
  if (service.pricingMode === "virtual_diagnosis") return Number(service.minCredits ?? service.visitCredits ?? fallbackCredits);
  if (service.pricingMode === "visit_then_quote") return Number(service.visitCredits ?? fallbackCredits);
  return Number(service.minCredits ?? fallbackCredits);
}

export function matchedServiceSummary(service: FlexibleService | undefined, generic = false) {
  if (!service) return "Precio por confirmar";
  if (generic) return pricingSummary(service);
  if (service.emergency && service.emergencyCredits) return `${service.name} - Emergencia desde ${service.emergencyCredits} creditos`;
  if (service.pricingMode === "quote_required") return `${service.name} - Requiere cotizacion`;
  if (service.pricingMode === "virtual_diagnosis") return `${service.name} - Cotiza con fotos`;
  if (service.pricingMode === "visit_then_quote") return `${service.name} - Visita desde ${service.visitCredits ?? 0} creditos`;
  if (service.pricingMode === "hourly") return `${service.name} - ${service.hourlyCredits ?? 0} creditos/hora`;
  if (service.pricingMode === "range") return `${service.name} - Desde ${service.minCredits ?? 0} a ${service.maxCredits ?? 0} creditos`;
  return `${service.name} - ${service.fixedCredits ?? serviceCreditValue(service)} creditos`;
}
