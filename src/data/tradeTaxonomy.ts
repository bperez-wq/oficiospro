import { nationalServiceTypes, type ServiceAudience } from "@/data/serviceCatalog";

export type TradeSegment =
  | "hogar"
  | "comunidades"
  | "empresas"
  | "industria_campo"
  | "construccion_obra"
  | "terminaciones"
  | "muebleria_carpinteria"
  | "metalmecanica"
  | "servicios_exterior";

export type ClientVisibility = "active" | "pilot" | "forming" | "hidden";
export type RegistrationVisibility = "active" | "hidden";
export type CoverageStatus = "available" | "limited" | "forming" | "waitlist";
export type RiskLevel = "low" | "medium" | "high";
export type PricingModeDefault = "fixed" | "hourly" | "visit_then_quote" | "quote_required";
export type AllowedFor = "hogar" | "empresa" | "comunidad" | "industria" | "campo";

export type TradeCategory = {
  id: string;
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  segment: TradeSegment;
  clientVisibility: ClientVisibility;
  registrationVisibility: RegistrationVisibility;
  coverageStatus: CoverageStatus;
  requiresCertification: boolean;
  riskLevel: RiskLevel;
  allowedFor: AllowedFor[];
  iconKey: string;
  imageKey: string;
  relatedServices: string[];
  relatedProblems: string[];
  seoEnabled: boolean;
  notes: string;
};

export type TradeSpecialty = {
  id: string;
  categoryId: string;
  slug: string;
  label: string;
  description: string;
  clientVisibility: ClientVisibility;
  registrationVisibility: RegistrationVisibility;
  coverageStatus: CoverageStatus;
  requiresCertification: boolean;
  examples: string[];
  keywords: string[];
  pricingModeDefault: PricingModeDefault;
  riskLevel: RiskLevel;
};

type SpecialtySeed = {
  slug: string;
  label: string;
  description?: string;
  clientVisibility?: ClientVisibility;
  coverageStatus?: CoverageStatus;
  requiresCertification?: boolean;
  examples?: string[];
  keywords?: string[];
  pricingModeDefault?: PricingModeDefault;
  riskLevel?: RiskLevel;
};

type CategorySeed = TradeCategory & {
  specialtyDefaults?: Partial<Pick<TradeSpecialty, "clientVisibility" | "coverageStatus" | "requiresCertification" | "pricingModeDefault" | "riskLevel">>;
  specialties: SpecialtySeed[];
};

const activePilotCategoryIds = new Set([
  "hogar",
  "gasfiteria",
  "electricidad",
  "climatizacion-refrigeracion",
  "jardineria-exterior",
  "terminaciones",
  "seguridad-tecnologia",
  "comunidades-edificios",
  "empresas-comercios",
  "industria",
  "riego-agricola",
  "emergencias",
]);

const editorialSeoCategoryIds = new Set(["gasfiteria", "electricidad", "climatizacion-refrigeracion", "jardineria-exterior", "emergencias"]);

const segmentLabels: Record<TradeSegment, string> = {
  hogar: "Hogar y exterior",
  comunidades: "Comunidades",
  empresas: "Empresas",
  industria_campo: "Industria y campo",
  construccion_obra: "Construccion y obra",
  terminaciones: "Terminaciones",
  muebleria_carpinteria: "Muebleria y carpinteria",
  metalmecanica: "Metalmecanica",
  servicios_exterior: "Servicios exterior",
};

const seeds: CategorySeed[] = [
  {
    id: "hogar",
    slug: "hogar",
    label: "Hogar y mantencion general",
    shortLabel: "Hogar",
    description: "Oficios frecuentes para casas y departamentos, con cobertura inicial real o piloto.",
    segment: "hogar",
    clientVisibility: "active",
    registrationVisibility: "active",
    coverageStatus: "available",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["hogar"],
    iconKey: "home",
    imageKey: "hogar",
    relatedServices: ["mantencion general", "reparaciones menores", "armado de muebles"],
    relatedProblems: ["arreglos del hogar", "mantencion preventiva", "instalaciones simples"],
    seoEnabled: true,
    notes: "Categoria paraguas visible al cliente solo para servicios con oferta o piloto.",
    specialties: [
      { slug: "mantencion-general", label: "Mantencion general", clientVisibility: "active", coverageStatus: "available", examples: ["reparaciones menores", "instalaciones simples"] },
      { slug: "reparaciones-menores", label: "Reparaciones menores", clientVisibility: "active", coverageStatus: "available" },
      { slug: "armado-de-muebles", label: "Armado de muebles", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "instalacion-cortinas", label: "Instalacion de cortinas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "domotica-basica", label: "Domotica basica", clientVisibility: "forming", coverageStatus: "forming" },
      { slug: "mudanzas", label: "Mudanzas", clientVisibility: "forming", coverageStatus: "waitlist", pricingModeDefault: "quote_required" },
    ],
  },
  {
    id: "gasfiteria",
    slug: "gasfiteria",
    label: "Gasfiteria",
    shortLabel: "Gasfiteria",
    description: "Agua, gas, sanitarios, calefont, bombas y urgencias de filtracion.",
    segment: "hogar",
    clientVisibility: "active",
    registrationVisibility: "active",
    coverageStatus: "available",
    requiresCertification: true,
    riskLevel: "high",
    allowedFor: ["hogar", "empresa", "comunidad"],
    iconKey: "droplets",
    imageKey: "gasfiteria",
    relatedServices: ["filtraciones", "calefont", "destapes", "bombas"],
    relatedProblems: ["fuga de agua", "baja presion", "calefont detenido"],
    seoEnabled: true,
    notes: "Gas y calefont deben indicar certificación cuando aplica.",
    specialtyDefaults: { requiresCertification: true, riskLevel: "high", pricingModeDefault: "visit_then_quote" },
    specialties: [
      { slug: "gasfiteria-domiciliaria", label: "Gasfiteria domiciliaria", clientVisibility: "active", coverageStatus: "available" },
      { slug: "reparacion-filtraciones", label: "Reparacion de filtraciones", clientVisibility: "active", coverageStatus: "available" },
      { slug: "fuga-de-agua", label: "Fuga de agua", clientVisibility: "active", coverageStatus: "available" },
      { slug: "mantencion-calefont", label: "Mantencion calefont", clientVisibility: "active", coverageStatus: "available" },
      { slug: "instalacion-calefont", label: "Instalacion calefont", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "destapes", label: "Destapes", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "bombas-de-agua", label: "Bombas de agua", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "redes-de-gas", label: "Redes de gas", clientVisibility: "forming", coverageStatus: "forming" },
    ],
  },
  {
    id: "electricidad",
    slug: "electricidad",
    label: "Electricidad",
    shortLabel: "Electricidad",
    description: "Electricidad domiciliaria, comercial, SEC, tableros, luminarias y respaldo.",
    segment: "hogar",
    clientVisibility: "active",
    registrationVisibility: "active",
    coverageStatus: "available",
    requiresCertification: true,
    riskLevel: "high",
    allowedFor: ["hogar", "empresa", "comunidad", "industria"],
    iconKey: "zap",
    imageKey: "electricidad",
    relatedServices: ["tableros", "luminarias", "enchufes", "normalizacion"],
    relatedProblems: ["corte electrico", "cortocircuito", "sobrecarga"],
    seoEnabled: true,
    notes: "SEC requerido cuando corresponda por alcance.",
    specialtyDefaults: { requiresCertification: true, riskLevel: "high", pricingModeDefault: "visit_then_quote" },
    specialties: [
      { slug: "electricidad-domiciliaria", label: "Electricidad domiciliaria", clientVisibility: "active", coverageStatus: "available" },
      { slug: "electricista-sec", label: "Electricista SEC", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "tableros-electricos", label: "Tableros electricos", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "instalacion-luminarias", label: "Instalacion de luminarias", clientVisibility: "active", coverageStatus: "available" },
      { slug: "normalizacion-electrica", label: "Normalizacion electrica", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "citofonia", label: "Citofonia", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "cargadores-vehiculos-electricos", label: "Cargadores vehiculos electricos", clientVisibility: "forming", coverageStatus: "forming" },
    ],
  },
  {
    id: "climatizacion-refrigeracion",
    slug: "climatizacion-refrigeracion",
    label: "Climatizacion y refrigeracion",
    shortLabel: "Climatizacion",
    description: "Aire acondicionado, calefaccion, HVAC, refrigeracion comercial y frio operativo.",
    segment: "hogar",
    clientVisibility: "active",
    registrationVisibility: "active",
    coverageStatus: "available",
    requiresCertification: true,
    riskLevel: "high",
    allowedFor: ["hogar", "empresa", "industria"],
    iconKey: "snowflake",
    imageKey: "climatizacion-refrigeracion",
    relatedServices: ["aire acondicionado", "refrigeracion comercial", "camaras de frio"],
    relatedProblems: ["equipo sin frio", "mantencion HVAC", "camara critica"],
    seoEnabled: true,
    notes: "Separar hogar vs comercial en cotización y cobertura.",
    specialtyDefaults: { requiresCertification: true, riskLevel: "high", pricingModeDefault: "visit_then_quote" },
    specialties: [
      { slug: "aire-acondicionado-calefaccion", label: "Aire acondicionado y calefaccion", clientVisibility: "active", coverageStatus: "available" },
      { slug: "mantencion-hvac", label: "Mantencion HVAC", clientVisibility: "active", coverageStatus: "available" },
      { slug: "refrigeracion-comercial", label: "Refrigeracion comercial", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "camaras-de-frio", label: "Camaras de frio", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "frio-industrial", label: "Frio industrial", clientVisibility: "forming", coverageStatus: "forming" },
      { slug: "ventilacion-extraccion", label: "Ventilacion y extraccion", clientVisibility: "forming", coverageStatus: "forming" },
    ],
  },
  {
    id: "jardineria-exterior",
    slug: "jardineria-exterior",
    label: "Jardineria, exterior y piscinas",
    shortLabel: "Jardineria",
    description: "Jardines, riego, piscinas, limpieza técnica y servicios exteriores.",
    segment: "servicios_exterior",
    clientVisibility: "active",
    registrationVisibility: "active",
    coverageStatus: "available",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["hogar", "empresa", "comunidad", "campo"],
    iconKey: "leaf",
    imageKey: "jardineria",
    relatedServices: ["jardineria", "riego", "piscinas", "control de plagas"],
    relatedProblems: ["jardin abandonado", "piscina verde", "plagas"],
    seoEnabled: true,
    specialties: [
      { slug: "jardineria", label: "Jardineria", clientVisibility: "active", coverageStatus: "available", pricingModeDefault: "hourly" },
      { slug: "riego", label: "Riego", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "piscinas", label: "Piscinas", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "control-de-plagas", label: "Control de plagas", clientVisibility: "pilot", coverageStatus: "limited", requiresCertification: true },
      { slug: "limpieza-post-obra", label: "Limpieza post obra", clientVisibility: "forming", coverageStatus: "forming" },
      { slug: "lavado-alfombras-tapices", label: "Lavado de alfombras/tapices", clientVisibility: "forming", coverageStatus: "waitlist" },
    ],
    notes: "Control de plagas requiere validar autorizaciones cuando aplique.",
  },
  {
    id: "construccion-obra",
    slug: "construccion-obra",
    label: "Construccion y obra",
    shortLabel: "Construccion",
    description: "Obras menores, albañileria, techumbres, hormigon y ampliaciones acotadas.",
    segment: "construccion_obra",
    clientVisibility: "forming",
    registrationVisibility: "active",
    coverageStatus: "forming",
    requiresCertification: false,
    riskLevel: "high",
    allowedFor: ["hogar", "empresa", "comunidad"],
    iconKey: "hammer",
    imageKey: "construccion",
    relatedServices: ["obras menores", "techumbres", "hormigon", "albañileria"],
    relatedProblems: ["humedad", "daño menor", "reparacion de muro"],
    seoEnabled: false,
    notes: "Captar postulantes, pero publicar al cliente solo tras validar alcance, permisos y riesgo de obra.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "quote_required", riskLevel: "high" },
    specialties: [
      { slug: "albanileria", label: "Albañileria" },
      { slug: "ceramista", label: "Ceramista" },
      { slug: "yesero", label: "Yesero" },
      { slug: "enfierrador", label: "Enfierrador", riskLevel: "high" },
      { slug: "hormigon", label: "Hormigon" },
      { slug: "techumbres", label: "Techumbres", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "drywall-volcanita", label: "Drywall / volcanita" },
      { slug: "ventanas-aluminio", label: "Ventanas y aluminio" },
      { slug: "vidrieria", label: "Vidrieria" },
      { slug: "impermeabilizacion", label: "Impermeabilizacion", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "obras-menores", label: "Obras menores", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "reparacion-estructural-menor", label: "Reparacion estructural menor", riskLevel: "high" },
      { slug: "radieres", label: "Radieres" },
      { slug: "tabiqueria", label: "Tabiqueria" },
      { slug: "ampliaciones-menores", label: "Ampliaciones menores", riskLevel: "high" },
    ],
  },
  {
    id: "terminaciones",
    slug: "terminaciones",
    label: "Terminaciones",
    shortLabel: "Terminaciones",
    description: "Pintura, pavimentos, ceramica, molduras y revestimientos.",
    segment: "terminaciones",
    clientVisibility: "pilot",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["hogar", "empresa", "comunidad"],
    iconKey: "paintbrush",
    imageKey: "pintura",
    relatedServices: ["pintura", "ceramica", "pisos", "revestimientos"],
    relatedProblems: ["muro dañado", "renovacion interior", "terminacion fina"],
    seoEnabled: false,
    notes: "Piloto de baja complejidad; priorizar especialistas con evidencia fotografica de trabajos.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "quote_required", riskLevel: "medium" },
    specialties: [
      { slug: "pintura-fina", label: "Pintura fina", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "pintura-interior", label: "Pintura interior", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "pintura-exterior", label: "Pintura exterior", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "estuco", label: "Estuco" },
      { slug: "pavimentos", label: "Pavimentos" },
      { slug: "porcelanato", label: "Porcelanato" },
      { slug: "ceramica", label: "Ceramica" },
      { slug: "piso-flotante", label: "Piso flotante" },
      { slug: "vitrificado", label: "Vitrificado" },
      { slug: "sellos-terminaciones", label: "Sellos y terminaciones" },
      { slug: "molduras", label: "Molduras" },
      { slug: "revestimientos", label: "Revestimientos" },
    ],
  },
  {
    id: "muebleria-carpinteria",
    slug: "muebleria-carpinteria",
    label: "Muebleria y carpinteria",
    shortLabel: "Carpinteria",
    description: "Muebles a medida, cocinas, closets, puertas, tapiceria, restauracion, decks y pergolas.",
    segment: "muebleria_carpinteria",
    clientVisibility: "forming",
    registrationVisibility: "active",
    coverageStatus: "forming",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["hogar", "empresa"],
    iconKey: "ruler",
    imageKey: "carpinteria",
    relatedServices: ["muebles a medida", "closets", "cocinas", "decks"],
    relatedProblems: ["mueble roto", "falta de almacenaje", "renovacion cocina"],
    seoEnabled: false,
    notes: "Mantener en formacion hasta definir cotización, medicion y expectativas de materiales.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "quote_required" },
    specialties: [
      { slug: "muebles-a-medida", label: "Fabricacion de muebles a medida" },
      { slug: "cocinas", label: "Cocinas" },
      { slug: "closets", label: "Closets" },
      { slug: "muebles-bano", label: "Muebles de baño" },
      { slug: "puertas", label: "Puertas" },
      { slug: "reparacion-muebles", label: "Reparacion de muebles" },
      { slug: "instalacion-muebles", label: "Instalacion de muebles", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "tapiceria", label: "Tapiceria" },
      { slug: "restauracion", label: "Restauracion" },
      { slug: "carpinteria-general", label: "Carpinteria general" },
      { slug: "decks-pergolas", label: "Decks y pergolas" },
    ],
  },
  {
    id: "metalmecanica",
    slug: "metalmecanica",
    label: "Metalmecanica",
    shortLabel: "Metalmecanica",
    description: "Soldadura, estructuras metalicas, portones, rejas, protecciones, torno y fabricacion menor.",
    segment: "metalmecanica",
    clientVisibility: "pilot",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: true,
    riskLevel: "high",
    allowedFor: ["hogar", "empresa", "comunidad", "industria", "campo"],
    iconKey: "wrench",
    imageKey: "industria",
    relatedServices: ["soldadura", "portones", "rejas", "estructuras metalicas"],
    relatedProblems: ["porton detenido", "estructura dañada", "protección faltante"],
    seoEnabled: false,
    notes: "Rubro de mayor riesgo; validar certificaciones, taller/capacidad y tipo de soldadura antes de publicar.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "quote_required", requiresCertification: true, riskLevel: "high" },
    specialties: [
      { slug: "soldadura", label: "Soldadura", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "estructuras-metalicas", label: "Estructuras metalicas" },
      { slug: "portones", label: "Portones", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "rejas", label: "Rejas" },
      { slug: "protecciones", label: "Protecciones" },
      { slug: "cierres-metalicos", label: "Cierres metalicos" },
      { slug: "torno", label: "Torno" },
      { slug: "fabricacion-metalica-menor", label: "Fabricacion metalica menor" },
      { slug: "reparacion-estructuras", label: "Reparacion de estructuras" },
      { slug: "automatizacion-portones", label: "Automatizacion de portones", clientVisibility: "pilot", coverageStatus: "limited" },
    ],
  },
  {
    id: "comunidades-edificios",
    slug: "comunidades-edificios",
    label: "Comunidades y edificios",
    shortLabel: "Comunidades",
    description: "Edificios y condominios: salas técnicas, portones, camaras, citofonia y espacios comunes.",
    segment: "comunidades",
    clientVisibility: "pilot",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["comunidad", "empresa"],
    iconKey: "building",
    imageKey: "comunidades",
    relatedServices: ["portones", "salas de bombas", "citofonia", "aseo edificios"],
    relatedProblems: ["acceso detenido", "bomba fallando", "mantencion comun"],
    seoEnabled: false,
    notes: "Piloto B2B/comunidad; requiere contacto operativo y definicion de responsable de aprobacion.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "visit_then_quote" },
    specialties: [
      { slug: "aseo-edificios", label: "Aseo de edificios", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "salas-de-bombas", label: "Salas de bombas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "portones", label: "Portones", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "camaras", label: "Camaras", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "citofonia", label: "Citofonia", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "mantencion-electrica-comun", label: "Mantencion electrica comun" },
      { slug: "mantencion-sanitaria-comun", label: "Mantencion sanitaria comun" },
      { slug: "jardineria-comunitaria", label: "Jardineria comunitaria" },
      { slug: "control-plagas", label: "Control de plagas", clientVisibility: "pilot", coverageStatus: "limited", requiresCertification: true },
      { slug: "limpieza-estacionamientos", label: "Limpieza de estacionamientos" },
      { slug: "limpieza-fachadas", label: "Limpieza de fachadas" },
      { slug: "conserjeria", label: "Conserjeria", clientVisibility: "hidden", coverageStatus: "waitlist" },
    ],
  },
  {
    id: "empresas-comercios",
    slug: "empresas-comercios",
    label: "Empresas y comercios",
    shortLabel: "Empresas",
    description: "Oficinas, retail, restaurantes, bodegas y mantencion comercial.",
    segment: "empresas",
    clientVisibility: "pilot",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["empresa"],
    iconKey: "briefcase",
    imageKey: "empresas",
    relatedServices: ["mantencion oficinas", "refrigeracion comercial", "aseo oficinas"],
    relatedProblems: ["sucursal detenida", "mantencion recurrente", "falla local"],
    seoEnabled: false,
    notes: "Piloto para demanda empresa; separar oficios técnicos de roles operativos no publicados.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "visit_then_quote" },
    specialties: [
      { slug: "refrigeracion-comercial", label: "Refrigeracion comercial", clientVisibility: "pilot", coverageStatus: "limited", requiresCertification: true },
      { slug: "mantencion-oficinas", label: "Mantencion de oficinas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "aseo-oficinas", label: "Aseo oficinas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "prevencion-riesgos", label: "Prevencion de riesgos", clientVisibility: "forming", coverageStatus: "waitlist", pricingModeDefault: "quote_required" },
      { slug: "inventario-bodega", label: "Inventario/bodega", clientVisibility: "hidden", coverageStatus: "waitlist" },
      { slug: "operadores-grua-montacargas", label: "Operadores de grua/montacargas", clientVisibility: "hidden", coverageStatus: "waitlist" },
      { slug: "conductores", label: "Conductores", clientVisibility: "hidden", coverageStatus: "waitlist" },
      { slug: "mecanicos", label: "Mecanicos", clientVisibility: "forming", coverageStatus: "forming" },
      { slug: "tecnicos-electricos", label: "Técnicos electricos", clientVisibility: "pilot", coverageStatus: "limited", requiresCertification: true },
      { slug: "tecnicos-climatizacion", label: "Técnicos de climatizacion", clientVisibility: "pilot", coverageStatus: "limited", requiresCertification: true },
      { slug: "mantencion-comercial", label: "Mantencion comercial", clientVisibility: "pilot", coverageStatus: "limited" },
    ],
  },
  {
    id: "industria",
    slug: "industria",
    label: "Industria y mantencion",
    shortLabel: "Industria",
    description: "Mantencion industrial, mecanica, electricidad industrial, instrumentacion y soldadura.",
    segment: "industria_campo",
    clientVisibility: "pilot",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: true,
    riskLevel: "high",
    allowedFor: ["industria", "empresa"],
    iconKey: "factory",
    imageKey: "industria",
    relatedServices: ["mantencion maquinaria", "bombas", "tableros", "sensores"],
    relatedProblems: ["linea detenida", "bomba fallando", "tablero critico"],
    seoEnabled: false,
    notes: "Piloto industrial con revision manual; no prometer disponibilidad inmediata ni SLA sin contrato.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "quote_required", requiresCertification: true, riskLevel: "high" },
    specialties: [
      { slug: "mantencion-maquinaria", label: "Mantencion de maquinaria", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "mecanica-industrial", label: "Mecanica industrial", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "bombas", label: "Bombas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "mantencion-bombas", label: "Mantencion de bombas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "electricidad-industrial", label: "Electricidad industrial", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "tableros-electricos", label: "Tableros electricos", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "instrumentacion", label: "Instrumentacion" },
      { slug: "sensores-control", label: "Sensores y control" },
      { slug: "mantencion-cintas-equipos", label: "Mantencion de cintas/equipos" },
      { slug: "soldadura-industrial", label: "Soldadura industrial", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "frio-industrial", label: "Frio industrial" },
      { slug: "camaras-frio", label: "Camaras de frio" },
      { slug: "operadores-maquinaria", label: "Operadores de maquinaria", clientVisibility: "hidden", coverageStatus: "waitlist" },
    ],
  },
  {
    id: "agroindustria-campos",
    slug: "agroindustria-campos",
    label: "Agroindustria y campos",
    shortLabel: "Agro/campo",
    description: "Riego tecnificado, maquinaria agricola, packing, frio, bombas y operación de campo.",
    segment: "industria_campo",
    clientVisibility: "pilot",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["campo", "industria", "empresa"],
    iconKey: "sprout",
    imageKey: "agroindustria",
    relatedServices: ["riego tecnificado", "packing", "maquinaria agricola", "camaras de frio"],
    relatedProblems: ["riego detenido", "packing", "maquinaria fallando"],
    seoEnabled: false,
    notes: "Piloto campo/agro; priorizar comunas con demanda CRM y especialistas verificables.",
    specialtyDefaults: { clientVisibility: "forming", coverageStatus: "forming", pricingModeDefault: "quote_required" },
    specialties: [
      { slug: "mecanica-agricola", label: "Mecanica agricola", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "riego-tecnificado", label: "Riego tecnificado", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "bombas", label: "Bombas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "mantencion-bombas", label: "Mantencion de bombas", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "frio-industrial", label: "Frio industrial" },
      { slug: "camaras-de-frio", label: "Camaras de frio", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "packing", label: "Packing", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "mantencion-cintas-equipos", label: "Mantencion de cintas/equipos" },
      { slug: "soldadura-industrial", label: "Soldadura industrial" },
      { slug: "prevencion-riesgos", label: "Prevencion de riesgos", clientVisibility: "forming", coverageStatus: "waitlist" },
      { slug: "operadores-maquinaria", label: "Operadores de maquinaria", clientVisibility: "hidden", coverageStatus: "waitlist" },
    ],
  },
  {
    id: "seguridad-tecnologia",
    slug: "seguridad-tecnologia",
    label: "Seguridad y tecnologia",
    shortLabel: "Seguridad",
    description: "Camaras, alarmas, control de acceso, redes y soporte técnico.",
    segment: "hogar",
    clientVisibility: "pilot",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: false,
    riskLevel: "medium",
    allowedFor: ["hogar", "empresa", "comunidad"],
    iconKey: "shield-check",
    imageKey: "seguridad",
    relatedServices: ["camaras", "alarmas", "control de acceso", "redes"],
    relatedProblems: ["camara sin señal", "acceso inseguro", "wifi inestable"],
    seoEnabled: false,
    notes: "Piloto técnico; distinguir instalaciones simples de seguridad electronica critica.",
    specialties: [
      { slug: "camaras-alarmas-control-acceso", label: "Camaras, alarmas y control de acceso", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "cctv", label: "CCTV", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "redes-wifi", label: "Redes y WiFi", clientVisibility: "forming", coverageStatus: "forming" },
      { slug: "soporte-ti", label: "Soporte TI", clientVisibility: "forming", coverageStatus: "forming" },
    ],
  },
  {
    id: "emergencias",
    slug: "emergencias",
    label: "Emergencias",
    shortLabel: "Emergencias",
    description: "Incidentes criticos para hogar, comercio, comunidades, campo e industria.",
    segment: "hogar",
    clientVisibility: "active",
    registrationVisibility: "active",
    coverageStatus: "limited",
    requiresCertification: true,
    riskLevel: "high",
    allowedFor: ["hogar", "empresa", "comunidad", "industria", "campo"],
    iconKey: "siren",
    imageKey: "emergencias",
    relatedServices: ["fuga de agua", "corte electrico", "cerrajero", "refrigeracion critica"],
    relatedProblems: ["urgencia", "incidente critico", "servicio detenido"],
    seoEnabled: true,
    notes: "Visible con mensaje de cobertura limitada; no prometer respuesta garantizada sin especialista confirmado.",
    specialtyDefaults: { requiresCertification: true, riskLevel: "high", pricingModeDefault: "visit_then_quote" },
    specialties: [
      { slug: "fuga-de-agua", label: "Fuga de agua", clientVisibility: "active", coverageStatus: "available" },
      { slug: "corte-electrico", label: "Corte electrico", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "calefont-detenido", label: "Calefont detenido", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "cerrajero", label: "Cerrajero", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "porton-detenido", label: "Porton detenido", clientVisibility: "pilot", coverageStatus: "limited" },
      { slug: "destape-urgente", label: "Destape urgente", clientVisibility: "active", coverageStatus: "limited" },
      { slug: "refrigeracion-critica", label: "Refrigeracion critica", clientVisibility: "pilot", coverageStatus: "limited" },
    ],
  },
];

function fromSeeds(): { categories: TradeCategory[]; specialties: TradeSpecialty[] } {
  const categories = seeds.map(({ specialtyDefaults: _specialtyDefaults, specialties: _specialties, ...category }) => category);
  const specialties = seeds.flatMap((category) =>
    category.specialties.map((specialty) => ({
      id: `${category.id}-${specialty.slug}`,
      categoryId: category.id,
      slug: specialty.slug,
      label: specialty.label,
      description: specialty.description ?? `${specialty.label} dentro de ${category.label}.`,
      clientVisibility: specialty.clientVisibility ?? category.specialtyDefaults?.clientVisibility ?? category.clientVisibility,
      registrationVisibility: "active" as RegistrationVisibility,
      coverageStatus: specialty.coverageStatus ?? category.specialtyDefaults?.coverageStatus ?? category.coverageStatus,
      requiresCertification: specialty.requiresCertification ?? category.specialtyDefaults?.requiresCertification ?? category.requiresCertification,
      examples: specialty.examples ?? [specialty.label],
      keywords: specialty.keywords ?? [specialty.label, category.label, category.shortLabel],
      pricingModeDefault: specialty.pricingModeDefault ?? category.specialtyDefaults?.pricingModeDefault ?? "visit_then_quote",
      riskLevel: specialty.riskLevel ?? category.specialtyDefaults?.riskLevel ?? category.riskLevel,
    })),
  );
  return { categories, specialties };
}

const seededTaxonomy = fromSeeds();

const seededCategoryIds = new Set(seededTaxonomy.categories.map((category) => category.id));

function mapAudience(audience: ServiceAudience): AllowedFor {
  if (audience === "agricola") return "campo";
  return audience === "industrial" ? "industria" : audience;
}

function segmentForServiceType(id: string): TradeSegment {
  if (id.includes("agro") || id.includes("agric") || id.includes("riego") || id.includes("maquinaria") || id.includes("industria")) return "industria_campo";
  if (id.includes("comunidad")) return "comunidades";
  if (id.includes("empresa") || id.includes("logistica") || id.includes("transporte")) return "empresas";
  if (id.includes("construccion")) return "construccion_obra";
  if (id.includes("limpieza") || id.includes("jardineria")) return "servicios_exterior";
  return "hogar";
}

function categoryFromCatalog(category: (typeof nationalServiceTypes)[number]): TradeCategory {
  const clientVisibility: ClientVisibility = activePilotCategoryIds.has(category.id) ? "pilot" : "forming";
  const coverageStatus: CoverageStatus = clientVisibility === "pilot" ? "limited" : "forming";
  const requiresCertification = category.specialtyDetails.some((specialty) => specialty.certificationRequired !== "No obligatoria");
  const riskLevel: RiskLevel = category.appliesTo.includes("industrial") ? "high" : category.marginType === "company" ? "medium" : "low";
  return {
    id: category.id,
    slug: category.slug,
    label: category.name,
    shortLabel: category.name.split(" y ")[0] ?? category.name,
    description: category.description,
    segment: segmentForServiceType(category.id),
    clientVisibility,
    registrationVisibility: "active",
    coverageStatus,
    requiresCertification,
    riskLevel,
    allowedFor: Array.from(new Set(category.appliesTo.map(mapAudience))),
    iconKey: category.icon,
    imageKey: category.id,
    relatedServices: category.specialties.slice(0, 5),
    relatedProblems: category.specialtyDetails.flatMap((specialty) => specialty.keywords).slice(0, 5),
    seoEnabled: editorialSeoCategoryIds.has(category.id),
    notes: "Importado desde serviceCatalog y gobernado por tradeTaxonomy para visibilidad.",
  };
}

function specialtiesFromCatalog(category: (typeof nationalServiceTypes)[number]): TradeSpecialty[] {
  const categoryMeta = categoryFromCatalog(category);
  return category.specialtyDetails.map((specialty) => ({
    id: specialty.id,
    categoryId: category.id,
    slug: specialty.slug,
    label: specialty.name,
    description: `${specialty.name} para ${category.name.toLowerCase()}.`,
    clientVisibility: categoryMeta.clientVisibility,
    registrationVisibility: "active",
    coverageStatus: categoryMeta.coverageStatus,
    requiresCertification: specialty.certificationRequired !== "No obligatoria",
    examples: specialty.typicalServices,
    keywords: specialty.keywords,
    pricingModeDefault: specialty.suggestedCredits.max === null ? "quote_required" : specialty.suggestedCredits.min <= 12 ? "fixed" : "visit_then_quote",
    riskLevel: categoryMeta.riskLevel,
  }));
}

const importedCategories = nationalServiceTypes.filter((category) => !seededCategoryIds.has(category.id)).map(categoryFromCatalog);
const importedSpecialties = nationalServiceTypes.filter((category) => !seededCategoryIds.has(category.id)).flatMap(specialtiesFromCatalog);

export const tradeCategories: TradeCategory[] = [...seededTaxonomy.categories, ...importedCategories];
export const tradeSpecialties: TradeSpecialty[] = [...seededTaxonomy.specialties, ...importedSpecialties];

export const tradeSegmentLabels = segmentLabels;

export function getRegistrationTradeOptions() {
  return tradeCategories
    .filter((category) => category.registrationVisibility === "active")
    .map((category) => ({
      value: category.id,
      label: category.label,
      meta: `${getTradeCoverageLabel(category)} · ${category.description}`,
      group: segmentLabels[category.segment],
    }));
}

export function getClientVisibleTradeOptions({ includeForming = false }: { includeForming?: boolean } = {}) {
  return tradeCategories
    .filter((category) => {
      if (category.clientVisibility === "hidden") return false;
      if (includeForming) return ["active", "pilot", "forming"].includes(category.clientVisibility);
      return ["active", "pilot"].includes(category.clientVisibility);
    })
    .map((category) => ({
      value: category.id,
      label: category.shortLabel || category.label,
      meta: `${getTradeCoverageLabel(category)} · ${category.description}`,
      group: menuGroupForSegment(category.segment),
    }));
}

export function getRegistrationSpecialtyOptions(categoryId: string) {
  return tradeSpecialties
    .filter((specialty) => specialty.categoryId === categoryId && specialty.registrationVisibility === "active")
    .map((specialty) => ({
      value: specialty.label,
      label: specialty.label,
      meta: `${getTradeCoverageLabel(specialty)} · ${specialty.description}`,
      group: tradeCategories.find((category) => category.id === categoryId)?.label,
    }));
}

export function getClientVisibleSpecialtyOptions(categoryId: string, { includeForming = false }: { includeForming?: boolean } = {}) {
  return tradeSpecialties
    .filter((specialty) => specialty.categoryId === categoryId)
    .filter((specialty) => {
      if (specialty.clientVisibility === "hidden") return false;
      if (includeForming) return ["active", "pilot", "forming"].includes(specialty.clientVisibility);
      return ["active", "pilot"].includes(specialty.clientVisibility);
    })
    .map((specialty) => ({ value: specialty.label, label: specialty.label, meta: getTradeCoverageLabel(specialty) }));
}

export function getTradeCategoryById(id: string) {
  return tradeCategories.find((category) => category.id === id || category.slug === id);
}

export function getTradeSpecialtyBySlugOrLabel(value: string, categoryId?: string) {
  const token = normalizeTradeToken(value);
  return tradeSpecialties.find((specialty) => {
    if (categoryId && specialty.categoryId !== categoryId) return false;
    return normalizeTradeToken(specialty.slug) === token || normalizeTradeToken(specialty.label) === token;
  });
}

export function getTradeAvailabilityStatus(item: Pick<TradeCategory | TradeSpecialty, "coverageStatus" | "clientVisibility">) {
  if (item.clientVisibility === "hidden") return "hidden";
  return item.coverageStatus;
}

export function getTradeCoverageLabel(item: Pick<TradeCategory | TradeSpecialty, "coverageStatus" | "clientVisibility">) {
  if (item.clientVisibility === "forming" || item.coverageStatus === "forming") return "En formacion";
  if (item.coverageStatus === "waitlist") return "Lista de espera";
  if (item.clientVisibility === "pilot" || item.coverageStatus === "limited") return "Piloto / cobertura limitada";
  return "Cobertura activa";
}

export function isTradeClientSelectable(item: Pick<TradeCategory | TradeSpecialty, "clientVisibility" | "coverageStatus">) {
  return item.clientVisibility === "active" || item.clientVisibility === "pilot";
}

export function isTradeRegistrationSelectable(item: Pick<TradeCategory | TradeSpecialty, "registrationVisibility">) {
  return item.registrationVisibility === "active";
}

export function isTradeForming(item: Pick<TradeCategory | TradeSpecialty, "clientVisibility" | "coverageStatus">) {
  return item.clientVisibility === "forming" || item.coverageStatus === "forming" || item.coverageStatus === "waitlist";
}

export function tradeSegmentForCategory(categoryId: string) {
  return getTradeCategoryById(categoryId)?.segment ?? "hogar";
}

export function getClientMenuGroups() {
  const groups = ["Hogar", "Construccion y terminaciones", "Comunidades", "Empresas", "Industria y campo"] as const;
  return groups
    .map((group) => {
      const categories = tradeCategories
        .filter((category) => category.clientVisibility === "active" || category.clientVisibility === "pilot")
        .filter((category) => menuGroupForSegment(category.segment) === group);
      const items = categories.flatMap((category) => {
        const specialties = tradeSpecialties
          .filter((specialty) => specialty.categoryId === category.id)
          .filter((specialty) => specialty.clientVisibility === "active" || specialty.clientVisibility === "pilot")
          .slice(0, 4);
        if (!specialties.length) return [{ label: category.shortLabel || category.label, href: `/especialistas?categoria=${encodeURIComponent(category.id)}` }];
        return specialties.map((specialty) => ({
          label: specialty.label,
          href: `/especialistas?categoria=${encodeURIComponent(category.id)}&especialidad=${encodeURIComponent(specialty.slug)}`,
        }));
      });
      return {
        title: group,
        href: categories[0] ? `/especialistas?categoria=${encodeURIComponent(categories[0].id)}` : "/especialistas",
        items: dedupeMenuItems(items).slice(0, 8),
      };
    })
    .filter((group) => group.items.length);
}

export function tradeSearchTermsForCategory(categoryId: string) {
  const category = getTradeCategoryById(categoryId);
  const specialties = tradeSpecialties.filter((specialty) => specialty.categoryId === categoryId);
  return [category?.label, category?.shortLabel, category?.slug, ...specialties.flatMap((specialty) => [specialty.label, specialty.slug, ...specialty.keywords])]
    .filter(Boolean)
    .map(String);
}

export function normalizeTradeToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function menuGroupForSegment(segment: TradeSegment) {
  if (segment === "hogar" || segment === "servicios_exterior") return "Hogar";
  if (segment === "construccion_obra" || segment === "terminaciones" || segment === "muebleria_carpinteria" || segment === "metalmecanica") return "Construccion y terminaciones";
  if (segment === "comunidades") return "Comunidades";
  if (segment === "empresas") return "Empresas";
  return "Industria y campo";
}

function dedupeMenuItems(items: { label: string; href: string }[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeTradeToken(item.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
