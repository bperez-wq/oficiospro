// Stub seguro del cliente Soro SEO.
//
// NO llama a ninguna API. No existe integracion real todavia: falta
// documentacion oficial de la API de Soro y credenciales. Este adapter
// existe para fijar el contrato y evitar que una integracion futura
// habilite autopublicacion por accidente.
//
// Pendiente para Codex (ver docs/soro-seo-integration-plan.md):
// - Implementar fetch real solo cuando existan SORO_API_KEY / SORO_PROJECT_ID.
// - Mantener publishDraft() SIEMPRE deshabilitado: la publicacion es humana.

export type SoroClientStatus = "disabled" | "enabled";

export type SoroClientResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: SoroClientStatus; reason: string };

export type SoroClientConfig = {
  apiKey?: string;
  projectId?: string;
  webhookSecret?: string;
};

function readConfig(): SoroClientConfig {
  // Variables esperadas a futuro: SORO_API_KEY, SORO_PROJECT_ID, SORO_WEBHOOK_SECRET.
  // Nunca hardcodear claves en este archivo.
  return {
    apiKey: process.env.SORO_API_KEY,
    projectId: process.env.SORO_PROJECT_ID,
    webhookSecret: process.env.SORO_WEBHOOK_SECRET,
  };
}

export function getSoroClientStatus(): SoroClientStatus {
  const config = readConfig();
  return config.apiKey && config.projectId ? "enabled" : "disabled";
}

const DISABLED: { ok: false; status: SoroClientStatus; reason: string } = {
  ok: false,
  status: "disabled",
  reason:
    "Integracion Soro no configurada. La importacion es manual via content/soro-drafts/ y scripts/import-soro-draft.mjs.",
};

/** Futuro: traer keywords investigadas en Soro. Hoy: deshabilitado. */
export async function fetchKeywordIdeas(): Promise<SoroClientResult<never[]>> {
  return DISABLED;
}

/** Futuro: traer briefs generados en Soro. Hoy: deshabilitado. */
export async function fetchBriefs(): Promise<SoroClientResult<never[]>> {
  return DISABLED;
}

/** Futuro: traer borradores como Markdown para pasar por soro:audit. Hoy: deshabilitado. */
export async function fetchDrafts(): Promise<SoroClientResult<never[]>> {
  return DISABLED;
}

/**
 * Publicacion directa desde Soro: PROHIBIDA por politica editorial.
 * Esta funcion existe solo para dejar el contrato explicito y siempre falla.
 */
export async function publishDraft(): Promise<SoroClientResult<never>> {
  return {
    ok: false,
    status: getSoroClientStatus(),
    reason:
      "Autopublicacion deshabilitada por politica editorial (docs/soro-seo-editorial-policy.md). La publicacion requiere revision humana.",
  };
}
