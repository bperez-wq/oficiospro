// Alternative external provider sources (stubs).
// Prepared behind the same interface so we are not coupled to Google. Disabled
// by default; do not implement live calls until reviewed (legal/cost/risk).

import { GooglePlacesSource } from "./googlePlacesDiscovery";
import {
  DISABLED_RESULT,
  type DiscoveryResult,
  type ExternalProviderPreview,
  type ExternalProviderSearchInput,
  type ExternalProviderSource,
} from "./types";

/** OpenStreetMap / Overpass source - stub (open data alternative). */
export const OpenStreetMapSource: ExternalProviderSource = {
  id: "osm",
  isEnabled() {
    return false;
  },
  async search(_input: ExternalProviderSearchInput): Promise<DiscoveryResult> {
    return DISABLED_RESULT;
  },
  async getDetails(_externalPlaceId: string): Promise<ExternalProviderPreview | null> {
    return null;
  },
  buildExternalUrl(externalPlaceId: string): string {
    return `https://www.openstreetmap.org/?mlat=0&mlon=0#${encodeURIComponent(externalPlaceId)}`;
  },
};

/** Manually curated directory loaded by operations - stub. */
export const ManualDirectorySource: ExternalProviderSource = {
  id: "manual",
  isEnabled() {
    return false;
  },
  async search(_input: ExternalProviderSearchInput): Promise<DiscoveryResult> {
    return DISABLED_RESULT;
  },
  async getDetails(_externalPlaceId: string): Promise<ExternalProviderPreview | null> {
    return null;
  },
  buildExternalUrl(externalPlaceId: string): string {
    return `/contacto?externalProvider=${encodeURIComponent(externalPlaceId)}`;
  },
};

/** Default source used by the UI. Swap here to change provider. */
export const defaultExternalProviderSource: ExternalProviderSource = GooglePlacesSource;

export const externalProviderSources: ExternalProviderSource[] = [
  GooglePlacesSource,
  OpenStreetMapSource,
  ManualDirectorySource,
];
