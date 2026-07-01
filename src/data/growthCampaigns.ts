export type GrowthCampaign = {
  id: string;
  name: string;
  target: string;
  landingUrl: string;
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  suggestedCopy: string;
  cta: string;
  trade?: string;
  commune?: string;
};

export const specialistGrowthCampaigns: GrowthCampaign[] = [
  {
    id: "instagram_bio",
    name: "Instagram bio",
    target: "Especialistas que revisan el perfil de OficiosPro",
    landingUrl: "/especialistas-fundadores",
    source: "campana_local",
    utmSource: "instagram",
    utmMedium: "bio",
    utmCampaign: "especialistas_fundadores",
    utmContent: "bio_link",
    suggestedCopy: "Crea tu perfil fundador en OficiosPro y muestra tus servicios por comuna. Sin costo inicial en etapa fundador.",
    cta: "Crear perfil sin costo",
  },
  {
    id: "instagram_story",
    name: "Instagram story",
    target: "Personas con oficios que responden historias",
    landingUrl: "/especialistas-fundadores",
    source: "campana_local",
    utmSource: "instagram",
    utmMedium: "story",
    utmCampaign: "especialistas_fundadores",
    utmContent: "story_cta",
    suggestedCopy: "Tienes un oficio? Estamos formando la red OficiosPro por comuna. Postula en cerca de 3 minutos.",
    cta: "Empezar ahora",
  },
  {
    id: "whatsapp_direct",
    name: "WhatsApp directo",
    target: "Especialistas contactados uno a uno",
    landingUrl: "/especialistas-fundadores",
    source: "whatsapp_referral",
    utmSource: "whatsapp",
    utmMedium: "direct",
    utmCampaign: "especialistas_fundadores",
    utmContent: "direct_message",
    suggestedCopy: "Hola, vi que trabajas en oficios técnicos. Estoy creando OficiosPro.cl para dar visibilidad a especialistas verificados por comuna. Estamos invitando a los primeros especialistas fundadores sin costo inicial. Te interesa crear tu perfil?",
    cta: "Crear perfil",
  },
  {
    id: "facebook_group",
    name: "Facebook grupos",
    target: "Grupos locales de trabajo y oficios",
    landingUrl: "/especialistas-fundadores",
    source: "facebook_group",
    utmSource: "facebook",
    utmMedium: "group_post",
    utmCampaign: "especialistas_fundadores",
    utmContent: "community_post",
    suggestedCopy: "Estamos sumando especialistas con oficios para OficiosPro.cl. La idea es ordenar perfiles, servicios y comunas de cobertura sin prometer trabajos garantizados. Postulacion sin costo inicial en etapa fundador.",
    cta: "Postular como especialista",
  },
  {
    id: "omil_partner",
    name: "OMIL / municipalidad",
    target: "Equipos municipales de empleo",
    landingUrl: "/instituciones",
    source: "omil",
    utmSource: "omil",
    utmMedium: "partner",
    utmCampaign: "especialistas_fundadores_instituciones",
    utmContent: "municipal_outreach",
    suggestedCopy: "OficiosPro puede apoyar la visibilidad de especialistas locales con perfil por oficio y comuna. Las postulaciones quedan en revision antes de publicarse.",
    cta: "Coordinar piloto",
  },
  {
    id: "ferreteria_partner",
    name: "Ferreteria partner",
    target: "Clientes especialistas de ferreterias locales",
    landingUrl: "/especialistas-fundadores",
    source: "ferreteria",
    utmSource: "ferreteria",
    utmMedium: "qr_store",
    utmCampaign: "especialistas_fundadores_partners",
    utmContent: "counter_qr",
    suggestedCopy: "Eres especialista y compras materiales para tus trabajos? Crea tu perfil fundador en OficiosPro y prepara tu visibilidad por comuna.",
    cta: "Crear perfil fundador",
  },
  {
    id: "cft_ip_partner",
    name: "CFT / IP partner",
    target: "Egresados y estudiantes técnicos",
    landingUrl: "/instituciones",
    source: "cft_ip",
    utmSource: "cft_ip",
    utmMedium: "partner",
    utmCampaign: "especialistas_fundadores_instituciones",
    utmContent: "education_partner",
    suggestedCopy: "OficiosPro esta formando una red de especialistas por comuna. Los perfiles se revisan antes de publicarse y pueden requerir apoyo de formalizacion.",
    cta: "Ver programa",
  },
  {
    id: "referral_specialist",
    name: "Referido especialista",
    target: "Especialistas que recomiendan colegas",
    landingUrl: "/referidos/especialistas",
    source: "referido_especialista",
    utmSource: "referral",
    utmMedium: "specialist_share",
    utmCampaign: "founder_specialist_referrals",
    utmContent: "share_link",
    suggestedCopy: "Invita a un buen especialista. Si postula y es aprobado, ayudas a fortalecer la red OficiosPro.",
    cta: "Compartir link",
  },
];

export function campaignRelativeHref(campaign: GrowthCampaign) {
  const params = new URLSearchParams({
    source: campaign.source,
    campaign: campaign.utmCampaign,
    utm_source: campaign.utmSource,
    utm_medium: campaign.utmMedium,
    utm_campaign: campaign.utmCampaign,
  });
  if (campaign.utmContent) params.set("utm_content", campaign.utmContent);
  if (campaign.trade) params.set("trade", campaign.trade);
  if (campaign.commune) params.set("commune", campaign.commune);
  return `${campaign.landingUrl}?${params.toString()}`;
}

export function campaignAbsoluteUrl(campaign: GrowthCampaign, baseUrl = "https://www.oficiospro.cl") {
  return `${baseUrl.replace(/\/$/, "")}${campaignRelativeHref(campaign)}`;
}
