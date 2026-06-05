import { chileCommunes } from "@/data/chileCommunes";

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

export const marketplaceCategories: MarketplaceCategory[] = [
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

export const allSpecialties = marketplaceCategories.flatMap((category) =>
  category.specialties.map((specialty) => ({
    categoryId: category.id,
    categoryName: category.name,
    name: specialty,
    slug: toSlug(specialty),
  })),
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
