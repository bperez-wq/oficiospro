#!/usr/bin/env node
/**
 * OficiosPro MCP Server (read-only).
 *
 * Exposes the existing OficiosPro admin API (model health, specialists,
 * conversion events, CRM, leads) to an MCP client as READ-ONLY tools.
 *
 * It only performs HTTP GET requests against the deployed OficiosPro Worker.
 * It never writes, never touches D1/payments/CRM mutations, and never
 * modifies the platform. Authentication uses an admin token via env.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ----------------------------- Constants ---------------------------------

function normalizeBaseUrl(raw: string | undefined): string {
  let value = (raw || "https://oficiospro.cl").trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  return value;
}

const BASE_URL = normalizeBaseUrl(process.env.OFICIOSPRO_BASE_URL);
const ADMIN_TOKEN = (process.env.OFICIOSPRO_ADMIN_TOKEN || "").trim();
const REQUEST_TIMEOUT_MS = 30000;
const CHARACTER_LIMIT = 25000; // Max characters per response before truncation.

enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}

// ----------------------------- HTTP client -------------------------------

type ApiResult = Record<string, unknown>;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Perform an authenticated read-only GET against the OficiosPro admin API. */
async function apiGet(path: string, query: Record<string, string | number | undefined> = {}): Promise<ApiResult> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && `${value}`.length > 0) url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "x-admin-token": ADMIN_TOKEN,
      },
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as ApiResult;
    if (!response.ok || data.ok === false) {
      throw new ApiError(String(data.error ?? `http_${response.status}`), response.status);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/** Map errors to clear, actionable guidance for the agent. */
function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.message === "unauthorized" || error.status === 401 || error.status === 403) {
      return "Error: token admin invalido o sin permisos. Revisa OFICIOSPRO_ADMIN_TOKEN.";
    }
    if (error.message === "database_not_configured") return "Error: la base D1 no esta configurada en el entorno consultado.";
    if (error.message === "crm_tables_not_ready" || error.message === "crm_schema_not_ready") return "Error: las tablas CRM aun no estan listas en ese entorno.";
    if (error.status === 404) return "Error: endpoint no encontrado. Revisa OFICIOSPRO_BASE_URL.";
    if (error.status === 429) return "Error: limite de peticiones alcanzado. Espera unos segundos y reintenta.";
    return `Error: la API respondio con un fallo (${error.message}).`;
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Error: la peticion expiro (timeout). Reintenta o revisa la conectividad.";
  }
  return `Error inesperado: ${error instanceof Error ? error.message : String(error)}`;
}

// ----------------------------- Formatting --------------------------------

function asRows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function compact(record: Record<string, unknown>, max = 8): string {
  return Object.entries(record)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, max)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" | ");
}

function rowsToMarkdown(title: string, rows: Record<string, unknown>[], offset: number): string {
  const lines = [`# ${title}`, "", `Mostrando ${rows.length} registro(s) desde offset ${offset}.`, ""];
  rows.forEach((row, index) => {
    const label = String(row.id ?? row.name ?? row.title ?? `#${offset + index + 1}`);
    lines.push(`## ${label}`);
    lines.push(compact(row));
    lines.push("");
  });
  if (!rows.length) lines.push("_Sin registros para los parametros indicados._");
  return lines.join("\n");
}

function objectToMarkdown(title: string, obj: Record<string, unknown>): string {
  const lines = [`# ${title}`, ""];
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) lines.push(`- **${key}**: ${value.length} elemento(s)`);
    else if (value && typeof value === "object") lines.push(`- **${key}**: ${JSON.stringify(value)}`);
    else lines.push(`- **${key}**: ${String(value)}`);
  }
  return lines.join("\n");
}

type ListParams = { limit: number; offset: number; response_format: ResponseFormat };

/** Build a list response: structured content + chosen text format, with truncation. */
function buildListResponse(title: string, rows: Record<string, unknown>[], params: ListParams) {
  let working = rows;
  let truncated = false;
  const render = (): string =>
    params.response_format === ResponseFormat.MARKDOWN
      ? rowsToMarkdown(title, working, params.offset)
      : JSON.stringify({ count: working.length, offset: params.offset, items: working, truncated }, null, 2);

  let text = render();
  while (text.length > CHARACTER_LIMIT && working.length > 1) {
    working = working.slice(0, Math.max(1, Math.floor(working.length / 2)));
    truncated = true;
    text = render();
  }

  const hasMore = rows.length >= params.limit;
  const output = {
    count: working.length,
    offset: params.offset,
    has_more: hasMore,
    ...(hasMore ? { next_offset: params.offset + params.limit } : {}),
    truncated,
    ...(truncated ? { truncation_message: "Respuesta truncada por tamano. Usa 'offset'/'limit' o filtros para ver mas." } : {}),
    items: working,
  };
  return { content: [{ type: "text" as const, text }], structuredContent: output };
}

// ----------------------------- Schemas -----------------------------------

const paginationShape = {
  limit: z.number().int().min(1).max(500).default(100).describe("Maximo de registros a devolver (1-500)."),
  offset: z.number().int().min(0).default(0).describe("Registros a saltar para paginacion."),
  response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Formato de salida: 'markdown' o 'json'."),
};

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;

// ----------------------------- Server ------------------------------------

const server = new McpServer({ name: "oficiospro-mcp-server", version: "1.0.0" });

server.registerTool(
  "oficiospro_crm_overview",
  {
    title: "OficiosPro - Resumen CRM",
    description: `Resumen operativo del CRM de OficiosPro (solo lectura).

Devuelve conteos clave: leads nuevos, especialistas pendientes, cotizaciones virtuales pendientes, tareas vencidas, empresas nuevas, incidencias de pago, oportunidades abiertas y distribucion por pipeline.

Args:
  - response_format ('markdown' | 'json'): formato de salida (default 'markdown').

Returns: objeto 'overview' con los conteos. No modifica datos. GET /api/admin/crm/overview.`,
    inputSchema: { response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Formato de salida: 'markdown' o 'json'.") },
    annotations: READ_ONLY,
  },
  async ({ response_format }) => {
    try {
      const data = await apiGet("/api/admin/crm/overview");
      const overview = (data.overview as Record<string, unknown>) ?? {};
      const text = response_format === ResponseFormat.MARKDOWN ? objectToMarkdown("Resumen CRM OficiosPro", overview) : JSON.stringify(overview, null, 2);
      return { content: [{ type: "text", text }], structuredContent: overview };
    } catch (error) {
      return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
    }
  },
);

server.registerTool(
  "oficiospro_list_specialists",
  {
    title: "OficiosPro - Listar especialistas",
    description: `Lista postulaciones/perfiles de especialistas registrados (solo lectura).

Args: limit (1-500, default 100), offset (default 0), response_format ('markdown' | 'json').
Returns: { count, offset, has_more, items } con campos como id, name, trade, commune, status, createdAt.
Usar cuando: "cuantos especialistas se registraron", "ultimos postulantes". GET /api/admin/specialists.`,
    inputSchema: { ...paginationShape },
    annotations: READ_ONLY,
  },
  async ({ limit, offset, response_format }) => {
    try {
      const data = await apiGet("/api/admin/specialists", { limit, offset });
      return buildListResponse("Especialistas OficiosPro", asRows(data.specialists), { limit, offset, response_format });
    } catch (error) {
      return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
    }
  },
);

server.registerTool(
  "oficiospro_list_conversion_events",
  {
    title: "OficiosPro - Eventos de conversion",
    description: `Lista eventos de conversion del embudo (trafico, CTAs, pasos de registro, asistente) (solo lectura).

Args: limit (1-500, default 100), offset (default 0), event_name (string opcional, coincidencia exacta), response_format.
Returns: { count, offset, has_more, items } con campos como eventName, source, campaign, path, createdAt.
Ejemplos de event_name: "click_offer_services", "specialist_application_started", "founder_landing_view".
GET /api/admin/conversion-events.`,
    inputSchema: { ...paginationShape, event_name: z.string().min(1).max(120).optional().describe("Filtro opcional por nombre exacto de evento.") },
    annotations: READ_ONLY,
  },
  async ({ limit, offset, response_format, event_name }) => {
    try {
      const data = await apiGet("/api/admin/conversion-events", { limit, offset });
      let rows = asRows(data.conversionEvents);
      if (event_name) rows = rows.filter((row) => String(row.eventName ?? row.name ?? row.event ?? "") === event_name);
      const title = event_name ? `Eventos de conversion: ${event_name}` : "Eventos de conversion OficiosPro";
      return buildListResponse(title, rows, { limit, offset, response_format });
    } catch (error) {
      return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
    }
  },
);

enum CrmResource {
  OPPORTUNITIES = "opportunities",
  TASKS = "tasks",
  CONTACTS = "contacts",
  COMPANIES = "companies",
  ACTIVITY = "activity",
  WORK_QUEUE = "work-queue",
  REPORTS = "reports",
}

server.registerTool(
  "oficiospro_list_crm",
  {
    title: "OficiosPro - Listar recurso CRM",
    description: `Lista un recurso del CRM de OficiosPro (solo lectura).

Args:
  - resource: 'opportunities' | 'tasks' | 'contacts' | 'companies' | 'activity' | 'work-queue' | 'reports'
  - limit (1-500, default 100), offset (default 0), response_format ('markdown' | 'json').
Returns: { count, offset, has_more, items } con los registros del recurso.
Usar cuando: "oportunidades abiertas", "tareas del CRM", "actividad reciente". GET /api/admin/crm/{resource}.`,
    inputSchema: { resource: z.nativeEnum(CrmResource).describe("Recurso CRM a listar."), ...paginationShape },
    annotations: READ_ONLY,
  },
  async ({ resource, limit, offset, response_format }) => {
    try {
      const data = await apiGet(`/api/admin/crm/${resource}`, { limit, offset });
      const key = resource === "work-queue" ? "workQueue" : resource;
      const rows = asRows(data[key] ?? data[resource] ?? data.items ?? data.results);
      return buildListResponse(`CRM OficiosPro - ${resource}`, rows, { limit, offset, response_format });
    } catch (error) {
      return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
    }
  },
);

server.registerTool(
  "oficiospro_list_leads",
  {
    title: "OficiosPro - Listar leads",
    description: `Lista los leads capturados (solo lectura).

Args: limit (1-500, default 100), offset (default 0), response_format ('markdown' | 'json').
Returns: { count, offset, has_more, items } con campos como id, name, email, phone, type, status, createdAt.
Usar cuando: "cuantos leads hay", "ultimos contactos". GET /api/admin/leads.`,
    inputSchema: { ...paginationShape },
    annotations: READ_ONLY,
  },
  async ({ limit, offset, response_format }) => {
    try {
      const data = await apiGet("/api/admin/leads", { limit, offset });
      return buildListResponse("Leads OficiosPro", asRows(data.leads), { limit, offset, response_format });
    } catch (error) {
      return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
    }
  },
);

// ----------------------------- Bootstrap ---------------------------------

async function main(): Promise<void> {
  if (!ADMIN_TOKEN) {
    console.error("ERROR: falta la variable de entorno OFICIOSPRO_ADMIN_TOKEN.");
    process.exit(1);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`oficiospro-mcp-server conectado (base: ${BASE_URL}) via stdio.`);
}

main().catch((error) => {
  console.error("Fallo al iniciar oficiospro-mcp-server:", error);
  process.exit(1);
});
