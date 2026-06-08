# Leads y email transaccional

OficiosPro captura solicitudes en una tabla común `lead_submissions` mediante el Worker. Los formularios mantienen una copia local en el navegador solo como respaldo, pero la fuente operacional debe ser Cloudflare D1.

## 1. Crear D1

```bash
npx wrangler d1 create oficiospro-leads
```

Cloudflare devolverá `database_name` y `database_id`.

## 2. Agregar binding DB

En `wrangler.toml`, descomenta y completa con el ID real:

```toml
[[d1_databases]]
binding = "DB"
database_name = "oficiospro-leads"
database_id = "ID_REAL_DE_CLOUDFLARE"
```

No uses un `database_id` inventado. Si `DB` no está configurado, los endpoints responden `database_not_configured` y la UI muestra contacto directo a `bperez@oficiospro.cl`.

## 3. Correr migraciones

```bash
npx wrangler d1 migrations apply oficiospro-leads
```

La migración inicial crea `lead_submissions` e índices por fecha, tipo, estado, región, comuna, email y teléfono.

## 4. Variables de entorno

Configura en Cloudflare Workers:

```bash
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put RESEND_API_KEY
```

Variables recomendadas:

```text
LEADS_TO_EMAIL=bperez@oficiospro.cl
LEADS_FROM_EMAIL=OficiosPro <notificaciones@oficiospro.cl>
LEADS_REPLY_TO_EMAIL=bperez@oficiospro.cl
```

`RESEND_API_KEY` es opcional. Si no existe, el lead se guarda igual y la respuesta indica `emailSent: false`.

## 5. DNS para Resend

En Resend, agrega el dominio `oficiospro.cl`, configura SPF/DKIM según las instrucciones del proveedor y valida el dominio antes de usar `notificaciones@oficiospro.cl` como remitente.

## 6. Probar un lead

Desde la web:

1. Abre `/contacto`.
2. Envía un mensaje.
3. Si D1 está configurado, el endpoint responde `ok: true`.
4. Si Resend está configurado, responde `emailSent: true`.

Desde API:

```bash
curl -X POST https://TU_DOMINIO/api/leads \
  -H "Content-Type: application/json" \
  -d '{"leadType":"contact_message","fullName":"Juan Pérez","email":"juan@example.com","phone":"+56 9 1234 5678","problemDescription":"Consulta desde prueba"}'
```

## 7. Revisar leads por admin

Los endpoints admin requieren Bearer token:

```bash
curl https://TU_DOMINIO/api/admin/leads \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Actualizar estado:

```bash
curl -X PATCH https://TU_DOMINIO/api/admin/leads/lead_id/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"contactado","priority":"alta"}'
```

Si `ADMIN_TOKEN` no está configurado, los endpoints admin responden `admin_token_not_configured`.

## 8. Si email no está configurado

El lead queda guardado en D1 con `email_sent = 0`. Revisa los registros desde `/api/admin/leads` y configura Resend cuando esté listo el DNS transaccional.
