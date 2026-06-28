import { chileTaxConfig2026, roundTaxCLP } from "@/config/taxConfig";
import { chileCommunes } from "@/data/chileCommunes";
import { nationalServiceTypes, type NationalSpecialty, type ServiceAudience } from "@/data/serviceCatalog";

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type MarketplaceCategory = {
  id: string;
  name: string;
  description: string;
  specialties: string[];
};

export type ServiceType = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  icon?: string;
  appliesTo?: ServiceAudience[];
  marginType: "home" | "company";
  specialties: string[];
  specialtyDetails?: NationalSpecialty[];
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  audience: "cliente" | "empresa";
  priceCLP: number;
  monthlyCredits: number;
  accumulatesMonths: number;
  description: string;
  benefits: string[];
  ctaLabel?: string;
};

export type CommercialConfig = {
  creditValueCLP: number;
  minHomeMarginCLP: number;
  minCompanyMarginCLP: number;
  homeVisitFeeCLP: number;
  companyVisitFeeCLP: number;
  creditExpirationMonths: number;
  clientReferralBonusCredits: number;
  specialistReferralBonus: string;
};

export type SpecialistRank = "Fundador" | "Bronce" | "Plata" | "Oro" | "Platino";

export const specialistRanks: { rank: SpecialistRank; minJobs: number; minRating: number; benefits: string }[] = [
  { rank: "Fundador", minJobs: 0, minRating: 0, benefits: "Acceso temprano, perfil destacado y feedback directo de producto." },
  { rank: "Bronce", minJobs: 10, minRating: 4.3, benefits: "Mayor visibilidad local y acceso a solicitudes estándar." },
  { rank: "Plata", minJobs: 40, minRating: 4.5, benefits: "Prioridad en búsquedas, badge visible y mejores oportunidades." },
  { rank: "Oro", minJobs: 100, minRating: 4.7, benefits: "Posición preferente, solicitudes premium y reputación destacada." },
  { rank: "Platino", minJobs: 250, minRating: 4.85, benefits: "Máxima visibilidad, atención prioritaria y campañas especiales." },
];

export const validationRequirements = [
  "RUT validado",
  "Documento de identidad",
  "Selfie de verificación",
  "Certificaciones del oficio",
  "Mínimo 3 referencias laborales",
  "Portafolio fotográfico",
];

export const defaultCommercialConfig: CommercialConfig = {
  creditValueCLP: 1000,
  minHomeMarginCLP: 0,
  minCompanyMarginCLP: 0,
  homeVisitFeeCLP: 0,
  companyVisitFeeCLP: 12000,
  creditExpirationMonths: 24,
  clientReferralBonusCredits: 10,
  specialistReferralBonus: "Badge Fundador o créditos de reputación",
};

const legacyServiceTypes: ServiceType[] = [
  {
    id: "hogar",
    name: "Hogar",
    marginType: "home",
    description: "Servicios recurrentes y reparaciones para casas y departamentos.",
    specialties: [
      "Gasfitería domiciliaria",
      "Electricidad domiciliaria",
      "Cerrajería",
      "Pintura",
      "Carpintería",
      "Armado de muebles",
      "Instalación de cortinas",
      "Reparaciones menores",
      "Mantención de piscina",
      "Jardinería hogar",
      "Instalación de TV",
      "Instalación de lámparas",
      "Cambio de grifería",
      "Destape de lavaplatos",
      "Reparación de filtraciones",
    ],
  },
  {
    id: "empresas",
    name: "Empresas",
    marginType: "company",
    description: "Mantención bajo demanda para oficinas, retail, restaurantes, bodegas y comunidades.",
    specialties: [
      "Mantención oficinas",
      "Mantención retail",
      "Mantención restaurantes",
      "Mantención bodegas",
      "Mantención comunidades",
      "Mantención plantas productivas",
      "Electricidad comercial",
      "Gasfitería comercial",
      "Climatización comercial",
      "Cerrajería empresas",
      "Control de acceso empresas",
      "Seguridad electrónica",
      "Pintura oficinas",
      "Muebles corporativos",
      "Proveedor residente",
    ],
  },
  {
    id: "climatizacion-refrigeracion",
    name: "Climatización y Refrigeración",
    marginType: "company",
    description: "Frío, calor, ventilación y continuidad térmica para hogares y empresas.",
    specialties: [
      "Aire acondicionado residencial",
      "Aire acondicionado comercial",
      "Bombas de calor",
      "Mantención HVAC",
      "Ventilación",
      "Refrigeración comercial",
      "Cámaras frigoríficas",
      "Chillers",
      "VRF / VRV",
      "Vitrinas refrigeradas",
      "Compresores de frío",
      "Fan coil",
      "Ductos de climatización",
      "Extracción de aire",
      "Limpieza de filtros HVAC",
    ],
  },
  {
    id: "construccion",
    name: "Construcción",
    marginType: "home",
    description: "Obras menores, terminaciones, instalaciones y remodelaciones.",
    specialties: [
      "Maestro constructor",
      "Albañilería",
      "Carpintería",
      "Cerámicas",
      "Instalación de pisos",
      "Pintura interior",
      "Pintura exterior",
      "Techumbre",
      "Impermeabilización",
      "Tabiquería",
      "Yesería",
      "Reparación de muros",
      "Remodelación baños",
      "Remodelación cocinas",
      "Soldadura estructuras menores",
    ],
  },
  {
    id: "electricidad",
    name: "Electricidad",
    marginType: "home",
    description: "Electricidad domiciliaria, comercial, certificada e industrial.",
    specialties: [
      "Electricista SEC",
      "Tableros eléctricos",
      "Instalación de enchufes",
      "Instalación de luminarias",
      "Normalización eléctrica",
      "Certificación TE1",
      "Empalmes eléctricos",
      "Mallas a tierra",
      "Canalización eléctrica",
      "Iluminación LED",
      "Portones eléctricos",
      "Respaldo UPS",
      "Medición eléctrica",
      "Cortocircuitos",
      "Electricidad industrial",
    ],
  },
  {
    id: "gasfiteria",
    name: "Gasfitería",
    marginType: "home",
    description: "Agua, gas, sanitarios, calefont, bombas y urgencias.",
    specialties: [
      "Gasfíter certificado",
      "Redes de agua",
      "Redes de gas",
      "Mantención calefont",
      "Instalación calefont",
      "Termos eléctricos",
      "Reparación alcantarillado",
      "Bombas de agua",
      "Presurizadores",
      "Detección de fugas",
      "Artefactos sanitarios",
      "Cambio de cañerías",
      "Destapes",
      "Instalación lavadora",
      "Instalación lavavajillas",
    ],
  },
  {
    id: "jardineria",
    name: "Jardinería",
    marginType: "home",
    description: "Mantención, paisajismo, riego, piscinas y exteriores.",
    specialties: [
      "Jardinería hogar",
      "Paisajismo",
      "Poda de árboles",
      "Riego automático",
      "Mantención de piscina",
      "Control de plagas",
      "Fumigación",
      "Corte de pasto",
      "Recuperación de césped",
      "Jardines verticales",
      "Limpieza de canaletas",
      "Lavado de terrazas",
      "Mantención quinchos",
      "Instalación pasto sintético",
      "Huertos urbanos",
    ],
  },
  {
    id: "agroindustria",
    name: "Agroindustria",
    marginType: "company",
    description: "Packing, riego, maquinaria, frío agrícola y líneas de proceso.",
    specialties: [
      "Mantención packing",
      "Frigoristas",
      "Bombas de riego",
      "Automatización agrícola",
      "Calderas",
      "Compresores",
      "Líneas de proceso",
      "Hidráulica",
      "Neumática",
      "Mecánica agrícola",
      "Electromecánica agrícola",
      "Riego tecnificado",
      "Sensores agrícolas",
      "Invernaderos",
      "Control de plagas agrícola",
    ],
  },
  {
    id: "industria",
    name: "Industria",
    marginType: "company",
    description: "Mantención industrial, electromecánica, automatización y paradas de planta.",
    specialties: [
      "Mecánico industrial",
      "Electromecánico",
      "Instrumentista",
      "Soldador certificado",
      "Técnico PLC",
      "Automatización industrial",
      "Mantención motores",
      "Bombas industriales",
      "Correas transportadoras",
      "Hidráulica industrial",
      "Neumática industrial",
      "Lubricación industrial",
      "Montaje industrial",
      "Vibraciones mecánicas",
      "Paradas de planta",
    ],
  },
  {
    id: "emergencias",
    name: "Emergencias",
    marginType: "home",
    description: "Respuesta rápida para incidentes críticos de hogar y operación.",
    specialties: [
      "Cerrajero emergencia",
      "Gasfíter emergencia",
      "Electricista emergencia",
      "Destape emergencia",
      "Fuga de agua",
      "Fuga de gas",
      "Corte eléctrico",
      "Calefont detenido",
      "Refrigeración crítica",
      "Aire acondicionado crítico",
      "Portón detenido",
      "Filtración lluvia",
      "Bomba detenida",
      "Cerradura digital bloqueada",
      "Soporte TI urgente",
    ],
  },
];

export const serviceTypes: ServiceType[] = nationalServiceTypes;

export const serviceTypeOptions = serviceTypes.map((type) => ({ id: type.id, name: type.name }));

export const allServiceSpecialties = serviceTypes.flatMap((type) =>
  type.specialties.map((specialty) => {
    const detail = type.specialtyDetails?.find((item) => item.name === specialty);
    return {
    serviceTypeId: type.id,
    serviceTypeName: type.name,
    marginType: type.marginType,
    name: specialty,
      slug: detail?.slug ?? toSlug(specialty),
      subcategory: detail?.subcategory,
      suggestedCredits: detail?.suggestedCredits,
      certificationRequired: detail?.certificationRequired,
      appliesTo: detail?.appliesTo,
      emergency: detail?.emergency,
      expectedTicketCLP: detail?.expectedTicketCLP,
      suggestedMinMarginCLP: detail?.suggestedMinMarginCLP,
      seoTitle: detail?.seoTitle,
      seoDescription: detail?.seoDescription,
      keywords: detail?.keywords,
      suggestedCities: detail?.suggestedCities,
    };
  }),
);

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basico",
    name: "Club Hogar Básico",
    audience: "cliente",
    priceCLP: 35000,
    monthlyCredits: 40,
    accumulatesMonths: 10,
    description: "Para mantenciones simples y primeros usos.",
    benefits: ["40 créditos mensuales", "Técnicos verificados", "Pago protegido"],
  },
  {
    id: "plus",
    name: "Club Hogar Plus",
    audience: "cliente",
    priceCLP: 59000,
    monthlyCredits: 60,
    accumulatesMonths: 10,
    description: "El equilibrio ideal para familias activas.",
    benefits: ["60 créditos mensuales", "Prioridad de agenda", "Garantía OficiosPro"],
  },
  {
    id: "familiar",
    name: "Club Hogar Familiar",
    audience: "cliente",
    priceCLP: 89000,
    monthlyCredits: 100,
    accumulatesMonths: 10,
    description: "Más créditos, prioridad y respaldo extendido.",
    benefits: ["100 créditos mensuales", "Atención prioritaria", "Historial familiar"],
  },
  {
    id: "pyme",
    name: "Plan Empresa Pyme",
    audience: "empresa",
    priceCLP: 49990,
    monthlyCredits: 50,
    accumulatesMonths: 10,
    description: "Cuenta corporativa para oficinas pequeñas, locales y restaurantes.",
    benefits: ["Facturación mensual", "50 créditos iniciales", "Dashboard empresa"],
  },
  {
    id: "empresa",
    name: "Plan Empresa",
    audience: "empresa",
    priceCLP: 149990,
    monthlyCredits: 200,
    accumulatesMonths: 10,
    description: "Múltiples sucursales, historial y créditos mensuales.",
    benefits: ["200 créditos mensuales", "Múltiples sucursales", "Reportes mensuales"],
  },
  {
    id: "corporativo",
    name: "Plan Corporativo",
    audience: "empresa",
    priceCLP: 499990,
    monthlyCredits: 650,
    accumulatesMonths: 10,
    description: "SLA, ejecutivo asignado, reportes mensuales y créditos personalizados para operación crítica.",
    benefits: ["SLA garantizado", "Ejecutivo asignado", "Reportes mensuales", "Créditos por volumen"],
    ctaLabel: "Solicitar evaluación",
  },
];

export function getServiceTypeById(id: string) {
  return serviceTypes.find((type) => type.id === id);
}

export function getSpecialtiesByServiceType(id: string) {
  return getServiceTypeById(id)?.specialties ?? [];
}

export function getPlanById(id: string | null | undefined) {
  return subscriptionPlans.find((plan) => plan.id === id) ?? subscriptionPlans[1];
}

export function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateServiceEconomics({
  clientCredits,
  specialistPayoutCLP,
  serviceTypeId,
  config = defaultCommercialConfig,
}: {
  clientCredits: number;
  specialistPayoutCLP: number;
  serviceTypeId: string;
  config?: CommercialConfig;
}) {
  const serviceType = getServiceTypeById(serviceTypeId);
  const incomeCLP = clientCredits * config.creditValueCLP;
  const marginCLP = incomeCLP - specialistPayoutCLP;
  const commissionNetCLP = roundTaxCLP(specialistPayoutCLP * chileTaxConfig2026.platformCommission.standardRate, chileTaxConfig2026);
  const commissionIvaCLP = chileTaxConfig2026.platformCommission.ivaApplies
    ? roundTaxCLP(commissionNetCLP * chileTaxConfig2026.ivaRate, chileTaxConfig2026)
    : 0;
  const segmentFloorCLP = serviceType?.marginType === "company" ? config.minCompanyMarginCLP : config.minHomeMarginCLP;
  const minMarginCLP = Math.max(segmentFloorCLP, commissionNetCLP + commissionIvaCLP);

  return {
    incomeCLP,
    specialistPayoutCLP,
    marginCLP,
    minMarginCLP,
    status: marginCLP >= minMarginCLP ? "OK" : "Revisar",
  };
}

const legacyMarketplaceCategories: MarketplaceCategory[] = [
  {
    id: "climatizacion-refrigeracion",
    name: "Climatización y Refrigeración",
    description: "Servicios residenciales, comerciales e industriales de frío, calor y ventilación.",
    specialties: [
      "Técnico aire acondicionado split",
      "Técnico aire acondicionado central",
      "Instalador aire acondicionado",
      "Mantención aire acondicionado",
      "Técnico HVAC",
      "Técnico VRF/VRV",
      "Técnico bombas de calor",
      "Técnico calderas",
      "Técnico ventilación",
      "Técnico extracción de aire",
      "Técnico refrigeración comercial",
      "Técnico cámaras frigoríficas",
      "Técnico vitrinas refrigeradas",
      "Técnico compresores",
      "Técnico chillers",
      "Técnico fan coil",
      "Técnico ductos",
      "Técnico limpieza filtros HVAC",
      "Técnico climatización industrial",
      "Técnico refrigeración transporte",
    ],
  },
  {
    id: "electricidad",
    name: "Electricidad",
    description: "Electricistas domiciliarios, SEC, comerciales e industriales.",
    specialties: [
      "Electricista domiciliario",
      "Electricista SEC",
      "Electricista comercial",
      "Electricista industrial",
      "Instalador de enchufes",
      "Instalador de luminarias",
      "Reparación de cortocircuitos",
      "Normalización eléctrica",
      "Tableros eléctricos",
      "Empalmes eléctricos",
      "Mallas a tierra",
      "Medición eléctrica",
      "Mantención subestaciones",
      "Canalización eléctrica",
      "Instalador portones eléctricos",
      "Electricidad comunidades",
      "Iluminación LED",
      "Eficiencia energética",
      "Certificación TE1",
      "Respaldo UPS",
    ],
  },
  {
    id: "construccion",
    name: "Construcción",
    description: "Obras menores, terminaciones, instalaciones y mantención de infraestructura.",
    specialties: [
      "Maestro constructor",
      "Maestro multifunción",
      "Carpintero",
      "Mueblista",
      "Pintor",
      "Albañil",
      "Ceramista",
      "Instalador de pisos",
      "Instalador de ventanas",
      "Instalador de cortinas",
      "Instalador de muebles",
      "Techista",
      "Impermeabilización",
      "Tabiquería",
      "Yesero",
      "Soldador estructuras",
      "Radier y hormigón",
      "Reparación de muros",
      "Remodelación baños",
      "Remodelación cocinas",
    ],
  },
  {
    id: "gasfiteria",
    name: "Gasfitería",
    description: "Instalaciones sanitarias, calefont, filtraciones y emergencias de agua.",
    specialties: [
      "Gasfíter domiciliario",
      "Gasfíter certificado",
      "Reparación de filtraciones",
      "Destape de cañerías",
      "Mantención calefont",
      "Instalación calefont",
      "Cambio de grifería",
      "Instalación lavaplatos",
      "Instalación lavamanos",
      "Instalación WC",
      "Reparación estanque WC",
      "Bombas de agua",
      "Presurizadores",
      "Redes sanitarias",
      "Redes de gas",
      "Detección de fugas",
      "Termos eléctricos",
      "Calderas domiciliarias",
      "Reparación alcantarillado",
      "Mantención comunidades",
    ],
  },
  {
    id: "industria",
    name: "Industria",
    description: "Soporte técnico para plantas, bodegas, centros productivos y operación crítica.",
    specialties: [
      "Mecánico industrial",
      "Electromecánico",
      "Instrumentista",
      "Soldador certificado",
      "Frigorista industrial",
      "Técnico PLC",
      "Técnico automatización industrial",
      "Mantención bombas industriales",
      "Mantención correas transportadoras",
      "Mantención motores",
      "Tornero",
      "Calderero",
      "Hidráulica industrial",
      "Neumática industrial",
      "Lubricación industrial",
      "Montaje industrial",
      "Alineación láser",
      "Vibraciones mecánicas",
      "Mantención preventiva",
      "Paradas de planta",
    ],
  },
  {
    id: "agroindustria",
    name: "Agroindustria",
    description: "Servicios para riego, maquinaria, predios, packing y temporada agrícola.",
    specialties: [
      "Técnico agrícola",
      "Técnico riego agrícola",
      "Instalador riego tecnificado",
      "Mantención bombas de riego",
      "Mecánico agrícola",
      "Electromecánico agrícola",
      "Aplicador fitosanitario",
      "Podador especializado",
      "Cosechero especializado",
      "Técnico packing",
      "Frigorista agrícola",
      "Técnico invernaderos",
      "Automatización de riego",
      "Técnico sensores agrícolas",
      "Topógrafo agrícola",
      "Operador maquinaria agrícola",
      "Mantención tractores",
      "Soldador agrícola",
      "Técnico pozos profundos",
      "Control de plagas agrícola",
    ],
  },
  {
    id: "energia",
    name: "Energía",
    description: "Energías renovables, respaldo, medición y eficiencia energética.",
    specialties: [
      "Instalador paneles solares",
      "Mantención paneles solares",
      "Lavado paneles solares",
      "Técnico inversores solares",
      "Baterías domiciliarias",
      "Baterías industriales",
      "Generadores eléctricos",
      "Grupos electrógenos",
      "Eficiencia energética",
      "Auditoría energética",
      "Medición de consumo",
      "Cargadores vehículos eléctricos",
      "Bombas de calor",
      "Termos solares",
      "Respaldo eléctrico",
      "UPS industrial",
      "Microredes",
      "Iluminación eficiente",
      "Gestión demanda eléctrica",
      "Monitoreo energético",
    ],
  },
  {
    id: "automatizacion",
    name: "Automatización",
    description: "Control, seguridad, domótica, cámaras, alarmas e integración tecnológica.",
    specialties: [
      "Domótica residencial",
      "Automatización residencial",
      "Instalador cámaras seguridad",
      "Instalador alarmas",
      "Control de acceso",
      "Cerraduras digitales",
      "Portones automáticos",
      "Redes domiciliarias",
      "Redes empresas",
      "Soporte computacional",
      "Técnico redes",
      "Instalador fibra interna",
      "Configuración WiFi",
      "Técnico CCTV IP",
      "Sensores IoT",
      "Automatización PLC",
      "SCADA básico",
      "Integración BMS",
      "Monitoreo remoto",
      "Cableado estructurado",
    ],
  },
  {
    id: "emergencias",
    name: "Emergencias",
    description: "Respuesta rápida para incidentes domiciliarios y operación crítica.",
    specialties: [
      "Cerrajero emergencia",
      "Gasfíter emergencia",
      "Electricista emergencia",
      "Destape emergencia",
      "Fuga de agua",
      "Fuga de gas",
      "Corte eléctrico",
      "Calefont detenido",
      "Aire acondicionado crítico",
      "Refrigeración crítica",
      "Portón detenido",
      "Vidrios emergencia",
      "Techumbre emergencia",
      "Filtración lluvia",
      "Bomba detenida",
      "Generador emergencia",
      "Cámara frigorífica caída",
      "Control plagas urgente",
      "Cerradura digital bloqueada",
      "Soporte TI urgente",
    ],
  },
  {
    id: "servicios-empresas",
    name: "Servicios para empresas",
    description: "Mantenciones recurrentes, SLA, proveedores verificados y facturación consolidada.",
    specialties: [
      "Mantención oficinas",
      "Mantención retail",
      "Mantención restaurantes",
      "Mantención bodegas",
      "Mantención comunidades",
      "Mantención plantas productivas",
      "Técnico salas de venta",
      "Técnico refrigeración restaurantes",
      "Electricidad locales comerciales",
      "Gasfitería comercial",
      "HVAC empresas",
      "Cerrajería empresas",
      "Pintura oficinas",
      "Muebles corporativos",
      "Seguridad electrónica",
      "Control de acceso empresas",
      "Gestión multisucursal",
      "Auditoría mantenciones",
      "Reportes mensuales",
      "Proveedor residente",
    ],
  },
];

export const marketplaceCategories: MarketplaceCategory[] = serviceTypes.map((category) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  specialties: category.specialties,
}));

export const allSpecialties = marketplaceCategories.flatMap((category) =>
  category.specialties.map((specialty) => {
    const detail = serviceTypes.find((type) => type.id === category.id)?.specialtyDetails?.find((item) => item.name === specialty);
    return {
      categoryId: category.id,
      categoryName: category.name,
      name: specialty,
      slug: detail?.slug ?? toSlug(specialty),
      seoTitle: detail?.seoTitle ?? `${specialty} en Chile | OficiosPro`,
      seoDescription: detail?.seoDescription ?? `Encuentra ${specialty.toLowerCase()} por comuna y reputación en OficiosPro.`,
      keywords: detail?.keywords ?? [specialty.toLowerCase(), category.name.toLowerCase()],
      appliesTo: detail?.appliesTo ?? [],
      suggestedCities: detail?.suggestedCities ?? ["Santiago", "Las Condes", "Curicó", "Talca"],
    };
  }),
);

export const nationalCoverageStats = {
  regions: new Set(chileCommunes.map((commune) => commune.regionId)).size,
  provinces: new Set(chileCommunes.map((commune) => commune.provinceId)).size,
  communes: chileCommunes.length,
  specialties: allSpecialties.length,
  targetSpecialists: 10000,
};

export const seoSearchExamples = [
  {
    query: "aire acondicionado Las Condes",
    title: "Técnicos de aire acondicionado en Las Condes",
    description: "Perfiles verificados, disponibilidad, calificaciones y precio desde créditos.",
  },
  {
    query: "electricista SEC Santiago",
    title: "Electricistas SEC en Santiago",
    description: "Especialistas certificados con trabajos completados y pago protegido.",
  },
  {
    query: "técnico refrigeración Curicó",
    title: "Técnicos en refrigeración en Curicó",
    description: "Mantención comercial, cámaras frigoríficas y respuesta operacional.",
  },
  {
    query: "bombas de calor Puerto Varas",
    title: "Técnicos en bombas de calor en Puerto Varas",
    description: "Instalación, mantención y diagnóstico con reputación verificable.",
  },
];

export function distanceInKm(a: GeoPoint, b: GeoPoint) {
  const earthRadius = 6371;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
