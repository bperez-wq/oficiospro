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

No uses un `database_id` inventado. Si `DB` no está configurado, los endpoints pueden responder `database_not_configured` como estado operacional sin bloquear la UI; el frontend guarda respaldo local y muestra: “Estamos activando la recepción automática. Escríbenos a bperez@oficiospro.cl.”

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

## 5. Postulaciones de especialistas

- Las certificaciones son declarativas y opcionales.
- El especialista puede marcar `No tengo certificaciones formales`.
- OficiosPro guarda la postulacion con `status = postulado`, `reviewStatus = pendiente_revision` y `certificationStatus` segun lo declarado.
- El especialista declara `specialistExpectedPayoutCLP`; no controla creditos cliente, Comision OficiosPro ni valor del credito.
- El Worker calcula `calculatedClientCredits` internamente desde la tarifa CLP declarada antes de guardar/enviar el payload.
- Si `DB` no esta configurada, el Worker responde sin romper la UI, intenta email si `RESEND_API_KEY` existe y el frontend conserva respaldo en localStorage.
- Si `RESEND_API_KEY` no esta configurada, el lead puede quedar guardado y la UI informa recepcion sin prometer correo.

## 6. DNS para Resend

En Resend, agrega el dominio `oficiospro.cl`, configura SPF/DKIM según las instrucciones del proveedor y valida el dominio antes de usar `notificaciones@oficiospro.cl` como remitente.

## 7. Probar un lead

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

## 8. Revisar leads por admin

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

## 9. Si email no está configurado

El lead queda guardado en D1 con `email_sent = 0`. Revisa los registros desde `/api/admin/leads` y configura Resend cuando esté listo el DNS transaccional.

## 10. Checklist Cloudflare obligatorio

Antes de considerar operativo el flujo de leads en producción:

1. Crear D1:

```bash
npx wrangler d1 create oficiospro-leads
```

2. Agregar binding `DB` en `wrangler.toml` con el `database_id` real:

```toml
[[d1_databases]]
binding = "DB"
database_name = "oficiospro-leads"
database_id = "ID_REAL_DE_CLOUDFLARE"
```

3. Correr migración remota:

```bash
npx wrangler d1 migrations apply oficiospro-leads --remote
```

4. Configurar token admin:

```bash
npx wrangler secret put ADMIN_TOKEN
```

5. Configurar email operacional:

```text
LEADS_TO_EMAIL=bperez@oficiospro.cl
LEADS_FROM_EMAIL=OficiosPro <notificaciones@oficiospro.cl>
LEADS_REPLY_TO_EMAIL=bperez@oficiospro.cl
```

6. Configurar Resend solo si se usará email transaccional:

```bash
npx wrangler secret put RESEND_API_KEY
```

7. Probar endpoints:

```bash
TEST_BASE_URL=https://oficiospro.cl node scripts/test-lead-endpoints.mjs
```

8. Probar admin:

- Abrir `/admin/leads`.
- Ingresar `ADMIN_TOKEN`.
- Confirmar que `GET /api/admin/leads` cargue leads desde D1.
- Cambiar estado con `PATCH /api/admin/leads/:id/status`.

## 11. Comportamiento esperado por configuración

- Si `DB` no está configurada, el Worker responde `database_not_configured`, la UI guarda respaldo local y muestra: “Estamos activando la recepción automática. Escríbenos a bperez@oficiospro.cl.”
- Si `DB` está configurada pero `RESEND_API_KEY` no existe, el lead queda guardado, `emailSent=false` y la UI muestra confirmación normal sin prometer correo.
- Si `DB` y `RESEND_API_KEY` están configurados correctamente, el lead queda guardado y se envía email a `LEADS_TO_EMAIL`.
- Si `ADMIN_TOKEN` no existe, el admin responde `admin_token_not_configured` para evitar un panel silenciosamente inseguro.
- `/admin/leads` es un panel interno no enlazado desde la navegación pública; solicita `ADMIN_TOKEN` en pantalla y lo guarda solo en `sessionStorage`.

## 12. Persistencia operativa D1 agregada

Ademas de `lead_submissions`, la migracion crea tablas operativas para que el admin pueda revisar datos reales por flujo:

- `specialist_applications`
- `customer_leads`
- `company_leads`
- `service_requests`
- `conversion_events`

`schema.sql` queda disponible para aplicar el schema completo desde Cloudflare:

```bash
npx wrangler d1 execute oficiospro-leads --remote --file=./schema.sql
```

Endpoints operativos:

```text
POST /api/specialists/apply
POST /api/customers/register-interest
POST /api/companies/lead
POST /api/service-requests/create
POST /api/conversion-events/create

GET /api/admin/specialist-applications
GET /api/admin/customer-leads
GET /api/admin/company-leads
GET /api/admin/service-requests
GET /api/admin/conversion-events

POST /api/admin/specialist-applications/:id/approve
POST /api/admin/specialist-applications/:id/reject
POST /api/admin/specialist-applications/:id/request-more-info
POST /api/admin/leads/:id/update-status
```

Variables nuevas recomendadas para email:

```text
EMAIL_PROVIDER_API_KEY=<secret Cloudflare, Resend actualmente>
NOTIFICATION_TO_EMAIL=bperez@oficiospro.cl
NOTIFICATION_CC_EMAIL=bperez@calbu.cl
FROM_EMAIL=OficiosPro <notificaciones@oficiospro.cl>
```

Compatibilidad temporal: el Worker tambien acepta `RESEND_API_KEY`, `LEADS_TO_EMAIL`, `LEADS_FROM_EMAIL` y `LEADS_REPLY_TO_EMAIL`.

Si `EMAIL_PROVIDER_API_KEY` no esta configurada, el lead queda guardado en D1, se registra un evento `email_pending_configuration` y la UI no promete correo.

## 13. Captura temprana de postulacion especialista

El registro de especialistas debe capturar oportunidades desde el primer contacto util. Si una persona ingresa email o telefono valido, el frontend puede enviar un lead tipo `specialist_application` aunque el perfil no este completo.

Marcadores esperados en `payload_json`:

- `specialistLeadKind = "registration_attempt"`
- `leadSubtype = "registration_attempt"`
- `draftProfileStatus = "contact_entered"`
- `founderStatus = "lead_capturado"`

En `/admin/leads`, estos registros aparecen con:

- KPI `Intentos especialista`
- badge `Intento capturado`
- etapa operacional `Intento especialista capturado`
- recomendacion de contacto antes de 24 h

Prueba E2E segura:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
$env:APP_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="VALOR_REAL_DEL_SECRETO"
node scripts\test-specialist-intake-capture.mjs
```

El script valida `ADMIN_TOKEN` antes de crear datos y usa solo registros marcados como `e2e_test`, `isTest=true`, `testRunId` y `example.com`.

Por defecto limpia sus datos de prueba al terminar mediante `/api/admin/crm/cleanup-test-data`. Para inspeccionar el registro antes de limpiar:

```powershell
node scripts\test-specialist-intake-capture.mjs --keep-test-data
node scripts\test-specialist-intake-capture.mjs --cleanup-only
```
