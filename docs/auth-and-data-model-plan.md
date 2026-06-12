# Auth And Data Model Plan

## Estado Actual

- Sesion mock/browser para UI.
- Admin real parcial usa `ADMIN_TOKEN` en endpoints D1.
- `src/lib/auth/*` deja tipos, roles y guards preparados.
- `migrations/0003_operational_foundation.sql` agrega `users`, `specialist_profiles`, `specialist_services` y tablas operacionales.

## Opciones De Auth

| Opcion | Ventaja | Riesgo |
| --- | --- | --- |
| Supabase Auth | Rapido, integra storage y Postgres si se migra | Duplicar D1/Postgres si no se define bien |
| Clerk | UX y sesiones robustas | Costo y dependencia externa |
| Auth0 | Enterprise-ready | Mayor complejidad |
| Custom JWT | Control total con Cloudflare | Mayor carga de seguridad |

## Recomendacion

Para piloto avanzado: mantener `ADMIN_TOKEN` para endpoints internos y elegir proveedor auth antes de pedir datos sensibles. Para operacion real, usar sesiones firmadas y roles server-side; el browser no decide permisos.

## Modelo De Datos

- `users`: identidad de cuenta.
- `specialist_profiles`: perfil profesional y estado de publicacion.
- `specialist_services`: servicios por especialista con precios en creditos.
- `service_requests`: solicitud cliente/especialista/servicio.
- `company_accounts`: cuentas empresa.
- `admin_audit_log`: trazabilidad de acciones internas.

## Acciones

1. Elegir proveedor auth.
2. Mapear subject externo a `users.authProvider/authSubject`.
3. Crear middleware/guard server-side en worker para roles.
4. Migrar admin visual a endpoints con `Authorization`.
5. Deshabilitar credenciales demo en produccion.

## Go/No-Go Piloto

Go con `ADMIN_TOKEN`, siempre que no se expongan credenciales demo publicamente.

## Go/No-Go 1.000 Especialistas

No-Go hasta tener auth real, roles persistidos y auditoria admin obligatoria para acciones sensibles.
