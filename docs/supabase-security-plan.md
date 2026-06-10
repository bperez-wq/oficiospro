# Plan de seguridad Supabase/RLS

Supabase no es requisito para compilar OficiosPro hoy. Este plan deja las políticas mínimas sugeridas si se migra desde `localStorage` y D1 parcial hacia Supabase.

## Reglas generales

- No exponer `service_role` en frontend.
- Usar `anon` solo como clave pública.
- Activar RLS en todas las tablas sensibles.
- Mapear roles desde `auth.users` y una tabla `profiles`.
- Toda acción admin debe validar rol en backend o policy.

## Políticas sugeridas

### `specialist_applications`

- Especialista autenticado puede leer y actualizar su propia postulación.
- Admin puede leer todas, aprobar, rechazar y solicitar más información.
- Invitado no puede leer postulaciones.

### `customer_leads`

- Cliente puede leer sus propios datos.
- Admin puede leer y actualizar todos los leads.
- Inserción pública solo vía endpoint con rate limit, no directo desde cliente si contiene datos sensibles.

### `company_leads`

- Empresa puede leer sus propios leads.
- Admin puede leer y actualizar todos.
- Usuarios customer/specialist no pueden leer leads empresa.

### `payments`

- Usuario puede leer sus propios pagos.
- Admin puede leer todos.
- Inserciones y cambios de estado solo desde backend/webhook verificado.

### `credit_wallets`

- Usuario puede leer su wallet.
- Admin puede leer y reconciliar.
- Ajustes de saldo solo desde backend autorizado.

### `reviews`

- Público puede leer reviews aprobadas.
- Autor puede crear review asociada a servicio propio.
- Admin puede moderar, ocultar y aprobar.

### `identity_documents`

- Usuario puede crear documentos propios mediante URL firmada.
- Usuario no puede listar ni leer documentos después de subirlos.
- Admin puede leer con auditoría y acceso temporal.

## Validaciones complementarias

- Webhooks Mercado Pago deben ser idempotentes.
- Logs deben usar redacción de RUT, email, teléfono y tokens.
- Backups y retención deben definirse antes de cargar usuarios reales.
