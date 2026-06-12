const profileBase = "/assets/oficios/perfiles";

export type ProfileImageInput = {
  name?: string | null;
  src?: string | null;
  serviceTypeId?: string | null;
  specialty?: string | null;
  category?: string | null;
  allowCategoryFallback?: boolean;
};

export const namedProfileImageSlugs = [
  "alejandra-acuna",
  "alvaro-medina",
  "andrea-bustos",
  "andres-ibarra",
  "antonia-herrera",
  "barbara-aguilera",
  "camila-arancibia",
  "carolina-poblete",
  "catalina-vargas",
  "claudia-donoso",
  "constanza-olivares",
  "constanza-silva",
  "cristobal-herrera",
  "daniela-morales",
  "daniela-ponce",
  "diego-carrasco",
  "eduardo-cardenas",
  "elena-morales",
  "elisa-maldonado",
  "felipe-rojas",
  "fernanda-tapia",
  "francisca-leiva",
  "francisco-soto",
  "gabriela-toledo",
  "hector-vidal",
  "ignacio-campos",
  "isidora-lagos",
  "javiera-nunez",
  "jorge-salinas",
  "josefa-navarrete",
  "josefina-soto",
  "katherine-rojas",
  "lorena-cisternas",
  "marco-pena",
  "maria-jose-pino",
  "marisol-caceres",
  "monica-saavedra",
  "natalia-quezada",
  "nicolas-bravo",
  "oscar-sepulveda",
  "patricia-alarcon",
  "patricio-herrera",
  "paula-contreras",
  "paulina-salazar",
  "pilar-san-martin",
  "rocio-gallardo",
  "rodrigo-palma",
  "romina-escobar",
  "sebastian-munoz",
  "sofia-vergara",
  "tamara-espinoza",
  "valentina-rivas",
  "victor-mendoza",
] as const;

const namedProfileImageSlugSet = new Set<string>(namedProfileImageSlugs);

const categoryProfileFallbacks: Record<string, string> = {
  electricidad: `${profileBase}/electricista-mujer-01.jpg`,
  "tableros electricos": `${profileBase}/electricista-mujer-02.jpg`,
  gasfiteria: `${profileBase}/gasfiter-mujer-01.jpg`,
  gasfiter: `${profileBase}/gasfiter-mujer-01.jpg`,
  filtracion: `${profileBase}/gasfiter-mujer-01.jpg`,
  climatizacion: `${profileBase}/climatizacion-mujer-01.jpg`,
  refrigeracion: `${profileBase}/climatizacion-mujer-01.jpg`,
  hvac: `${profileBase}/climatizacion-mujer-01.jpg`,
  jardineria: `${profileBase}/jardinera-mujer-01.jpg`,
  jardin: `${profileBase}/jardinera-mujer-01.jpg`,
  pintura: `${profileBase}/pintora-mujer-01.jpg`,
  industrial: `${profileBase}/industrial-mujer-01.jpg`,
  industria: `${profileBase}/industrial-mujer-01.jpg`,
  empresas: `${profileBase}/industrial-mujer-02.jpg`,
};

export function normalizeProfileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function profileImageByName(name?: string | null) {
  if (!name) return undefined;
  const slug = normalizeProfileName(name);
  return namedProfileImageSlugSet.has(slug) ? `${profileBase}/${slug}.jpg` : undefined;
}

export function isProfileImagePath(src?: string | null) {
  return Boolean(src?.startsWith(`${profileBase}/`));
}

export function isKnownWorkImagePath(src?: string | null) {
  if (!src) return false;
  if (src.startsWith("/assets/work-") || src.startsWith("/assets/hero-")) return true;
  return src.startsWith("/assets/oficios/") && !isProfileImagePath(src);
}

export function profileFallbackByTrade(serviceTypeId?: string | null, specialty?: string | null, category?: string | null) {
  const key = normalizeProfileName([serviceTypeId, specialty, category].filter(Boolean).join(" "));
  const match = Object.entries(categoryProfileFallbacks).find(([needle]) => key.includes(normalizeProfileName(needle)));
  return match?.[1];
}

export function specialistInitials(name?: string | null) {
  return (name || "OP")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getSpecialistProfileImage({
  name,
  src,
  serviceTypeId,
  specialty,
  category,
  allowCategoryFallback = false,
}: ProfileImageInput) {
  return (
    profileImageByName(name) ??
    (src && !isKnownWorkImagePath(src) ? src : undefined) ??
    (allowCategoryFallback ? profileFallbackByTrade(serviceTypeId, specialty, category) : undefined)
  );
}
