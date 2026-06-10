# Seguridad OficiosPro

Este sprint deja un endurecimiento mínimo antes de abrir registros reales. No reemplaza una revisión formal ni una implementación completa de auth, DB y storage privado.

## Diagnóstico inicial

- No se detectaron secrets reales de Mercado Pago, Resend, Supabase service role ni Cloudflare en archivos versionados.
- `.env.example` usa placeholders y `.gitignore` bloquea `.env`, `.env.local`, `.env.production`, `*.local`, `work/`, `node_modules/`, `.next/` y `out/`.
- El login principal sigue siendo mock para desarrollo visual; las credenciales internas solo se muestran en `localhost`.
- El panel `/admin` antes dependía de sesión mock en cliente; ahora valida rol admin antes de cargar datos locales del panel.
- Los endpoints `/api/admin/*`, `/api/credits/add`, `/api/credits/use` y `/api/admin/payments/reconcile` requieren token admin del Worker.
- Los endpoints públicos de leads tenían sanitización parcial; ahora tienen validación server-side, body limit, content-type JSON, honeypot y rate limit básico.
- Los documentos de identidad podían quedar como URLs temporales de navegador en estado local; ahora cédula/selfie quedan marcadas como pendientes de storage seguro y no se renderizan como imágenes sensibles en admin.
- Mercado Pago calcula montos desde catálogo interno y valida plan/credit pack en backend; el webhook no sugiere activar créditos si falta `MERCADOPAGO_WEBHOOK_SECRET`.

## Alcance protegido

- Admin UI: `/admin` requiere sesión con `role = "admin"` y no carga datos si el rol no corresponde.
- Admin API: usar `Authorization: Bearer <ADMIN_API_TOKEN>` o, por compatibilidad, `ADMIN_TOKEN`.
- Leads: validación de método/ruta, `Content-Type`, tamaño máximo, campos mínimos, email, teléfono, RUT, créditos y sanitización básica.
- Anti-spam: honeypot y rate limit en memoria por IP, email, teléfono y endpoint.
- Logs: no se agregaron logs de payloads sensibles; existe helper `redactSensitive` para nuevos logs internos.
- Headers: Worker agrega CSP razonable, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y protección de framing.

## Simulación interna vigente

- Auth real no está implementada. El login mock sirve para demos y debe reemplazarse por Supabase Auth, Clerk, Auth0 o auth server-side propia antes de usuarios reales.
- Algunos datos operativos siguen en `localStorage` para prototipo: perfiles, reservas, pagos mock, leads locales y configuración admin.
- El rate limit en memoria ayuda en desarrollo, pero no es suficiente como control durable en producción distribuida.
- La aprobación admin local no sustituye autorización backend para datos reales.

## Variables como secrets

Configurar en Cloudflare como secrets o variables seguras, nunca en archivos versionados:

- `ADMIN_API_TOKEN`
- `ADMIN_TOKEN` solo si se mantiene compatibilidad legacy
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `LEADS_TO_EMAIL`
- `LEADS_FROM_EMAIL`
- `SUPABASE_SERVICE_ROLE_KEY` solo backend si se usa Supabase
- Credenciales R2/Supabase Storage privado si se activa identidad

Si alguna credencial real estuvo en el repo o fue pegada en una rama, debe rotarse.

## Datos sensibles

- No guardar cédula, reverso ni selfie en `localStorage`, `public/`, logs ni email.
- RUT, email, teléfono y dirección deben mostrarse solo en vistas internas autorizadas.
- No enviar payloads completos de Mercado Pago a logs ni al frontend.
- No exponer margen, payout ni datos financieros internos en UI pública.

## Plan antes de producción real

1. Reemplazar auth mock por auth server-side con sesiones expirables y roles verificados.
2. Mover datos sensibles a DB real con políticas por rol.
3. Activar R2 o Supabase Storage privado para identidad.
4. Reemplazar rate limit en memoria por KV, D1 o un servicio durable.
5. Guardar webhooks Mercado Pago procesados para idempotencia real.
6. Activar monitoreo, backups, alertas y revisión de logs redaccionados.
7. Ejecutar pruebas de seguridad manuales y automatizadas antes del lanzamiento.
