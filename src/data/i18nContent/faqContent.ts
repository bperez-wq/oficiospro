import type { Locale } from "@/lib/i18n/config";

export type FaqItem = { segment: string; question: string; answer: string };

export type FaqLocaleContent = {
  creditsEyebrow: string;
  creditsTitle: string;
  creditsIntro: string;
  generalEyebrow: string;
  generalTitle: string;
  creditQuestions: FaqItem[];
  generalQuestions: FaqItem[];
};

const es: FaqLocaleContent = {
  creditsEyebrow: "Sistema de créditos",
  creditsTitle: "Cómo funcionan los créditos",
  creditsIntro:
    "Qué es un crédito, cómo se compran, cómo se usan y qué protección tienes ante problemas, disputas o trabajos no completados.",
  generalEyebrow: "General",
  generalTitle: "Otras preguntas frecuentes",
  creditQuestions: [
    { segment: "Créditos", question: "¿Qué es 1 crédito?", answer: "Un crédito es la unidad con la que se cobran los servicios dentro de OficiosPro. Cada servicio muestra su precio en créditos antes de reservar, así sabes el valor por adelantado y sin sorpresas." },
    { segment: "Créditos", question: "¿Cómo se compran los créditos?", answer: "Puedes adquirir créditos en paquetes desde el checkout, o acumularlos mes a mes con un plan como Club Hogar. El valor en pesos se muestra siempre antes de pagar." },
    { segment: "Créditos", question: "¿Cómo se usan?", answer: "Al reservar un servicio, los créditos correspondientes se retienen. Se liberan al especialista cuando el trabajo avanza o queda cerrado. Cualquier adicional requiere tu aprobación antes de cobrarse." },
    { segment: "Créditos", question: "¿Qué pasa si el trabajo no se completa?", answer: "Los créditos quedan protegidos: no se liberan al especialista si el servicio no se realiza. OficiosPro revisa cada caso de forma manual mientras se resuelve." },
    { segment: "Créditos", question: "¿Hay reembolsos o disputas?", answer: "Sí. Si hay un problema con el servicio, puedes abrir una disputa y el equipo OficiosPro la revisa. Mientras se resuelve, los créditos retenidos permanecen protegidos." },
    { segment: "Créditos", question: "¿Los créditos se acumulan o vencen?", answer: "Se acumulan mes a mes hasta un tope equivalente a 10 meses de tu plan (por ejemplo, 400 créditos en un plan de 40 mensuales). Dentro de ese tope se mantienen disponibles; al llegar al tope dejan de sumar, así que conviene usarlos al menos un par de veces al año." },
    { segment: "Club Hogar", question: "¿Qué ventaja dan los créditos en Club Hogar?", answer: "Club Hogar te permite acumular créditos mensuales y acceder a un valor preferente en créditos por servicio frente al precio normal, manteniendo la misma protección de pago." },
    { segment: "Empresas", question: "¿Cómo funcionan los créditos para empresas?", answer: "Las empresas pueden operar con planes y créditos según su volumen de mantenciones y sedes. Un ejecutivo revisa el caso para proponer la cobertura adecuada." },
  ],
  generalQuestions: [
    { segment: "Clientes", question: "¿La reserva queda confirmada automáticamente?", answer: "No. La solicitud queda pendiente de confirmación para que OficiosPro y el especialista revisen horario, comuna y detalle del trabajo. Te contactamos antes de cualquier cobro." },
    { segment: "Clientes", question: "¿Qué significa pago protegido?", answer: "Significa que tus créditos se retienen con trazabilidad y solo se liberan cuando el servicio avanza, evitando acuerdos poco claros fuera de la plataforma." },
    { segment: "Empresas", question: "¿Puedo solicitar cobertura para varias sedes?", answer: "Sí. Las empresas pueden indicar sucursales, comuna principal y tipo de mantención para evaluar un plan operativo." },
    { segment: "Especialistas", question: "¿Qué revisa OficiosPro para verificar un perfil?", answer: "Identidad, referencias, portafolio, cobertura, certificaciones cuando correspondan y claridad de servicios ofrecidos. La revisión la hace una persona del equipo." },
    { segment: "Especialistas", question: "¿La agenda ya bloquea horarios reales?", answer: "La agenda actual permite visualizar y bloquear disponibilidad de forma local, preparada para conectarse al backend definitivo." },
  ],
};

const en: FaqLocaleContent = {
  creditsEyebrow: "Credit system",
  creditsTitle: "How credits work",
  creditsIntro:
    "What a credit is, how you buy them, how they're used, and what protection you have against problems, disputes or unfinished jobs.",
  generalEyebrow: "General",
  generalTitle: "Other frequent questions",
  creditQuestions: [
    { segment: "Credits", question: "What is 1 credit?", answer: "A credit is the unit services are charged in inside OficiosPro. Every service shows its price in credits before you book, so you know the value upfront with no surprises." },
    { segment: "Credits", question: "How do you buy credits?", answer: "You can buy credits in packs at checkout, or accumulate them month to month with a plan like Home Club. The value in pesos is always shown before you pay." },
    { segment: "Credits", question: "How are they used?", answer: "When you book a service, the matching credits are held. They're released to the specialist as the job progresses or is completed. Any extra requires your approval before being charged." },
    { segment: "Credits", question: "What if the job isn't completed?", answer: "Credits stay protected: they aren't released to the specialist if the service isn't done. OficiosPro reviews each case manually while it's resolved." },
    { segment: "Credits", question: "Are there refunds or disputes?", answer: "Yes. If there's a problem with the service, you can open a dispute and the OficiosPro team reviews it. While it's resolved, the held credits stay protected." },
    { segment: "Credits", question: "Do credits roll over or expire?", answer: "They accumulate month to month up to a cap equal to 10 months of your plan (for example, 400 credits on a 40-per-month plan). Within that cap they stay available; once you hit the cap they stop adding up, so it's worth using them at least a couple of times a year." },
    { segment: "Home Club", question: "What advantage do credits give in Home Club?", answer: "Home Club lets you accumulate monthly credits and access a preferential credit value per service versus the standard price, keeping the same payment protection." },
    { segment: "Businesses", question: "How do credits work for businesses?", answer: "Businesses can operate with plans and credits based on their volume of maintenance jobs and locations. An account manager reviews the case to propose the right coverage." },
  ],
  generalQuestions: [
    { segment: "Customers", question: "Is the booking confirmed automatically?", answer: "No. The request stays pending confirmation so OficiosPro and the specialist can review schedule, district and job details. We contact you before any charge." },
    { segment: "Customers", question: "What does protected payment mean?", answer: "It means your credits are held with traceability and only released as the service progresses, avoiding unclear deals outside the platform." },
    { segment: "Businesses", question: "Can I request coverage for several locations?", answer: "Yes. Businesses can indicate branches, main district and type of maintenance to evaluate an operational plan." },
    { segment: "Specialists", question: "What does OficiosPro review to verify a profile?", answer: "Identity, references, portfolio, coverage, certifications where applicable, and clarity of the services offered. The review is done by a person on the team." },
    { segment: "Specialists", question: "Does the calendar already block real time slots?", answer: "The current calendar lets you view and block availability locally, ready to connect to the definitive backend." },
  ],
};

const pt: FaqLocaleContent = {
  creditsEyebrow: "Sistema de créditos",
  creditsTitle: "Como funcionam os créditos",
  creditsIntro:
    "O que é um crédito, como comprá-los, como são usados e que proteção você tem diante de problemas, disputas ou trabalhos não concluídos.",
  generalEyebrow: "Geral",
  generalTitle: "Outras perguntas frequentes",
  creditQuestions: [
    { segment: "Créditos", question: "O que é 1 crédito?", answer: "Um crédito é a unidade com que os serviços são cobrados dentro da OficiosPro. Cada serviço mostra o preço em créditos antes de reservar, então você sabe o valor com antecedência e sem surpresas." },
    { segment: "Créditos", question: "Como se compram os créditos?", answer: "Você pode adquirir créditos em pacotes no checkout, ou acumulá-los mês a mês com um plano como o Club Hogar. O valor em pesos é sempre mostrado antes de pagar." },
    { segment: "Créditos", question: "Como são usados?", answer: "Ao reservar um serviço, os créditos correspondentes ficam retidos. Eles são liberados ao especialista quando o trabalho avança ou é concluído. Qualquer adicional requer sua aprovação antes de ser cobrado." },
    { segment: "Créditos", question: "O que acontece se o trabalho não for concluído?", answer: "Os créditos ficam protegidos: não são liberados ao especialista se o serviço não for realizado. A OficiosPro revisa cada caso manualmente enquanto é resolvido." },
    { segment: "Créditos", question: "Há reembolsos ou disputas?", answer: "Sim. Se houver um problema com o serviço, você pode abrir uma disputa e a equipe OficiosPro a revisa. Enquanto é resolvida, os créditos retidos permanecem protegidos." },
    { segment: "Créditos", question: "Os créditos acumulam ou vencem?", answer: "Acumulam mês a mês até um teto equivalente a 10 meses do seu plano (por exemplo, 400 créditos em um plano de 40 mensais). Dentro desse teto ficam disponíveis; ao atingir o teto param de somar, então convém usá-los pelo menos algumas vezes por ano." },
    { segment: "Club Hogar", question: "Que vantagem dão os créditos no Club Hogar?", answer: "O Club Hogar permite acumular créditos mensais e acessar um valor preferencial em créditos por serviço em relação ao preço normal, mantendo a mesma proteção de pagamento." },
    { segment: "Empresas", question: "Como funcionam os créditos para empresas?", answer: "As empresas podem operar com planos e créditos conforme seu volume de manutenções e filiais. Um executivo revisa o caso para propor a cobertura adequada." },
  ],
  generalQuestions: [
    { segment: "Clientes", question: "A reserva fica confirmada automaticamente?", answer: "Não. A solicitação fica pendente de confirmação para que a OficiosPro e o especialista revisem horário, cidade e detalhe do trabalho. Entramos em contato antes de qualquer cobrança." },
    { segment: "Clientes", question: "O que significa pagamento protegido?", answer: "Significa que seus créditos ficam retidos com rastreabilidade e só são liberados conforme o serviço avança, evitando acordos pouco claros fora da plataforma." },
    { segment: "Empresas", question: "Posso solicitar cobertura para várias sedes?", answer: "Sim. As empresas podem indicar filiais, cidade principal e tipo de manutenção para avaliar um plano operacional." },
    { segment: "Especialistas", question: "O que a OficiosPro revisa para verificar um perfil?", answer: "Identidade, referências, portfólio, cobertura, certificações quando cabíveis e clareza dos serviços oferecidos. A revisão é feita por uma pessoa da equipe." },
    { segment: "Especialistas", question: "A agenda já bloqueia horários reais?", answer: "A agenda atual permite visualizar e bloquear a disponibilidade localmente, preparada para se conectar ao backend definitivo." },
  ],
};

const fr: FaqLocaleContent = {
  creditsEyebrow: "Système de crédits",
  creditsTitle: "Comment fonctionnent les crédits",
  creditsIntro:
    "Ce qu'est un crédit, comment les acheter, comment ils s'utilisent et quelle protection vous avez en cas de problème, de litige ou de travail non terminé.",
  generalEyebrow: "Général",
  generalTitle: "Autres questions fréquentes",
  creditQuestions: [
    { segment: "Crédits", question: "Qu'est-ce qu'un crédit ?", answer: "Un crédit est l'unité de facturation des services dans OficiosPro. Chaque service affiche son prix en crédits avant la réservation, vous connaissez donc la valeur à l'avance et sans surprise." },
    { segment: "Crédits", question: "Comment acheter des crédits ?", answer: "Vous pouvez acheter des crédits en packs au paiement, ou les cumuler mois après mois avec une formule comme le Club Maison. La valeur en pesos est toujours affichée avant de payer." },
    { segment: "Crédits", question: "Comment s'utilisent-ils ?", answer: "Lors de la réservation d'un service, les crédits correspondants sont retenus. Ils sont libérés au spécialiste à mesure que le travail avance ou se termine. Tout supplément nécessite votre approbation avant d'être facturé." },
    { segment: "Crédits", question: "Que se passe-t-il si le travail n'est pas terminé ?", answer: "Les crédits restent protégés : ils ne sont pas libérés au spécialiste si le service n'a pas lieu. OficiosPro examine chaque cas manuellement pendant sa résolution." },
    { segment: "Crédits", question: "Y a-t-il des remboursements ou des litiges ?", answer: "Oui. En cas de problème avec le service, vous pouvez ouvrir un litige que l'équipe OficiosPro examine. Pendant sa résolution, les crédits retenus restent protégés." },
    { segment: "Crédits", question: "Les crédits se cumulent-ils ou expirent-ils ?", answer: "Ils se cumulent mois après mois jusqu'à un plafond équivalent à 10 mois de votre formule (par exemple, 400 crédits pour une formule de 40 par mois). Dans cette limite ils restent disponibles ; une fois le plafond atteint ils cessent de s'ajouter, il vaut donc mieux les utiliser au moins deux fois par an." },
    { segment: "Club Maison", question: "Quel avantage donnent les crédits dans le Club Maison ?", answer: "Le Club Maison permet de cumuler des crédits mensuels et d'accéder à une valeur préférentielle en crédits par service par rapport au prix standard, avec la même protection de paiement." },
    { segment: "Entreprises", question: "Comment fonctionnent les crédits pour les entreprises ?", answer: "Les entreprises peuvent opérer avec des formules et des crédits selon leur volume d'entretiens et de sites. Un conseiller examine le cas pour proposer la couverture adaptée." },
  ],
  generalQuestions: [
    { segment: "Clients", question: "La réservation est-elle confirmée automatiquement ?", answer: "Non. La demande reste en attente de confirmation pour qu'OficiosPro et le spécialiste vérifient l'horaire, la ville et le détail du travail. Nous vous contactons avant tout paiement." },
    { segment: "Clients", question: "Que signifie paiement protégé ?", answer: "Cela signifie que vos crédits sont retenus avec traçabilité et libérés uniquement à mesure que le service avance, évitant les accords flous hors de la plateforme." },
    { segment: "Entreprises", question: "Puis-je demander une couverture pour plusieurs sites ?", answer: "Oui. Les entreprises peuvent indiquer les agences, la ville principale et le type d'entretien pour évaluer une formule opérationnelle." },
    { segment: "Spécialistes", question: "Que vérifie OficiosPro pour valider un profil ?", answer: "Identité, références, portfolio, couverture, certifications le cas échéant et clarté des services proposés. La vérification est faite par une personne de l'équipe." },
    { segment: "Spécialistes", question: "L'agenda bloque-t-il déjà de vrais créneaux ?", answer: "L'agenda actuel permet de visualiser et de bloquer la disponibilité localement, prêt à se connecter au backend définitif." },
  ],
};

const de: FaqLocaleContent = {
  creditsEyebrow: "Credit-System",
  creditsTitle: "Wie Credits funktionieren",
  creditsIntro:
    "Was ein Credit ist, wie man sie kauft, wie sie verwendet werden und welchen Schutz du bei Problemen, Streitfällen oder nicht abgeschlossenen Arbeiten hast.",
  generalEyebrow: "Allgemein",
  generalTitle: "Weitere häufige Fragen",
  creditQuestions: [
    { segment: "Credits", question: "Was ist 1 Credit?", answer: "Ein Credit ist die Einheit, in der Leistungen bei OficiosPro abgerechnet werden. Jede Leistung zeigt ihren Preis in Credits vor der Buchung, sodass du den Wert im Voraus und ohne Überraschungen kennst." },
    { segment: "Credits", question: "Wie kauft man Credits?", answer: "Du kannst Credits im Paket an der Kasse kaufen oder sie Monat für Monat mit einem Plan wie dem Haus-Club ansammeln. Der Wert in Pesos wird immer vor der Zahlung angezeigt." },
    { segment: "Credits", question: "Wie werden sie verwendet?", answer: "Bei der Buchung einer Leistung werden die entsprechenden Credits reserviert. Sie werden an die Fachkraft freigegeben, sobald die Arbeit fortschreitet oder abgeschlossen ist. Jeder Zusatz erfordert deine Freigabe vor der Berechnung." },
    { segment: "Credits", question: "Was passiert, wenn die Arbeit nicht abgeschlossen wird?", answer: "Die Credits bleiben geschützt: Sie werden nicht an die Fachkraft freigegeben, wenn die Leistung nicht erbracht wird. OficiosPro prüft jeden Fall manuell während der Klärung." },
    { segment: "Credits", question: "Gibt es Rückerstattungen oder Streitfälle?", answer: "Ja. Bei einem Problem mit der Leistung kannst du einen Streitfall eröffnen, den das OficiosPro-Team prüft. Während der Klärung bleiben die reservierten Credits geschützt." },
    { segment: "Credits", question: "Werden Credits übertragen oder verfallen sie?", answer: "Sie sammeln sich Monat für Monat bis zu einer Obergrenze von 10 Monaten deines Plans (zum Beispiel 400 Credits bei einem Plan mit 40 pro Monat). Innerhalb dieser Grenze bleiben sie verfügbar; ist die Grenze erreicht, sammeln sie sich nicht weiter an, daher lohnt es sich, sie mindestens ein paar Mal im Jahr zu nutzen." },
    { segment: "Haus-Club", question: "Welchen Vorteil bieten Credits im Haus-Club?", answer: "Der Haus-Club ermöglicht das Ansammeln monatlicher Credits und einen bevorzugten Credit-Wert pro Leistung gegenüber dem Standardpreis, bei gleichem Zahlungsschutz." },
    { segment: "Unternehmen", question: "Wie funktionieren Credits für Unternehmen?", answer: "Unternehmen können je nach Umfang ihrer Wartungen und Standorte mit Plänen und Credits arbeiten. Ein Kundenbetreuer prüft den Fall, um die passende Abdeckung vorzuschlagen." },
  ],
  generalQuestions: [
    { segment: "Kunden", question: "Wird die Buchung automatisch bestätigt?", answer: "Nein. Die Anfrage bleibt bis zur Bestätigung offen, damit OficiosPro und die Fachkraft Termin, Ort und Arbeitsdetails prüfen. Wir kontaktieren dich vor jeder Berechnung." },
    { segment: "Kunden", question: "Was bedeutet geschützte Zahlung?", answer: "Es bedeutet, dass deine Credits mit Nachverfolgbarkeit reserviert und nur freigegeben werden, während die Leistung fortschreitet, um unklare Absprachen außerhalb der Plattform zu vermeiden." },
    { segment: "Unternehmen", question: "Kann ich Abdeckung für mehrere Standorte anfragen?", answer: "Ja. Unternehmen können Filialen, Hauptstandort und Art der Wartung angeben, um einen operativen Plan zu bewerten." },
    { segment: "Fachkräfte", question: "Was prüft OficiosPro zur Verifizierung eines Profils?", answer: "Identität, Referenzen, Portfolio, Abdeckung, Zertifizierungen soweit zutreffend und Klarheit der angebotenen Leistungen. Die Prüfung übernimmt eine Person im Team." },
    { segment: "Fachkräfte", question: "Blockiert der Kalender bereits echte Zeitfenster?", answer: "Der aktuelle Kalender erlaubt das lokale Ansehen und Blockieren der Verfügbarkeit, bereit zur Anbindung an das endgültige Backend." },
  ],
};

const it: FaqLocaleContent = {
  creditsEyebrow: "Sistema di crediti",
  creditsTitle: "Come funzionano i crediti",
  creditsIntro:
    "Cos'è un credito, come acquistarli, come si usano e quale protezione hai in caso di problemi, contestazioni o lavori non completati.",
  generalEyebrow: "Generale",
  generalTitle: "Altre domande frequenti",
  creditQuestions: [
    { segment: "Crediti", question: "Cos'è 1 credito?", answer: "Un credito è l'unità con cui vengono addebitati i servizi all'interno di OficiosPro. Ogni servizio mostra il prezzo in crediti prima di prenotare, così conosci il valore in anticipo e senza sorprese." },
    { segment: "Crediti", question: "Come si acquistano i crediti?", answer: "Puoi acquistare crediti in pacchetti al checkout, oppure accumularli mese per mese con un piano come il Club Casa. Il valore in pesos viene sempre mostrato prima di pagare." },
    { segment: "Crediti", question: "Come si usano?", answer: "Quando prenoti un servizio, i crediti corrispondenti vengono trattenuti. Vengono rilasciati allo specialista man mano che il lavoro avanza o si conclude. Qualsiasi aggiuntivo richiede la tua approvazione prima di essere addebitato." },
    { segment: "Crediti", question: "Cosa succede se il lavoro non viene completato?", answer: "I crediti restano protetti: non vengono rilasciati allo specialista se il servizio non viene svolto. OficiosPro esamina ogni caso manualmente durante la risoluzione." },
    { segment: "Crediti", question: "Ci sono rimborsi o contestazioni?", answer: "Sì. In caso di problema con il servizio, puoi aprire una contestazione che il team OficiosPro esamina. Durante la risoluzione, i crediti trattenuti restano protetti." },
    { segment: "Crediti", question: "I crediti si accumulano o scadono?", answer: "Si accumulano mese per mese fino a un tetto pari a 10 mesi del tuo piano (per esempio, 400 crediti in un piano da 40 mensili). Entro quel tetto restano disponibili; una volta raggiunto il tetto smettono di sommarsi, quindi conviene usarli almeno un paio di volte l'anno." },
    { segment: "Club Casa", question: "Quale vantaggio danno i crediti nel Club Casa?", answer: "Il Club Casa consente di accumulare crediti mensili e di accedere a un valore preferenziale in crediti per servizio rispetto al prezzo normale, mantenendo la stessa protezione di pagamento." },
    { segment: "Aziende", question: "Come funzionano i crediti per le aziende?", answer: "Le aziende possono operare con piani e crediti in base al volume di manutenzioni e sedi. Un referente esamina il caso per proporre la copertura adeguata." },
  ],
  generalQuestions: [
    { segment: "Clienti", question: "La prenotazione viene confermata automaticamente?", answer: "No. La richiesta resta in attesa di conferma affinché OficiosPro e lo specialista verifichino orario, città e dettaglio del lavoro. Ti contattiamo prima di qualsiasi addebito." },
    { segment: "Clienti", question: "Cosa significa pagamento protetto?", answer: "Significa che i tuoi crediti vengono trattenuti con tracciabilità e rilasciati solo man mano che il servizio avanza, evitando accordi poco chiari fuori dalla piattaforma." },
    { segment: "Aziende", question: "Posso richiedere copertura per più sedi?", answer: "Sì. Le aziende possono indicare filiali, città principale e tipo di manutenzione per valutare un piano operativo." },
    { segment: "Specialisti", question: "Cosa esamina OficiosPro per verificare un profilo?", answer: "Identità, referenze, portfolio, copertura, certificazioni quando applicabili e chiarezza dei servizi offerti. La revisione è fatta da una persona del team." },
    { segment: "Specialisti", question: "L'agenda blocca già fasce orarie reali?", answer: "L'agenda attuale permette di visualizzare e bloccare la disponibilità localmente, pronta a connettersi al backend definitivo." },
  ],
};

export const faqContent: Record<Locale, FaqLocaleContent> = { es, en, pt, fr, de, it };
