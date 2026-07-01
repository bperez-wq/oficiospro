import type { Locale } from "@/lib/i18n/config";

export type EmpresasFeature = { title: string; text: string };

export type EmpresasLocaleContent = {
  heroRequestAccount: string;
  heroTalkSales: string;
  casesEyebrow: string;
  casesTitle: string;
  continuityEyebrow: string;
  continuityTitle: string;
  continuityText: string;
  dashboardTitle: string;
  dashboardExample: string;
  mCredits: string;
  mUsed: string;
  mResponse: string;
  mBranches: string;
  creditsHelp: string;
  plansEyebrow: string;
  plansTitle: string;
  plansLead: string;
  features: EmpresasFeature[];
  formEyebrow: string;
  formTitle: string;
  formText: string;
  formImgAlt: string;
};

const es: EmpresasLocaleContent = {
  heroRequestAccount: "Solicitar cuenta empresa",
  heroTalkSales: "Hablar con ventas",
  casesEyebrow: "Casos de uso",
  casesTitle: "Una red para cada tipo de operación.",
  continuityEyebrow: "Continuidad operacional",
  continuityTitle: "Centraliza tus mantenciones y paga con créditos corporativos.",
  continuityText: "Reduce carga administrativa, ordena proveedores externos, controla consumo por sucursal y prepara trazabilidad para facturación mensual consolidada.",
  dashboardTitle: "Dashboard empresa",
  dashboardExample: "Vista de ejemplo",
  mCredits: "Créditos",
  mUsed: "Usados",
  mResponse: "Respuesta",
  mBranches: "Sucursales",
  creditsHelp: "¿Cómo funcionan los créditos? (1 crédito = $1.000)",
  plansEyebrow: "Planes empresa",
  plansTitle: "Membresía fija mensual + bolsa de créditos.",
  plansLead: "Diseñado para empresas que necesitan respuesta operacional, créditos corporativos, control por centro de costo, documentación y trazabilidad.",
  features: [
    { title: "Facturación y trazabilidad", text: "Documentación preparada para revisión administrativa, contable y tributaria." },
    { title: "Dashboard de consumo", text: "Créditos corporativos, solicitudes abiertas, centros de costo e historial." },
    { title: "SLA y priorización", text: "Respuesta rápida para operación crítica." },
    { title: "Gestión por sucursal", text: "Ordena locales, oficinas, bodegas, comunidades y responsables internos." },
    { title: "Reportes mensuales", text: "Control de mantenciones, gastos y proveedores." },
    { title: "Externalización controlada", text: "Contrata servicios sin aumentar carga operativa permanente." },
  ],
  formEyebrow: "Solicitud empresa",
  formTitle: "Cuéntanos tu operación.",
  formText: "Recibiremos la solicitud con datos de contacto, sucursales, centros de costo y plan objetivo para preparar una cuenta corporativa.",
  formImgAlt: "Equipo técnico trabajando en una empresa",
};

const en: EmpresasLocaleContent = {
  heroRequestAccount: "Request a business account",
  heroTalkSales: "Talk to sales",
  casesEyebrow: "Use cases",
  casesTitle: "A network for every type of operation.",
  continuityEyebrow: "Operational continuity",
  continuityTitle: "Centralize your maintenance and pay with corporate credits.",
  continuityText: "Cut administrative load, organize external providers, control consumption per branch and prepare traceability for consolidated monthly billing.",
  dashboardTitle: "Business dashboard",
  dashboardExample: "Sample view",
  mCredits: "Credits",
  mUsed: "Used",
  mResponse: "Response",
  mBranches: "Branches",
  creditsHelp: "How do credits work? (1 credit = $1,000 CLP)",
  plansEyebrow: "Business plans",
  plansTitle: "Fixed monthly membership + credit pack.",
  plansLead: "Designed for companies that need operational response, corporate credits, cost-center control, documentation and traceability.",
  features: [
    { title: "Billing and traceability", text: "Documentation ready for administrative, accounting and tax review." },
    { title: "Consumption dashboard", text: "Corporate credits, open requests, cost centers and history." },
    { title: "SLA and prioritization", text: "Fast response for critical operations." },
    { title: "Per-branch management", text: "Organize locations, offices, warehouses, communities and internal owners." },
    { title: "Monthly reports", text: "Control of maintenance, spend and providers." },
    { title: "Controlled outsourcing", text: "Contract services without adding permanent operational load." },
  ],
  formEyebrow: "Business request",
  formTitle: "Tell us about your operation.",
  formText: "We'll receive the request with contact details, branches, cost centers and target plan to prepare a corporate account.",
  formImgAlt: "Technical team working at a company",
};

const pt: EmpresasLocaleContent = {
  heroRequestAccount: "Solicitar conta empresa",
  heroTalkSales: "Falar com vendas",
  casesEyebrow: "Casos de uso",
  casesTitle: "Uma rede para cada tipo de operação.",
  continuityEyebrow: "Continuidade operacional",
  continuityTitle: "Centralize suas manutenções e pague com créditos corporativos.",
  continuityText: "Reduza a carga administrativa, organize fornecedores externos, controle o consumo por filial e prepare rastreabilidade para faturamento mensal consolidado.",
  dashboardTitle: "Dashboard empresa",
  dashboardExample: "Visão de exemplo",
  mCredits: "Créditos",
  mUsed: "Usados",
  mResponse: "Resposta",
  mBranches: "Filiais",
  creditsHelp: "Como funcionam os créditos? (1 crédito = $1.000)",
  plansEyebrow: "Planos empresa",
  plansTitle: "Mensalidade fixa + pacote de créditos.",
  plansLead: "Projetado para empresas que precisam de resposta operacional, créditos corporativos, controle por centro de custo, documentação e rastreabilidade.",
  features: [
    { title: "Faturamento e rastreabilidade", text: "Documentação preparada para revisão administrativa, contábil e tributária." },
    { title: "Dashboard de consumo", text: "Créditos corporativos, solicitações abertas, centros de custo e histórico." },
    { title: "SLA e priorização", text: "Resposta rápida para operação crítica." },
    { title: "Gestão por filial", text: "Organize lojas, escritórios, depósitos, condomínios e responsáveis internos." },
    { title: "Relatórios mensais", text: "Controle de manutenções, gastos e fornecedores." },
    { title: "Terceirização controlada", text: "Contrate serviços sem aumentar a carga operacional permanente." },
  ],
  formEyebrow: "Solicitação empresa",
  formTitle: "Conte-nos sobre sua operação.",
  formText: "Receberemos a solicitação com dados de contato, filiais, centros de custo e plano objetivo para preparar uma conta corporativa.",
  formImgAlt: "Equipe técnica trabalhando em uma empresa",
};

const fr: EmpresasLocaleContent = {
  heroRequestAccount: "Demander un compte entreprise",
  heroTalkSales: "Parler aux ventes",
  casesEyebrow: "Cas d'usage",
  casesTitle: "Un réseau pour chaque type d'opération.",
  continuityEyebrow: "Continuité opérationnelle",
  continuityTitle: "Centralisez vos entretiens et payez avec des crédits d'entreprise.",
  continuityText: "Réduisez la charge administrative, organisez les prestataires externes, contrôlez la consommation par site et préparez la traçabilité pour une facturation mensuelle consolidée.",
  dashboardTitle: "Tableau de bord entreprise",
  dashboardExample: "Vue d'exemple",
  mCredits: "Crédits",
  mUsed: "Utilisés",
  mResponse: "Réponse",
  mBranches: "Agences",
  creditsHelp: "Comment fonctionnent les crédits ? (1 crédit = 1 000 $ CLP)",
  plansEyebrow: "Formules entreprise",
  plansTitle: "Abonnement mensuel fixe + pack de crédits.",
  plansLead: "Conçu pour les entreprises qui ont besoin de réactivité opérationnelle, de crédits d'entreprise, de contrôle par centre de coûts, de documentation et de traçabilité.",
  features: [
    { title: "Facturation et traçabilité", text: "Documentation prête pour la revue administrative, comptable et fiscale." },
    { title: "Tableau de bord de consommation", text: "Crédits d'entreprise, demandes ouvertes, centres de coûts et historique." },
    { title: "SLA et priorisation", text: "Réponse rapide pour les opérations critiques." },
    { title: "Gestion par site", text: "Organisez locaux, bureaux, entrepôts, copropriétés et responsables internes." },
    { title: "Rapports mensuels", text: "Contrôle des entretiens, dépenses et prestataires." },
    { title: "Externalisation maîtrisée", text: "Sous-traitez des services sans alourdir la charge opérationnelle permanente." },
  ],
  formEyebrow: "Demande entreprise",
  formTitle: "Parlez-nous de votre opération.",
  formText: "Nous recevrons la demande avec les coordonnées, les sites, les centres de coûts et la formule cible pour préparer un compte entreprise.",
  formImgAlt: "Équipe technique travaillant dans une entreprise",
};

const de: EmpresasLocaleContent = {
  heroRequestAccount: "Firmenkonto anfragen",
  heroTalkSales: "Mit dem Vertrieb sprechen",
  casesEyebrow: "Anwendungsfälle",
  casesTitle: "Ein Netzwerk für jede Art von Betrieb.",
  continuityEyebrow: "Betriebskontinuität",
  continuityTitle: "Zentralisiere deine Wartungen und zahle mit Firmen-Credits.",
  continuityText: "Reduziere den Verwaltungsaufwand, ordne externe Anbieter, steuere den Verbrauch pro Filiale und bereite Nachverfolgbarkeit für die konsolidierte monatliche Abrechnung vor.",
  dashboardTitle: "Unternehmens-Dashboard",
  dashboardExample: "Beispielansicht",
  mCredits: "Credits",
  mUsed: "Genutzt",
  mResponse: "Antwort",
  mBranches: "Filialen",
  creditsHelp: "Wie funktionieren Credits? (1 Credit = 1.000 $ CLP)",
  plansEyebrow: "Unternehmenspläne",
  plansTitle: "Feste monatliche Mitgliedschaft + Credit-Paket.",
  plansLead: "Konzipiert für Unternehmen, die operative Reaktionsfähigkeit, Firmen-Credits, Kostenstellen-Kontrolle, Dokumentation und Nachverfolgbarkeit brauchen.",
  features: [
    { title: "Abrechnung und Nachverfolgbarkeit", text: "Dokumentation bereit für administrative, buchhalterische und steuerliche Prüfung." },
    { title: "Verbrauchs-Dashboard", text: "Firmen-Credits, offene Anfragen, Kostenstellen und Verlauf." },
    { title: "SLA und Priorisierung", text: "Schnelle Antwort für kritischen Betrieb." },
    { title: "Verwaltung pro Filiale", text: "Ordne Standorte, Büros, Lager, Gemeinschaften und interne Verantwortliche." },
    { title: "Monatliche Berichte", text: "Kontrolle von Wartungen, Ausgaben und Anbietern." },
    { title: "Kontrolliertes Outsourcing", text: "Beauftrage Leistungen ohne dauerhaft höhere Betriebslast." },
  ],
  formEyebrow: "Unternehmensanfrage",
  formTitle: "Erzähl uns von deinem Betrieb.",
  formText: "Wir erhalten die Anfrage mit Kontaktdaten, Filialen, Kostenstellen und Zielplan, um ein Firmenkonto vorzubereiten.",
  formImgAlt: "Technikteam bei der Arbeit in einem Unternehmen",
};

const it: EmpresasLocaleContent = {
  heroRequestAccount: "Richiedi account azienda",
  heroTalkSales: "Parla con le vendite",
  casesEyebrow: "Casi d'uso",
  casesTitle: "Una rete per ogni tipo di operazione.",
  continuityEyebrow: "Continuità operativa",
  continuityTitle: "Centralizza le tue manutenzioni e paga con crediti aziendali.",
  continuityText: "Riduci il carico amministrativo, organizza i fornitori esterni, controlla il consumo per filiale e prepara la tracciabilità per la fatturazione mensile consolidata.",
  dashboardTitle: "Dashboard azienda",
  dashboardExample: "Vista di esempio",
  mCredits: "Crediti",
  mUsed: "Usati",
  mResponse: "Risposta",
  mBranches: "Filiali",
  creditsHelp: "Come funzionano i crediti? (1 credito = $1.000)",
  plansEyebrow: "Piani azienda",
  plansTitle: "Abbonamento mensile fisso + pacchetto di crediti.",
  plansLead: "Pensato per aziende che necessitano di risposta operativa, crediti aziendali, controllo per centro di costo, documentazione e tracciabilità.",
  features: [
    { title: "Fatturazione e tracciabilità", text: "Documentazione pronta per revisione amministrativa, contabile e fiscale." },
    { title: "Dashboard dei consumi", text: "Crediti aziendali, richieste aperte, centri di costo e cronologia." },
    { title: "SLA e prioritizzazione", text: "Risposta rapida per operazioni critiche." },
    { title: "Gestione per filiale", text: "Organizza locali, uffici, magazzini, condomini e responsabili interni." },
    { title: "Report mensili", text: "Controllo di manutenzioni, spese e fornitori." },
    { title: "Esternalizzazione controllata", text: "Affida servizi senza aumentare il carico operativo permanente." },
  ],
  formEyebrow: "Richiesta azienda",
  formTitle: "Raccontaci la tua operazione.",
  formText: "Riceveremo la richiesta con dati di contatto, filiali, centri di costo e piano obiettivo per preparare un account aziendale.",
  formImgAlt: "Team tecnico al lavoro in un'azienda",
};

export const empresasContent: Record<Locale, EmpresasLocaleContent> = { es, en, pt, fr, de, it };
