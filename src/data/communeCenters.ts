export type CommuneCenter = {
  commune: string;
  region: string;
  lat: number;
  lng: number;
};

const centers: CommuneCenter[] = [
  { commune: "Santiago", region: "Metropolitana de Santiago", lat: -33.4489, lng: -70.6693 },
  { commune: "Santiago Centro", region: "Metropolitana de Santiago", lat: -33.4489, lng: -70.6693 },
  { commune: "Providencia", region: "Metropolitana de Santiago", lat: -33.4314, lng: -70.6093 },
  { commune: "Las Condes", region: "Metropolitana de Santiago", lat: -33.4088, lng: -70.5673 },
  { commune: "Nunoa", region: "Metropolitana de Santiago", lat: -33.4569, lng: -70.5975 },
  { commune: "Ñuñoa", region: "Metropolitana de Santiago", lat: -33.4569, lng: -70.5975 },
  { commune: "Vitacura", region: "Metropolitana de Santiago", lat: -33.391, lng: -70.572 },
  { commune: "La Florida", region: "Metropolitana de Santiago", lat: -33.5225, lng: -70.5983 },
  { commune: "Maipu", region: "Metropolitana de Santiago", lat: -33.511, lng: -70.757 },
  { commune: "Maipú", region: "Metropolitana de Santiago", lat: -33.511, lng: -70.757 },
  { commune: "Puente Alto", region: "Metropolitana de Santiago", lat: -33.6167, lng: -70.5758 },
  { commune: "San Miguel", region: "Metropolitana de Santiago", lat: -33.4854, lng: -70.6493 },
  { commune: "Penalolen", region: "Metropolitana de Santiago", lat: -33.486, lng: -70.532 },
  { commune: "Peñalolén", region: "Metropolitana de Santiago", lat: -33.486, lng: -70.532 },
  { commune: "Lo Barnechea", region: "Metropolitana de Santiago", lat: -33.351, lng: -70.518 },
  { commune: "Independencia", region: "Metropolitana de Santiago", lat: -33.4146, lng: -70.6654 },
  { commune: "Recoleta", region: "Metropolitana de Santiago", lat: -33.4069, lng: -70.6331 },
  { commune: "Macul", region: "Metropolitana de Santiago", lat: -33.486, lng: -70.599 },
  { commune: "La Reina", region: "Metropolitana de Santiago", lat: -33.44, lng: -70.552 },
  { commune: "Colina", region: "Metropolitana de Santiago", lat: -33.2037, lng: -70.6755 },
  { commune: "Valparaiso", region: "Valparaiso", lat: -33.0472, lng: -71.6127 },
  { commune: "Valparaíso", region: "Valparaíso", lat: -33.0472, lng: -71.6127 },
  { commune: "Vina del Mar", region: "Valparaiso", lat: -33.0245, lng: -71.5518 },
  { commune: "Viña del Mar", region: "Valparaíso", lat: -33.0245, lng: -71.5518 },
  { commune: "Quilpue", region: "Valparaiso", lat: -33.045, lng: -71.449 },
  { commune: "Quilpué", region: "Valparaíso", lat: -33.045, lng: -71.449 },
  { commune: "Rancagua", region: "O'Higgins", lat: -34.1708, lng: -70.7444 },
  { commune: "San Fernando", region: "O'Higgins", lat: -34.5833, lng: -70.9833 },
  { commune: "Talca", region: "Maule", lat: -35.4264, lng: -71.6554 },
  { commune: "Curico", region: "Maule", lat: -34.9828, lng: -71.2394 },
  { commune: "Curicó", region: "Maule", lat: -34.9828, lng: -71.2394 },
  { commune: "Linares", region: "Maule", lat: -35.8467, lng: -71.5931 },
  { commune: "Chillan", region: "Nuble", lat: -36.6063, lng: -72.1034 },
  { commune: "Chillán", region: "Ñuble", lat: -36.6063, lng: -72.1034 },
  { commune: "Concepcion", region: "Biobio", lat: -36.8269, lng: -73.0498 },
  { commune: "Concepción", region: "Biobío", lat: -36.8269, lng: -73.0498 },
  { commune: "Talcahuano", region: "Biobio", lat: -36.7248, lng: -73.1168 },
  { commune: "Los Angeles", region: "Biobio", lat: -37.4697, lng: -72.3537 },
  { commune: "Los Ángeles", region: "Biobío", lat: -37.4697, lng: -72.3537 },
  { commune: "Temuco", region: "La Araucania", lat: -38.7359, lng: -72.5904 },
  { commune: "Villarrica", region: "La Araucania", lat: -39.2857, lng: -72.2279 },
  { commune: "Valdivia", region: "Los Rios", lat: -39.8196, lng: -73.2452 },
  { commune: "Valdivia", region: "Los Ríos", lat: -39.8196, lng: -73.2452 },
  { commune: "Osorno", region: "Los Lagos", lat: -40.574, lng: -73.1335 },
  { commune: "Puerto Montt", region: "Los Lagos", lat: -41.4693, lng: -72.9424 },
  { commune: "Puerto Varas", region: "Los Lagos", lat: -41.3167, lng: -72.9833 },
  { commune: "La Serena", region: "Coquimbo", lat: -29.9027, lng: -71.2519 },
  { commune: "Coquimbo", region: "Coquimbo", lat: -29.9533, lng: -71.3436 },
  { commune: "Antofagasta", region: "Antofagasta", lat: -23.6509, lng: -70.3975 },
  { commune: "Calama", region: "Antofagasta", lat: -22.4544, lng: -68.9294 },
  { commune: "Iquique", region: "Tarapaca", lat: -20.2307, lng: -70.1357 },
  { commune: "Iquique", region: "Tarapacá", lat: -20.2307, lng: -70.1357 },
  { commune: "Arica", region: "Arica y Parinacota", lat: -18.4783, lng: -70.3126 },
  { commune: "Coyhaique", region: "Aysen", lat: -45.5712, lng: -72.0685 },
  { commune: "Coyhaique", region: "Aysén", lat: -45.5712, lng: -72.0685 },
  { commune: "Punta Arenas", region: "Magallanes", lat: -53.1638, lng: -70.9171 },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getCommuneCenter(commune?: string, region?: string): CommuneCenter | null {
  if (!commune || commune === "all") return null;
  const normalizedCommune = normalize(commune);
  const normalizedRegion = region ? normalize(region) : "";
  return (
    centers.find((center) => normalize(center.commune) === normalizedCommune && (!normalizedRegion || normalize(center.region) === normalizedRegion)) ??
    centers.find((center) => normalize(center.commune) === normalizedCommune) ??
    null
  );
}

