// External provider discovery - shared types.
// These power a SEPARATE, clearly-labeled "external results" section shown only
// when OficiosPro has low own coverage. External results are NEVER verified by
// OficiosPro and are never mixed with the OficiosPro specialist ranking.

export type ExternalProviderSourceId = "google_places" | "osm" | "manual";

export type DiscoveryStatus = "ok" | "disabled" | "error";

/** Minimal, live preview of an external provider. Restricted Places content
 * (reviews, photos, phones, addresses) is shown live and never persisted. */
export type ExternalProviderPreview = {
  source: ExternalProviderSourceId;
  externalPlaceId: string;
  name: string;
  category?: string;
  commune?: string;
  region?: string;
  /** Shown live only if returned by the source; never stored as own base. */
  rating?: number;
  userRatingsTotal?: number;
  mapsUrl: string;
  /** Always false: external results are not verified by OficiosPro. */
  verified: false;
};

export type ExternalProviderSearchInput = {
  trade: string;
  commune?: string;
  region?: string;
  lat?: number;
  lng?: number;
  query?: string;
  limit?: number;
};

export type DiscoveryResult = {
  status: DiscoveryStatus;
  providers: ExternalProviderPreview[];
  attribution: string;
  error?: string;
};

/** Common interface so we are not coupled to a single provider. */
export interface ExternalProviderSource {
  readonly id: ExternalProviderSourceId;
  isEnabled(): boolean;
  search(input: ExternalProviderSearchInput): Promise<DiscoveryResult>;
  getDetails(externalPlaceId: string): Promise<ExternalProviderPreview | null>;
  buildExternalUrl(externalPlaceId: string): string;
}

export const DISABLED_RESULT: DiscoveryResult = {
  status: "disabled",
  providers: [],
  attribution: "",
};
