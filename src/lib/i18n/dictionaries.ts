import type { Locale } from "@/lib/i18n/config";

/**
 * Diccionarios de traducción. El español (es) es la fuente de verdad y define la
 * forma (`Dictionary`); el resto de los idiomas debe cumplir ese contrato.
 *
 * Alcance de esta etapa: shell (header/footer) + landing global. El resto del copy
 * de la plataforma se traduce de forma incremental.
 */
const es = {
  nav: {
    specialists: "Especialistas",
    categories: "Categorías",
    club: "Club Hogar",
    companies: "Empresas",
    refer: "Recomienda y gana",
    work: "Trabaja con nosotros",
    support: "Soporte",
    login: "Iniciar sesión",
    search: "Buscar",
    searchPlaceholder: "Busca oficio, problema o comuna",
    global: "Global",
  },
  lang: {
    choose: "Idioma",
  },
  footer: {
    tagline:
      "Técnicos verificados, créditos acumulables y dashboards para convertir mantenciones del hogar y operación empresarial en una experiencia confiable.",
    chips: ["Pago seguro", "Garantía OficiosPro", "Técnicos verificados", "Cobertura en crecimiento"],
    globalCta: "¿En qué país te gustaría usar OficiosPro?",
  },
  global: {
    eyebrow: "OficiosPro en el mundo",
    title: "Estamos evaluando dónde lanzar primero.",
    subtitle:
      "OficiosPro conecta hogares y empresas con especialistas verificados. Aún no operamos en todos los países: cuéntanos dónde te gustaría usarlo y prioritizaremos esa zona.",
    honest:
      "Honestidad primero: todavía no hay especialistas en todas las ciudades. Esto es una lista de espera para medir interés, no una promesa de cobertura inmediata.",
    formTitle: "Únete a la lista de espera",
    name: "Nombre",
    email: "Email",
    country: "País",
    countryPlaceholder: "Selecciona tu país",
    city: "Ciudad",
    cityPlaceholder: "Tu ciudad",
    trade: "¿Qué servicio necesitas?",
    tradePlaceholder: "Ej: gasfitería, electricidad, climatización",
    role: "¿Cómo participarías?",
    roleClient: "Busco contratar especialistas",
    roleSpecialist: "Soy especialista y quiero ofrecer servicios",
    submit: "Unirme a la lista",
    submitting: "Enviando...",
    disclaimer: "Usaremos tus datos solo para avisarte cuando OficiosPro llegue a tu zona.",
    success: "¡Gracias! Te sumamos a la lista de espera.",
    successSub: "Te avisaremos cuando evaluemos lanzar en tu ciudad. Mientras tanto, no compartiremos tus datos.",
    benefitsTitle: "Por qué OficiosPro",
    benefits: [
      "Especialistas verificados antes de publicarse",
      "Pago protegido con créditos hasta confirmar el trabajo",
      "Reputación y reseñas reales",
    ],
    back: "Volver al inicio",
  },
} as const;

type WidenDictionary<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly WidenDictionary<Item>[]
    : T extends object
      ? { [Key in keyof T]: WidenDictionary<T[Key]> }
      : T;

export type Dictionary = WidenDictionary<typeof es>;

const en: Dictionary = {
  nav: {
    specialists: "Specialists",
    categories: "Categories",
    club: "Home Club",
    companies: "Businesses",
    refer: "Refer & earn",
    work: "Work with us",
    support: "Support",
    login: "Log in",
    search: "Search",
    searchPlaceholder: "Search a trade, problem or city",
    global: "Global",
  },
  lang: {
    choose: "Language",
  },
  footer: {
    tagline:
      "Verified tradespeople, rollover credits and dashboards that turn home maintenance and business operations into a trustworthy experience.",
    chips: ["Secure payment", "OficiosPro guarantee", "Verified pros", "Growing coverage"],
    globalCta: "Which country would you like OficiosPro in?",
  },
  global: {
    eyebrow: "OficiosPro worldwide",
    title: "We're deciding where to launch first.",
    subtitle:
      "OficiosPro connects homes and businesses with verified specialists. We don't operate everywhere yet — tell us where you'd like to use it and we'll prioritize your area.",
    honest:
      "Honesty first: there aren't specialists in every city yet. This is a waitlist to gauge interest, not a promise of immediate coverage.",
    formTitle: "Join the waitlist",
    name: "Name",
    email: "Email",
    country: "Country",
    countryPlaceholder: "Select your country",
    city: "City",
    cityPlaceholder: "Your city",
    trade: "What service do you need?",
    tradePlaceholder: "e.g. plumbing, electrical, HVAC",
    role: "How would you take part?",
    roleClient: "I want to hire specialists",
    roleSpecialist: "I'm a specialist and want to offer services",
    submit: "Join the list",
    submitting: "Sending...",
    disclaimer: "We'll only use your details to let you know when OficiosPro reaches your area.",
    success: "Thanks! You're on the waitlist.",
    successSub: "We'll reach out when we evaluate launching in your city. We won't share your data.",
    benefitsTitle: "Why OficiosPro",
    benefits: [
      "Specialists verified before going live",
      "Protected payment with credits until the job is confirmed",
      "Real reputation and reviews",
    ],
    back: "Back to home",
  },
};

const pt: Dictionary = {
  nav: {
    specialists: "Especialistas",
    categories: "Categorias",
    club: "Clube Casa",
    companies: "Empresas",
    refer: "Indique e ganhe",
    work: "Trabalhe conosco",
    support: "Suporte",
    login: "Entrar",
    search: "Buscar",
    searchPlaceholder: "Busque um serviço, problema ou cidade",
    global: "Global",
  },
  lang: {
    choose: "Idioma",
  },
  footer: {
    tagline:
      "Profissionais verificados, créditos acumuláveis e painéis que transformam a manutenção da casa e a operação das empresas em uma experiência confiável.",
    chips: ["Pagamento seguro", "Garantia OficiosPro", "Profissionais verificados", "Cobertura em crescimento"],
    globalCta: "Em qual país você gostaria de usar a OficiosPro?",
  },
  global: {
    eyebrow: "OficiosPro no mundo",
    title: "Estamos avaliando onde lançar primeiro.",
    subtitle:
      "A OficiosPro conecta casas e empresas a especialistas verificados. Ainda não operamos em todos os países — conte onde você gostaria de usar e vamos priorizar a sua região.",
    honest:
      "Honestidade em primeiro lugar: ainda não há especialistas em todas as cidades. Esta é uma lista de espera para medir interesse, não uma promessa de cobertura imediata.",
    formTitle: "Entre na lista de espera",
    name: "Nome",
    email: "Email",
    country: "País",
    countryPlaceholder: "Selecione seu país",
    city: "Cidade",
    cityPlaceholder: "Sua cidade",
    trade: "Qual serviço você precisa?",
    tradePlaceholder: "ex: encanamento, elétrica, climatização",
    role: "Como você participaria?",
    roleClient: "Quero contratar especialistas",
    roleSpecialist: "Sou especialista e quero oferecer serviços",
    submit: "Entrar na lista",
    submitting: "Enviando...",
    disclaimer: "Usaremos seus dados apenas para avisar quando a OficiosPro chegar à sua região.",
    success: "Obrigado! Você está na lista de espera.",
    successSub: "Avisaremos quando avaliarmos lançar na sua cidade. Não compartilharemos seus dados.",
    benefitsTitle: "Por que OficiosPro",
    benefits: [
      "Especialistas verificados antes de publicar",
      "Pagamento protegido com créditos até confirmar o trabalho",
      "Reputação e avaliações reais",
    ],
    back: "Voltar ao início",
  },
};

const fr: Dictionary = {
  nav: {
    specialists: "Spécialistes",
    categories: "Catégories",
    club: "Club Maison",
    companies: "Entreprises",
    refer: "Parrainez et gagnez",
    work: "Travaillez avec nous",
    support: "Assistance",
    login: "Se connecter",
    search: "Rechercher",
    searchPlaceholder: "Cherchez un métier, un problème ou une ville",
    global: "Global",
  },
  lang: {
    choose: "Langue",
  },
  footer: {
    tagline:
      "Des artisans vérifiés, des crédits cumulables et des tableaux de bord qui transforment l'entretien de la maison et les opérations des entreprises en une expérience fiable.",
    chips: ["Paiement sécurisé", "Garantie OficiosPro", "Pros vérifiés", "Couverture en expansion"],
    globalCta: "Dans quel pays aimeriez-vous utiliser OficiosPro ?",
  },
  global: {
    eyebrow: "OficiosPro dans le monde",
    title: "Nous choisissons où lancer en premier.",
    subtitle:
      "OficiosPro met en relation particuliers et entreprises avec des spécialistes vérifiés. Nous ne sommes pas encore partout — dites-nous où vous aimeriez l'utiliser et nous prioriserons votre zone.",
    honest:
      "L'honnêteté d'abord : il n'y a pas encore de spécialistes dans toutes les villes. Ceci est une liste d'attente pour mesurer l'intérêt, pas une promesse de couverture immédiate.",
    formTitle: "Rejoindre la liste d'attente",
    name: "Nom",
    email: "Email",
    country: "Pays",
    countryPlaceholder: "Sélectionnez votre pays",
    city: "Ville",
    cityPlaceholder: "Votre ville",
    trade: "De quel service avez-vous besoin ?",
    tradePlaceholder: "ex : plomberie, électricité, climatisation",
    role: "Comment participeriez-vous ?",
    roleClient: "Je veux engager des spécialistes",
    roleSpecialist: "Je suis spécialiste et veux proposer mes services",
    submit: "Rejoindre la liste",
    submitting: "Envoi...",
    disclaimer: "Nous utiliserons vos données uniquement pour vous prévenir quand OficiosPro arrivera chez vous.",
    success: "Merci ! Vous êtes sur la liste d'attente.",
    successSub: "Nous vous contacterons quand nous évaluerons un lancement dans votre ville. Vos données restent privées.",
    benefitsTitle: "Pourquoi OficiosPro",
    benefits: [
      "Spécialistes vérifiés avant publication",
      "Paiement protégé par crédits jusqu'à confirmation du travail",
      "Réputation et avis réels",
    ],
    back: "Retour à l'accueil",
  },
};

const de: Dictionary = {
  nav: {
    specialists: "Fachleute",
    categories: "Kategorien",
    club: "Haus-Club",
    companies: "Unternehmen",
    refer: "Empfehlen & verdienen",
    work: "Mitarbeiten",
    support: "Support",
    login: "Anmelden",
    search: "Suchen",
    searchPlaceholder: "Gewerk, Problem oder Stadt suchen",
    global: "Global",
  },
  lang: {
    choose: "Sprache",
  },
  footer: {
    tagline:
      "Geprüfte Fachleute, ansparbare Guthaben und Dashboards, die Hausinstandhaltung und Unternehmensbetrieb zu einem verlässlichen Erlebnis machen.",
    chips: ["Sichere Zahlung", "OficiosPro-Garantie", "Geprüfte Profis", "Wachsende Abdeckung"],
    globalCta: "In welchem Land möchten Sie OficiosPro nutzen?",
  },
  global: {
    eyebrow: "OficiosPro weltweit",
    title: "Wir entscheiden, wo wir zuerst starten.",
    subtitle:
      "OficiosPro verbindet Haushalte und Unternehmen mit geprüften Fachleuten. Wir sind noch nicht überall — sagen Sie uns, wo Sie es nutzen möchten, und wir priorisieren Ihre Region.",
    honest:
      "Ehrlichkeit zuerst: Es gibt noch nicht in jeder Stadt Fachleute. Dies ist eine Warteliste, um Interesse zu messen — kein Versprechen sofortiger Abdeckung.",
    formTitle: "Auf die Warteliste",
    name: "Name",
    email: "E-Mail",
    country: "Land",
    countryPlaceholder: "Land auswählen",
    city: "Stadt",
    cityPlaceholder: "Ihre Stadt",
    trade: "Welche Leistung brauchen Sie?",
    tradePlaceholder: "z. B. Sanitär, Elektrik, Klima",
    role: "Wie würden Sie teilnehmen?",
    roleClient: "Ich möchte Fachleute beauftragen",
    roleSpecialist: "Ich bin Fachkraft und möchte Leistungen anbieten",
    submit: "Eintragen",
    submitting: "Senden...",
    disclaimer: "Wir nutzen Ihre Daten nur, um Sie zu informieren, wenn OficiosPro in Ihre Region kommt.",
    success: "Danke! Sie stehen auf der Warteliste.",
    successSub: "Wir melden uns, wenn wir einen Start in Ihrer Stadt prüfen. Ihre Daten bleiben privat.",
    benefitsTitle: "Warum OficiosPro",
    benefits: [
      "Fachleute vor der Freischaltung geprüft",
      "Geschützte Zahlung mit Guthaben bis zur Bestätigung",
      "Echte Reputation und Bewertungen",
    ],
    back: "Zur Startseite",
  },
};

const it: Dictionary = {
  nav: {
    specialists: "Specialisti",
    categories: "Categorie",
    club: "Club Casa",
    companies: "Aziende",
    refer: "Invita e guadagna",
    work: "Lavora con noi",
    support: "Assistenza",
    login: "Accedi",
    search: "Cerca",
    searchPlaceholder: "Cerca un mestiere, un problema o una città",
    global: "Global",
  },
  lang: {
    choose: "Lingua",
  },
  footer: {
    tagline:
      "Professionisti verificati, crediti accumulabili e dashboard che trasformano la manutenzione della casa e le operazioni aziendali in un'esperienza affidabile.",
    chips: ["Pagamento sicuro", "Garanzia OficiosPro", "Professionisti verificati", "Copertura in crescita"],
    globalCta: "In quale paese vorresti usare OficiosPro?",
  },
  global: {
    eyebrow: "OficiosPro nel mondo",
    title: "Stiamo valutando dove lanciare per primo.",
    subtitle:
      "OficiosPro collega case e aziende con specialisti verificati. Non operiamo ancora ovunque: dicci dove vorresti usarlo e daremo priorità alla tua zona.",
    honest:
      "Onestà prima di tutto: non ci sono ancora specialisti in ogni città. Questa è una lista d'attesa per misurare l'interesse, non una promessa di copertura immediata.",
    formTitle: "Iscriviti alla lista d'attesa",
    name: "Nome",
    email: "Email",
    country: "Paese",
    countryPlaceholder: "Seleziona il tuo paese",
    city: "Città",
    cityPlaceholder: "La tua città",
    trade: "Di quale servizio hai bisogno?",
    tradePlaceholder: "es: idraulica, elettricità, climatizzazione",
    role: "Come parteciperesti?",
    roleClient: "Voglio assumere specialisti",
    roleSpecialist: "Sono uno specialista e voglio offrire servizi",
    submit: "Iscriviti",
    submitting: "Invio...",
    disclaimer: "Useremo i tuoi dati solo per avvisarti quando OficiosPro arriverà nella tua zona.",
    success: "Grazie! Sei nella lista d'attesa.",
    successSub: "Ti contatteremo quando valuteremo il lancio nella tua città. Non condivideremo i tuoi dati.",
    benefitsTitle: "Perché OficiosPro",
    benefits: [
      "Specialisti verificati prima della pubblicazione",
      "Pagamento protetto con crediti fino alla conferma del lavoro",
      "Reputazione e recensioni reali",
    ],
    back: "Torna alla home",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { es, en, pt, fr, de, it };
