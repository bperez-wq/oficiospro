# OficiosPro MCP Server (read-only)

Servidor [MCP](https://modelcontextprotocol.io) que expone la **API admin existente** de OficiosPro a un cliente MCP (Claude Desktop, etc.) como herramientas de **solo lectura**.

No modifica la plataforma: solo hace peticiones HTTP `GET` al Worker desplegado. No toca Worker, D1, `wrangler.toml`, pagos ni mutaciones del CRM.

## Herramientas

Todas son `readOnlyHint: true`:

| Tool | Qué hace | Endpoint |
|---|---|---|
| `oficiospro_crm_overview` | Resumen del CRM (leads nuevos, especialistas/cotizaciones pendientes, tareas vencidas, oportunidades, pipeline) | `GET /api/admin/crm/overview` |
| `oficiospro_list_specialists` | Lista postulaciones/perfiles de especialistas (paginado) | `GET /api/admin/specialists` |
| `oficiospro_list_conversion_events` | Eventos del embudo (CTAs, pasos de registro, asistente); filtro opcional `event_name` | `GET /api/admin/conversion-events` |
| `oficiospro_list_crm` | Lista un recurso CRM: `opportunities`, `tasks`, `contacts`, `companies`, `activity`, `work-queue`, `reports` | `GET /api/admin/crm/{resource}` |
| `oficiospro_list_leads` | Lista leads capturados (paginado) | `GET /api/admin/leads` |

Cada tool acepta `response_format` (`markdown` por defecto, o `json`), y las de lista aceptan `limit` (1-500) y `offset`.

## Requisitos

- Node.js >= 18
- Un **admin token** válido de OficiosPro (el mismo que usas en `/admin/crm/business-health`).

## Instalación y build

```bash
cd tools/oficiospro-mcp-server
npm install
npm run build
```

Esto genera `dist/index.js`.

## Configuración

Variables de entorno:

- `OFICIOSPRO_ADMIN_TOKEN` (requerida): tu admin token. **No lo subas al repo.**
- `OFICIOSPRO_BASE_URL` (opcional): por defecto `https://oficiospro.cl`. Útil para apuntar a un entorno de pruebas.

Copia `.env.example` a `.env` para referencia local (el servidor lee las variables del entorno del proceso; en Claude Desktop se pasan en `env`).

## Conectar a Claude Desktop

Edita tu `claude_desktop_config.json` (ver `claude_desktop_config.example.json`):

```json
{
  "mcpServers": {
    "oficiospro": {
      "command": "node",
      "args": ["C:\\Users\\Benjamin\\oficiospro\\oficiospro\\tools\\oficiospro-mcp-server\\dist\\index.js"],
      "env": {
        "OFICIOSPRO_BASE_URL": "https://oficiospro.cl",
        "OFICIOSPRO_ADMIN_TOKEN": "tu-token-real"
      }
    }
  }
}
```

Reinicia Claude Desktop. Verás las herramientas `oficiospro_*`.

## Probar con el MCP Inspector

```bash
OFICIOSPRO_ADMIN_TOKEN=tu-token npx @modelcontextprotocol/inspector node dist/index.js
```

## Notas de seguridad

- Solo lectura: el servidor nunca hace `POST`/`PATCH`/`DELETE`.
- El admin token es sensible: trátalo como secreto y no lo commitees.
- No se incluye `dist/` ni `node_modules/` en el repo; se generan localmente.
