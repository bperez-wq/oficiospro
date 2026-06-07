const specialists = [
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
    image: "assets/work-hvac.webp",
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
    image: "assets/work-electrical.webp",
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
    image: "assets/work-bathroom.webp",
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
    image: "assets/club-empresas.webp",
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
    image: "assets/hero-hogar.webp",
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
    image: "assets/club-empresas.webp",
    gallery: ["Portón", "Estructura", "Reja"],
    distance: 11.3,
    verified: true,
    photos: false,
    certifications: ["Soldadura MIG", "Estructuras metálicas"],
    description: "Reparaciones, estructuras metálicas, portones, rejas y trabajos industriales.",
  },
];

const availabilityLabels = {
  now: "Disponible ahora",
  today: "Disponible hoy",
  tomorrow: "Disponible mañana",
};

const availabilityClasses = {
  now: "status-now",
  today: "status-today",
  tomorrow: "status-tomorrow",
};

const storageKeys = {
  users: "oficiospro.users",
  specialistRequests: "oficiospro.specialistRequests",
  companyRequests: "oficiospro.companyRequests",
  bookings: "oficiospro.bookings",
  wallet: "oficiospro.creditsWallet",
  transactions: "oficiospro.creditTransactions",
  categories: "oficiospro.categories",
  services: "oficiospro.services",
  session: "oficiospro.session",
};

const defaultCategories = [
  { id: "hogar", name: "Hogar", description: "Gasfitería, electricidad, jardinería, pintura y cerrajería." },
  { id: "climatizacion", name: "Climatización", description: "Aire acondicionado, bombas de calor, refrigeración y mantención HVAC." },
  { id: "tecnologia", name: "Tecnología", description: "Cámaras, alarmas, redes, domótica y soporte computacional." },
  { id: "industrial", name: "Industrial", description: "Soldadura, automatización, electricidad industrial y mantención de equipos." },
];

const defaultServices = [
  { id: "srv-gasfiteria", categoryId: "hogar", name: "Visita gasfitería", baseCredits: 30, dynamicPricing: true },
  { id: "srv-electricidad", categoryId: "hogar", name: "Diagnóstico eléctrico", baseCredits: 25, dynamicPricing: true },
  { id: "srv-jardin", categoryId: "hogar", name: "Mantención de jardín", baseCredits: 35, dynamicPricing: true },
  { id: "srv-hvac", categoryId: "climatizacion", name: "Mantención HVAC", baseCredits: 45, dynamicPricing: true },
  { id: "srv-cctv", categoryId: "tecnologia", name: "Instalación de cámaras", baseCredits: 20, dynamicPricing: true },
  { id: "srv-industrial", categoryId: "industrial", name: "Servicio industrial", baseCredits: 55, dynamicPricing: true },
];

const defaultBookings = [
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
    customer: "Cliente Club Hogar",
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
    customer: "Cliente Club Hogar",
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

const defaultTransactions = [
  { id: "tx-001", type: "Carga mensual", detail: "Plan Plus Club Hogar", amount: 45, date: "2026-06-01" },
  { id: "tx-002", type: "Reserva", detail: "Reparación de filtración", amount: -30, date: "2026-05-28" },
  { id: "tx-003", type: "Carga mensual", detail: "Plan Plus Club Hogar", amount: 45, date: "2026-05-01" },
];

const companyDashboard = {
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
  creditMovements: [
    { id: "ctx-001", type: "Carga corporativa", detail: "Plan Empresa mensual", amount: 200, date: "2026-06-01" },
    { id: "ctx-002", type: "Servicio", detail: "Técnico HVAC Quilicura", amount: -55, date: "2026-06-02" },
    { id: "ctx-003", type: "Servicio", detail: "Electricista Vitacura", amount: -42, date: "2026-06-01" },
  ],
  branches: ["Casa matriz", "Local Vitacura", "Bodega Quilicura", "Sucursal Las Condes"],
};

let flashMessage = "";
let landingInitialized = false;

const landing = document.querySelector("#landing");
const appView = document.querySelector("#appView");
const categoryFilter = document.querySelector("#categoryFilter");
const needSearch = document.querySelector("#needSearch");
const searchForm = document.querySelector("#searchForm");
const zoneFilter = document.querySelector("#zoneFilter");
const availabilityFilter = document.querySelector("#availabilityFilter");
const sortFilter = document.querySelector("#sortFilter");
const specialistGrid = document.querySelector("#specialistGrid");
const resultCount = document.querySelector("#resultCount");
const ratingFilter = document.querySelector("#ratingFilter");
const ratingValue = document.querySelector("#ratingValue");
const verifiedFilter = document.querySelector("#verifiedFilter");
const withPhotosFilter = document.querySelector("#withPhotosFilter");
const segmentFilters = [...document.querySelectorAll(".segmentFilter")];
const signupForm = document.querySelector("#signupForm");
const formStatus = document.querySelector("#formStatus");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function replaceLegacyLabels(value) {
  const legacyText = "de" + "mo";
  if (typeof value === "string") {
    return value
      .replaceAll(`Cliente ${legacyText}`, "Cliente Club Hogar")
      .replaceAll(`Operadora ${legacyText[0].toUpperCase()}${legacyText.slice(1)}`, "Operadora Norte")
      .replaceAll(`${legacyText}-client`, "cliente-club-hogar")
      .replaceAll(`usr-${legacyText}`, "usr-club-hogar")
      .replaceAll(`sr-${legacyText}`, "sr-postulacion-inicial")
      .replaceAll(`co-${legacyText}`, "co-operadora-norte")
      .replaceAll(legacyText, "preview");
  }
  if (Array.isArray(value)) return value.map(replaceLegacyLabels);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceLegacyLabels(item)]));
  }
  return value;
}

function sanitizeStoredPresentationData() {
  [
    storageKeys.wallet,
    storageKeys.bookings,
    storageKeys.users,
    storageKeys.specialistRequests,
    storageKeys.companyRequests,
    storageKeys.session,
  ].forEach((key) => {
    const stored = localStorage.getItem(key);
    if (!stored) return;
    try {
      writeStorage(key, replaceLegacyLabels(JSON.parse(stored)));
    } catch {
      localStorage.removeItem(key);
    }
  });
}

function seedStorage() {
  if (!localStorage.getItem(storageKeys.wallet)) {
    writeStorage(storageKeys.wallet, { ownerId: "cliente-club-hogar", balance: 135, expiresInMonths: 24 });
  }
  if (!localStorage.getItem(storageKeys.bookings)) writeStorage(storageKeys.bookings, defaultBookings);
  if (!localStorage.getItem(storageKeys.transactions)) writeStorage(storageKeys.transactions, defaultTransactions);
  if (!localStorage.getItem(storageKeys.categories)) writeStorage(storageKeys.categories, defaultCategories);
  if (!localStorage.getItem(storageKeys.services)) writeStorage(storageKeys.services, defaultServices);
  if (!localStorage.getItem(storageKeys.users)) {
    writeStorage(storageKeys.users, [
      { id: "usr-club-hogar", role: "client", name: "Cliente Club Hogar", email: "cliente@oficiospro.cl", commune: "Las Condes" },
    ]);
  }
  if (!localStorage.getItem(storageKeys.specialistRequests)) {
    writeStorage(storageKeys.specialistRequests, [
      {
        id: "sr-postulacion-inicial",
        name: "Juan Pérez",
        specialty: "Gasfíter",
        commune: "La Reina",
        phone: "+56 9 5555 5555",
        status: "Pendiente",
        createdAt: "2026-06-04",
      },
    ]);
  }
  if (!localStorage.getItem(storageKeys.companyRequests)) {
    writeStorage(storageKeys.companyRequests, [
      { id: "co-operadora-norte", company: "Operadora Norte", plan: "Empresa", contact: "María Lagos", status: "Pendiente" },
    ]);
  }
  sanitizeStoredPresentationData();
}

function uniqueValues(key) {
  return [...new Set(specialists.map((specialist) => specialist[key]))].sort();
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fillSelect(select, values) {
  if (!select || select.dataset.ready === "true") return;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  select.dataset.ready = "true";
}

function getSelectedSegments() {
  return segmentFilters
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filterLandingSpecialists() {
  if (!categoryFilter || !zoneFilter || !availabilityFilter || !sortFilter || !ratingFilter) return specialists;

  const selectedCategory = categoryFilter.value;
  const selectedZone = zoneFilter.value;
  const selectedAvailability = availabilityFilter.value;
  const minimumRating = Number(ratingFilter.value);
  const selectedSegments = getSelectedSegments();
  const searchTerm = normalizeSearch(needSearch?.value);

  return specialists
    .filter((specialist) => {
      if (!searchTerm) return true;
      const searchable = normalizeSearch(
        [
          specialist.name,
          specialist.specialty,
          specialist.category,
          specialist.zone,
          specialist.description,
          ...specialist.badges,
          ...specialist.gallery,
          ...specialist.certifications,
        ].join(" ")
      );
      return searchable.includes(searchTerm);
    })
    .filter((specialist) => selectedCategory === "all" || specialist.specialty === selectedCategory)
    .filter((specialist) => selectedZone === "all" || specialist.zone === selectedZone)
    .filter((specialist) => selectedAvailability === "all" || specialist.availability === selectedAvailability)
    .filter((specialist) => specialist.rating >= minimumRating)
    .filter((specialist) => !verifiedFilter.checked || specialist.verified)
    .filter((specialist) => !withPhotosFilter.checked || specialist.photos)
    .filter((specialist) => selectedSegments.length === 0 || selectedSegments.includes(specialist.category))
    .sort((a, b) => {
      if (sortFilter.value === "distance") return a.distance - b.distance;
      if (sortFilter.value === "price") return a.credits - b.credits;
      return b.rating - a.rating;
    });
}

function renderLandingSpecialists() {
  if (!specialistGrid || !resultCount || !ratingFilter || !ratingValue) return;

  const visibleSpecialists = filterLandingSpecialists();
  ratingValue.textContent = Number(ratingFilter.value).toFixed(1);
  resultCount.textContent = `${visibleSpecialists.length} resultado${visibleSpecialists.length === 1 ? "" : "s"}`;

  if (visibleSpecialists.length === 0) {
    specialistGrid.innerHTML = `
      <article class="empty-state">
        <h3>No encontramos especialistas con esos filtros</h3>
        <p>Prueba bajar la calificación mínima o ampliar la comuna.</p>
      </article>
    `;
    return;
  }

  specialistGrid.innerHTML = visibleSpecialists.map((specialist) => renderSpecialistCard(specialist, "landing")).join("");
}

function renderSpecialistCard(specialist, mode = "app") {
  const trustBadges = [
    specialist.verified ? "Verificado" : null,
    specialist.top ? "Top especialista" : null,
    specialist.certifications.length ? "Certificado" : null,
  ].filter(Boolean);
  const visibleBadges = [...new Set([...trustBadges, ...specialist.badges])];
  const reserveButton =
    mode === "app"
      ? `<button class="button primary compact" type="button" data-reserve="${specialist.id}">Reservar</button>`
      : "";

  return `
    <article class="specialist-card ${mode === "app" ? "app-specialist-card" : ""}">
      <div class="profile-media">
        <div class="profile-photo">
          <img src="${specialist.image}" alt="${specialist.name}, ${specialist.specialty} en ${specialist.zone}" loading="lazy">
          <span aria-hidden="true">${getInitials(specialist.name)}</span>
        </div>
        ${specialist.top ? '<span class="top-specialist">Top especialista</span>' : ""}
      </div>

      <div class="card-top">
        <div>
          <h3>${specialist.name}</h3>
          <p><strong>${specialist.specialty}</strong> · ${specialist.zone}</p>
        </div>
      </div>

      <div class="rating-line" aria-label="Reputación del especialista">
        <strong>${specialist.rating.toFixed(1)}/5</strong>
        <span>${specialist.jobs} trabajos completados</span>
        <span>${specialist.responseTime} respuesta promedio</span>
      </div>

      <div class="status-row">
        <span class="availability ${availabilityClasses[specialist.availability]}">
          ${availabilityLabels[specialist.availability]}
        </span>
        ${visibleBadges.map((badge) => `<span class="verified">${badge}</span>`).join("")}
      </div>

      <p class="description">${specialist.description}</p>

      <div class="metrics">
        <span><strong>${specialist.rating.toFixed(1)}</strong> calidad</span>
        <span><strong>${specialist.jobs}</strong> trabajos</span>
        <span><strong>${specialist.recommendation}%</strong> recomienda</span>
        <span><strong>${specialist.responseTime}</strong> respuesta</span>
      </div>

      <div class="work-gallery" aria-label="Galería de trabajos">
        ${specialist.gallery.map((item) => `<span>${item}</span>`).join("")}
      </div>

      <div class="credit-line">
        <strong>Desde ${specialist.credits} créditos</strong>
        <span>${specialist.demand}</span>
      </div>

      <div class="tags">
        ${specialist.certifications.map((certification) => `<span>${certification}</span>`).join("")}
      </div>

      <div class="card-footer">
        <div>
          <strong>Desde ${specialist.credits} créditos</strong>
          <span>tarifa dinámica OficiosPro</span>
        </div>
        <div class="card-actions">
          <a href="/especialistas/${specialist.id}">Ver perfil</a>
          ${reserveButton}
        </div>
      </div>
    </article>
  `;
}

function initLanding() {
  fillSelect(categoryFilter, uniqueValues("specialty"));
  fillSelect(zoneFilter, uniqueValues("zone"));

  if (!landingInitialized) {
    [
      categoryFilter,
      zoneFilter,
      availabilityFilter,
      sortFilter,
      ratingFilter,
      verifiedFilter,
      withPhotosFilter,
      needSearch,
      ...segmentFilters,
    ]
      .filter(Boolean)
      .forEach((control) => control.addEventListener("input", renderLandingSpecialists));

    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        renderLandingSpecialists();
        document.querySelector("#tecnicos")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  if (signupForm && !landingInitialized) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const requests = readStorage(storageKeys.specialistRequests, []);
      const request = {
        id: createId("sr"),
        name: formData.get("name"),
        specialty: formData.get("specialty"),
        commune: formData.get("zone"),
        phone: formData.get("phone"),
        experience: formData.get("experience"),
        status: "Pendiente",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      writeStorage(storageKeys.specialistRequests, [request, ...requests]);
      formStatus.textContent = `${request.name}, recibimos tu solicitud. Quedó guardada en el panel admin para verificación.`;
      signupForm.reset();
    });
  }

  landingInitialized = true;
  renderLandingSpecialists();
}

function normalizePath() {
  const path = window.location.pathname;
  if (path === "" || path === "/" || path.endsWith("/index.html")) return "/";
  return path.replace(/\/$/, "");
}

function navigateTo(path) {
  history.pushState({}, "", path);
  renderRoute();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getWallet() {
  return readStorage(storageKeys.wallet, { ownerId: "cliente-club-hogar", balance: 135, expiresInMonths: 24 });
}

function setWallet(wallet) {
  writeStorage(storageKeys.wallet, wallet);
}

function getBookings() {
  return readStorage(storageKeys.bookings, defaultBookings);
}

function setBookings(bookings) {
  writeStorage(storageKeys.bookings, bookings);
}

function getTransactions() {
  return readStorage(storageKeys.transactions, defaultTransactions);
}

function setTransactions(transactions) {
  writeStorage(storageKeys.transactions, transactions);
}

function getCategories() {
  return readStorage(storageKeys.categories, defaultCategories);
}

function setCategories(categories) {
  writeStorage(storageKeys.categories, categories);
}

function getServices() {
  return readStorage(storageKeys.services, defaultServices);
}

function setServices(services) {
  writeStorage(storageKeys.services, services);
}

function renderNotice() {
  if (!flashMessage) return "";
  const message = flashMessage;
  flashMessage = "";
  return `<div class="app-notice" role="status">${message}</div>`;
}

function renderAppNav(activePath) {
  const links = [
    ["/dashboard-cliente", "Cliente"],
    ["/especialistas", "Técnicos"],
    ["/club-hogar", "Club Hogar"],
    ["/empresas", "Empresas"],
    ["/dashboard-empresa", "Dashboard Empresa"],
    ["/dashboard-especialista", "Especialista"],
    ["/admin", "Admin"],
  ];

  return `
    <nav class="app-tabs" aria-label="Navegación de plataforma">
      ${links
        .map(([href, label]) => `<a href="${href}" ${activePath === href ? 'aria-current="page"' : ""}>${label}</a>`)
        .join("")}
    </nav>
  `;
}

function renderAppPage({ eyebrow, title, subtitle, actions = "", body = "", modifier = "" }) {
  const path = normalizePath();
  appView.innerHTML = `
    <div class="app-shell ${modifier}">
      ${renderNotice()}
      ${renderAppNav(path)}
      <section class="app-page-hero">
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        ${actions ? `<div class="app-hero-actions">${actions}</div>` : ""}
      </section>
      ${body}
    </div>
  `;
}

function renderLogin() {
  renderAppPage({
    eyebrow: "Acceso",
    title: "Ingresa a OficiosPro",
    subtitle: "Acceso para revisar navegación, paneles y reservas antes de conectar la autenticación definitiva.",
    body: `
      <section class="app-grid two">
        <form class="app-card app-form" data-form="login">
          <label>Email<input name="email" type="email" placeholder="tu@email.cl" required></label>
          <label>Contraseña<input name="password" type="password" placeholder="Tu contraseña" required></label>
          <button class="button primary" type="submit">Ingresar</button>
          <p class="form-status" data-form-status></p>
        </form>
        <aside class="app-card">
          <h2>Entradas rápidas</h2>
          <p>Usa estos accesos para revisar paneles y flujos operativos.</p>
          <div class="stacked-actions">
            <a class="button secondary" href="/dashboard-cliente">Dashboard cliente</a>
            <a class="button secondary" href="/dashboard-especialista">Dashboard especialista</a>
            <a class="button secondary" href="/admin">Panel admin</a>
          </div>
        </aside>
      </section>
    `,
  });
}

function renderClientRegistration() {
  renderAppPage({
    eyebrow: "Registro cliente",
    title: "Crea tu cuenta Club Hogar",
    subtitle: "Registra tus datos de contacto, comuna, plan y créditos para gestionar servicios desde OficiosPro.",
    body: `
      <section class="app-grid two">
        <form class="app-card app-form" data-form="client">
          <label>Nombre completo<input name="name" type="text" placeholder="Ej: Benjamín Pérez" required></label>
          <label>Email<input name="email" type="email" placeholder="nombre@email.cl" required></label>
          <label>Teléfono<input name="phone" type="tel" placeholder="+56 9 1234 5678" required></label>
          <label>Comuna<input name="commune" type="text" placeholder="Las Condes" required></label>
          <label>Plan
            <select name="plan">
              <option>Básico, 20 créditos</option>
              <option>Plus, 45 créditos</option>
              <option>Premium, 85 créditos</option>
            </select>
          </label>
          <button class="button primary" type="submit">Crear cuenta cliente</button>
          <p class="form-status" data-form-status></p>
        </form>
        <article class="app-card highlight-card">
          <span>Saldo inicial</span>
          <strong>45 créditos</strong>
          <p>Al registrar un cliente se crea una cuenta con billetera de créditos para reservar especialistas.</p>
        </article>
      </section>
    `,
  });
}

function renderSpecialistRegistration() {
  renderAppPage({
    eyebrow: "Registro especialista",
    title: "Convierte tu oficio en una fuente constante de clientes.",
    subtitle: "Crea una solicitud verificable para que el admin la apruebe antes de aparecer en la red.",
    body: `
      <section class="app-grid two">
        <form class="app-card app-form" data-form="specialist">
          <label>Nombre completo<input name="name" type="text" placeholder="Ej: Juan Pérez" required></label>
          <label>Email<input name="email" type="email" placeholder="especialista@email.cl" required></label>
          <label>Especialidad principal<input name="specialty" type="text" placeholder="Gasfíter, electricista, HVAC" required></label>
          <label>Comuna base<input name="commune" type="text" placeholder="Providencia" required></label>
          <label>WhatsApp<input name="phone" type="tel" placeholder="+56 9 1234 5678" required></label>
          <label>Certificaciones<input name="certifications" type="text" placeholder="SEC, HVAC, CCTV"></label>
          <label class="full">Experiencia<textarea name="experience" rows="4" placeholder="Describe trabajos, zonas y experiencia comprobable"></textarea></label>
          <button class="button primary" type="submit">Enviar solicitud</button>
          <p class="form-status" data-form-status></p>
        </form>
        <article class="app-card specialist-preview-card">
          <img src="assets/work-electrical.webp" alt="Especialista mostrando un trabajo terminado">
          <div>
            <h2>Perfil tipo LinkedIn + Booking</h2>
            <p>Foto destacada, certificaciones, trabajos completados, galería y calificaciones verificadas.</p>
          </div>
        </article>
      </section>
    `,
  });
}

function getFilteredAppSpecialists() {
  const specialty = document.querySelector("[data-app-filter='specialty']")?.value || "all";
  const commune = document.querySelector("[data-app-filter='commune']")?.value || "all";
  const availability = document.querySelector("[data-app-filter='availability']")?.value || "all";
  const rating = Number(document.querySelector("[data-app-filter='rating']")?.value || 4.5);
  const sort = document.querySelector("[data-app-filter='sort']")?.value || "rating";

  return specialists
    .filter((specialist) => specialty === "all" || specialist.specialty === specialty)
    .filter((specialist) => commune === "all" || specialist.zone === commune)
    .filter((specialist) => availability === "all" || specialist.availability === availability)
    .filter((specialist) => specialist.rating >= rating)
    .sort((a, b) => {
      if (sort === "credits") return a.credits - b.credits;
      if (sort === "response") return Number.parseFloat(a.responseTime) - Number.parseFloat(b.responseTime);
      return b.rating - a.rating;
    });
}

function renderAppSpecialistsResults() {
  const target = document.querySelector("#appSpecialistResults");
  const count = document.querySelector("#appResultCount");
  const ratingLabel = document.querySelector("#appRatingValue");
  if (!target || !count) return;

  const rating = document.querySelector("[data-app-filter='rating']")?.value || "4.5";
  const visible = getFilteredAppSpecialists();
  if (ratingLabel) ratingLabel.textContent = Number(rating).toFixed(1);
  count.textContent = `${visible.length} especialista${visible.length === 1 ? "" : "s"}`;
  target.innerHTML = visible.length
    ? visible.map((specialist) => renderSpecialistCard(specialist, "app")).join("")
    : `<article class="empty-state"><h3>No hay especialistas con esos filtros</h3><p>Prueba otra comuna o baja la calificación mínima.</p></article>`;
}

function renderSpecialistsRoute() {
  const specialtyOptions = uniqueValues("specialty").map((value) => `<option value="${value}">${value}</option>`).join("");
  const communeOptions = uniqueValues("zone").map((value) => `<option value="${value}">${value}</option>`).join("");

  renderAppPage({
    eyebrow: "Especialistas",
    title: "Busca técnicos por comuna, disponibilidad y créditos.",
    subtitle: "Listado con filtros funcionales, perfiles individuales y reservas que descuentan créditos del usuario.",
    actions: `
      <a class="button secondary" href="/dashboard-cliente">Ver mis créditos</a>
      <a class="button primary" href="/registro-cliente">Crear cuenta</a>
    `,
    body: `
      <section class="app-card app-filter-bar">
        <label>Especialidad
          <select data-app-filter="specialty"><option value="all">Todas</option>${specialtyOptions}</select>
        </label>
        <label>Comuna
          <select data-app-filter="commune"><option value="all">Todas</option>${communeOptions}</select>
        </label>
        <label>Disponibilidad
          <select data-app-filter="availability">
            <option value="all">Cualquier horario</option>
            <option value="now">Disponible ahora</option>
            <option value="today">Disponible hoy</option>
            <option value="tomorrow">Disponible mañana</option>
          </select>
        </label>
        <label>Orden
          <select data-app-filter="sort">
            <option value="rating">Mejor calificación</option>
            <option value="credits">Menos créditos</option>
            <option value="response">Respuesta más rápida</option>
          </select>
        </label>
        <label class="range-label compact-range">Calificación mínima <span id="appRatingValue">4.5</span>
          <input data-app-filter="rating" type="range" min="3.5" max="5" step="0.1" value="4.5">
        </label>
      </section>
      <div class="result-toolbar">
        <strong id="appResultCount"></strong>
        <span>Precio en créditos, con tarifa dinámica según demanda y disponibilidad.</span>
      </div>
      <section class="specialist-grid app-results-grid" id="appSpecialistResults" aria-live="polite"></section>
    `,
  });
  renderAppSpecialistsResults();
}

function renderSpecialistProfile(id) {
  const specialist = specialists.find((item) => item.id === id);
  if (!specialist) {
    renderNotFound();
    return;
  }

  renderAppPage({
    eyebrow: specialist.category,
    title: specialist.name,
    subtitle: `${specialist.specialty} en ${specialist.zone}. ${specialist.description}`,
    actions: `
      <button class="button primary" type="button" data-reserve="${specialist.id}">Reservar por ${specialist.credits} créditos</button>
      <a class="button secondary" href="/especialistas">Volver al listado</a>
    `,
    body: `
      <section class="profile-layout">
        <article class="app-card profile-main">
          <img src="${specialist.image}" alt="${specialist.name} realizando un trabajo de ${specialist.specialty}">
          <div class="status-row">
            ${specialist.badges.map((badge) => `<span class="verified">${badge}</span>`).join("")}
          </div>
          <h2>Perfil profesional</h2>
          <p>${specialist.description}</p>
          <div class="work-gallery larger">
            ${specialist.gallery.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
        <aside class="app-card profile-sidebar">
          <div class="credit-balance">
            <span>Desde</span>
            <strong>${specialist.credits} créditos</strong>
            <p>La cantidad puede subir o bajar por demanda, horario y zona.</p>
          </div>
          <div class="mini-stats">
            <article><strong>${specialist.rating.toFixed(1)}/5</strong><span>calificación</span></article>
            <article><strong>${specialist.jobs}</strong><span>trabajos</span></article>
            <article><strong>${specialist.responseTime}</strong><span>respuesta</span></article>
            <article><strong>${specialist.recommendation}%</strong><span>recomendación</span></article>
          </div>
          <h3>Certificaciones</h3>
          <div class="tags">${specialist.certifications.map((cert) => `<span>${cert}</span>`).join("")}</div>
        </aside>
      </section>
    `,
  });
}

function reserveSpecialist(id) {
  const specialist = specialists.find((item) => item.id === id);
  if (!specialist) return;

  const wallet = getWallet();
  if (wallet.balance < specialist.credits) {
    flashMessage = `No tienes créditos suficientes para reservar a ${specialist.name}. Puedes recargar o cambiar de plan en Club Hogar.`;
    renderRoute();
    return;
  }

  wallet.balance -= specialist.credits;
  setWallet(wallet);

  const booking = {
    id: createId("bk"),
    specialistId: specialist.id,
    specialistName: specialist.name,
    service: `Reserva ${specialist.specialty}`,
    date: "2026-06-14",
    time: "11:00",
    status: "Confirmada",
    credits: specialist.credits,
    commune: specialist.zone,
    customer: "Cliente Club Hogar",
    channel: "Club Hogar",
  };

  setBookings([booking, ...getBookings()]);
  setTransactions([
    {
      id: createId("tx"),
      type: "Reserva",
      detail: booking.service,
      amount: -specialist.credits,
      date: new Date().toISOString().slice(0, 10),
    },
    ...getTransactions(),
  ]);

  flashMessage = `Reserva confirmada con ${specialist.name}. Se descontaron ${specialist.credits} créditos.`;
  renderRoute();
}

function renderTransactions(transactions = getTransactions()) {
  return `
    <div class="movement-list">
      ${transactions
        .map(
          (tx) => `
            <article>
              <div><strong>${tx.type}</strong><span>${tx.detail}</span></div>
              <strong class="${tx.amount < 0 ? "negative" : "positive"}">${tx.amount > 0 ? "+" : ""}${tx.amount}</strong>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderClubHogar() {
  const wallet = getWallet();
  renderAppPage({
    eyebrow: "Club Hogar",
    title: "Créditos acumulables para resolver tu casa cuando lo necesites.",
    subtitle: "El modelo Club Hogar permite suscripción mensual, acumulación hasta 24 meses y reservas con pago protegido.",
    actions: `
      <a class="button primary" href="/especialistas">Usar créditos</a>
      <a class="button secondary" href="/registro-cliente">Crear cuenta</a>
    `,
    body: `
      <section class="app-grid three">
        <article class="app-card pricing-card"><span>Básico</span><strong>$19.990/mes</strong><p>20 créditos mensuales para mantenciones simples.</p></article>
        <article class="app-card pricing-card featured"><span>Plus</span><strong>$39.990/mes</strong><p>45 créditos mensuales. En 3 meses acumulas 135 créditos.</p></article>
        <article class="app-card pricing-card"><span>Premium</span><strong>$69.990/mes</strong><p>85 créditos mensuales y atención prioritaria.</p></article>
      </section>
      <section class="app-grid two">
        <article class="app-card">
          <h2>Simulador Club Hogar</h2>
          <div class="credit-simulator">
            <div><span>Plan Plus</span><strong>45 créditos/mes</strong></div>
            <div><span>Mes 2</span><strong>90 créditos</strong></div>
            <div><span>Mes 3</span><strong>135 créditos</strong></div>
          </div>
          <p>Puedes usarlo en gasfitería, electricidad, jardín o climatización.</p>
        </article>
        <article class="app-card">
          <h2>Tu billetera</h2>
          <div class="credit-balance"><span>Créditos disponibles</span><strong>${wallet.balance}</strong><p>Vigencia: ${wallet.expiresInMonths} meses.</p></div>
          ${renderTransactions()}
        </article>
      </section>
    `,
  });
}

function renderEmpresas() {
  const requests = readStorage(storageKeys.companyRequests, []);
  renderAppPage({
    eyebrow: "OficiosPro Empresas",
    title: "Centraliza tus mantenciones y paga con créditos corporativos.",
    subtitle: "Red de técnicos verificados para oficinas, restaurantes, bodegas, locales comerciales, plantas productivas y comunidades.",
    actions: `
      <a class="button primary" href="#empresa-form">Solicitar cuenta empresa</a>
      <a class="button secondary" href="/dashboard-empresa">Ver panel empresa</a>
      <a class="button ghost" href="/especialistas">Ver técnicos</a>
    `,
    modifier: "enterprise-app",
    body: `
      <section class="app-grid three">
        <article class="app-card pricing-card dark"><span>Plan Pyme</span><strong>$49.990/mes</strong><p>Membresía fija mensual + bolsa de créditos. Ideal para oficinas pequeñas, locales y restaurantes.</p></article>
        <article class="app-card pricing-card featured"><span>Plan Empresa</span><strong>$149.990/mes</strong><p>Dashboard, múltiples sucursales, historial de servicios y facturación mensual.</p></article>
        <article class="app-card pricing-card dark"><span>Corporativo</span><strong>Desde $499.990/mes</strong><p>SLA, atención prioritaria, ejecutivo asignado y reportes mensuales.</p></article>
      </section>
      <section class="company-dashboard app-card">
        <div class="dashboard-header">
          <div><span>Dashboard empresa</span><strong>Operación activa</strong></div>
          <a href="/dashboard-empresa">Abrir dashboard</a>
        </div>
        <div class="dashboard-grid">
          <article><span>Créditos corporativos</span><strong>${companyDashboard.creditsAvailable}</strong></article>
          <article><span>Usados este mes</span><strong>${companyDashboard.creditsUsed}</strong></article>
          <article><span>Respuesta promedio</span><strong>${companyDashboard.responseTime}</strong></article>
          <article><span>Facturación mensual</span><strong>${companyDashboard.monthlyBilling}</strong></article>
        </div>
        <div class="app-grid two compact-grid">
          <div>
            <h3>Servicios solicitados</h3>
            <div class="dashboard-list">
              ${companyDashboard.services
                .map((item) => `<div><span>${item.service} · ${item.branch}</span><strong>${item.credits} créditos</strong></div>`)
                .join("")}
            </div>
          </div>
          <div>
            <h3>Sucursales activas</h3>
            <div class="branch-list">${companyDashboard.branches.map((branch) => `<span>${branch}</span>`).join("")}</div>
          </div>
        </div>
      </section>
      <section class="app-grid two" id="empresa-form">
        <form class="app-card app-form" data-form="company">
          <h2>Solicitud de empresa</h2>
          <label>Empresa<input name="company" type="text" placeholder="Nombre empresa" required></label>
          <label>RUT<input name="rut" type="text" placeholder="76.123.456-7"></label>
          <label>Contacto<input name="contact" type="text" placeholder="Nombre contacto" required></label>
          <label>Email<input name="email" type="email" placeholder="operaciones@empresa.cl" required></label>
          <label>Sucursales<input name="branches" type="number" min="1" value="1"></label>
          <label>Plan
            <select name="plan"><option>Pyme</option><option>Empresa</option><option>Corporativo</option></select>
          </label>
          <button class="button primary" type="submit">Enviar solicitud</button>
          <p class="form-status" data-form-status></p>
        </form>
        <article class="app-card">
          <h2>Solicitudes recientes</h2>
          <div class="admin-list">
            ${requests.map((request) => `<article><strong>${request.company}</strong><span>${request.plan} · ${request.status}</span></article>`).join("")}
          </div>
        </article>
      </section>
    `,
  });
}

function renderCompanyDashboard() {
  renderAppPage({
    eyebrow: "Dashboard empresa",
    title: "Centro operativo para mantenciones corporativas.",
    subtitle: "Vista operativa para controlar créditos, sucursales, servicios solicitados, historial y facturación mensual consolidada.",
    actions: `
      <a class="button primary" href="/especialistas">Solicitar técnico</a>
      <a class="button secondary" href="/empresas">Ver planes empresa</a>
    `,
    modifier: "enterprise-app",
    body: `
      <section class="app-grid four">
        <article class="app-card stat-card"><span>Créditos corporativos</span><strong>${companyDashboard.creditsAvailable}</strong></article>
        <article class="app-card stat-card"><span>Usados este mes</span><strong>${companyDashboard.creditsUsed}</strong></article>
        <article class="app-card stat-card"><span>Respuesta promedio</span><strong>${companyDashboard.responseTime}</strong></article>
        <article class="app-card stat-card"><span>Sucursales activas</span><strong>${companyDashboard.activeBranches}</strong></article>
      </section>

      <section class="company-dashboard app-card">
        <div class="dashboard-header">
          <div><span>Operación corporativa</span><strong>Servicios en curso</strong></div>
          <span>Facturación mensual para empresas</span>
        </div>
        <div class="dashboard-grid">
          <article><span>Factura estimada</span><strong>${companyDashboard.monthlyBilling}</strong></article>
          <article><span>Próximo cierre</span><strong>${companyDashboard.nextInvoiceDate}</strong></article>
          <article><span>Servicios abiertos</span><strong>${companyDashboard.services.filter((item) => item.status !== "Finalizado").length}</strong></article>
          <article><span>Historial del mes</span><strong>${companyDashboard.history.length}</strong></article>
        </div>
      </section>

      <section class="app-grid two">
        <article class="app-card">
          <h2>Servicios solicitados</h2>
          <div class="booking-list">
            ${companyDashboard.services
              .map(
                (item) => `
                  <article>
                    <div><strong>${item.service}</strong><span>${item.branch} · ${item.status}</span></div>
                    <div><strong>${item.credits} créditos</strong><span>Pago corporativo</span></div>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="app-card">
          <h2>Sucursales</h2>
          <div class="branch-list">${companyDashboard.branches.map((branch) => `<span>${branch}</span>`).join("")}</div>
          <div class="credit-balance enterprise-balance">
            <span>Bolsa corporativa disponible</span>
            <strong>${companyDashboard.creditsAvailable}</strong>
            <p>Créditos compartidos por todas las sucursales activas.</p>
          </div>
        </article>
      </section>

      <section class="app-grid two">
        <article class="app-card">
          <h2>Historial de mantenciones</h2>
          <div class="booking-list">
            ${companyDashboard.history
              .map(
                (item) => `
                  <article>
                    <div><strong>${item.service}</strong><span>${item.branch} · ${item.date}</span></div>
                    <div><strong>${item.credits} créditos</strong><span>${item.status}</span></div>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="app-card">
          <h2>Movimientos de créditos</h2>
          ${renderTransactions(companyDashboard.creditMovements)}
        </article>
      </section>
    `,
  });
}

function renderClientDashboard() {
  const wallet = getWallet();
  const bookings = getBookings();
  const upcoming = bookings.filter((booking) => booking.status !== "Finalizada");
  const completed = bookings.filter((booking) => booking.status === "Finalizada");
  const favorites = specialists.filter((specialist) => specialist.top).slice(0, 3);

  renderAppPage({
    eyebrow: "Dashboard cliente",
    title: "Tu operación de hogar en un solo lugar.",
    subtitle: "Billetera de créditos, reservas próximas, historial y especialistas favoritos en una sola vista.",
    actions: `<a class="button primary" href="/especialistas">Reservar técnico</a>`,
    body: `
      <section class="app-grid four">
        <article class="app-card stat-card"><span>Créditos disponibles</span><strong>${wallet.balance}</strong></article>
        <article class="app-card stat-card"><span>Reservas próximas</span><strong>${upcoming.length}</strong></article>
        <article class="app-card stat-card"><span>Servicios realizados</span><strong>${completed.length}</strong></article>
        <article class="app-card stat-card"><span>Técnicos favoritos</span><strong>${favorites.length}</strong></article>
      </section>
      <section class="app-grid two">
        <article class="app-card"><h2>Reservas próximas</h2>${renderBookingList(upcoming)}</article>
        <article class="app-card"><h2>Historial de créditos</h2>${renderTransactions()}</article>
      </section>
      <section class="app-card">
        <h2>Técnicos favoritos</h2>
        <div class="favorite-grid">
          ${favorites
            .map(
              (specialist) => `
                <a href="/especialistas/${specialist.id}">
                  <img src="${specialist.image}" alt="${specialist.name}">
                  <strong>${specialist.name}</strong>
                  <span>${specialist.specialty} · ${specialist.rating.toFixed(1)}/5</span>
                </a>
              `
            )
            .join("")}
        </div>
      </section>
    `,
  });
}

function renderSpecialistDashboard() {
  const specialist = specialists[0];
  const bookings = getBookings().filter((booking) => booking.specialistId === specialist.id);
  const earnedCredits = bookings.reduce((sum, booking) => sum + booking.credits, 0);

  renderAppPage({
    eyebrow: "Dashboard especialista",
    title: `Panel de ${specialist.name}`,
    subtitle: "Vista inicial para revisar perfil, reservas recibidas, calificación, trabajos completados y créditos ganados.",
    actions: `<a class="button primary" href="/especialistas/${specialist.id}">Ver perfil público</a>`,
    body: `
      <section class="profile-layout">
        <article class="app-card profile-main">
          <img src="${specialist.image}" alt="${specialist.name}">
          <h2>${specialist.specialty}</h2>
          <p>${specialist.description}</p>
          <div class="status-row">${specialist.badges.map((badge) => `<span class="verified">${badge}</span>`).join("")}</div>
        </article>
        <aside class="app-card profile-sidebar">
          <div class="mini-stats">
            <article><strong>${specialist.rating.toFixed(1)}/5</strong><span>calificación</span></article>
            <article><strong>${specialist.jobs}</strong><span>trabajos completados</span></article>
            <article><strong>${bookings.length}</strong><span>reservas recibidas</span></article>
            <article><strong>${earnedCredits}</strong><span>créditos ganados</span></article>
          </div>
        </aside>
      </section>
      <section class="app-card"><h2>Reservas recibidas</h2>${renderBookingList(bookings)}</section>
    `,
  });
}

function renderBookingList(bookings) {
  if (!bookings.length) return `<p class="muted">No hay reservas para mostrar.</p>`;
  return `
    <div class="booking-list">
      ${bookings
        .map(
          (booking) => `
            <article>
              <div>
                <strong>${booking.service}</strong>
                <span>${booking.specialistName} · ${booking.commune}</span>
              </div>
              <div>
                <strong>${booking.credits} créditos</strong>
                <span>${booking.date} · ${booking.status}</span>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderAdmin() {
  const users = readStorage(storageKeys.users, []);
  const requests = readStorage(storageKeys.specialistRequests, []);
  const companies = readStorage(storageKeys.companyRequests, []);
  const bookings = getBookings();
  const categories = getCategories();
  const services = getServices();

  renderAppPage({
    eyebrow: "Admin",
    title: "Panel operativo para administrar la red.",
    subtitle: "Aprobación de especialistas, usuarios, empresas, reservas, categorías y servicios sin backend todavía.",
    body: `
      <section class="app-grid four">
        <article class="app-card stat-card"><span>Usuarios</span><strong>${users.length}</strong></article>
        <article class="app-card stat-card"><span>Especialistas por aprobar</span><strong>${requests.filter((item) => item.status === "Pendiente").length}</strong></article>
        <article class="app-card stat-card"><span>Empresas</span><strong>${companies.length}</strong></article>
        <article class="app-card stat-card"><span>Reservas</span><strong>${bookings.length}</strong></article>
      </section>
      <section class="app-grid two">
        <article class="app-card">
          <h2>Aprobar especialistas</h2>
          <div class="admin-list">
            ${requests
              .map(
                (request) => `
                  <article>
                    <div><strong>${request.name}</strong><span>${request.specialty} · ${request.commune} · ${request.status}</span></div>
                    <button type="button" data-approve-specialist="${request.id}">Aprobar</button>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="app-card">
          <h2>Empresas</h2>
          <div class="admin-list">
            ${companies.map((company) => `<article><strong>${company.company}</strong><span>${company.plan} · ${company.status}</span></article>`).join("")}
          </div>
        </article>
      </section>
      <section class="app-grid two">
        <article class="app-card">
          <h2>Categorías</h2>
          <form class="inline-admin-form" data-form="category"><input name="name" placeholder="Nueva categoría"><button type="submit">Agregar</button></form>
          <div class="tag-list">${categories.map((category) => `<span>${category.name}</span>`).join("")}</div>
        </article>
        <article class="app-card">
          <h2>Servicios</h2>
          <form class="inline-admin-form" data-form="service"><input name="name" placeholder="Nuevo servicio"><input name="credits" type="number" min="1" placeholder="Créditos"><button type="submit">Agregar</button></form>
          <div class="admin-list">
            ${services.map((service) => `<article><strong>${service.name}</strong><span>${service.baseCredits} créditos base</span></article>`).join("")}
          </div>
        </article>
      </section>
      <section class="app-card">
        <h2>Reservas</h2>
        ${renderBookingList(bookings)}
      </section>
    `,
  });
}

function renderNotFound() {
  renderAppPage({
    eyebrow: "Ruta no encontrada",
    title: "Esta vista todavía no existe.",
    subtitle: "Vuelve al listado de especialistas o al inicio de OficiosPro.",
    actions: `<a class="button primary" href="/">Ir al inicio</a><a class="button secondary" href="/especialistas">Ver técnicos</a>`,
  });
}

function handleAppSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();

  const formData = new FormData(form);
  const status = form.querySelector("[data-form-status]");
  const type = form.dataset.form;

  if (type === "login") {
    const session = { email: formData.get("email"), role: "preview", signedInAt: new Date().toISOString() };
    writeStorage(storageKeys.session, session);
    status.textContent = "Sesión iniciada. Puedes entrar a cualquier panel.";
    return;
  }

  if (type === "client") {
    const users = readStorage(storageKeys.users, []);
    const user = {
      id: createId("usr"),
      role: "client",
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      commune: formData.get("commune"),
      plan: formData.get("plan"),
      createdAt: new Date().toISOString(),
    };
    writeStorage(storageKeys.users, [user, ...users]);
    status.textContent = "Cuenta cliente creada en localStorage. Lista para conectar con users y credits_wallet.";
    form.reset();
    return;
  }

  if (type === "specialist") {
    const requests = readStorage(storageKeys.specialistRequests, []);
    const request = {
      id: createId("sr"),
      name: formData.get("name"),
      email: formData.get("email"),
      specialty: formData.get("specialty"),
      commune: formData.get("commune"),
      phone: formData.get("phone"),
      certifications: formData.get("certifications"),
      experience: formData.get("experience"),
      status: "Pendiente",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    writeStorage(storageKeys.specialistRequests, [request, ...requests]);
    status.textContent = "Solicitud recibida. Ahora aparece en el panel admin para aprobación.";
    form.reset();
    return;
  }

  if (type === "company") {
    const companies = readStorage(storageKeys.companyRequests, []);
    const company = {
      id: createId("co"),
      company: formData.get("company"),
      rut: formData.get("rut"),
      contact: formData.get("contact"),
      email: formData.get("email"),
      branches: formData.get("branches"),
      plan: formData.get("plan"),
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    };
    writeStorage(storageKeys.companyRequests, [company, ...companies]);
    status.textContent = "Solicitud empresa guardada. Quedó visible en admin.";
    return;
  }

  if (type === "category") {
    const categories = getCategories();
    const name = formData.get("name");
    if (!name) return;
    setCategories([{ id: createId("cat"), name, description: "Categoría creada desde admin." }, ...categories]);
    flashMessage = "Categoría agregada.";
    renderAdmin();
    return;
  }

  if (type === "service") {
    const services = getServices();
    const name = formData.get("name");
    const credits = Number(formData.get("credits") || 10);
    if (!name) return;
    setServices([{ id: createId("srv"), categoryId: "hogar", name, baseCredits: credits, dynamicPricing: true }, ...services]);
    flashMessage = "Servicio agregado.";
    renderAdmin();
  }
}

function handleAppClick(event) {
  const reserveButton = event.target.closest("[data-reserve]");
  if (reserveButton) {
    reserveSpecialist(reserveButton.dataset.reserve);
    return;
  }

  const approveButton = event.target.closest("[data-approve-specialist]");
  if (approveButton) {
    const requests = readStorage(storageKeys.specialistRequests, []);
    const updated = requests.map((request) =>
      request.id === approveButton.dataset.approveSpecialist ? { ...request, status: "Aprobado" } : request
    );
    writeStorage(storageKeys.specialistRequests, updated);
    flashMessage = "Especialista aprobado en el panel admin.";
    renderAdmin();
  }
}

function updateHeaderActive(path) {
  document.querySelectorAll(".nav a, .top-action, .login-link").forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === path || (path.startsWith("/especialistas") && href === "/especialistas");
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function renderRoute() {
  seedStorage();
  const path = normalizePath();
  updateHeaderActive(path);

  if (path === "/") {
    document.body.classList.remove("app-mode");
    landing.hidden = false;
    appView.hidden = true;
    initLanding();
    return;
  }

  document.body.classList.add("app-mode");
  landing.hidden = true;
  appView.hidden = false;

  const profileMatch = path.match(/^\/especialistas\/([a-z0-9-]+)$/);
  if (profileMatch) {
    renderSpecialistProfile(profileMatch[1]);
    return;
  }

  if (path === "/login") renderLogin();
  else if (path === "/registro-cliente") renderClientRegistration();
  else if (path === "/registro-especialista") renderSpecialistRegistration();
  else if (path === "/especialistas") renderSpecialistsRoute();
  else if (path === "/club-hogar") renderClubHogar();
  else if (path === "/empresas") renderEmpresas();
  else if (path === "/dashboard-empresa") renderCompanyDashboard();
  else if (path === "/dashboard-cliente") renderClientDashboard();
  else if (path === "/dashboard-especialista") renderSpecialistDashboard();
  else if (path === "/admin") renderAdmin();
  else renderNotFound();
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || !href.startsWith("/") || link.target) return;

  const url = new URL(link.href);
  if (url.origin !== window.location.origin) return;

  event.preventDefault();
  navigateTo(`${url.pathname}${url.search}${url.hash}`);
});

appView.addEventListener("submit", handleAppSubmit);
appView.addEventListener("click", handleAppClick);
appView.addEventListener("input", (event) => {
  if (event.target.matches("[data-app-filter]")) renderAppSpecialistsResults();
});
window.addEventListener("popstate", renderRoute);

renderRoute();
