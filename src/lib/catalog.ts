import { chileCommunes } from "@/data/chileCommunes";
import { allServiceSpecialties, serviceTypes } from "@/data/marketplace";
import { otherServiceLabels } from "@/data/serviceCatalog";

export const OTHER_SERVICE_VALUE = "__otro_servicio__";
export const OTHER_SERVICE_LABEL = "Otro / No encontré mi servicio";

export type SelectOption = {
  value: string;
  label: string;
  meta?: string;
  group?: string;
};

const collator = new Intl.Collator("es-CL", { sensitivity: "base", numeric: true });
const canonicalPlaces: Record<string, string> = {
  biobio: "Biobío",
  camina: "Camiña",
  chillan: "Chillán",
  "chillan viejo": "Chillán Viejo",
  concepcion: "Concepción",
  concon: "Concón",
  copiapo: "Copiapó",
  curacavi: "Curacaví",
  curico: "Curicó",
  diguillin: "Diguillín",
  "juan fernandez": "Juan Fernández",
  "la union": "La Unión",
  limari: "Limarí",
  "los angeles": "Los Ángeles",
  "los rios": "Los Ríos",
  mafil: "Máfil",
  maipu: "Maipú",
  "maria elena": "María Elena",
  "maria pinto": "María Pinto",
  nuble: "Ñuble",
  niquen: "Ñiquén",
  nunoa: "Ñuñoa",
  olmue: "Olmué",
  penalolen: "Peñalolén",
  "penasco": "Peñasco",
  "penaflor": "Peñaflor",
  puchuncavi: "Puchuncaví",
  quilpue: "Quilpué",
  quillon: "Quillón",
  "rio bueno": "Río Bueno",
  "rio hurtado": "Río Hurtado",
  "san fabian": "San Fabián",
  "san joaquin": "San Joaquín",
  "san jose de maipo": "San José de Maipo",
  "san nicolas": "San Nicolás",
  "san ramon": "San Ramón",
  "santa maria": "Santa María",
  tarapaca: "Tarapacá",
  valparaiso: "Valparaíso",
  vicuna: "Vicuña",
  "vina del mar": "Viña del Mar",
};

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizePlaceName(value: string) {
  return canonicalPlaces[normalizeSearch(value)] ?? value;
}

export function sortByLabel<T extends { label: string }>(items: T[]) {
  return [...items].sort((a, b) => collator.compare(a.label, b.label));
}

export const communeOptions: SelectOption[] = sortByLabel(
  Array.from(
    chileCommunes
      .map((commune) => ({
        value: normalizePlaceName(commune.name),
        label: normalizePlaceName(commune.name),
        meta: normalizePlaceName(commune.regionName),
        group: normalizePlaceName(commune.regionName),
      }))
      .reduce((map, commune) => map.set(normalizeSearch(commune.label), commune), new Map<string, SelectOption>())
      .values(),
  ),
);

export const regionOptions: SelectOption[] = sortByLabel(
  Array.from(new Set(chileCommunes.map((commune) => normalizePlaceName(commune.regionName)))).map((region) => ({
    value: region,
    label: region,
  })),
);

export function communesForRegion(region: string) {
  const filtered = region ? communeOptions.filter((commune) => normalizeSearch(commune.meta ?? "") === normalizeSearch(region)) : communeOptions;
  return filtered.length ? filtered : communeOptions;
}

export const serviceTypeOptions: SelectOption[] = sortByLabel(
  serviceTypes.map((type) => ({
    value: type.id,
    label: type.name,
    meta: type.description,
    group: type.marginType === "company" ? "Empresas e industria" : "Hogar y personas",
  })),
);

// Nombres cortos + subtítulo para el buscador del hero (no afecta los formularios internos).
const heroServiceTypeOverrides: Record<string, { label: string; meta: string }> = {
  hogar: { label: "Hogar", meta: "Servicios técnicos y reparaciones para casa" },
  empresas: { label: "Empresas", meta: "Mantención, oficinas, retail y comunidades" },
  "climatizacion-refrigeracion": { label: "Climatización", meta: "Aire acondicionado, bombas de calor y HVAC" },
  emergencias: { label: "Emergencias", meta: "Servicios urgentes 24/7" },
  "agricultura-campos": { label: "Agricultura y campos", meta: "Riego, contratistas y operación rural" },
  agroindustria: { label: "Agroindustria", meta: "Packing, frío, líneas de proceso y mantención" },
  industria: { label: "Industria", meta: "Mantención, mecánica, automatización y equipos" },
};

const heroServiceTypeOrder = [
  "hogar",
  "empresas",
  "climatizacion-refrigeracion",
  "emergencias",
  "agricultura-campos",
  "agroindustria",
  "industria",
];

export const heroServiceTypeOptions: SelectOption[] = (() => {
  const byId = new Map(serviceTypes.map((type) => [type.id, type] as const));
  const seen = new Set<string>();
  const toOption = (id: string): SelectOption | null => {
    const type = byId.get(id);
    if (!type) return null;
    const override = heroServiceTypeOverrides[id];
    return { value: id, label: override?.label ?? type.name, meta: override?.meta ?? type.description };
  };

  const ordered: SelectOption[] = [];
  for (const id of heroServiceTypeOrder) {
    const option = toOption(id);
    if (option) {
      seen.add(id);
      ordered.push(option);
    }
  }

  const rest = sortByLabel(
    serviceTypes
      .filter((type) => !seen.has(type.id))
      .map((type) => toOption(type.id))
      .filter((option): option is SelectOption => option !== null),
  );

  return [...ordered, ...rest];
})();

export function specialtyOptionsForType(serviceTypeId: string, includeOther = true) {
  const type = serviceTypes.find((item) => item.id === serviceTypeId);
  const specialties = type?.specialties ?? allServiceSpecialties.map((item) => item.name);
  const unique = Array.from(new Set(specialties.filter((specialty) => !normalizeSearch(specialty).startsWith("otro servicio"))));
  const options = sortByLabel(
    unique.map((specialty) => ({
      value: specialty,
      label: specialty,
      group: type?.name,
    })),
  );
  return includeOther ? [...options, { value: OTHER_SERVICE_VALUE, label: otherLabelForType(type?.appliesTo ?? []) }] : options;
}

export const allSpecialtyOptions: SelectOption[] = [
  ...sortByLabel(Array.from(new Set(allServiceSpecialties.map((item) => item.name))).map((specialty) => ({ value: specialty, label: specialty }))),
  { value: OTHER_SERVICE_VALUE, label: OTHER_SERVICE_LABEL },
];

function otherLabelForType(appliesTo: string[]) {
  if (appliesTo.includes("agricola")) return "Otro servicio agrícola";
  if (appliesTo.includes("industrial")) return "Otro servicio industrial";
  if (appliesTo.includes("empresa")) return "Otro servicio de empresa";
  if (appliesTo.includes("hogar")) return "Otro servicio de hogar";
  return otherServiceLabels[4] ?? OTHER_SERVICE_LABEL;
}
