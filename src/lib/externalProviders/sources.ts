// External provider sources, behind one interface so we are not coupled to any
// single provider. The DEFAULT is OpenStreetMap: free, open data (ODbL), key-less
// and runs from the client, with no Terms-of-Service risk of building a competing
// database. Google Places stays as an optional, disabled-by-default alternative.

import { GooglePlacesSource } from "./googlePlacesDiscovery";
import { OpenStreetMapSource } from "./openStreetMapDiscovery";
import {
  DISABLED_RESULT,
  type DiscoveryResult,
  type ExternalProviderPreview,
  type ExternalProviderSearchInput,
  type ExternalProviderSource,
} from "./types";

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

/** Default source used by the UI. OpenStreetMap (open data, no cost, no key). */
export const defaultExternalProviderSource: ExternalProviderSource = OpenStreetMapSource;

export const externalProviderSources: ExternalProviderSource[] = [
  OpenStreetMapSource,
  GooglePlacesSource,
  ManualDirectorySource,
];
