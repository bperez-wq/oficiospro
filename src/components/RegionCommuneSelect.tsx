"use client";

import { SearchableSelect } from "@/components/SearchableSelect";
import {
  ALL_COMMUNES_VALUE,
  ALL_REGIONS_VALUE,
  allRegionOptions,
  communesForRegion,
  regionOptions,
  type SelectOption,
} from "@/lib/catalog";

type RegionCommuneSelectProps = {
  region: string;
  commune: string;
  onRegionChange: (regionCode: string) => void;
  onCommuneChange: (commune: string) => void;
  regionLabel?: string;
  communeLabel?: string;
  regionPlaceholder?: string;
  communePlaceholder?: string;
  required?: boolean;
  allowAllRegions?: boolean;
  allRegionLabel?: string;
  allCommuneLabel?: string;
  regionClassName?: string;
  communeClassName?: string;
};

export function RegionCommuneSelect({
  region,
  commune,
  onRegionChange,
  onCommuneChange,
  regionLabel = "Región",
  communeLabel = "Comuna",
  regionPlaceholder = "Selecciona región",
  communePlaceholder = "Busca comuna",
  required = false,
  allowAllRegions = false,
  allRegionLabel = "Todas las regiones",
  allCommuneLabel = "Todas las comunas",
  regionClassName = "",
  communeClassName = "",
}: RegionCommuneSelectProps) {
  const regionSelectOptions = allowAllRegions ? relabelAllOption(allRegionOptions, allRegionLabel) : regionOptions;
  const hasSpecificRegion = Boolean(region && region !== ALL_REGIONS_VALUE);
  const dependentCommunes = hasSpecificRegion ? communesForRegion(region) : [];
  const communeSelectOptions: SelectOption[] =
    allowAllRegions && hasSpecificRegion
      ? [{ value: ALL_COMMUNES_VALUE, label: allCommuneLabel }, ...dependentCommunes]
      : dependentCommunes;
  const disabledCommuneOptions =
    allowAllRegions && commune === ALL_COMMUNES_VALUE ? [{ value: ALL_COMMUNES_VALUE, label: allCommuneLabel }] : [];

  function changeRegion(nextRegion: string) {
    onRegionChange(nextRegion);
  }

  return (
    <>
      <SearchableSelect
        label={regionLabel}
        value={region}
        options={regionSelectOptions}
        onChange={changeRegion}
        placeholder={regionPlaceholder}
        required={required}
        className={regionClassName}
      />
      <SearchableSelect
        label={communeLabel}
        value={commune}
        options={hasSpecificRegion ? communeSelectOptions : disabledCommuneOptions}
        onChange={onCommuneChange}
        placeholder={hasSpecificRegion ? communePlaceholder : "Selecciona una región primero"}
        required={required && hasSpecificRegion && !allowAllRegions}
        disabled={!hasSpecificRegion}
        className={communeClassName}
      />
    </>
  );
}

function relabelAllOption(options: SelectOption[], label: string) {
  return options.map((option) => (option.value === ALL_REGIONS_VALUE ? { ...option, label } : option));
}
