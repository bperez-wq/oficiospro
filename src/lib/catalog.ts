import { chileCommunes } from "@/data/chileCommunes";
import { allServiceSpecialties, serviceTypes } from "@/data/marketplace";

export const OTHER_SERVICE_VALUE = "__otro_servicio__";
export const OTHER_SERVICE_LABEL = "Otro / No encontré mi servicio";

export type SelectOption = {
  value: string;
  label: string;
  meta?: string;
};

const collator = new Intl.Collator("es-CL", { sensitivity: "base", numeric: true });

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function sortByLabel<T extends { label: string }>(items: T[]) {
  return [...items].sort((a, b) => collator.compare(a.label, b.label));
}

export const communeOptions: SelectOption[] = sortByLabel(
  Array.from(new Map(chileCommunes.map((commune) => [commune.name, commune])).values()).map((commune) => ({
    value: commune.name,
    label: commune.name,
    meta: commune.regionName,
  })),
);

export const regionOptions: SelectOption[] = sortByLabel(
  Array.from(new Set(chileCommunes.map((commune) => commune.regionName))).map((region) => ({
    value: region,
    label: region,
  })),
);

export function communesForRegion(region: string) {
  const filtered = region ? communeOptions.filter((commune) => commune.meta === region) : communeOptions;
  return filtered.length ? filtered : communeOptions;
}

export const serviceTypeOptions: SelectOption[] = sortByLabel(
  serviceTypes.map((type) => ({
    value: type.id,
    label: type.name,
    meta: type.description,
  })),
);

export function specialtyOptionsForType(serviceTypeId: string, includeOther = true) {
  const type = serviceTypes.find((item) => item.id === serviceTypeId);
  const specialties = type?.specialties ?? allServiceSpecialties.map((item) => item.name);
  const unique = Array.from(new Set(specialties));
  const options = sortByLabel(unique.map((specialty) => ({ value: specialty, label: specialty })));
  return includeOther ? [...options, { value: OTHER_SERVICE_VALUE, label: OTHER_SERVICE_LABEL }] : options;
}

export const allSpecialtyOptions: SelectOption[] = [
  ...sortByLabel(Array.from(new Set(allServiceSpecialties.map((item) => item.name))).map((specialty) => ({ value: specialty, label: specialty }))),
  { value: OTHER_SERVICE_VALUE, label: OTHER_SERVICE_LABEL },
];
