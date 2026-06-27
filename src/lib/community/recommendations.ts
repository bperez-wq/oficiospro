// Collaborative specialist recommendations.
//
// Lets any user recommend a tradesperson they trust. The goal is to give more
// opportunities to people who do good work and to those who recommend them. Each
// recommendation is captured today via the existing conversion-events endpoint
// (no backend change required); the CRM enrichment (opportunity + reward tracking)
// is documented as a follow-up.

import { submitConversionEvent } from "@/lib/leadClient";

export type SpecialistRecommendation = {
  /** Name of the recommended tradesperson or business. */
  recommendedName: string;
  /** Trade / oficio (category id or free text). */
  trade?: string;
  commune?: string;
  region?: string;
  /** Optional contact for the recommended person (phone/email/whatsapp). */
  recommendedContact?: string;
  /** Why the user recommends them (work quality, reliability, etc.). */
  reason?: string;
  /** Optional: who recommends, so we can reward them. */
  recommenderName?: string;
  recommenderContact?: string;
  /** Origin of the recommendation. */
  source?: "community" | "osm" | "google_places";
  /** External id when the recommendation comes from a map listing. */
  externalPlaceId?: string;
};

export type RecommendationResult = { ok: boolean; id?: string; stored?: boolean };

/** Submit a recommendation. Best-effort: never throws to the UI. */
export async function submitSpecialistRecommendation(
  rec: SpecialistRecommendation,
): Promise<RecommendationResult> {
  const name = (rec.recommendedName ?? "").trim();
  if (!name) return { ok: false };
  try {
    const result = (await submitConversionEvent({
      type: "specialist_recommendation",
      source: "community_discovery",
      sourceComponent: "RecommendSpecialistCard",
      sourceButton: "Recomendar especialista",
      payload: {
        recommendedName: name,
        trade: rec.trade ?? "",
        commune: rec.commune ?? "",
        region: rec.region ?? "",
        recommendedContact: rec.recommendedContact ?? "",
        reason: rec.reason ?? "",
        recommenderName: rec.recommenderName ?? "",
        recommenderContact: rec.recommenderContact ?? "",
        recommendationSource: rec.source ?? "community",
        externalPlaceId: rec.externalPlaceId ?? "",
        // Referral reward: 1 credit granted to the referrer when the recommended
        // specialist is approved/incorporated (admin-confirmed, anti-fraud).
        rewardProgram: "refer_specialist_1_credit",
        rewardCredits: 1,
        rewardStatus: "pending_specialist_approval",
      },
    })) as { ok?: boolean; id?: string; stored?: boolean };
    return { ok: Boolean(result?.ok ?? true), id: result?.id, stored: result?.stored };
  } catch {
    return { ok: false };
  }
}
