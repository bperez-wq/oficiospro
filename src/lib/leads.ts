export type LeadType =
  | "customer_request"
  | "specialist_application"
  | "company_request"
  | "booking_request"
  | "contact_message"
  | "club_hogar_interest"
  | "payment_interest";

export type LeadSubmissionPayload = {
  leadType: LeadType;
  fullName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  applicantType?: string;
  service?: string;
  trade?: string;
  problemDescription?: string;
  urgency?: string;
  regionCode?: string;
  regionName?: string;
  communeCode?: string;
  communeName?: string;
  specialistId?: string;
  specialistName?: string;
  requestedDate?: string;
  requestedTime?: string;
  creditsEstimate?: number;
  sourcePage?: string;
  sourceComponent?: string;
  sourceButton?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  referralCode?: string;
  consentContact?: boolean;
  consentTerms?: boolean;
  honeypot?: string;
  payload?: Record<string, unknown>;
};

export type LeadSubmitResult = {
  ok: boolean;
  id?: string;
  stored?: boolean;
  emailSent?: boolean;
  emailError?: string;
  error?: string;
  message: string;
};

export const leadSuccessMessage = "Recibimos tu solicitud. El equipo OficiosPro la revisará pronto.";
export const leadSavedNoEmailMessage = "Recibimos tu solicitud. El equipo OficiosPro la revisará pronto.";
export const leadDatabaseNotConfiguredMessage =
  "Estamos activando la recepción automática. Escríbenos a bperez@oficiospro.cl.";
export const leadErrorMessage = "No pudimos enviar la solicitud en este momento. Escríbenos a bperez@oficiospro.cl y revisaremos tu caso.";

export function leadMessageForResult(result: Pick<LeadSubmitResult, "ok" | "emailSent" | "error">) {
  if (result.error === "database_not_configured") return leadDatabaseNotConfiguredMessage;
  if (!result.ok) return leadErrorMessage;
  return result.emailSent ? leadSuccessMessage : leadSavedNoEmailMessage;
}
