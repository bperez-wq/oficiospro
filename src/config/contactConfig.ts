export const contactConfig = {
  supportEmail: "bperez@oficiospro.cl",
  whatsappNumber: (process.env.NEXT_PUBLIC_OFICIOSPRO_WHATSAPP ?? "").replace(/[^\d]/g, ""),
  whatsappEnabled: Boolean((process.env.NEXT_PUBLIC_OFICIOSPRO_WHATSAPP ?? "").replace(/[^\d]/g, "")),
};

export function specialistWhatsappMessage(input: { trade?: string; commune?: string } = {}) {
  const trade = input.trade?.trim() || "___";
  const commune = input.commune?.trim() || "___";
  return `Hola, quiero crear mi perfil de especialista en OficiosPro. Mi oficio es ${trade} y trabajo en ${commune}.`;
}

export function whatsappHref(message: string) {
  if (!contactConfig.whatsappEnabled) return "";
  return `https://wa.me/${contactConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function supportMailtoHref(subject: string, body: string) {
  return `mailto:${contactConfig.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
