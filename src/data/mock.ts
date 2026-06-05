import { getServiceTypeById, serviceTypes, type GeoPoint, type SpecialistRank } from "@/data/marketplace";

export type Availability = "now" | "today" | "tomorrow";

export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type WorkHistory = {
  title: string;
  commune: string;
  credits: number;
  rating: number;
  image: string;
};

export type Specialist = {
  id: string;
  name: string;
  initials: string;
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
  galleryImages: string[];
  distance: number;
  verified: boolean;
  photos: boolean;
  certifications: string[];
  servicesOffered: string[];
  workHistory: WorkHistory[];
  reviews: Review[];
  description: string;
  serviceTypeId?: string;
  serviceType?: string;
  specialties?: string[];
  commune?: string;
  region?: string;
  lat?: number;
  lng?: number;
  radioCoberturaKm?: number;
  trabajosCompletados?: number;
  precioDesdeCreditos?: number;
  foto?: string;
  geo?: GeoPoint;
  coverageRadiusKm?: number;
  rank?: SpecialistRank;
  validation?: SpecialistValidation;
  publishedFromAdmin?: boolean;
};

export type SpecialistValidation = {
  rut: "pending" | "approved" | "rejected";
  identityDocument: "pending" | "approved" | "rejected";
  selfie: "pending" | "approved" | "rejected";
  certifications: "pending" | "approved" | "rejected";
  references: number;
  portfolioPhotos: number;
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

const bathroom = "/assets/work-bathroom.webp";
const electrical = "/assets/work-electrical.webp";
const garden = "/assets/work-garden.webp";
const hvac = "/assets/work-hvac.webp";
const home = "/assets/hero-hogar.webp";
const enterprise = "/assets/club-empresas.webp";

const baseSpecialists: Specialist[] = [
  {
    id: "victor-araya",
    name: "Víctor Araya",
    initials: "VA",
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
    badges: ["Verificado", "Respuesta rápida", "Garantía OficiosPro"],
    image: hvac,
    gallery: ["Instalación split", "Mantención", "Diagnóstico"],
    galleryImages: [hvac, enterprise, home],
    distance: 2.1,
    verified: true,
    photos: true,
    certifications: ["HVAC certificado", "Bombas de calor", "Refrigeración"],
    servicesOffered: ["Mantención aire acondicionado", "Instalación split", "Diagnóstico HVAC", "Limpieza de filtros"],
    workHistory: [
      { title: "Aire acondicionado recuperado", commune: "Providencia", credits: 45, rating: 4.9, image: hvac },
      { title: "Mantención preventiva oficina", commune: "Las Condes", credits: 52, rating: 4.8, image: enterprise },
    ],
    reviews: [
      { author: "Marcela R.", rating: 5, date: "2026-05-30", text: "Llegó puntual, explicó la falla y dejó el equipo funcionando el mismo día." },
      { author: "Administración Norte", rating: 4.8, date: "2026-05-18", text: "Muy buen reporte técnico y orden en terreno." },
    ],
    description: "Instalación, mantención y diagnóstico de aire acondicionado residencial y comercial con foco en respuesta rápida.",
  },
  {
    id: "carolina-mendez",
    name: "Carolina Méndez",
    initials: "CM",
    specialty: "Electricista SEC",
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
    badges: ["Verificado", "Top especialista", "Certificado SEC"],
    image: electrical,
    gallery: ["Tablero", "Iluminación", "Normalización"],
    galleryImages: [electrical, home, enterprise],
    distance: 4.4,
    verified: true,
    photos: true,
    certifications: ["SEC clase D", "Normalización eléctrica"],
    servicesOffered: ["Revisión de tablero", "Cambio de enchufes", "Instalación de luminarias", "Diagnóstico de cortocircuitos"],
    workHistory: [
      { title: "Tablero eléctrico renovado", commune: "Las Condes", credits: 38, rating: 4.9, image: electrical },
      { title: "Iluminación de terraza", commune: "Vitacura", credits: 26, rating: 4.7, image: home },
    ],
    reviews: [
      { author: "Tomás L.", rating: 4.9, date: "2026-05-26", text: "Trabajo limpio y claro. Dejó todo documentado con fotos." },
      { author: "Clínica Dental Apoquindo", rating: 4.8, date: "2026-05-12", text: "Excelente coordinación para trabajar fuera de horario." },
    ],
    description: "Tableros, enchufes, iluminación, fallas domiciliarias y normalización eléctrica para hogares y locales.",
  },
  {
    id: "miguel-soto",
    name: "Miguel Soto",
    initials: "MS",
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
    image: bathroom,
    gallery: ["Calefont", "Filtración", "Sanitario"],
    galleryImages: [bathroom, home, electrical],
    distance: 3.2,
    verified: true,
    photos: true,
    certifications: ["Instalador autorizado", "Redes sanitarias"],
    servicesOffered: ["Reparación de filtraciones", "Mantención de calefont", "Cambio de grifería", "Destape de lavaplatos"],
    workHistory: [
      { title: "Baño reparado sin romper cerámica", commune: "Ñuñoa", credits: 30, rating: 4.8, image: bathroom },
      { title: "Calefont revisado y certificado", commune: "Macul", credits: 34, rating: 4.7, image: home },
    ],
    reviews: [
      { author: "Paula V.", rating: 4.8, date: "2026-06-01", text: "Resolvió una filtración que llevaba semanas. Muy recomendable." },
      { author: "Condominio Plaza", rating: 4.6, date: "2026-05-09", text: "Buena comunicación y precio claro en créditos." },
    ],
    description: "Filtraciones, calefont, artefactos sanitarios, destapes y urgencias domiciliarias con respaldo de garantía.",
  },
  {
    id: "daniela-fuentes",
    name: "Daniela Fuentes",
    initials: "DF",
    specialty: "Refrigeración comercial",
    category: "Climatización",
    zone: "Santiago Centro",
    availability: "tomorrow",
    rating: 4.9,
    jobs: 143,
    recommendation: 99,
    credits: 50,
    demand: "Alta demanda",
    responseTime: "2.0 h",
    years: 4,
    top: true,
    badges: ["Verificado", "Frío comercial", "Top especialista"],
    image: enterprise,
    gallery: ["Vitrina", "Cámara", "Compresor"],
    galleryImages: [enterprise, hvac, electrical],
    distance: 5.8,
    verified: true,
    photos: true,
    certifications: ["Refrigeración", "Cámara frigorífica"],
    servicesOffered: ["Revisión de vitrina refrigerada", "Mantención de cámaras", "Diagnóstico de compresor", "Plan preventivo"],
    workHistory: [
      { title: "Cámara frigorífica estabilizada", commune: "Santiago Centro", credits: 50, rating: 5, image: enterprise },
      { title: "Vitrina de restaurante reparada", commune: "Recoleta", credits: 58, rating: 4.9, image: hvac },
    ],
    reviews: [
      { author: "Restaurante Norte", rating: 5, date: "2026-06-02", text: "Evitó pérdida de inventario y entregó informe técnico." },
      { author: "Cafetería Alameda", rating: 4.8, date: "2026-05-20", text: "Muy profesional para coordinar con operación abierta." },
    ],
    description: "Vitrinas, cámaras frigoríficas, equipos comerciales y mantenciones preventivas para negocios con operación continua.",
  },
  {
    id: "felipe-rojas",
    name: "Felipe Rojas",
    initials: "FR",
    specialty: "Instalador CCTV",
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
    image: home,
    gallery: ["Cámara IP", "Rack", "Sensor"],
    galleryImages: [home, electrical, enterprise],
    distance: 7.6,
    verified: true,
    photos: true,
    certifications: ["CCTV IP", "Redes domiciliarias"],
    servicesOffered: ["Instalación de cámaras", "Configuración móvil", "Alarmas", "Red WiFi mesh"],
    workHistory: [
      { title: "Cámaras para local comercial", commune: "La Florida", credits: 32, rating: 4.7, image: home },
      { title: "Red WiFi estabilizada", commune: "Peñalolén", credits: 20, rating: 4.5, image: electrical },
    ],
    reviews: [
      { author: "Felipe A.", rating: 4.6, date: "2026-05-28", text: "Dejó cámaras funcionando en el celular y explicó todo simple." },
      { author: "Minimarket Sur", rating: 4.5, date: "2026-05-15", text: "Buen servicio y ordenado con canaletas." },
    ],
    description: "Cámaras de seguridad, alarmas, redes domésticas y monitoreo remoto para hogares y pequeños negocios.",
  },
  {
    id: "patricio-herrera",
    name: "Patricio Herrera",
    initials: "PH",
    specialty: "Soldador certificado",
    category: "Industrial",
    zone: "Maipú",
    availability: "tomorrow",
    rating: 4.5,
    jobs: 112,
    recommendation: 91,
    credits: 55,
    demand: "Alta demanda",
    responseTime: "3.1 h",
    years: 6,
    top: false,
    badges: ["Verificado", "MIG", "Industrial"],
    image: enterprise,
    gallery: ["Portón", "Estructura", "Reja"],
    galleryImages: [enterprise, electrical, garden],
    distance: 11.3,
    verified: true,
    photos: false,
    certifications: ["Soldadura MIG", "Estructuras metálicas"],
    servicesOffered: ["Reparación de portones", "Estructuras metálicas", "Rejas", "Soportes industriales"],
    workHistory: [
      { title: "Portón industrial reparado", commune: "Maipú", credits: 55, rating: 4.6, image: enterprise },
      { title: "Estructura liviana instalada", commune: "Cerrillos", credits: 70, rating: 4.5, image: garden },
    ],
    reviews: [
      { author: "Bodega Oeste", rating: 4.6, date: "2026-05-22", text: "Trabajo firme, seguro y entregado en el plazo comprometido." },
      { author: "Comunidad Los Pinos", rating: 4.4, date: "2026-04-30", text: "Buen diagnóstico y reparación del acceso vehicular." },
    ],
    description: "Reparaciones, estructuras metálicas, portones, rejas y trabajos industriales con documentación del trabajo.",
  },
  {
    id: "sofia-vergara",
    name: "Sofía Vergara",
    initials: "SV",
    specialty: "Jardinera",
    category: "Hogar",
    zone: "La Reina",
    availability: "today",
    rating: 4.9,
    jobs: 164,
    recommendation: 97,
    credits: 35,
    demand: "Demanda media",
    responseTime: "1.8 h",
    years: 5,
    top: true,
    badges: ["Verificado", "Paisajismo", "Top especialista"],
    image: garden,
    gallery: ["Poda", "Riego", "Recuperación"],
    galleryImages: [garden, home, bathroom],
    distance: 6.2,
    verified: true,
    photos: true,
    certifications: ["Paisajismo", "Riego automático"],
    servicesOffered: ["Mantención de jardín", "Poda", "Instalación de riego", "Recuperación de césped"],
    workHistory: [
      { title: "Jardín recuperado", commune: "La Reina", credits: 35, rating: 4.9, image: garden },
      { title: "Riego automático ajustado", commune: "Peñalolén", credits: 42, rating: 4.8, image: home },
    ],
    reviews: [
      { author: "Daniela P.", rating: 5, date: "2026-06-01", text: "El jardín cambió completamente y dejó plan de mantención." },
      { author: "Casa Los Dominicos", rating: 4.8, date: "2026-05-16", text: "Muy cuidadosa con plantas y horarios." },
    ],
    description: "Mantención, poda, riego automático y recuperación de jardines para hogares y comunidades.",
  },
  {
    id: "andres-ibarra",
    name: "Andrés Ibarra",
    initials: "AI",
    specialty: "Cerrajero",
    category: "Hogar",
    zone: "Vitacura",
    availability: "now",
    rating: 4.7,
    jobs: 132,
    recommendation: 95,
    credits: 18,
    demand: "Demanda media",
    responseTime: "0.7 h",
    years: 7,
    top: false,
    badges: ["Urgencias", "Verificado", "Respuesta rápida"],
    image: home,
    gallery: ["Chapa", "Cerradura", "Control acceso"],
    galleryImages: [home, enterprise, electrical],
    distance: 3.9,
    verified: true,
    photos: true,
    certifications: ["Control de acceso", "Cerraduras digitales"],
    servicesOffered: ["Apertura de puertas", "Cambio de chapa", "Cerraduras digitales", "Copias y ajustes"],
    workHistory: [
      { title: "Cerradura digital instalada", commune: "Vitacura", credits: 24, rating: 4.8, image: home },
      { title: "Apertura de emergencia", commune: "Las Condes", credits: 18, rating: 4.7, image: enterprise },
    ],
    reviews: [
      { author: "Matías C.", rating: 4.7, date: "2026-05-29", text: "Llegó rápido y resolvió sin dañar la puerta." },
      { author: "Cowork Apoquindo", rating: 4.6, date: "2026-05-10", text: "Buena instalación de control de acceso." },
    ],
    description: "Cerrajería residencial, aperturas, chapas, cerraduras digitales y control de acceso para oficinas.",
  },
  {
    id: "nicolas-bravo",
    name: "Nicolás Bravo",
    initials: "NB",
    specialty: "Maestro multifunción",
    category: "Hogar",
    zone: "Macul",
    availability: "today",
    rating: 4.6,
    jobs: 204,
    recommendation: 93,
    credits: 28,
    demand: "Demanda estable",
    responseTime: "2.2 h",
    years: 6,
    top: false,
    badges: ["Verificado", "Hogar", "Galería real"],
    image: bathroom,
    gallery: ["Muebles", "Reparaciones", "Instalaciones"],
    galleryImages: [bathroom, garden, electrical],
    distance: 5.1,
    verified: true,
    photos: true,
    certifications: ["Instalación de muebles", "Terminaciones"],
    servicesOffered: ["Armado de muebles", "Reparaciones menores", "Instalación de cortinas", "Sellos y terminaciones"],
    workHistory: [
      { title: "Mueble instalado y nivelado", commune: "Macul", credits: 28, rating: 4.6, image: bathroom },
      { title: "Reparación de muro interior", commune: "Ñuñoa", credits: 35, rating: 4.5, image: home },
    ],
    reviews: [
      { author: "Camila T.", rating: 4.6, date: "2026-05-24", text: "Resolvió varias tareas en una sola visita." },
      { author: "Pedro B.", rating: 4.5, date: "2026-05-08", text: "Ordenado, puntual y cuidadoso." },
    ],
    description: "Soluciones rápidas para reparaciones menores, armado de muebles, instalaciones y terminaciones del hogar.",
  },
  {
    id: "valentina-rivas",
    name: "Valentina Rivas",
    initials: "VR",
    specialty: "Pintora profesional",
    category: "Hogar",
    zone: "Santiago Centro",
    availability: "tomorrow",
    rating: 4.8,
    jobs: 119,
    recommendation: 96,
    credits: 40,
    demand: "Demanda media",
    responseTime: "2.5 h",
    years: 4,
    top: false,
    badges: ["Verificado", "Terminaciones", "Garantía"],
    image: home,
    gallery: ["Muros", "Esmalte", "Reparación"],
    galleryImages: [home, bathroom, garden],
    distance: 4.8,
    verified: true,
    photos: true,
    certifications: ["Terminaciones finas", "Preparación de superficies"],
    servicesOffered: ["Pintura interior", "Reparación de muros", "Esmalte al agua", "Pintura de oficinas"],
    workHistory: [
      { title: "Departamento repintado", commune: "Santiago Centro", credits: 40, rating: 4.8, image: home },
      { title: "Oficina renovada", commune: "Providencia", credits: 64, rating: 4.7, image: enterprise },
    ],
    reviews: [
      { author: "Ignacia M.", rating: 4.8, date: "2026-05-27", text: "Muy buenas terminaciones y protección de muebles." },
      { author: "Estudio Creativo", rating: 4.7, date: "2026-05-11", text: "Cumplió fecha y dejó todo limpio." },
    ],
    description: "Pintura interior, reparación de muros y terminaciones limpias para departamentos, casas y oficinas.",
  },
  {
    id: "rodrigo-palma",
    name: "Rodrigo Palma",
    initials: "RP",
    specialty: "Técnico computacional",
    category: "Tecnología",
    zone: "Providencia",
    availability: "now",
    rating: 4.7,
    jobs: 151,
    recommendation: 94,
    credits: 22,
    demand: "Demanda estable",
    responseTime: "1.6 h",
    years: 5,
    top: false,
    badges: ["Verificado", "Soporte remoto", "Redes"],
    image: enterprise,
    gallery: ["Notebook", "Red", "Backup"],
    galleryImages: [enterprise, electrical, home],
    distance: 2.7,
    verified: true,
    photos: true,
    certifications: ["Soporte TI", "Redes pequeñas empresas"],
    servicesOffered: ["Formateo y respaldo", "Configuración de correo", "Red de oficina", "Soporte remoto"],
    workHistory: [
      { title: "Red de oficina estabilizada", commune: "Providencia", credits: 38, rating: 4.7, image: enterprise },
      { title: "Notebook recuperado", commune: "Ñuñoa", credits: 22, rating: 4.8, image: home },
    ],
    reviews: [
      { author: "Oficina Legal", rating: 4.7, date: "2026-05-23", text: "Ordenó red, impresoras y accesos compartidos." },
      { author: "Javiera S.", rating: 4.6, date: "2026-05-04", text: "Muy claro explicando el problema del equipo." },
    ],
    description: "Soporte computacional, redes, correo, respaldo y continuidad tecnológica para hogares y pequeñas empresas.",
  },
  {
    id: "elena-morales",
    name: "Elena Morales",
    initials: "EM",
    specialty: "Mantención de piscinas",
    category: "Hogar",
    zone: "Lo Barnechea",
    availability: "today",
    rating: 4.8,
    jobs: 88,
    recommendation: 95,
    credits: 42,
    demand: "Temporada alta",
    responseTime: "2.0 h",
    years: 6,
    top: true,
    badges: ["Verificado", "Piscinas", "Top especialista"],
    image: garden,
    gallery: ["Filtro", "Agua", "Bomba"],
    galleryImages: [garden, hvac, bathroom],
    distance: 8.9,
    verified: true,
    photos: true,
    certifications: ["Tratamiento de agua", "Bombas de piscina"],
    servicesOffered: ["Mantención semanal", "Revisión de bomba", "Balance químico", "Limpieza profunda"],
    workHistory: [
      { title: "Piscina recuperada", commune: "Lo Barnechea", credits: 42, rating: 4.8, image: garden },
      { title: "Bomba reemplazada", commune: "Vitacura", credits: 58, rating: 4.7, image: hvac },
    ],
    reviews: [
      { author: "Casa Camino Real", rating: 4.8, date: "2026-05-31", text: "Agua cristalina y buen seguimiento semanal." },
      { author: "Condominio Valle", rating: 4.7, date: "2026-05-14", text: "Muy profesional con químicos y bomba." },
    ],
    description: "Mantención de piscinas, bombas, filtros y tratamiento de agua para casas y comunidades.",
  },
];

export const specialistOperationalProfiles: Record<
  string,
  Required<Pick<Specialist, "geo" | "coverageRadiusKm" | "rank" | "validation">>
> = {
  "victor-araya": {
    geo: { lat: -33.4314, lng: -70.6093 },
    coverageRadiusKm: 18,
    rank: "Platino",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 5, portfolioPhotos: 18 },
  },
  "carolina-mendez": {
    geo: { lat: -33.4088, lng: -70.5673 },
    coverageRadiusKm: 14,
    rank: "Oro",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 4, portfolioPhotos: 14 },
  },
  "miguel-soto": {
    geo: { lat: -33.4569, lng: -70.5975 },
    coverageRadiusKm: 16,
    rank: "Oro",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 4, portfolioPhotos: 12 },
  },
  "daniela-fuentes": {
    geo: { lat: -33.4489, lng: -70.6693 },
    coverageRadiusKm: 35,
    rank: "Oro",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 6, portfolioPhotos: 16 },
  },
  "felipe-rojas": {
    geo: { lat: -33.5225, lng: -70.5983 },
    coverageRadiusKm: 20,
    rank: "Plata",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "pending", references: 3, portfolioPhotos: 8 },
  },
  "patricio-herrera": {
    geo: { lat: -33.511, lng: -70.757 },
    coverageRadiusKm: 45,
    rank: "Plata",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 5, portfolioPhotos: 6 },
  },
  "sofia-vergara": {
    geo: { lat: -33.44, lng: -70.552 },
    coverageRadiusKm: 12,
    rank: "Oro",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 4, portfolioPhotos: 22 },
  },
  "andres-ibarra": {
    geo: { lat: -33.391, lng: -70.572 },
    coverageRadiusKm: 15,
    rank: "Plata",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "pending", references: 3, portfolioPhotos: 10 },
  },
  "nicolas-bravo": {
    geo: { lat: -33.486, lng: -70.599 },
    coverageRadiusKm: 18,
    rank: "Plata",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 3, portfolioPhotos: 11 },
  },
  "valentina-rivas": {
    geo: { lat: -33.4489, lng: -70.6693 },
    coverageRadiusKm: 16,
    rank: "Plata",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 3, portfolioPhotos: 13 },
  },
  "rodrigo-palma": {
    geo: { lat: -33.4314, lng: -70.6093 },
    coverageRadiusKm: 22,
    rank: "Bronce",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "pending", references: 3, portfolioPhotos: 7 },
  },
  "elena-morales": {
    geo: { lat: -33.351, lng: -70.518 },
    coverageRadiusKm: 20,
    rank: "Oro",
    validation: { rut: "approved", identityDocument: "approved", selfie: "approved", certifications: "approved", references: 4, portfolioPhotos: 15 },
  },
};

const baseServiceTypeMap: Record<string, { serviceTypeId: string; specialties: string[]; region?: string }> = {
  "victor-araya": {
    serviceTypeId: "climatizacion-refrigeracion",
    specialties: ["Mantención HVAC", "Aire acondicionado residencial", "Bombas de calor"],
  },
  "carolina-mendez": {
    serviceTypeId: "electricidad",
    specialties: ["Electricista SEC", "Tableros eléctricos", "Instalación de luminarias"],
  },
  "miguel-soto": {
    serviceTypeId: "hogar",
    specialties: ["Gasfitería domiciliaria", "Reparación de filtraciones", "Mantención calefont"],
  },
  "daniela-fuentes": {
    serviceTypeId: "climatizacion-refrigeracion",
    specialties: ["Refrigeración comercial", "Cámaras frigoríficas", "Vitrinas refrigeradas"],
  },
  "felipe-rojas": {
    serviceTypeId: "empresas",
    specialties: ["Seguridad electrónica", "Control de acceso empresas", "Mantención oficinas"],
  },
  "patricio-herrera": {
    serviceTypeId: "industria",
    specialties: ["Soldador certificado", "Montaje industrial", "Paradas de planta"],
  },
  "sofia-vergara": {
    serviceTypeId: "jardineria",
    specialties: ["Jardinería hogar", "Paisajismo", "Riego automático"],
  },
  "andres-ibarra": {
    serviceTypeId: "emergencias",
    specialties: ["Cerrajero emergencia", "Cerradura digital bloqueada", "Portón detenido"],
  },
  "nicolas-bravo": {
    serviceTypeId: "hogar",
    specialties: ["Armado de muebles", "Reparaciones menores", "Instalación de cortinas"],
  },
  "valentina-rivas": {
    serviceTypeId: "construccion",
    specialties: ["Pintura interior", "Reparación de muros", "Pintura oficinas"],
  },
  "rodrigo-palma": {
    serviceTypeId: "empresas",
    specialties: ["Mantención oficinas", "Seguridad electrónica", "Proveedor residente"],
  },
  "elena-morales": {
    serviceTypeId: "jardineria",
    specialties: ["Mantención de piscina", "Bombas de agua", "Jardinería hogar"],
  },
};

const generatedLocations = [
  { commune: "Valparaíso", region: "Valparaíso", lat: -33.0472, lng: -71.6127 },
  { commune: "Viña del Mar", region: "Valparaíso", lat: -33.0245, lng: -71.5518 },
  { commune: "Quilpué", region: "Valparaíso", lat: -33.045, lng: -71.449 },
  { commune: "Rancagua", region: "O'Higgins", lat: -34.1708, lng: -70.7444 },
  { commune: "San Fernando", region: "O'Higgins", lat: -34.5833, lng: -70.9833 },
  { commune: "Talca", region: "Maule", lat: -35.4264, lng: -71.6554 },
  { commune: "Curicó", region: "Maule", lat: -34.9828, lng: -71.2394 },
  { commune: "Linares", region: "Maule", lat: -35.8467, lng: -71.5931 },
  { commune: "Chillán", region: "Ñuble", lat: -36.6063, lng: -72.1034 },
  { commune: "Concepción", region: "Biobío", lat: -36.8269, lng: -73.0498 },
  { commune: "Talcahuano", region: "Biobío", lat: -36.7248, lng: -73.1168 },
  { commune: "Los Ángeles", region: "Biobío", lat: -37.4697, lng: -72.3537 },
  { commune: "Temuco", region: "La Araucanía", lat: -38.7359, lng: -72.5904 },
  { commune: "Villarrica", region: "La Araucanía", lat: -39.2857, lng: -72.2279 },
  { commune: "Valdivia", region: "Los Ríos", lat: -39.8196, lng: -73.2452 },
  { commune: "Osorno", region: "Los Lagos", lat: -40.574, lng: -73.1335 },
  { commune: "Puerto Montt", region: "Los Lagos", lat: -41.4693, lng: -72.9424 },
  { commune: "Puerto Varas", region: "Los Lagos", lat: -41.3167, lng: -72.9833 },
  { commune: "La Serena", region: "Coquimbo", lat: -29.9027, lng: -71.2519 },
  { commune: "Coquimbo", region: "Coquimbo", lat: -29.9533, lng: -71.3436 },
  { commune: "Antofagasta", region: "Antofagasta", lat: -23.6509, lng: -70.3975 },
  { commune: "Calama", region: "Antofagasta", lat: -22.4544, lng: -68.9294 },
  { commune: "Iquique", region: "Tarapacá", lat: -20.2307, lng: -70.1357 },
  { commune: "Arica", region: "Arica y Parinacota", lat: -18.4783, lng: -70.3126 },
  { commune: "Coyhaique", region: "Aysén", lat: -45.5712, lng: -72.0685 },
  { commune: "Punta Arenas", region: "Magallanes", lat: -53.1638, lng: -70.9171 },
  { commune: "Colina", region: "Metropolitana de Santiago", lat: -33.2037, lng: -70.6755 },
  { commune: "Puente Alto", region: "Metropolitana de Santiago", lat: -33.6167, lng: -70.5758 },
];

const generatedNames = [
  "Ignacio Campos",
  "Fernanda Tapia",
  "Jorge Salinas",
  "Camila Arancibia",
  "Sebastián Muñoz",
  "Paula Contreras",
  "Héctor Vidal",
  "Francisca Leiva",
  "Cristóbal Herrera",
  "María José Pino",
  "Eduardo Cárdenas",
  "Isidora Lagos",
  "Álvaro Medina",
  "Tamara Espinoza",
  "Claudio Riquelme",
  "Javiera Núñez",
  "Renato Bravo",
  "Constanza Silva",
  "Matías Fuentes",
  "Natalia Quezada",
  "Diego Carrasco",
  "Daniela Morales",
  "Gonzalo Reyes",
  "Josefina Soto",
  "Felipe Álvarez",
  "Catalina Vargas",
  "Marco Peña",
  "Antonia Herrera",
];

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function slugFromName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function rankFor(jobs: number, rating: number): SpecialistRank {
  if (jobs >= 260 && rating >= 4.85) return "Platino";
  if (jobs >= 120 && rating >= 4.7) return "Oro";
  if (jobs >= 45 && rating >= 4.5) return "Plata";
  return "Bronce";
}

const generatedSpecialists: Specialist[] = generatedNames.map((name, index) => {
  const serviceType = serviceTypes[index % serviceTypes.length];
  const location = generatedLocations[index % generatedLocations.length];
  const mainSpecialty = serviceType.specialties[(index * 2) % serviceType.specialties.length];
  const extraSpecialty = serviceType.specialties[(index * 2 + 1) % serviceType.specialties.length];
  const jobs = 52 + index * 7;
  const rating = Number((4.55 + (index % 5) * 0.08).toFixed(1));
  const credits = 18 + (index % 8) * 6 + (serviceType.marginType === "company" ? 10 : 0);
  const image = [bathroom, electrical, garden, hvac, enterprise][index % 5];
  const responseTime = `${(0.8 + (index % 7) * 0.35).toFixed(1)} h`;

  return {
    id: slugFromName(name),
    name,
    initials: initialsFromName(name),
    specialty: mainSpecialty,
    category: serviceType.name,
    serviceTypeId: serviceType.id,
    serviceType: serviceType.name,
    specialties: [mainSpecialty, extraSpecialty],
    zone: location.commune,
    commune: location.commune,
    region: location.region,
    availability: (["now", "today", "tomorrow"] as Availability[])[index % 3],
    rating,
    jobs,
    trabajosCompletados: jobs,
    recommendation: 91 + (index % 8),
    credits,
    precioDesdeCreditos: credits,
    demand: index % 3 === 0 ? "Alta demanda" : index % 3 === 1 ? "Demanda media" : "Demanda estable",
    responseTime,
    years: 2 + (index % 7),
    top: index % 4 === 0,
    badges: ["Verificado", index % 4 === 0 ? "Top especialista" : "Certificado", serviceType.marginType === "company" ? "Empresas" : "Club Hogar"],
    image,
    foto: image,
    gallery: [mainSpecialty, extraSpecialty, "Diagnóstico"],
    galleryImages: [image, [bathroom, electrical, garden, hvac, enterprise][(index + 1) % 5], [bathroom, electrical, garden, hvac, enterprise][(index + 2) % 5]],
    distance: 4 + (index % 10),
    verified: true,
    photos: true,
    certifications: [serviceType.marginType === "company" ? "Certificación empresa" : "Certificación oficio", mainSpecialty],
    servicesOffered: [mainSpecialty, extraSpecialty, `Visita diagnóstico ${serviceType.marginType === "company" ? "empresa" : "hogar"}`],
    workHistory: [
      { title: `${mainSpecialty} completado`, commune: location.commune, credits, rating, image },
      { title: `Mantención preventiva`, commune: location.commune, credits: credits + 8, rating: Math.min(5, rating + 0.1), image: [bathroom, electrical, garden, hvac, enterprise][(index + 1) % 5] },
    ],
    reviews: [
      { author: "Cliente verificado", rating, date: "2026-05-22", text: "Coordinación clara, trabajo documentado y pago cerrado en créditos." },
      { author: "Operación local", rating: Math.min(5, rating + 0.1), date: "2026-05-10", text: "Buen tiempo de respuesta y reporte final simple de revisar." },
    ],
    description: `${mainSpecialty} y ${extraSpecialty} con cobertura en ${location.commune} y comunas cercanas.`,
    geo: { lat: location.lat, lng: location.lng },
    lat: location.lat,
    lng: location.lng,
    coverageRadiusKm: serviceType.marginType === "company" ? 45 : 18,
    radioCoberturaKm: serviceType.marginType === "company" ? 45 : 18,
    rank: rankFor(jobs, rating),
    validation: {
      rut: "approved",
      identityDocument: "approved",
      selfie: "approved",
      certifications: index % 5 === 0 ? "pending" : "approved",
      references: 3 + (index % 4),
      portfolioPhotos: 6 + (index % 10),
    },
  };
});

function normalizeBaseSpecialist(specialist: Specialist): Specialist {
  const profile = specialistOperationalProfiles[specialist.id];
  const serviceMeta = baseServiceTypeMap[specialist.id] ?? { serviceTypeId: "hogar", specialties: [specialist.specialty] };
  const serviceType = getServiceTypeById(serviceMeta.serviceTypeId) ?? serviceTypes[0];
  const geo = profile?.geo ?? specialist.geo;
  const coverageRadiusKm = profile?.coverageRadiusKm ?? specialist.coverageRadiusKm ?? (serviceType.marginType === "company" ? 35 : 16);

  return {
    ...specialist,
    ...profile,
    category: serviceType.name,
    serviceTypeId: serviceType.id,
    serviceType: serviceType.name,
    specialties: serviceMeta.specialties,
    commune: specialist.zone,
    region: serviceMeta.region ?? "Metropolitana de Santiago",
    lat: geo?.lat,
    lng: geo?.lng,
    geo,
    coverageRadiusKm,
    radioCoberturaKm: coverageRadiusKm,
    trabajosCompletados: specialist.jobs,
    precioDesdeCreditos: specialist.credits,
    foto: specialist.image,
  };
}

export const specialists: Specialist[] = [...baseSpecialists.map(normalizeBaseSpecialist), ...generatedSpecialists];

export const categories = [
  { id: "hogar", name: "Hogar", description: "Gasfitería, electricidad, jardinería, pintura, cerrajería y reparaciones menores." },
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

export const homeBenefits = [
  "Técnicos verificados",
  "Pago liberado al finalizar el trabajo",
  "Créditos acumulables hasta 24 meses",
  "Calificaciones reales",
  "Garantía OficiosPro",
];

export const workStories: WorkHistory[] = [
  { title: "Baño reparado", commune: "Ñuñoa", credits: 30, rating: 4.8, image: bathroom },
  { title: "Tablero eléctrico renovado", commune: "Las Condes", credits: 38, rating: 4.9, image: electrical },
  { title: "Aire acondicionado instalado", commune: "Providencia", credits: 45, rating: 4.9, image: hvac },
  { title: "Jardín recuperado", commune: "La Reina", credits: 35, rating: 4.9, image: garden },
];

export const testimonials = [
  {
    quote: "Reservé un gasfíter en minutos y pude ver trabajos anteriores antes de confirmar.",
    author: "Paula Valdés",
    role: "Cliente Club Hogar",
  },
  {
    quote: "Nos ayudó a ordenar proveedores, créditos y facturación para tres locales.",
    author: "Martín Leiva",
    role: "Operaciones retail",
  },
  {
    quote: "Ahora mi perfil muestra reputación real y recibo reservas mejor filtradas.",
    author: "Carolina Méndez",
    role: "Electricista SEC",
  },
];

export const companyUseCases = ["Oficinas", "Restaurantes", "Bodegas", "Comunidades", "Plantas productivas"];

export const defaultBookings: Booking[] = [
  {
    id: "bk-1001",
    specialistId: "victor-araya",
    specialistName: "Víctor Araya",
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
  {
    id: "bk-2002",
    specialistId: "carolina-mendez",
    specialistName: "Carolina Méndez",
    service: "Normalización eléctrica local",
    date: "2026-06-08",
    time: "19:00",
    status: "Confirmada",
    credits: 42,
    commune: "Vitacura",
    customer: "Operadora Demo",
    channel: "Empresas",
  },
];

export const defaultTransactions: CreditTransaction[] = [
  { id: "tx-001", type: "Carga mensual", detail: "Plan Plus Club Hogar", amount: 45, date: "2026-06-01" },
  { id: "tx-002", type: "Reserva", detail: "Reparación de filtración", amount: -30, date: "2026-05-28" },
  { id: "tx-003", type: "Carga mensual", detail: "Plan Plus Club Hogar", amount: 45, date: "2026-05-01" },
  { id: "tx-004", type: "Bono de bienvenida", detail: "Créditos iniciales", amount: 20, date: "2026-04-28" },
];

export const companyDashboard = {
  creditsAvailable: 720,
  creditsUsed: 280,
  responseTime: "2.4 h",
  activeBranches: 7,
  monthlyBilling: "$322.000",
  nextInvoiceDate: "2026-06-30",
  suppliers: 14,
  openRequests: 3,
  services: [
    { service: "Electricista", branch: "Vitacura", status: "Finalizado", credits: 42 },
    { service: "Técnico HVAC", branch: "Quilicura", status: "En ruta", credits: 55 },
    { service: "Cerrajero", branch: "Las Condes", status: "Solicitado", credits: 18 },
    { service: "Refrigeración comercial", branch: "Santiago Centro", status: "Agendado", credits: 50 },
  ],
  history: [
    { service: "Refrigeración comercial", branch: "Santiago Centro", date: "2026-06-03", credits: 50, status: "Finalizado" },
    { service: "Normalización eléctrica", branch: "Vitacura", date: "2026-06-01", credits: 42, status: "Finalizado" },
    { service: "Mantención preventiva", branch: "Quilicura", date: "2026-05-29", credits: 36, status: "Finalizado" },
  ],
  branches: ["Casa matriz", "Local Vitacura", "Bodega Quilicura", "Sucursal Las Condes", "Local Providencia"],
};
