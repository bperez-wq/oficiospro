export type SpecialistAssistantCategory =
  | "cliente"
  | "registro"
  | "formalizacion"
  | "pagos"
  | "referidos"
  | "categorias"
  | "seguridad"
  | "soporte";

export type SpecialistAssistantLink = {
  label: string;
  href: string;
  eventName?: string;
  serviceSlug?: string;
};

export type SpecialistAssistantKnowledgeEntry = {
  id: string;
  category: SpecialistAssistantCategory;
  intent: string;
  keywords: string[];
  questionExamples: string[];
  answer: string;
  actionButtons?: SpecialistAssistantLink[];
  relatedLinks: SpecialistAssistantLink[];
  confidence: number;
  escalationRecommended: boolean;
};

export const specialistAssistantContactEmail = "bperez@oficiospro.cl";
export const specialistAssistantContactLink = `mailto:${specialistAssistantContactEmail}`;

export const specialistAssistantSuggestedQuestions = [
  "Necesito gasfiter",
  "Busco electricista",
  "Tengo una filtracion",
  "Quiero ofrecer mis servicios",
  "Tiene costo crear mi perfil?",
  "Que pasa si no se emitir boleta?",
];

export const specialistAssistantFallbacks = {
  unknown:
    "No tengo esa respuesta confirmada. Escribenos a bperez@oficiospro.cl y te ayudamos directamente.",
  lowConfidence:
    "No tengo suficiente informacion para responder eso con seguridad. Escribenos a bperez@oficiospro.cl y te ayudamos directamente.",
  outOfScope:
    "Solo puedo responder dudas sobre OficiosPro. Para otra consulta, escribenos a bperez@oficiospro.cl.",
  taxLegal:
    "Esto es informacion referencial de OficiosPro y no reemplaza asesoria contable, tributaria o legal. Para tu caso puntual, escribenos a bperez@oficiospro.cl.",
  questionLimit:
    "Para ayudarte bien y evitar informacion incompleta, escribenos a bperez@oficiospro.cl. Asi revisamos tu caso puntual.",
  sensitive:
    "No puedo entregar datos privados, documentos, accesos internos ni informacion de otros especialistas. Si necesitas ayuda con tu caso, escribenos a bperez@oficiospro.cl.",
};

const commonContactLink = [{ label: "Escribir a bperez@oficiospro.cl", href: specialistAssistantContactLink }];
const registerLink = { label: "Crear perfil", href: "/registro-especialista?source=assistant&intent=offer_services", eventName: "assistant_offer_services_clicked" };
const founderLink = { label: "Ofrecer mis servicios", href: "/especialistas-fundadores?source=assistant&intent=offer_services", eventName: "assistant_offer_services_clicked" };
const formalizationLink = { label: "Ver formalizacion", href: "/formalizacion?source=assistant", eventName: "assistant_action_clicked" };
const supportLink = { label: "Escribir a soporte", href: "/contacto?source=assistant", eventName: "assistant_action_clicked" };

export const specialistAssistantKnowledge: SpecialistAssistantKnowledgeEntry[] = [
  {
    id: "cliente-find-service",
    category: "cliente",
    intent: "find_service",
    keywords: ["necesito ayuda", "busco especialista", "buscar especialista", "servicio tecnico", "tecnico", "especialista cerca"],
    questionExamples: ["Necesito un especialista", "Busco servicio tecnico", "Me pueden ayudar con un trabajo?"],
    answer:
      "Puedo ayudarte a buscar especialistas publicados o a dejar una solicitud. No tengo confirmada cobertura inmediata para cada comuna, pero la solicitud ayuda a priorizar el caso.",
    actionButtons: [
      { label: "Buscar especialista", href: "/especialistas?source=assistant", eventName: "assistant_find_service_clicked" },
      { label: "Solicitar especialista", href: "/contacto?source=assistant", eventName: "assistant_action_clicked" },
    ],
    relatedLinks: [{ label: "Ver especialistas", href: "/especialistas" }],
    confidence: 0.82,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-gasfiter",
    category: "cliente",
    intent: "find_gasfiter",
    keywords: ["gasfiter", "gasfiteria", "fuga", "filtracion", "filtracion agua", "llave", "cañeria", "caneria", "agua", "lavamanos", "wc"],
    questionExamples: ["Necesito gasfiter", "Tengo una filtracion", "Busco gasfiter urgente"],
    answer:
      "Te puedo ayudar a encontrar gasfiteres. Puedes revisar especialistas publicados o dejar una solicitud si aun estamos formando cobertura en tu comuna; no tengo confirmada disponibilidad inmediata.",
    actionButtons: [
      { label: "Ver gasfiteres", href: "/especialistas?servicio=gasfiteria&source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "gasfiteria" },
      { label: "Buscar por comuna", href: "/especialistas?servicio=gasfiteria&source=assistant#busqueda", eventName: "assistant_find_service_clicked", serviceSlug: "gasfiteria" },
      { label: "Solicitar especialista", href: "/contacto?intent=gasfiteria&source=assistant", eventName: "assistant_action_clicked", serviceSlug: "gasfiteria" },
    ],
    relatedLinks: [{ label: "Servicio gasfiteria", href: "/servicios/gasfiteria", serviceSlug: "gasfiteria" }],
    confidence: 0.94,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-electricista",
    category: "cliente",
    intent: "find_electricista",
    keywords: ["electricista", "electricidad", "corte electrico", "enchufe", "tablero", "automatico", "luz", "sec"],
    questionExamples: ["Busco electricista", "Tengo un corte electrico", "Necesito revisar enchufes"],
    answer:
      "Te puedo orientar hacia electricistas publicados o una solicitud de contacto. La disponibilidad real depende de comuna y agenda, asi que no la prometo desde el asistente.",
    actionButtons: [
      { label: "Ver electricistas", href: "/especialistas?servicio=electricidad&source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "electricidad" },
      { label: "Buscar por comuna", href: "/especialistas?servicio=electricidad&source=assistant#busqueda", eventName: "assistant_find_service_clicked", serviceSlug: "electricidad" },
      { label: "Solicitar especialista", href: "/contacto?intent=electricidad&source=assistant", eventName: "assistant_action_clicked", serviceSlug: "electricidad" },
    ],
    relatedLinks: [{ label: "Servicio electricidad", href: "/servicios/electricidad", serviceSlug: "electricidad" }],
    confidence: 0.94,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-calefont",
    category: "cliente",
    intent: "find_calefont",
    keywords: ["calefont", "calefon", "agua caliente", "no enciende", "gas", "llama piloto"],
    questionExamples: ["Mi calefont no enciende", "Necesito tecnico de calefont", "No tengo agua caliente"],
    answer:
      "Para problemas de calefont puedes revisar el servicio asociado y buscar especialistas. Si no hay cobertura confirmada para tu comuna, deja una solicitud para priorizarla.",
    actionButtons: [
      { label: "Ver calefont", href: "/servicios/calefont?source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "calefont" },
      { label: "Buscar gasfiter", href: "/especialistas?servicio=gasfiteria&source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "gasfiteria" },
      { label: "Solicitar especialista", href: "/contacto?intent=calefont&source=assistant", eventName: "assistant_action_clicked", serviceSlug: "calefont" },
    ],
    relatedLinks: [{ label: "Servicio calefont", href: "/servicios/calefont", serviceSlug: "calefont" }],
    confidence: 0.92,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-jardinero",
    category: "cliente",
    intent: "find_jardinero",
    keywords: ["jardinero", "jardineria", "pasto", "riego", "jardin", "poda"],
    questionExamples: ["Necesito jardinero", "Busco jardineria", "Quiero podar el jardin"],
    answer:
      "Puedes buscar especialistas de jardineria o dejar una solicitud. La cobertura depende de comuna y perfiles aprobados, por eso no confirmo disponibilidad inmediata desde aqui.",
    actionButtons: [
      { label: "Ver jardineros", href: "/especialistas?servicio=jardineria&source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "jardineria" },
      { label: "Buscar por comuna", href: "/especialistas?servicio=jardineria&source=assistant#busqueda", eventName: "assistant_find_service_clicked", serviceSlug: "jardineria" },
      { label: "Solicitar especialista", href: "/contacto?intent=jardineria&source=assistant", eventName: "assistant_action_clicked", serviceSlug: "jardineria" },
    ],
    relatedLinks: [{ label: "Ver especialistas", href: "/especialistas?servicio=jardineria", serviceSlug: "jardineria" }],
    confidence: 0.9,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-climatizacion",
    category: "cliente",
    intent: "find_climatizacion",
    keywords: ["aire acondicionado", "climatizacion", "hvac", "refrigeracion", "split", "calefaccion"],
    questionExamples: ["Necesito aire acondicionado", "Busco tecnico en climatizacion", "Reparar split"],
    answer:
      "Para climatizacion puedes revisar especialistas publicados o dejar una solicitud. OficiosPro evita prometer disponibilidad sin revisar comuna, agenda y cobertura.",
    actionButtons: [
      { label: "Ver climatizacion", href: "/especialistas?servicio=climatizacion&source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "climatizacion" },
      { label: "Solicitar especialista", href: "/contacto?intent=climatizacion&source=assistant", eventName: "assistant_action_clicked", serviceSlug: "climatizacion" },
    ],
    relatedLinks: [{ label: "Ver especialistas", href: "/especialistas?servicio=climatizacion", serviceSlug: "climatizacion" }],
    confidence: 0.9,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-pintor",
    category: "cliente",
    intent: "find_pintor",
    keywords: ["pintor", "pintura", "pintar", "muro", "fachada", "departamento"],
    questionExamples: ["Necesito pintor", "Quiero pintar mi departamento", "Busco pintura"],
    answer:
      "Puedes revisar especialistas de pintura o dejar una solicitud para que el equipo priorice cobertura. La disponibilidad se confirma fuera del asistente.",
    actionButtons: [
      { label: "Ver pintores", href: "/especialistas?servicio=pintura&source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "pintura" },
      { label: "Solicitar especialista", href: "/contacto?intent=pintura&source=assistant", eventName: "assistant_action_clicked", serviceSlug: "pintura" },
    ],
    relatedLinks: [{ label: "Ver especialistas", href: "/especialistas?servicio=pintura", serviceSlug: "pintura" }],
    confidence: 0.88,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-seguridad",
    category: "cliente",
    intent: "find_security_service",
    keywords: ["cerrajero", "cerradura", "llave", "camara", "camaras", "porton", "portones", "control remoto", "seguridad"],
    questionExamples: ["Necesito cerrajero", "Busco tecnico de camaras", "Tengo problema con porton"],
    answer:
      "Puedo guiarte hacia especialistas o solicitudes para seguridad, cerrajeria, camaras o portones. Si no hay cobertura confirmada en tu comuna, deja una solicitud para priorizarla.",
    actionButtons: [
      { label: "Ver especialistas", href: "/especialistas?source=assistant", eventName: "assistant_find_service_clicked" },
      { label: "Solicitar especialista", href: "/contacto?intent=seguridad&source=assistant", eventName: "assistant_action_clicked" },
      { label: "Ver portones", href: "/comunidades/portones?source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "portones" },
    ],
    relatedLinks: [{ label: "Marketplace", href: "/especialistas" }],
    confidence: 0.82,
    escalationRecommended: false,
  },
  {
    id: "cliente-find-piscina",
    category: "cliente",
    intent: "find_pool_service",
    keywords: ["piscina", "piscinero", "bomba piscina", "mantencion piscina", "filtro piscina"],
    questionExamples: ["Necesito mantencion de piscina", "Busco tecnico para piscina"],
    answer:
      "Puedes dejar una solicitud o revisar especialistas publicados. OficiosPro no confirma disponibilidad inmediata sin comuna y cobertura real.",
    actionButtons: [
      { label: "Ver especialistas", href: "/especialistas?servicio=piscina&source=assistant", eventName: "assistant_find_service_clicked", serviceSlug: "piscina" },
      { label: "Solicitar especialista", href: "/contacto?intent=piscina&source=assistant", eventName: "assistant_action_clicked", serviceSlug: "piscina" },
    ],
    relatedLinks: [{ label: "Ver especialistas", href: "/especialistas?servicio=piscina", serviceSlug: "piscina" }],
    confidence: 0.84,
    escalationRecommended: false,
  },
  {
    id: "especialista-offer-services",
    category: "registro",
    intent: "offer_services",
    keywords: ["quiero trabajar", "ofrecer servicios", "soy gasfiter", "soy electricista", "tengo un oficio", "ser especialista", "quiero postular", "inscribo", "inscribirme"],
    questionExamples: ["Quiero ofrecer mis servicios", "Soy gasfiter y quiero trabajar", "Como me inscribo?"],
    answer:
      "Puedes crear tu perfil de especialista fundador sin costo inicial. Te guiamos para declarar tus servicios, comuna y forma de documentar; no prometemos ingresos ni volumen fijo de trabajos.",
    actionButtons: [founderLink, registerLink, formalizationLink],
    relatedLinks: [founderLink, registerLink, formalizationLink],
    confidence: 0.95,
    escalationRecommended: false,
  },
  {
    id: "registro-como-postular",
    category: "registro",
    intent: "how_to_apply",
    keywords: ["postular", "registrar", "registro", "inscribirme", "crear perfil", "perfil", "especialista"],
    questionExamples: ["Como postulo?", "Donde creo mi perfil?", "Como me registro como especialista?"],
    answer:
      "Puedes postular desde el formulario de registro especialista. Completa tus datos, comuna, cobertura, servicios y forma referencial de documentar. OficiosPro revisa la postulacion antes de publicar cualquier perfil.",
    relatedLinks: [registerLink],
    confidence: 0.92,
    escalationRecommended: false,
  },
  {
    id: "registro-perfil-fundador",
    category: "registro",
    intent: "founder_profile",
    keywords: ["fundador", "perfil fundador", "primeros especialistas", "piloto", "fundadores"],
    questionExamples: ["Que es perfil fundador?", "Que significa ser fundador?", "Es un piloto?"],
    answer:
      "Perfil fundador significa que tu postulacion entra a la primera red revisada por comuna y oficio. No garantiza ingresos ni volumen fijo de trabajos; permite ordenar tu perfil y quedar disponible para revision operacional.",
    relatedLinks: [{ label: "Especialistas fundadores", href: "/especialistas-fundadores" }, registerLink],
    confidence: 0.9,
    escalationRecommended: false,
  },
  {
    id: "registro-costo-inicial",
    category: "registro",
    intent: "initial_cost",
    keywords: ["costo", "gratis", "pagar", "cobran", "sin costo", "precio registro", "crear perfil gratis"],
    questionExamples: ["Tiene costo crear mi perfil?", "Tengo que pagar para postular?", "Es gratis?"],
    answer:
      "La postulacion y creacion del perfil fundador no tiene costo inicial. El perfil queda en revision antes de publicarse y OficiosPro no promete trabajos ni ingresos garantizados.",
    relatedLinks: [registerLink],
    confidence: 0.95,
    escalationRecommended: false,
  },
  {
    id: "registro-revision",
    category: "registro",
    intent: "application_review",
    keywords: ["revision", "aprobar", "aprobacion", "48", "publicar", "cuanto demora", "cuando aparece"],
    questionExamples: ["Cuando revisan mi perfil?", "Cuando aparezco publicado?", "Cuanto demora la aprobacion?"],
    answer:
      "OficiosPro revisa las postulaciones antes de publicar perfiles. La revision inicial se comunica como referencial en 48 h, pero puede requerir contacto adicional si falta informacion o documentos.",
    relatedLinks: [registerLink, ...commonContactLink],
    confidence: 0.88,
    escalationRecommended: false,
  },
  {
    id: "registro-multiples-oficios",
    category: "registro",
    intent: "multiple_services",
    keywords: ["varios servicios", "mas de un servicio", "varios oficios", "multiservicio", "especialidades"],
    questionExamples: ["Puedo ofrecer mas de un servicio?", "Puedo poner varios oficios?", "Tengo varias especialidades"],
    answer:
      "Si. El registro permite declarar un oficio principal y servicios o especialidades adicionales. El equipo revisa que la informacion sea clara antes de publicar el perfil.",
    relatedLinks: [registerLink],
    confidence: 0.9,
    escalationRecommended: false,
  },
  {
    id: "registro-comunas-cobertura",
    category: "registro",
    intent: "coverage_communes",
    keywords: ["comuna", "comunas", "region", "cobertura", "radio", "zona", "atiendo"],
    questionExamples: ["Que comunas puedo atender?", "Puedo elegir cobertura?", "Como funciona el radio de atencion?"],
    answer:
      "Puedes indicar tu comuna base, region y radio o comunas de cobertura. Esa informacion ayuda a mostrar perfiles por zona cuando sean aprobados y a ordenar solicitudes reales.",
    relatedLinks: [registerLink],
    confidence: 0.9,
    escalationRecommended: false,
  },
  {
    id: "registro-oficio-no-encontrado",
    category: "registro",
    intent: "trade_not_found",
    keywords: ["no encuentro", "mi oficio", "no esta", "otro oficio", "otra categoria", "servicio no aparece"],
    questionExamples: ["No encuentro mi oficio", "Mi servicio no aparece", "Que hago si mi categoria no esta?"],
    answer:
      "Si tu oficio no aparece, puedes describirlo como otro servicio en el registro. OficiosPro revisa categorias activas y categorias en formacion antes de mostrarlas a clientes.",
    relatedLinks: [registerLink, ...commonContactLink],
    confidence: 0.86,
    escalationRecommended: false,
  },
  {
    id: "formalizacion-boleta",
    category: "formalizacion",
    intent: "boleta_honorarios",
    keywords: ["boleta", "honorarios", "emitir boleta", "sii", "documentar", "no se emitir"],
    questionExamples: ["Que pasa si no se emitir boleta?", "Necesito boleta de honorarios?", "Como documento?"],
    answer:
      "OficiosPro considera la boleta de honorarios como una forma posible de documentar servicios, pero cada caso debe validarse con contador o SII. Si no sabes documentar, postula igual y el equipo revisara tu situacion antes de activar pagos.",
    relatedLinks: [formalizationLink, ...commonContactLink],
    confidence: 0.88,
    escalationRecommended: true,
  },
  {
    id: "formalizacion-general",
    category: "formalizacion",
    intent: "formalization",
    keywords: ["formalizacion", "formalizar", "documentacion", "documentar", "contador", "sii"],
    questionExamples: ["Como funciona la formalizacion?", "Que documentos necesito?", "Como documento mis servicios?"],
    answer:
      "La formalizacion en OficiosPro es referencial y se revisa antes de operar pagos. Puedes ver la pagina de formalizacion, pero tu caso debe validarse con contador o SII cuando corresponda.",
    actionButtons: [formalizationLink, { label: "Escribir a soporte", href: specialistAssistantContactLink, eventName: "assistant_action_clicked" }],
    relatedLinks: [formalizationLink, ...commonContactLink],
    confidence: 0.9,
    escalationRecommended: true,
  },
  {
    id: "formalizacion-factura",
    category: "formalizacion",
    intent: "invoice",
    keywords: ["factura", "empresa", "spA", "giro", "iva", "facturar"],
    questionExamples: ["Puedo emitir factura?", "Tengo empresa, como facturo?", "Que pasa con IVA?"],
    answer:
      "Si emites factura o tienes empresa, la documentacion debe revisarse segun tu situacion tributaria. OficiosPro entrega informacion referencial, no reemplaza validacion contable, tributaria ni legal.",
    relatedLinks: [formalizationLink, ...commonContactLink],
    confidence: 0.84,
    escalationRecommended: true,
  },
  {
    id: "formalizacion-documentos",
    category: "formalizacion",
    intent: "required_documents",
    keywords: ["documento", "documentos", "cedula", "selfie", "validacion", "identidad", "pending_secure_storage"],
    questionExamples: ["Que documentos piden?", "Tengo que subir cedula?", "Que es pending_secure_storage?"],
    answer:
      "Los documentos de identidad y validacion son privados y no deben compartirse por chat. Si una validacion aparece como pending_secure_storage, significa que falta habilitar o completar el flujo seguro antes de usar esos documentos para aprobacion o pagos.",
    relatedLinks: [formalizationLink, ...commonContactLink],
    confidence: 0.86,
    escalationRecommended: true,
  },
  {
    id: "formalizacion-payout-bloqueado",
    category: "formalizacion",
    intent: "blocked_payout",
    keywords: ["payout", "pago bloqueado", "bloqueado", "liquidacion bloqueada", "retencion", "no puedo cobrar"],
    questionExamples: ["Por que mi pago esta bloqueado?", "Cuando liberan liquidacion?", "Tengo payout bloqueado"],
    answer:
      "OficiosPro no debe liberar pagos sin revision documental y flujo operativo correcto. Si tu liquidacion aparece bloqueada, contacta al equipo para revisar documento, estado del trabajo y validacion pendiente.",
    relatedLinks: [formalizationLink, ...commonContactLink],
    confidence: 0.82,
    escalationRecommended: true,
  },
  {
    id: "pagos-comision",
    category: "pagos",
    intent: "commission",
    keywords: ["comision", "9,5", "9.5", "iva", "cuanto cobra", "porcentaje", "descuento"],
    questionExamples: ["Cuanto cobra OficiosPro?", "Cual es la comision?", "Me descuentan algo?"],
    answer:
      "La comision estandar informada es 9,5% + IVA sobre la base configurada del servicio. Financia tecnologia, soporte, operacion, pago protegido y gestion administrativa. El calculo final puede depender del documento y validacion contable.",
    relatedLinks: [formalizationLink],
    confidence: 0.93,
    escalationRecommended: false,
  },
  {
    id: "pagos-creditos-precio-cliente",
    category: "pagos",
    intent: "credits",
    keywords: ["creditos", "cliente", "precio cliente", "tarifa", "clp", "cuanto ve el cliente"],
    questionExamples: ["El cliente ve pesos o creditos?", "Como se calcula el precio cliente?", "Yo elijo creditos?"],
    answer:
      "El especialista declara su tarifa esperada en CLP. OficiosPro calcula los creditos visibles para clientes y revisa margen, comision y condiciones antes de publicar el servicio.",
    relatedLinks: [registerLink, formalizationLink],
    confidence: 0.9,
    escalationRecommended: false,
  },
  {
    id: "pagos-protegido-cuando-se-paga",
    category: "pagos",
    intent: "protected_payment",
    keywords: ["pago protegido", "cuando pagan", "cuando se paga", "liberar pago", "cobrar", "liquidacion"],
    questionExamples: ["Cuando me pagan?", "Como funciona pago protegido?", "Cuando se libera el pago?"],
    answer:
      "OficiosPro trabaja con pago protegido: el cliente usa creditos y el pago se libera segun avance o cierre del trabajo, con documentacion revisada. No se libera una liquidacion sin validacion operativa y tributaria.",
    relatedLinks: [formalizationLink, ...commonContactLink],
    confidence: 0.88,
    escalationRecommended: true,
  },
  {
    id: "referidos-como-funciona",
    category: "referidos",
    intent: "referral",
    keywords: ["referir", "referidos", "invitar", "link referido", "codigo", "colega"],
    questionExamples: ["Como refiero a alguien?", "Puedo crear link de referido?", "Como invito a un colega?"],
    answer:
      "Puedes usar la pagina de referidos para crear un link y compartirlo con otros especialistas. El programa actual es no monetario: puede ayudar a visibilidad o reconocimiento, pero no promete pago por referir.",
    relatedLinks: [{ label: "Referidos especialistas", href: "/referidos/especialistas" }],
    confidence: 0.9,
    escalationRecommended: false,
  },
  {
    id: "referidos-badge",
    category: "referidos",
    intent: "founder_badge",
    keywords: ["badge", "insignia", "fundador", "reconocimiento", "beneficio referido"],
    questionExamples: ["Que es badge fundador?", "Gano algo por referir?", "Hay pago por referido?"],
    answer:
      "Por ahora los referidos no entregan pago monetario. El beneficio esperado es reconocimiento, visibilidad o badge dentro de la red cuando corresponda y cuando el perfil sea aprobado.",
    relatedLinks: [{ label: "Referidos especialistas", href: "/referidos/especialistas" }],
    confidence: 0.88,
    escalationRecommended: false,
  },
  {
    id: "categorias-activas-formacion",
    category: "categorias",
    intent: "active_and_forming_categories",
    keywords: ["categoria", "categorias", "activo", "activos", "formacion", "oficios activos", "oficios en formacion"],
    questionExamples: ["Que significa categoria en formacion?", "Que oficios estan activos?", "Mi oficio esta en formacion?"],
    answer:
      "Las categorias activas pueden mostrarse con mayor claridad a clientes. Las categorias en formacion sirven para captar especialistas y medir demanda antes de abrirlas completamente al marketplace.",
    relatedLinks: [{ label: "Especialistas fundadores", href: "/especialistas-fundadores" }, registerLink],
    confidence: 0.88,
    escalationRecommended: false,
  },
  {
    id: "categorias-registro-cliente",
    category: "categorias",
    intent: "registration_vs_client_categories",
    keywords: ["registro vs cliente", "cliente", "aparece cliente", "categoria para registro", "no se muestra"],
    questionExamples: ["Por que mi categoria aparece en registro y no al cliente?", "Todas las categorias se publican?"],
    answer:
      "Algunas categorias pueden estar habilitadas para registro antes de mostrarse masivamente a clientes. Eso permite ordenar oferta, revisar cobertura y evitar publicar servicios sin respaldo suficiente.",
    relatedLinks: [registerLink],
    confidence: 0.86,
    escalationRecommended: false,
  },
  {
    id: "seguridad-datos-privados",
    category: "seguridad",
    intent: "private_data",
    keywords: ["datos privados", "cedula", "selfie", "documento", "seguridad", "privado", "compartir documentos"],
    questionExamples: ["Mis documentos son publicos?", "Puedo mandar mi cedula por chat?", "Como protegen mis datos?"],
    answer:
      "Tus documentos privados no deben compartirse por este chat ni mostrarse a otros especialistas. Usa solo los flujos oficiales de OficiosPro cuando esten habilitados y escribe al equipo si necesitas revisar un caso sensible.",
    relatedLinks: [formalizationLink, ...commonContactLink],
    confidence: 0.9,
    escalationRecommended: true,
  },
  {
    id: "seguridad-perfiles-revisados",
    category: "seguridad",
    intent: "reviewed_profiles",
    keywords: ["verificado", "revisado", "confianza", "perfil verificado", "revision antecedentes"],
    questionExamples: ["Que significa perfil revisado?", "Como verifican especialistas?", "Por que revisan perfiles?"],
    answer:
      "OficiosPro revisa perfiles antes de publicarlos para cuidar la confianza del marketplace. La revision puede considerar datos de contacto, servicios declarados, cobertura, referencias y documentacion cuando aplique.",
    relatedLinks: [registerLink],
    confidence: 0.88,
    escalationRecommended: false,
  },
  {
    id: "soporte-contacto-humano",
    category: "soporte",
    intent: "support",
    keywords: ["soporte", "ayuda", "contacto", "correo", "humano", "hablar", "bperez"],
    questionExamples: ["Como hablo con alguien?", "Necesito ayuda humana", "Cual es el correo?"],
    answer:
      "Puedes escribir a bperez@oficiospro.cl para recibir ayuda directa del equipo OficiosPro. Es la ruta recomendada si tu caso es puntual, sensible o no aparece en estas respuestas.",
    relatedLinks: commonContactLink,
    confidence: 0.96,
    escalationRecommended: true,
  },
  {
    id: "soporte-instituciones",
    category: "soporte",
    intent: "institution",
    keywords: ["institucion", "omil", "municipalidad", "sence", "cft", "ip", "alianza", "piloto comunal"],
    questionExamples: ["Soy de una OMIL", "Quiero proponer una alianza", "Como trabaja OficiosPro con instituciones?"],
    answer:
      "OficiosPro tiene una propuesta para instituciones, OMIL, municipalidades y programas de empleabilidad. La colaboracion se revisa como piloto o conversacion institucional, sin prometer empleo ni ingresos.",
    actionButtons: [
      { label: "Ver instituciones", href: "/instituciones?source=assistant", eventName: "assistant_action_clicked" },
      { label: "Contactar soporte", href: "/contacto?source=assistant&intent=institucion", eventName: "assistant_action_clicked" },
    ],
    relatedLinks: [{ label: "Instituciones", href: "/instituciones" }, ...commonContactLink],
    confidence: 0.9,
    escalationRecommended: false,
  },
];
