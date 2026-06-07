export type ServiceAudience = "hogar" | "empresa" | "agricola" | "industrial";
export type CreditComplexity = "bajo" | "medio" | "alto" | "diagnostico" | "tecnico" | "contratista";

export type NationalSpecialty = {
  id: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  name: string;
  typicalServices: string[];
  suggestedCredits: { min: number; max: number | null; label: string };
  certificationRequired: string;
  appliesTo: ServiceAudience[];
  emergency: boolean;
  expectedTicketCLP: { min: number; max: number | null };
  suggestedMinMarginCLP: number;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  suggestedCities: string[];
};

export type NationalServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  appliesTo: ServiceAudience[];
  marginType: "home" | "company";
  specialties: string[];
  specialtyDetails: NationalSpecialty[];
};

type CategorySeed = {
  id: string;
  name: string;
  description: string;
  icon: string;
  appliesTo: ServiceAudience[];
  marginType: "home" | "company";
  groups: { subcategory: string; names: string[]; certification?: string; emergency?: boolean; complexity?: CreditComplexity }[];
};

const suggestedCitiesByAudience: Record<ServiceAudience, string[]> = {
  hogar: ["Las Condes", "Vitacura", "Providencia", "Ñuñoa", "Santiago"],
  empresa: ["Santiago", "Quilicura", "Las Condes", "Concepción", "Puerto Montt"],
  agricola: ["Curicó", "Talca", "Chillán", "Los Ángeles", "Osorno"],
  industrial: ["Santiago", "Rancagua", "Concepción", "Antofagasta", "Calama"],
};

const creditRanges: Record<CreditComplexity, { min: number; max: number | null; label: string }> = {
  bajo: { min: 6, max: 12, label: "bajo" },
  medio: { min: 14, max: 30, label: "medio" },
  alto: { min: 40, max: 80, label: "alto" },
  diagnostico: { min: 20, max: 60, label: "diagnóstico" },
  tecnico: { min: 80, max: 300, label: "servicio técnico" },
  contratista: { min: 200, max: null, label: "cotización personalizada" },
};

const categorySeeds: CategorySeed[] = [
  {
    id: "hogar",
    name: "Hogar",
    icon: "home",
    marginType: "home",
    appliesTo: ["hogar"],
    description: "Oficios recurrentes para casas y departamentos: reparaciones, instalaciones y mantenciones.",
    groups: [
      {
        subcategory: "Gasfitería hogar",
        certification: "Gas autorizado cuando aplica",
        emergency: true,
        names: [
          "Gasfíter domiciliario",
          "Reparación de filtraciones",
          "Instalación de grifería",
          "Reparación de inodoros",
          "Destape de cañerías",
          "Instalación de calefont",
          "Mantención de calefont",
          "Instalación de termos eléctricos",
          "Reparación de bombas de agua",
          "Instalación de estanques de agua",
          "Limpieza de estanques",
          "Detección de fugas",
          "Instalación de lavadoras",
          "Instalación de lavavajillas",
          "Reparación de presión de agua",
        ],
      },
      {
        subcategory: "Reparaciones menores",
        names: ["Cerrajero hogar", "Armado de muebles", "Instalación de cortinas", "Instalación de repisas", "Reparaciones menores"],
      },
    ],
  },
  {
    id: "empresas",
    name: "Empresas",
    icon: "building-2",
    marginType: "company",
    appliesTo: ["empresa"],
    description: "Mantención bajo demanda para oficinas, retail, restaurantes, bodegas y operaciones multi-sede.",
    groups: [
      {
        subcategory: "Mantención comercial",
        complexity: "diagnostico",
        names: [
          "Maestro de mantención oficinas",
          "Mantención retail",
          "Mantención restaurantes",
          "Mantención bodegas",
          "Mantención comunidades",
          "Mantención colegios",
          "Mantención clínicas",
          "Mantención hoteles",
          "Mantención gimnasios",
          "Mantención coworks",
          "Mantención edificios corporativos",
          "Supervisor de mantención externo",
          "Proveedor residente",
          "Gestión multisucursal",
          "Auditoría de mantenciones",
        ],
      },
    ],
  },
  {
    id: "climatizacion-refrigeracion",
    name: "Climatización y Refrigeración",
    icon: "snowflake",
    marginType: "company",
    appliesTo: ["hogar", "empresa", "industrial"],
    description: "Frío, calor, ventilación, HVAC y refrigeración comercial o alimentaria.",
    groups: [
      {
        subcategory: "Climatización hogar",
        certification: "HVAC recomendado",
        names: [
          "Técnico aire acondicionado residencial",
          "Instalador aire acondicionado",
          "Mantención aire acondicionado",
          "Técnico bombas de calor",
          "Instalador calefacción central",
          "Mantención calefacción central",
          "Instalador radiadores",
          "Instalador piso radiante",
          "Técnico ventilación domiciliaria",
          "Instalador extractores",
          "Limpieza de ductos",
          "Técnico calefactores",
          "Técnico estufas a pellet",
          "Técnico estufas a leña",
        ],
      },
      {
        subcategory: "Refrigeración comercial",
        certification: "Refrigeración / HVAC",
        complexity: "tecnico",
        emergency: true,
        names: [
          "Técnico HVAC",
          "Técnico aire acondicionado comercial",
          "Técnico VRV / VRF",
          "Técnico chillers",
          "Técnico rooftop",
          "Técnico ventilación industrial",
          "Técnico extracción de aire",
          "Técnico presurización",
          "Técnico refrigeración comercial",
          "Técnico vitrinas refrigeradas",
          "Técnico cámaras frigoríficas",
          "Técnico túneles de frío",
          "Técnico compresores",
          "Técnico evaporadores",
          "Técnico condensadores",
          "Técnico amoníaco industrial",
          "Técnico refrigerantes naturales",
          "Técnico CO2 transcrítico",
          "Técnico R290",
          "Frigorista",
        ],
      },
    ],
  },
  {
    id: "electricidad",
    name: "Electricidad",
    icon: "zap",
    marginType: "home",
    appliesTo: ["hogar", "empresa", "industrial"],
    description: "Electricidad domiciliaria, comercial, SEC, industrial y respaldo energético.",
    groups: [
      {
        subcategory: "Electricidad hogar",
        certification: "SEC cuando aplica",
        emergency: true,
        names: [
          "Electricista domiciliario",
          "Instalación de enchufes",
          "Instalación de lámparas",
          "Cambio de tablero eléctrico",
          "Instalación de automáticos",
          "Certificación SEC domiciliaria",
          "Instalación de citófonos",
          "Instalación de cámaras",
          "Instalación de alarmas",
          "Instalación de portones eléctricos",
          "Mantención eléctrica preventiva",
          "Instalación de cargadores para autos eléctricos",
        ],
      },
      {
        subcategory: "Electricidad comercial e industrial",
        certification: "SEC / industrial",
        complexity: "tecnico",
        names: [
          "Electricista comercial",
          "Electricista industrial",
          "Técnico tableros eléctricos",
          "Técnico grupos electrógenos",
          "Técnico UPS",
          "Técnico iluminación LED",
          "Técnico iluminación industrial",
          "Certificador SEC",
          "Instalador cargadores eléctricos",
          "Mantenimiento subestaciones",
          "Técnico banco de condensadores",
          "Técnico variadores de frecuencia",
          "Técnico motores eléctricos",
        ],
      },
    ],
  },
  {
    id: "gasfiteria",
    name: "Gasfitería",
    icon: "droplets",
    marginType: "home",
    appliesTo: ["hogar", "empresa"],
    description: "Agua, gas, sanitarios, calefont, bombas, destapes y emergencias.",
    groups: [
      {
        subcategory: "Agua y gas",
        certification: "Gas autorizado cuando aplica",
        emergency: true,
        names: [
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
          "Gasfitería comercial",
          "Gasfitería comunidades",
        ],
      },
    ],
  },
  {
    id: "construccion",
    name: "Construcción y Reparaciones",
    icon: "hammer",
    marginType: "home",
    appliesTo: ["hogar", "empresa", "industrial"],
    description: "Obras menores, terminaciones, techumbres, estructuras y reparaciones.",
    groups: [
      {
        subcategory: "Terminaciones y obra menor",
        names: [
          "Maestro general",
          "Carpintero",
          "Pintor",
          "Albañil",
          "Instalador de cerámica",
          "Instalador de porcelanato",
          "Instalador de pisos flotantes",
          "Instalador de vinílicos",
          "Instalador de alfombras",
          "Yesero",
          "Tabiquero",
          "Instalador de volcanita",
          "Reparación de techumbres",
          "Hojalatero",
          "Canaletero",
          "Impermeabilización",
          "Soldador domiciliario",
          "Instalador de ventanas",
          "Instalador de puertas",
          "Instalador de muebles",
          "Instalador de persianas",
          "Instalador de quinchos",
          "Reparación de rejas",
          "Reparación de portones",
        ],
      },
    ],
  },
  {
    id: "jardineria",
    name: "Jardinería y Exteriores",
    icon: "leaf",
    marginType: "home",
    appliesTo: ["hogar", "empresa", "agricola"],
    description: "Jardines, riego, piscinas, podas, exteriores, plagas y mantenciones.",
    groups: [
      {
        subcategory: "Jardín y exterior",
        names: [
          "Jardinero",
          "Mantención de jardín",
          "Paisajista",
          "Instalador de pasto",
          "Instalador de pasto sintético",
          "Podador",
          "Podador de altura",
          "Tala controlada",
          "Chipeado de ramas",
          "Instalador de riego automático",
          "Mantención de riego",
          "Reparación de bombas de riego",
          "Control de plagas jardín",
          "Fumigador domiciliario",
          "Mantención de piscinas",
          "Limpieza de piscinas",
          "Reparación de bombas de piscina",
          "Instalador de cercos",
          "Instalador de mallas",
          "Instalador de juegos infantiles",
        ],
      },
    ],
  },
  {
    id: "seguridad-tecnologia",
    name: "Seguridad y Tecnología",
    icon: "shield-check",
    marginType: "company",
    appliesTo: ["hogar", "empresa", "industrial"],
    description: "CCTV, alarmas, redes, fibra, soporte TI, domótica y automatización de edificios.",
    groups: [
      {
        subcategory: "Seguridad electrónica y TI",
        certification: "Redes / seguridad electrónica recomendado",
        names: [
          "Instalador CCTV",
          "Instalador alarmas",
          "Instalador control de acceso",
          "Instalador citofonía",
          "Instalador redes",
          "Técnico fibra óptica",
          "Técnico cableado estructurado",
          "Técnico WiFi corporativo",
          "Técnico servidores",
          "Soporte TI",
          "Técnico impresoras",
          "Técnico POS",
          "Técnico domótica",
          "Técnico automatización edificios",
          "Técnico BMS",
        ],
      },
    ],
  },
  {
    id: "limpieza-sanitizacion",
    name: "Limpieza y Sanitización",
    icon: "sparkles",
    marginType: "home",
    appliesTo: ["hogar", "empresa", "industrial"],
    description: "Aseo, limpieza técnica, sanitización, control de plagas y servicios operativos.",
    groups: [
      {
        subcategory: "Limpieza operativa",
        names: [
          "Aseo domiciliario",
          "Aseo oficinas",
          "Limpieza industrial",
          "Limpieza de vidrios",
          "Limpieza altura",
          "Limpieza alfombras",
          "Limpieza tapices",
          "Limpieza post obra",
          "Limpieza de bodegas",
          "Limpieza de fachadas",
          "Lavado de autos a domicilio",
          "Lavado de maquinaria",
          "Sanitización",
          "Desinfección",
          "Control de plagas",
          "Desratización",
          "Fumigación",
          "Limpieza de canaletas",
          "Limpieza de paneles solares",
          "Limpieza de piscinas",
        ],
      },
    ],
  },
  {
    id: "comunidades-edificios",
    name: "Comunidades y Edificios",
    icon: "building",
    marginType: "company",
    appliesTo: ["empresa", "hogar"],
    description: "Servicios para edificios, condominios, salas técnicas y espacios comunes.",
    groups: [
      {
        subcategory: "Operación de comunidades",
        complexity: "diagnostico",
        names: [
          "Conserje temporal",
          "Mayordomo edificio",
          "Maestro edificio",
          "Mantención bombas de agua",
          "Mantención sala de bombas",
          "Mantención sala eléctrica",
          "Mantención calderas",
          "Mantención ascensores",
          "Técnico portones",
          "Técnico citofonía",
          "Técnico cámaras",
          "Técnico control acceso",
          "Limpieza comunidades",
          "Jardinería comunidades",
          "Mantención piscina comunidad",
          "Pintura espacios comunes",
          "Reparación techos comunidades",
        ],
      },
    ],
  },
  {
    id: "agroindustria",
    name: "Agroindustria",
    icon: "factory",
    marginType: "company",
    appliesTo: ["agricola", "industrial", "empresa"],
    description: "Packing, frío alimentario, líneas de fruta, automatización y continuidad agroindustrial.",
    groups: [
      {
        subcategory: "Packing y frío alimentario",
        certification: "Frío alimentario / industrial recomendado",
        complexity: "tecnico",
        names: [
          "Técnico packing fruta fresca",
          "Técnico líneas de selección",
          "Técnico calibradoras",
          "Técnico pesadoras",
          "Técnico llenadoras",
          "Técnico etiquetadoras",
          "Técnico selladoras",
          "Técnico cintas transportadoras",
          "Técnico correas",
          "Técnico cámaras frigoríficas agrícolas",
          "Frigorista agrícola",
          "Técnico túneles de frío",
          "Técnico hidrocooler",
          "Técnico prefrío",
          "Técnico atmósfera controlada",
          "Técnico puertas frigoríficas",
          "Técnico generadores para packing",
          "Técnico tableros packing",
          "Técnico automatización packing",
          "Técnico sensores packing",
          "Técnico líneas de nueces",
          "Técnico líneas de cerezas",
          "Técnico líneas de uva",
          "Técnico líneas de manzanas",
          "Técnico líneas de cítricos",
        ],
      },
    ],
  },
  {
    id: "agricultura-campos",
    name: "Agricultura y Campos",
    icon: "sprout",
    marginType: "company",
    appliesTo: ["agricola"],
    description: "Mano de obra agrícola especializada, campos, ganadería, asesorías y operación rural.",
    groups: [
      {
        subcategory: "Mano de obra agrícola especializada",
        complexity: "contratista",
        names: [
          "Podador de nogales",
          "Podador de cerezos",
          "Podador de viñas",
          "Podador de paltos",
          "Podador de cítricos",
          "Podador de arándanos",
          "Podador de manzanos",
          "Podador de kiwis",
          "Especialista en poda en verde",
          "Especialista en poda de formación",
          "Injertador",
          "Raleador",
          "Amarrador",
          "Desbrotador",
          "Aplicador fitosanitario",
          "Monitor de plagas",
          "Supervisor de cuadrilla",
          "Capataz agrícola",
          "Jefe de campo externo",
          "Encargado de riego",
          "Tractorista",
          "Operador agrícola polifuncional",
        ],
      },
      {
        subcategory: "Servicios profesionales agrícolas",
        complexity: "diagnostico",
        names: [
          "Asesor agronómico",
          "Asesor riego",
          "Asesor nutrición vegetal",
          "Asesor fitosanitario",
          "Asesor maquinaria agrícola",
          "Asesor certificaciones agrícolas",
          "Asesor GlobalG.A.P.",
          "Asesor orgánico",
          "Asesor inocuidad",
          "Auditor agrícola",
          "Monitor calidad fruta",
          "Monitor cosecha",
          "Supervisor cosecha",
          "Supervisor packing",
          "Encargado trazabilidad",
          "Encargado BPA",
          "Encargado seguridad agrícola",
        ],
      },
      {
        subcategory: "Ganadería y rural",
        names: [
          "Veterinario rural",
          "Técnico ganadero",
          "Instalador cercos eléctricos",
          "Instalador bebederos",
          "Instalador corrales",
          "Reparación de mangas",
          "Operador maquinaria ganadera",
          "Control de plagas rurales",
          "Desratización predios",
          "Mantención galpones animales",
          "Técnico ordeña",
          "Técnico bombas lecheras",
          "Técnico estanques de leche",
          "Técnico frío lechero",
        ],
      },
    ],
  },
  {
    id: "contratistas-agricolas",
    name: "Contratistas Agrícolas",
    icon: "users",
    marginType: "company",
    appliesTo: ["agricola"],
    description: "Cuadrillas, contratistas por temporada, cosecha, poda, packing temporal y labores de campo.",
    groups: [
      {
        subcategory: "Cuadrillas agrícolas",
        complexity: "contratista",
        names: [
          "Contratista de poda",
          "Contratista de cosecha",
          "Contratista de raleo",
          "Contratista de amarra",
          "Contratista de desbrote",
          "Contratista de plantación",
          "Contratista de injertación",
          "Contratista de conducción de huertos",
          "Contratista de espaldera",
          "Contratista de parrón",
          "Contratista de desmalezado",
          "Contratista de limpieza de canales",
          "Contratista de aplicación agrícola",
          "Contratista de control de malezas",
          "Contratista de packing temporal",
          "Contratista de selección de fruta",
          "Contratista de carga y descarga",
          "Contratista de cuadrillas agrícolas",
          "Contratista de cosecha mecanizada",
          "Contratista de cosecha manual",
        ],
      },
    ],
  },
  {
    id: "maquinaria-agricola",
    name: "Maquinaria Agrícola",
    icon: "tractor",
    marginType: "company",
    appliesTo: ["agricola", "industrial"],
    description: "Mecánica agrícola, operadores, calibración, GPS, implementos y maquinaria de precisión.",
    groups: [
      {
        subcategory: "Mecánica y operación agrícola",
        certification: "Experiencia maquinaria agrícola",
        complexity: "tecnico",
        names: [
          "Mecánico agrícola",
          "Mecánico tractores",
          "Mecánico cosechadoras",
          "Mecánico pulverizadoras",
          "Mecánico atomizadores",
          "Mecánico maquinaria frutícola",
          "Mecánico maquinaria vitivinícola",
          "Técnico hidráulico agrícola",
          "Técnico neumáticos agrícolas",
          "Técnico implementos agrícolas",
          "Técnico calibración pulverizadoras",
          "Técnico GPS agrícola",
          "Técnico maquinaria de precisión",
          "Operador tractor",
          "Operador pulverizadora",
          "Operador atomizador",
          "Operador cosechadora",
          "Operador grúa agrícola",
          "Operador bins",
        ],
      },
    ],
  },
  {
    id: "riego-agricola",
    name: "Riego Agrícola",
    icon: "waves",
    marginType: "company",
    appliesTo: ["agricola"],
    description: "Riego tecnificado, goteo, bombas, fertirriego, telemetría, pozos y tableros de riego.",
    groups: [
      {
        subcategory: "Riego tecnificado",
        certification: "Riego tecnificado recomendado",
        complexity: "tecnico",
        emergency: true,
        names: [
          "Técnico riego tecnificado",
          "Instalador de riego por goteo",
          "Instalador de microaspersión",
          "Instalador de pivotes",
          "Mantención de sistemas de riego",
          "Reparación de matrices",
          "Reparación de válvulas",
          "Técnico bombas de riego",
          "Técnico filtros de riego",
          "Técnico fertirriego",
          "Técnico automatización de riego",
          "Instalador caseta de riego",
          "Técnico sensores humedad",
          "Técnico telemetría agrícola",
          "Técnico pozos profundos",
          "Técnico tranques",
          "Técnico impulsiones",
          "Técnico tableros de riego",
        ],
      },
    ],
  },
  {
    id: "industria",
    name: "Industria y Mantención",
    icon: "wrench",
    marginType: "company",
    appliesTo: ["industrial", "empresa"],
    description: "Mantención industrial, electromecánica, soldadura, hidráulica, neumática y predictivo.",
    groups: [
      {
        subcategory: "Mantención industrial",
        complexity: "tecnico",
        names: [
          "Mecánico industrial",
          "Electromecánico",
          "Soldador industrial",
          "Soldador TIG",
          "Soldador MIG",
          "Soldador certificado",
          "Calderero",
          "Tornero",
          "Fresador",
          "Técnico hidráulico",
          "Técnico neumático",
          "Técnico rodamientos",
          "Técnico correas transportadoras",
          "Técnico bombas industriales",
          "Técnico motores industriales",
          "Técnico reductores",
          "Técnico compresores industriales",
          "Técnico lubricación",
          "Técnico mantenimiento preventivo",
          "Técnico mantenimiento predictivo",
          "Técnico vibraciones",
          "Técnico termografía",
          "Técnico ultrasonido industrial",
        ],
      },
      {
        subcategory: "Automatización e instrumentación",
        certification: "Automatización / instrumentación",
        complexity: "tecnico",
        names: [
          "Programador PLC",
          "Técnico PLC",
          "Técnico SCADA",
          "Técnico sensores",
          "Instrumentista",
          "Técnico calibración",
          "Técnico control industrial",
          "Técnico tableros de control",
          "Técnico variadores",
          "Técnico HMI",
          "Técnico robótica industrial",
          "Técnico líneas automáticas",
          "Técnico pesaje industrial",
          "Técnico caudalímetros",
          "Técnico válvulas industriales",
        ],
      },
    ],
  },
  {
    id: "energia-sustentabilidad",
    name: "Energía y Sustentabilidad",
    icon: "sun",
    marginType: "company",
    appliesTo: ["hogar", "empresa", "agricola", "industrial"],
    description: "Paneles solares, baterías, eficiencia, bombas solares, biomasa y cargadores eléctricos.",
    groups: [
      {
        subcategory: "Energía y eficiencia",
        certification: "Eléctrica / solar cuando aplica",
        complexity: "diagnostico",
        names: [
          "Instalador paneles solares",
          "Mantención paneles solares",
          "Técnico inversores",
          "Técnico baterías solares",
          "Instalador termos solares",
          "Técnico bombas solares",
          "Instalador cargadores eléctricos",
          "Técnico eficiencia energética",
          "Auditor energético",
          "Instalador aislación térmica",
          "Instalador ventanas termopanel",
          "Técnico recuperación de calor",
          "Técnico biomasa",
          "Técnico calefacción eficiente",
          "Técnico bombas de calor",
          "Técnico medición consumo eléctrico",
        ],
      },
    ],
  },
  {
    id: "transporte-logistica",
    name: "Transporte y Logística",
    icon: "truck",
    marginType: "company",
    appliesTo: ["hogar", "empresa", "agricola", "industrial"],
    description: "Fletes, mudanzas, operadores, transporte agrícola, retiro de residuos y camiones de apoyo.",
    groups: [
      {
        subcategory: "Carga y operación logística",
        names: [
          "Flete pequeño",
          "Flete mediano",
          "Mudanza",
          "Carga y descarga",
          "Peoneta",
          "Operador grúa horquilla",
          "Operador transpaleta",
          "Operador apilador",
          "Transportista agrícola",
          "Transportista bins",
          "Transportista refrigerado",
          "Transportista última milla",
          "Transportista materiales construcción",
          "Retiro de escombros",
          "Retiro de ramas",
          "Retiro de residuos voluminosos",
          "Retiro de chatarra",
          "Servicio camión pluma",
          "Servicio camión aljibe",
          "Servicio camión tolva",
        ],
      },
    ],
  },
  {
    id: "emergencias",
    name: "Emergencias",
    icon: "siren",
    marginType: "home",
    appliesTo: ["hogar", "empresa", "agricola", "industrial"],
    description: "Respuesta rápida para incidentes críticos del hogar, comercio, campo e industria.",
    groups: [
      {
        subcategory: "Urgencias técnicas",
        emergency: true,
        names: [
          "Gasfíter emergencia",
          "Electricista emergencia",
          "Cerrajero emergencia",
          "Técnico refrigeración emergencia",
          "Técnico aire acondicionado emergencia",
          "Destape urgente",
          "Reparación filtración urgente",
          "Reparación portón urgente",
          "Reparación bomba agua urgente",
          "Técnico generador urgente",
          "Técnico cámaras seguridad urgente",
          "Control plagas urgente",
          "Limpieza post inundación",
          "Reparación techumbre urgente",
          "Vidriero emergencia",
        ],
      },
    ],
  },
  {
    id: "otros-servicios",
    name: "Otros Servicios",
    icon: "plus-circle",
    marginType: "company",
    appliesTo: ["hogar", "empresa", "agricola", "industrial"],
    description: "Servicios técnicos especializados, solicitudes no encontradas y oficios emergentes.",
    groups: [
      {
        subcategory: "Oficios técnicos especializados",
        complexity: "diagnostico",
        names: [
          "Técnico bombas",
          "Técnico compresores",
          "Técnico generadores",
          "Técnico motores eléctricos",
          "Técnico calderas",
          "Técnico quemadores",
          "Técnico válvulas",
          "Técnico sensores",
          "Técnico automatización",
          "Técnico control acceso",
          "Técnico seguridad electrónica",
          "Técnico frío industrial",
          "Técnico frío alimentario",
          "Técnico HVAC industrial",
          "Técnico refrigerantes naturales",
          "Técnico soldadura sanitaria",
          "Técnico acero inoxidable",
          "Técnico líneas alimentarias",
          "Técnico pesaje",
          "Técnico dosificación",
          "Técnico filtros industriales",
        ],
      },
    ],
  },
  {
    id: "servicios-campos",
    name: "Servicios para Campos",
    icon: "fence",
    marginType: "company",
    appliesTo: ["agricola"],
    description: "Infraestructura rural, cercos, mallas, caminos interiores, canales, bodegas y seguridad rural.",
    groups: [
      {
        subcategory: "Infraestructura rural",
        names: [
          "Instalador cercos agrícolas",
          "Instalador mallas antiheladas",
          "Instalador mallas antigranizo",
          "Instalador mallas sombra",
          "Instalador postes y alambres",
          "Instalador espalderas",
          "Instalador parrón",
          "Instalador invernaderos",
          "Mantención de caminos interiores",
          "Limpieza de acequias",
          "Limpieza de canales",
          "Reparación de compuertas",
          "Construcción de bodegas agrícolas",
          "Reparación de galpones agrícolas",
          "Instalador portones de campo",
          "Instalador cámaras rurales",
          "Instalador alarmas rurales",
          "Instalador energía solar rural",
        ],
      },
    ],
  },
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function creditsFor(group: CategorySeed["groups"][number], category: CategorySeed) {
  const complexity: CreditComplexity =
    group.complexity ?? (category.appliesTo.includes("agricola") || category.appliesTo.includes("industrial") ? "tecnico" : category.marginType === "company" ? "diagnostico" : "medio");
  return creditRanges[complexity];
}

function expectedTicket(range: { min: number; max: number | null }) {
  return { min: range.min * 1000, max: range.max ? range.max * 1000 : null };
}

function typicalServices(name: string, subcategory: string) {
  return [`Visita diagnóstico ${name}`, `Ejecución de ${name}`, `Mantención preventiva ${subcategory}`];
}

function specialtyFromSeed(category: CategorySeed, group: CategorySeed["groups"][number], name: string): NationalSpecialty {
  const slug = toSlugLocal(name);
  const range = creditsFor(group, category);
  const primaryAudience = category.appliesTo[0];
  const cities = unique(category.appliesTo.flatMap((audience) => suggestedCitiesByAudience[audience])).slice(0, 6);
  const suggestedMinMarginCLP = category.marginType === "company" ? 10000 : 5000;

  return {
    id: `${category.id}-${slug}`,
    slug,
    categoryId: category.id,
    categoryName: category.name,
    subcategory: group.subcategory,
    name,
    typicalServices: typicalServices(name, group.subcategory),
    suggestedCredits: range,
    certificationRequired: group.certification ?? (category.appliesTo.includes("industrial") ? "Experiencia técnica verificable" : "No obligatoria"),
    appliesTo: category.appliesTo,
    emergency: Boolean(group.emergency || category.id === "emergencias"),
    expectedTicketCLP: expectedTicket(range),
    suggestedMinMarginCLP,
    seoTitle: `${name} en Chile | OficiosPro`,
    seoDescription: `Encuentra ${name.toLowerCase()} verificado por comuna, disponibilidad, reputación y precio en créditos OficiosPro.`,
    keywords: unique([name, group.subcategory, category.name, primaryAudience, ...cities]).map((item) => item.toLowerCase()),
    suggestedCities: cities,
  };
}

export const nationalServiceTypes: NationalServiceCategory[] = categorySeeds.map((category) => {
  const specialtyDetails = category.groups.flatMap((group) => group.names.map((name) => specialtyFromSeed(category, group, name)));
  return {
    id: category.id,
    name: category.name,
    slug: toSlugLocal(category.name),
    description: category.description,
    icon: category.icon,
    appliesTo: category.appliesTo,
    marginType: category.marginType,
    specialties: specialtyDetails.map((specialty) => specialty.name),
    specialtyDetails,
  };
});

export const nationalSpecialties: NationalSpecialty[] = nationalServiceTypes.flatMap((category) => category.specialtyDetails);

export const otherServiceLabels = [
  "Otro servicio de hogar",
  "Otro servicio de empresa",
  "Otro servicio agrícola",
  "Otro servicio industrial",
  "Otro servicio técnico",
];

export const nationalCatalogStats = {
  categories: nationalServiceTypes.length,
  specialties: nationalSpecialties.length,
};

function toSlugLocal(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
