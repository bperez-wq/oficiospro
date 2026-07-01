import type { Locale } from "@/lib/i18n/config";

export type ClubFaqItem = { question: string; answer: string };

export type ClubHogarLocaleContent = {
  heroUseCredits: string;
  heroCreateAccount: string;
  heroCreditsHelp: string;
  railEyebrow: string;
  railTitle: string;
  railText: string;
  railMonthlyLabel: string;
  railAccumLabel: string;
  railAccumValue: string;
  railAccumDetail: string;
  railSavingLabel: string;
  railSavingDetail: string;
  railImageAlt: string;
  noSubChip: string;
  noSubTitle: string;
  noSubText: string;
  buyCredits: string;
  withClubChip: string;
  withClubTitle: string; // uses {n}
  withClubText: string;
  choosePlan: string;
  comparisonServices: string[]; // 4, paired with fixed credits in component
  simEyebrow: string;
  simTitle: string; // uses {plan} {n}
  simText: string; // uses {price} {n}? -> {price}
  simMonths: string[]; // 1 mes, 3 meses, 6 meses, 12 meses
  creditsUnit: string; // "créditos"
  simNote: string;
  includesTitle: string;
  includesItems: string[]; // 6
  casesEyebrow: string;
  casesTitle: string;
  caseRanges: { credits: string; text: string }[]; // 3
  casesNote: string;
  historyEyebrow: string;
  historyTitle: string;
  historyText: string;
  faqEyebrow: string;
  faqTitle: string;
  faq: ClubFaqItem[];
};

const es: ClubHogarLocaleContent = {
  heroUseCredits: "Usar créditos",
  heroCreateAccount: "Crear cuenta",
  heroCreditsHelp: "¿Cómo funcionan los créditos?",
  railEyebrow: "Uso cotidiano",
  railTitle: "Créditos listos para resolver sin volver a cotizar desde cero.",
  railText: "La experiencia se entiende como saldo, retención protegida y respaldo de cada servicio cerrado.",
  railMonthlyLabel: "Carga mensual",
  railAccumLabel: "Acumulación",
  railAccumValue: "Acumulables",
  railAccumDetail: "Según plan vigente",
  railSavingLabel: "Ahorro Club",
  railSavingDetail: "Por solicitud elegible",
  railImageAlt: "Especialista revisando un calefont a domicilio",
  noSubChip: "Sin suscripción",
  noSubTitle: "Compra créditos puntuales",
  noSubText: "Pagas precio normal en cada solicitud. Útil para arreglos esporádicos.",
  buyCredits: "Comprar créditos",
  withClubChip: "Con Club Hogar",
  withClubTitle: "Ahorra {n} créditos en cada solicitud",
  withClubText: "Carga mensual acumulable + descuento por solicitud + atención prioritaria.",
  choosePlan: "Elegir plan",
  comparisonServices: ["Mantención calefont", "Filtración (gasfitería)", "Revisión eléctrica", "Jardín puesta a punto"],
  simEyebrow: "Simulador visual",
  simTitle: "Con {plan}, acumulas {n} créditos cada mes.",
  simText: "Por {price}/mes cargas saldo disponible en créditos para planificar visitas, diagnósticos y mantenciones sin partir desde cero cada vez.",
  simMonths: ["1 mes", "3 meses", "6 meses", "12 meses"],
  creditsUnit: "créditos",
  simNote: "Renovación automática mensual. Los créditos quedan sujetos a términos de vigencia, uso, retención y devolución.",
  includesTitle: "Lo que incluye Club Hogar",
  includesItems: [
    "Créditos acumulables según plan vigente",
    "Saldo disponible para servicios",
    "Créditos retenidos hasta cerrar el servicio",
    "Pago protegido",
    "Historial de uso",
    "Garantía OficiosPro",
  ],
  casesEyebrow: "Casos de uso",
  casesTitle: "Problemas reales que puedes resolver con créditos.",
  caseRanges: [
    { credits: "6-12 cr", text: "Ajustes simples y revisiones menores" },
    { credits: "18-30 cr", text: "Visitas, diagnósticos y reparaciones frecuentes" },
    { credits: "40-60 cr", text: "Mantenciones completas o servicios técnicos" },
  ],
  casesNote: "Trabajos de ejemplo del set del proyecto; se reemplazan por casos reales al publicar.",
  historyEyebrow: "Historial de créditos",
  historyTitle: "Movimientos de créditos",
  historyText: "El historial separa cargas, usos, retenciones y devoluciones para que el saldo se entienda antes y después de cada servicio.",
  faqEyebrow: "Preguntas frecuentes",
  faqTitle: "Lo que más se pregunta sobre créditos.",
  faq: [
    { question: "¿Qué pasa si no uso mis créditos este mes?", answer: "Se acumulan según el plan vigente y quedan disponibles como saldo para próximas mantenciones, sujetos a los términos de vigencia y uso." },
    { question: "¿Puedo comprar créditos sin suscribirme?", answer: "Sí. Puedes comprar bolsas puntuales de créditos en el checkout y usarlas igual que un suscriptor, pero sin el descuento de 2 créditos por solicitud." },
    { question: "¿Cómo funciona el descuento de 2 créditos?", answer: "En cada solicitud elegible (servicios fijos, visitas y solicitudes base) los suscriptores Club Hogar pagan 2 créditos menos que el precio normal." },
    { question: "¿Qué pasa con mis créditos al reservar?", answer: "Quedan retenidos como pago protegido: solo se liberan al especialista cuando confirmas el avance o cierre del trabajo." },
    { question: "¿Puedo cancelar la suscripción?", answer: "Sí, la renovación es mensual y puedes pausar o cancelar. Tus créditos ya cargados siguen las condiciones de vigencia del plan." },
  ],
};

const en: ClubHogarLocaleContent = {
  heroUseCredits: "Use credits",
  heroCreateAccount: "Create account",
  heroCreditsHelp: "How do credits work?",
  railEyebrow: "Everyday use",
  railTitle: "Credits ready to solve things without quoting from scratch again.",
  railText: "Think of it as balance, protected holding and backup for every completed service.",
  railMonthlyLabel: "Monthly load",
  railAccumLabel: "Accumulation",
  railAccumValue: "Roll over",
  railAccumDetail: "According to active plan",
  railSavingLabel: "Club saving",
  railSavingDetail: "Per eligible request",
  railImageAlt: "Specialist checking a water heater at home",
  noSubChip: "No subscription",
  noSubTitle: "Buy one-off credits",
  noSubText: "You pay the standard price on each request. Handy for occasional fixes.",
  buyCredits: "Buy credits",
  withClubChip: "With Home Club",
  withClubTitle: "Save {n} credits on every request",
  withClubText: "Accumulable monthly load + per-request discount + priority attention.",
  choosePlan: "Choose plan",
  comparisonServices: ["Water heater service", "Leak (plumbing)", "Electrical check", "Garden tune-up"],
  simEyebrow: "Visual simulator",
  simTitle: "With {plan}, you accumulate {n} credits every month.",
  simText: "For {price}/month you load available balance in credits to plan visits, diagnoses and maintenance without starting from scratch each time.",
  simMonths: ["1 month", "3 months", "6 months", "12 months"],
  creditsUnit: "credits",
  simNote: "Automatic monthly renewal. Credits are subject to validity, use, holding and refund terms.",
  includesTitle: "What Home Club includes",
  includesItems: [
    "Credits that roll over per active plan",
    "Balance available for services",
    "Credits held until the service closes",
    "Protected payment",
    "Usage history",
    "OficiosPro guarantee",
  ],
  casesEyebrow: "Use cases",
  casesTitle: "Real problems you can solve with credits.",
  caseRanges: [
    { credits: "6-12 cr", text: "Simple adjustments and minor checks" },
    { credits: "18-30 cr", text: "Visits, diagnoses and frequent repairs" },
    { credits: "40-60 cr", text: "Full maintenance or technical services" },
  ],
  casesNote: "Example jobs from the project set; replaced by real cases at launch.",
  historyEyebrow: "Credit history",
  historyTitle: "Credit movements",
  historyText: "The history separates loads, uses, holds and refunds so the balance is clear before and after each service.",
  faqEyebrow: "Frequent questions",
  faqTitle: "What people ask most about credits.",
  faq: [
    { question: "What if I don't use my credits this month?", answer: "They accumulate per the active plan and stay available as balance for future maintenance, subject to validity and use terms." },
    { question: "Can I buy credits without subscribing?", answer: "Yes. You can buy one-off credit packs at checkout and use them like a subscriber, but without the 2-credit per-request discount." },
    { question: "How does the 2-credit discount work?", answer: "On each eligible request (fixed services, visits and base requests) Home Club subscribers pay 2 credits less than the standard price." },
    { question: "What happens to my credits when I book?", answer: "They're held as protected payment: released to the specialist only when you confirm progress or closing of the job." },
    { question: "Can I cancel the subscription?", answer: "Yes, renewal is monthly and you can pause or cancel. Credits already loaded follow the plan's validity conditions." },
  ],
};

const pt: ClubHogarLocaleContent = {
  heroUseCredits: "Usar créditos",
  heroCreateAccount: "Criar conta",
  heroCreditsHelp: "Como funcionam os créditos?",
  railEyebrow: "Uso cotidiano",
  railTitle: "Créditos prontos para resolver sem orçar do zero de novo.",
  railText: "A experiência se entende como saldo, retenção protegida e respaldo de cada serviço concluído.",
  railMonthlyLabel: "Carga mensal",
  railAccumLabel: "Acumulação",
  railAccumValue: "Acumuláveis",
  railAccumDetail: "Conforme plano vigente",
  railSavingLabel: "Economia Club",
  railSavingDetail: "Por solicitação elegível",
  railImageAlt: "Especialista revisando um aquecedor a domicílio",
  noSubChip: "Sem assinatura",
  noSubTitle: "Compre créditos avulsos",
  noSubText: "Você paga o preço normal em cada solicitação. Útil para consertos esporádicos.",
  buyCredits: "Comprar créditos",
  withClubChip: "Com Club Hogar",
  withClubTitle: "Economize {n} créditos em cada solicitação",
  withClubText: "Carga mensal acumulável + desconto por solicitação + atendimento prioritário.",
  choosePlan: "Escolher plano",
  comparisonServices: ["Manutenção de aquecedor", "Vazamento (encanamento)", "Revisão elétrica", "Jardim em dia"],
  simEyebrow: "Simulador visual",
  simTitle: "Com {plan}, você acumula {n} créditos por mês.",
  simText: "Por {price}/mês você carrega saldo disponível em créditos para planejar visitas, diagnósticos e manutenções sem começar do zero toda vez.",
  simMonths: ["1 mês", "3 meses", "6 meses", "12 meses"],
  creditsUnit: "créditos",
  simNote: "Renovação automática mensal. Os créditos ficam sujeitos a termos de validade, uso, retenção e devolução.",
  includesTitle: "O que o Club Hogar inclui",
  includesItems: [
    "Créditos acumuláveis conforme plano vigente",
    "Saldo disponível para serviços",
    "Créditos retidos até fechar o serviço",
    "Pagamento protegido",
    "Histórico de uso",
    "Garantia OficiosPro",
  ],
  casesEyebrow: "Casos de uso",
  casesTitle: "Problemas reais que você pode resolver com créditos.",
  caseRanges: [
    { credits: "6-12 cr", text: "Ajustes simples e revisões menores" },
    { credits: "18-30 cr", text: "Visitas, diagnósticos e reparos frequentes" },
    { credits: "40-60 cr", text: "Manutenções completas ou serviços técnicos" },
  ],
  casesNote: "Trabalhos de exemplo do conjunto do projeto; substituídos por casos reais ao publicar.",
  historyEyebrow: "Histórico de créditos",
  historyTitle: "Movimentações de créditos",
  historyText: "O histórico separa cargas, usos, retenções e devoluções para que o saldo seja claro antes e depois de cada serviço.",
  faqEyebrow: "Perguntas frequentes",
  faqTitle: "O que mais se pergunta sobre créditos.",
  faq: [
    { question: "O que acontece se eu não usar meus créditos este mês?", answer: "Acumulam conforme o plano vigente e ficam disponíveis como saldo para próximas manutenções, sujeitos aos termos de validade e uso." },
    { question: "Posso comprar créditos sem assinar?", answer: "Sim. Você pode comprar pacotes avulsos de créditos no checkout e usá-los como um assinante, mas sem o desconto de 2 créditos por solicitação." },
    { question: "Como funciona o desconto de 2 créditos?", answer: "Em cada solicitação elegível (serviços fixos, visitas e solicitações base) os assinantes Club Hogar pagam 2 créditos a menos que o preço normal." },
    { question: "O que acontece com meus créditos ao reservar?", answer: "Ficam retidos como pagamento protegido: só são liberados ao especialista quando você confirma o avanço ou fechamento do trabalho." },
    { question: "Posso cancelar a assinatura?", answer: "Sim, a renovação é mensal e você pode pausar ou cancelar. Os créditos já carregados seguem as condições de validade do plano." },
  ],
};

const fr: ClubHogarLocaleContent = {
  heroUseCredits: "Utiliser des crédits",
  heroCreateAccount: "Créer un compte",
  heroCreditsHelp: "Comment fonctionnent les crédits ?",
  railEyebrow: "Usage quotidien",
  railTitle: "Des crédits prêts à résoudre sans redevis à chaque fois.",
  railText: "À comprendre comme un solde, une rétention protégée et une garantie pour chaque service terminé.",
  railMonthlyLabel: "Recharge mensuelle",
  railAccumLabel: "Cumul",
  railAccumValue: "Cumulables",
  railAccumDetail: "Selon la formule active",
  railSavingLabel: "Économie Club",
  railSavingDetail: "Par demande éligible",
  railImageAlt: "Spécialiste vérifiant un chauffe-eau à domicile",
  noSubChip: "Sans abonnement",
  noSubTitle: "Achetez des crédits ponctuels",
  noSubText: "Vous payez le prix standard à chaque demande. Pratique pour les réparations occasionnelles.",
  buyCredits: "Acheter des crédits",
  withClubChip: "Avec le Club Maison",
  withClubTitle: "Économisez {n} crédits sur chaque demande",
  withClubText: "Recharge mensuelle cumulable + remise par demande + attention prioritaire.",
  choosePlan: "Choisir la formule",
  comparisonServices: ["Entretien chauffe-eau", "Fuite (plomberie)", "Contrôle électrique", "Remise en état du jardin"],
  simEyebrow: "Simulateur visuel",
  simTitle: "Avec {plan}, vous cumulez {n} crédits chaque mois.",
  simText: "Pour {price}/mois vous chargez un solde disponible en crédits pour planifier visites, diagnostics et entretiens sans repartir de zéro à chaque fois.",
  simMonths: ["1 mois", "3 mois", "6 mois", "12 mois"],
  creditsUnit: "crédits",
  simNote: "Renouvellement automatique mensuel. Les crédits sont soumis aux conditions de validité, d'utilisation, de rétention et de remboursement.",
  includesTitle: "Ce que comprend le Club Maison",
  includesItems: [
    "Crédits cumulables selon la formule active",
    "Solde disponible pour les services",
    "Crédits retenus jusqu'à la clôture du service",
    "Paiement protégé",
    "Historique d'utilisation",
    "Garantie OficiosPro",
  ],
  casesEyebrow: "Cas d'usage",
  casesTitle: "De vrais problèmes que vous pouvez résoudre avec des crédits.",
  caseRanges: [
    { credits: "6-12 cr", text: "Ajustements simples et contrôles mineurs" },
    { credits: "18-30 cr", text: "Visites, diagnostics et réparations fréquentes" },
    { credits: "40-60 cr", text: "Entretiens complets ou services techniques" },
  ],
  casesNote: "Exemples de travaux du jeu du projet ; remplacés par de vrais cas à la publication.",
  historyEyebrow: "Historique des crédits",
  historyTitle: "Mouvements de crédits",
  historyText: "L'historique sépare recharges, utilisations, rétentions et remboursements pour que le solde soit clair avant et après chaque service.",
  faqEyebrow: "Questions fréquentes",
  faqTitle: "Ce qu'on demande le plus sur les crédits.",
  faq: [
    { question: "Que se passe-t-il si je n'utilise pas mes crédits ce mois-ci ?", answer: "Ils se cumulent selon la formule active et restent disponibles comme solde pour de futurs entretiens, sous réserve des conditions de validité et d'utilisation." },
    { question: "Puis-je acheter des crédits sans m'abonner ?", answer: "Oui. Vous pouvez acheter des packs ponctuels de crédits au paiement et les utiliser comme un abonné, mais sans la remise de 2 crédits par demande." },
    { question: "Comment fonctionne la remise de 2 crédits ?", answer: "Sur chaque demande éligible (services fixes, visites et demandes de base) les abonnés Club Maison paient 2 crédits de moins que le prix standard." },
    { question: "Qu'arrive-t-il à mes crédits lors de la réservation ?", answer: "Ils sont retenus comme paiement protégé : libérés au spécialiste seulement quand vous confirmez l'avancement ou la clôture du travail." },
    { question: "Puis-je annuler l'abonnement ?", answer: "Oui, le renouvellement est mensuel et vous pouvez suspendre ou annuler. Les crédits déjà chargés suivent les conditions de validité de la formule." },
  ],
};

const de: ClubHogarLocaleContent = {
  heroUseCredits: "Credits nutzen",
  heroCreateAccount: "Konto erstellen",
  heroCreditsHelp: "Wie funktionieren Credits?",
  railEyebrow: "Alltagsnutzung",
  railTitle: "Credits, die bereitstehen, ohne jedes Mal neu zu kalkulieren.",
  railText: "Zu verstehen als Guthaben, geschützte Reservierung und Absicherung für jede abgeschlossene Leistung.",
  railMonthlyLabel: "Monatliche Aufladung",
  railAccumLabel: "Ansammlung",
  railAccumValue: "Übertragbar",
  railAccumDetail: "Je nach aktivem Plan",
  railSavingLabel: "Club-Ersparnis",
  railSavingDetail: "Pro berechtigter Anfrage",
  railImageAlt: "Fachkraft prüft einen Durchlauferhitzer zu Hause",
  noSubChip: "Ohne Abo",
  noSubTitle: "Einzelne Credits kaufen",
  noSubText: "Du zahlst den Standardpreis bei jeder Anfrage. Praktisch für gelegentliche Reparaturen.",
  buyCredits: "Credits kaufen",
  withClubChip: "Mit Haus-Club",
  withClubTitle: "Spare {n} Credits bei jeder Anfrage",
  withClubText: "Übertragbare monatliche Aufladung + Rabatt pro Anfrage + bevorzugte Betreuung.",
  choosePlan: "Plan wählen",
  comparisonServices: ["Wartung Durchlauferhitzer", "Leck (Installation)", "Elektro-Check", "Garten-Auffrischung"],
  simEyebrow: "Visueller Simulator",
  simTitle: "Mit {plan} sammelst du jeden Monat {n} Credits.",
  simText: "Für {price}/Monat lädst du verfügbares Guthaben in Credits, um Besuche, Diagnosen und Wartungen zu planen, ohne jedes Mal von vorn zu beginnen.",
  simMonths: ["1 Monat", "3 Monate", "6 Monate", "12 Monate"],
  creditsUnit: "Credits",
  simNote: "Automatische monatliche Verlängerung. Credits unterliegen den Bedingungen zu Gültigkeit, Nutzung, Reservierung und Rückerstattung.",
  includesTitle: "Was der Haus-Club enthält",
  includesItems: [
    "Übertragbare Credits je aktivem Plan",
    "Verfügbares Guthaben für Leistungen",
    "Credits reserviert bis zum Abschluss der Leistung",
    "Geschützte Zahlung",
    "Nutzungsverlauf",
    "OficiosPro-Garantie",
  ],
  casesEyebrow: "Anwendungsfälle",
  casesTitle: "Echte Probleme, die du mit Credits lösen kannst.",
  caseRanges: [
    { credits: "6-12 cr", text: "Einfache Anpassungen und kleine Prüfungen" },
    { credits: "18-30 cr", text: "Besuche, Diagnosen und häufige Reparaturen" },
    { credits: "40-60 cr", text: "Komplette Wartungen oder technische Leistungen" },
  ],
  casesNote: "Beispielarbeiten aus dem Projekt-Set; werden bei Veröffentlichung durch echte Fälle ersetzt.",
  historyEyebrow: "Credit-Verlauf",
  historyTitle: "Credit-Bewegungen",
  historyText: "Der Verlauf trennt Aufladungen, Nutzungen, Reservierungen und Rückerstattungen, damit das Guthaben vor und nach jeder Leistung klar ist.",
  faqEyebrow: "Häufige Fragen",
  faqTitle: "Was am meisten zu Credits gefragt wird.",
  faq: [
    { question: "Was passiert, wenn ich meine Credits diesen Monat nicht nutze?", answer: "Sie sammeln sich je nach aktivem Plan an und bleiben als Guthaben für künftige Wartungen verfügbar, vorbehaltlich der Gültigkeits- und Nutzungsbedingungen." },
    { question: "Kann ich Credits ohne Abo kaufen?", answer: "Ja. Du kannst einzelne Credit-Pakete an der Kasse kaufen und wie ein Abonnent nutzen, aber ohne den Rabatt von 2 Credits pro Anfrage." },
    { question: "Wie funktioniert der 2-Credit-Rabatt?", answer: "Bei jeder berechtigten Anfrage (feste Leistungen, Besuche und Basisanfragen) zahlen Haus-Club-Abonnenten 2 Credits weniger als den Standardpreis." },
    { question: "Was passiert mit meinen Credits bei der Buchung?", answer: "Sie werden als geschützte Zahlung reserviert: an die Fachkraft erst freigegeben, wenn du den Fortschritt oder Abschluss der Arbeit bestätigst." },
    { question: "Kann ich das Abo kündigen?", answer: "Ja, die Verlängerung ist monatlich und du kannst pausieren oder kündigen. Bereits geladene Credits folgen den Gültigkeitsbedingungen des Plans." },
  ],
};

const it: ClubHogarLocaleContent = {
  heroUseCredits: "Usare i crediti",
  heroCreateAccount: "Crea account",
  heroCreditsHelp: "Come funzionano i crediti?",
  railEyebrow: "Uso quotidiano",
  railTitle: "Crediti pronti a risolvere senza rifare il preventivo ogni volta.",
  railText: "Da intendere come saldo, trattenuta protetta e garanzia per ogni servizio concluso.",
  railMonthlyLabel: "Ricarica mensile",
  railAccumLabel: "Accumulo",
  railAccumValue: "Cumulabili",
  railAccumDetail: "Secondo il piano attivo",
  railSavingLabel: "Risparmio Club",
  railSavingDetail: "Per richiesta idonea",
  railImageAlt: "Specialista che controlla uno scaldabagno a domicilio",
  noSubChip: "Senza abbonamento",
  noSubTitle: "Acquista crediti singoli",
  noSubText: "Paghi il prezzo normale a ogni richiesta. Utile per riparazioni sporadiche.",
  buyCredits: "Acquista crediti",
  withClubChip: "Con il Club Casa",
  withClubTitle: "Risparmia {n} crediti su ogni richiesta",
  withClubText: "Ricarica mensile cumulabile + sconto per richiesta + attenzione prioritaria.",
  choosePlan: "Scegli il piano",
  comparisonServices: ["Manutenzione scaldabagno", "Perdita (idraulica)", "Revisione elettrica", "Giardino in ordine"],
  simEyebrow: "Simulatore visivo",
  simTitle: "Con {plan}, accumuli {n} crediti ogni mese.",
  simText: "Per {price}/mese carichi saldo disponibile in crediti per pianificare visite, diagnosi e manutenzioni senza ripartire da zero ogni volta.",
  simMonths: ["1 mese", "3 mesi", "6 mesi", "12 mesi"],
  creditsUnit: "crediti",
  simNote: "Rinnovo automatico mensile. I crediti sono soggetti a termini di validità, uso, trattenuta e rimborso.",
  includesTitle: "Cosa include il Club Casa",
  includesItems: [
    "Crediti cumulabili secondo il piano attivo",
    "Saldo disponibile per i servizi",
    "Crediti trattenuti fino alla chiusura del servizio",
    "Pagamento protetto",
    "Cronologia d'uso",
    "Garanzia OficiosPro",
  ],
  casesEyebrow: "Casi d'uso",
  casesTitle: "Problemi reali che puoi risolvere con i crediti.",
  caseRanges: [
    { credits: "6-12 cr", text: "Regolazioni semplici e controlli minori" },
    { credits: "18-30 cr", text: "Visite, diagnosi e riparazioni frequenti" },
    { credits: "40-60 cr", text: "Manutenzioni complete o servizi tecnici" },
  ],
  casesNote: "Lavori di esempio del set del progetto; sostituiti da casi reali alla pubblicazione.",
  historyEyebrow: "Cronologia crediti",
  historyTitle: "Movimenti di crediti",
  historyText: "La cronologia separa ricariche, usi, trattenute e rimborsi così il saldo è chiaro prima e dopo ogni servizio.",
  faqEyebrow: "Domande frequenti",
  faqTitle: "Ciò che si chiede di più sui crediti.",
  faq: [
    { question: "Cosa succede se non uso i miei crediti questo mese?", answer: "Si accumulano secondo il piano attivo e restano disponibili come saldo per future manutenzioni, soggetti ai termini di validità e uso." },
    { question: "Posso acquistare crediti senza abbonarmi?", answer: "Sì. Puoi acquistare pacchetti singoli di crediti al checkout e usarli come un abbonato, ma senza lo sconto di 2 crediti per richiesta." },
    { question: "Come funziona lo sconto di 2 crediti?", answer: "Su ogni richiesta idonea (servizi fissi, visite e richieste base) gli abbonati Club Casa pagano 2 crediti in meno del prezzo normale." },
    { question: "Cosa succede ai miei crediti quando prenoto?", answer: "Restano trattenuti come pagamento protetto: rilasciati allo specialista solo quando confermi l'avanzamento o la chiusura del lavoro." },
    { question: "Posso annullare l'abbonamento?", answer: "Sì, il rinnovo è mensile e puoi mettere in pausa o annullare. I crediti già caricati seguono le condizioni di validità del piano." },
  ],
};

export const clubHogarContent: Record<Locale, ClubHogarLocaleContent> = { es, en, pt, fr, de, it };
