export type Availability = "now" | "today" | "tomorrow";

export type Specialist = {
  id: string;
  name: string;
  specialty: string;
  category: string;
  zone: string;
  availability: Availability;
  rating: number;
  jobs: number;
  recommendation: number;
  credits: number;
  demand: string;
  responseTime: string;
  years: number;
  top: boolean;
  badges: string[];
  image: string;
  gallery: string[];
  distance: number;
  verified: boolean;
  photos: boolean;
  certifications: string[];
  description: string;
};

export type Booking = {
  id: string;
  specialistId: string;
  specialistName: string;
  service: string;
  date: string;
  time: string;
  status: string;
  credits: number;
  commune: string;
  customer: string;
  channel: "Club Hogar" | "Empresas";
};

export type CreditTransaction = {
  id: string;
  type: string;
  detail: string;
  amount: number;
  date: string;
};

export const availabilityLabels: Record<Availability, string> = {
  now: "Disponible ahora",
  today: "Disponible hoy",
  tomorrow: "Disponible mañana",
};

export const specialists: Specialist[] = [
  {
    id: "victor-araya",
    name: "Victor Araya",
    specialty: "Técnico HVAC",
    category: "Climatización",
    zone: "Providencia",
    availability: "now",
    rating: 4.9,
    jobs: 285,
    recommendation: 98,
    credits: 45,
    demand: "Alta demanda",
    responseTime: "1.1 h",
    years: 4,
    top: true,
    badges: ["Verificado", "HVAC", "Respuesta rápida"],
    image: "/assets/work-hvac.webp",
    gallery: ["Instalación split", "Mantención", "Diagnóstico"],
    distance: 2.1,
    verified: true,
    photos: true,
    certifications: ["SEC", "HVAC"],
    description: "Instalación, mantención y diagnóstico de aire acondicionado residencial y comercial.",
  },
  {
    id: "carolina-mendez",
    name: "Carolina Méndez",
    specialty: "Electricista",
    category: "Hogar",
    zone: "Las Condes",
    availability: "today",
    rating: 4.8,
    jobs: 176,
    recommendation: 96,
    credits: 25,
    demand: "Demanda media",
    responseTime: "1.4 h",
    years: 3,
    top: true,
    badges: ["Verificado", "SEC", "Top especialista"],
    image: "/assets/work-electrical.webp",
    gallery: ["Tablero", "Iluminación", "Normalización"],
    distance: 4.4,
    verified: true,
    photos: true,
    certifications: ["SEC"],
    description: "Tableros, enchufes, iluminación, fallas domiciliarias y normalización eléctrica.",
  },
  {
    id: "miguel-soto",
    name: "Miguel Soto",
    specialty: "Gasfíter",
    category: "Hogar",
    zone: "Ñuñoa",
    availability: "now",
    rating: 4.7,
    jobs: 221,
    recommendation: 94,
    credits: 30,
    demand: "Alta demanda",
    responseTime: "1.2 h",
    years: 5,
    top: false,
    badges: ["Verificado", "Urgencias", "Garantía"],
    image: "/assets/work-bathroom.webp",
    gallery: ["Calefont", "Filtración", "Sanitario"],
    distance: 3.2,
    verified: true,
    photos: true,
    certifications: ["Instalador autorizado"],
    description: "Filtraciones, calefont, artefactos sanitarios, destapes y urgencias domiciliarias.",
  },
  {
    id: "daniela-fuentes",
    name: "Daniela Fuentes",
    specialty: "Técnico en refrigeración comercial",
    category: "Climatización",
    zone: "Santiago Centro",
    availability: "tomorrow",
    rating: 4.9,
    jobs: 143,
    recommendation: 99,
    credits: 50,
    demand: "Demanda alta",
    responseTime: "2.0 h",
    years: 4,
    top: true,
    badges: ["Verificado", "Frío comercial", "Top especialista"],
    image: "/assets/club-empresas.webp",
    gallery: ["Vitrina", "Cámara", "Compresor"],
    distance: 5.8,
    verified: true,
    photos: true,
    certifications: ["Refrigeración", "Cámara frigorífica"],
    description: "Vitrinas, cámaras frigoríficas, equipos comerciales y mantenciones preventivas.",
  },
  {
    id: "felipe-rojas",
    name: "Felipe Rojas",
    specialty: "Instalador de cámaras",
    category: "Tecnología",
    zone: "La Florida",
    availability: "today",
    rating: 4.6,
    jobs: 98,
    recommendation: 92,
    credits: 20,
    demand: "Demanda baja",
    responseTime: "2.8 h",
    years: 2,
    top: false,
    badges: ["CCTV", "Redes", "Alarmas"],
    image: "/assets/hero-hogar.webp",
    gallery: ["Cámara IP", "Rack", "Sensor"],
    distance: 7.6,
    verified: false,
    photos: true,
    certifications: ["CCTV IP"],
    description: "Cámaras de seguridad, alarmas, redes domésticas y monitoreo remoto.",
  },
  {
    id: "patricio-herrera",
    name: "Patricio Herrera",
    specialty: "Soldador certificado",
    category: "Industrial",
    zone: "Maipú",
    availability: "tomorrow",
    rating: 4.5,
    jobs: 112,
    recommendation: 91,
    credits: 55,
    demand: "Demanda alta",
    responseTime: "3.1 h",
    years: 6,
    top: false,
    badges: ["Verificado", "MIG", "Industrial"],
    image: "/assets/club-empresas.webp",
    gallery: ["Portón", "Estructura", "Reja"],
    distance: 11.3,
    verified: true,
    photos: false,
    certifications: ["Soldadura MIG", "Estructuras metálicas"],
    description: "Reparaciones, estructuras metálicas, portones, rejas y trabajos industriales.",
  },
];

export const categories = [
  { id: "hogar", name: "Hogar", description: "Gasfitería, electricidad, jardinería, pintura y cerrajería." },
  { id: "climatizacion", name: "Climatización", description: "Aire acondicionado, bombas de calor, refrigeración y mantención HVAC." },
  { id: "tecnologia", name: "Tecnología", description: "Cámaras, alarmas, redes, domótica y soporte computacional." },
  { id: "industrial", name: "Industrial", description: "Soldadura, automatización, electricidad industrial y mantención de equipos." },
];

export const services = [
  { id: "srv-gasfiteria", categoryId: "hogar", name: "Visita gasfitería", baseCredits: 30 },
  { id: "srv-electricidad", categoryId: "hogar", name: "Diagnóstico eléctrico", baseCredits: 25 },
  { id: "srv-jardin", categoryId: "hogar", name: "Mantención de jardín", baseCredits: 35 },
  { id: "srv-hvac", categoryId: "climatizacion", name: "Mantención HVAC", baseCredits: 45 },
  { id: "srv-cctv", categoryId: "tecnologia", name: "Instalación de cámaras", baseCredits: 20 },
  { id: "srv-industrial", categoryId: "industrial", name: "Servicio industrial", baseCredits: 55 },
];

export const defaultBookings: Booking[] = [
  {
    id: "bk-1001",
    specialistId: "victor-araya",
    specialistName: "Victor Araya",
    service: "Mantención aire acondicionado",
    date: "2026-06-10",
    time: "10:30",
    status: "Confirmada",
    credits: 45,
    commune: "Providencia",
    customer: "Cliente demo",
    channel: "Club Hogar",
  },
  {
    id: "bk-1002",
    specialistId: "miguel-soto",
    specialistName: "Miguel Soto",
    service: "Reparación de filtración",
    date: "2026-05-28",
    time: "16:00",
    status: "Finalizada",
    credits: 30,
    commune: "Ñuñoa",
    customer: "Cliente demo",
    channel: "Club Hogar",
  },
  {
    id: "bk-2001",
    specialistId: "daniela-fuentes",
    specialistName: "Daniela Fuentes",
    service: "Revisión cámara frigorífica",
    date: "2026-06-12",
    time: "09:00",
    status: "Solicitada",
    credits: 50,
    commune: "Santiago Centro",
    customer: "Restaurante Norte",
    channel: "Empresas",
  },
];

export const defaultTransactions: CreditTransaction[] = [
  { id: "tx-001", type: "Carga mensual", detail: "Plan Plus Club Hogar", amount: 45, date: "2026-06-01" },
  { id: "tx-002", type: "Reserva", detail: "Reparación de filtración", amount: -30, date: "2026-05-28" },
  { id: "tx-003", type: "Carga mensual", detail: "Plan Plus Club Hogar", amount: 45, date: "2026-05-01" },
];

export const companyDashboard = {
  creditsAvailable: 720,
  creditsUsed: 280,
  responseTime: "2.4 h",
  activeBranches: 7,
  monthlyBilling: "$322.000",
  nextInvoiceDate: "2026-06-30",
  services: [
    { service: "Electricista", branch: "Vitacura", status: "Finalizado", credits: 42 },
    { service: "Técnico HVAC", branch: "Quilicura", status: "En ruta", credits: 55 },
    { service: "Cerrajero", branch: "Las Condes", status: "Solicitado", credits: 18 },
  ],
  history: [
    { service: "Refrigeración comercial", branch: "Santiago Centro", date: "2026-06-03", credits: 50, status: "Finalizado" },
    { service: "Normalización eléctrica", branch: "Vitacura", date: "2026-06-01", credits: 42, status: "Finalizado" },
    { service: "Mantención preventiva", branch: "Quilicura", date: "2026-05-29", credits: 36, status: "Finalizado" },
  ],
  branches: ["Casa matriz", "Local Vitacura", "Bodega Quilicura", "Sucursal Las Condes"],
};
