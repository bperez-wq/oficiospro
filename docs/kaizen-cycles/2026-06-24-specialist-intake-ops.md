# Kaizen cycle: specialist intake operations

## Problema

Personas intentaron inscribirse como especialistas y Benjamin no vio ningun intento en el panel admin. Para operacion piloto, no basta con capturar solo formularios completos: email o telefono valido ya debe dejar una oportunidad perseguible.

## Evidencia

- Incidente reportado por Benjamin el 2026-06-24.
- El registro de especialista ya captura intentos tempranos desde el formulario.
- `/admin/leads` mostraba esos registros como leads genericos, sin KPI, badge ni recomendacion de seguimiento.

## Hipotesis

Si los intentos tempranos se distinguen en `/admin/leads` y existe un script E2E dedicado, Benjamin podra detectar postulantes incompletos el mismo dia y reducir oportunidades perdidas.

## Metrica afectada

- Intentos especialista visibles en admin.
- Tiempo a primer contacto.
- Tasa de recuperacion de postulantes incompletos.

## Alcance

- Mejorar visibilidad operacional en `/admin/leads`.
- Agregar script E2E seguro para crear y verificar un intento marcado como prueba.
- Documentar como revisar y probar la captura temprana.

## Archivos permitidos

- `src/app/admin/leads/page.tsx`
- `scripts/test-specialist-intake-capture.mjs`
- `docs/leads-and-email.md`
- `docs/kaizen-backlog.md`
- `docs/kaizen-cycles/2026-06-24-specialist-intake-ops.md`
- `docs/kaizen-handoffs/2026-06-24-claude-specialist-intake-ops.md`

## Archivos prohibidos

- `worker/index.ts`
- `wrangler.toml`
- migraciones D1 remotas
- pagos, Mercado Pago, checkout, precios y comision
- componentes con trabajo suelto de Claude no relacionado

## Criterios de aceptacion

- `/admin/leads` muestra KPI `Intentos especialista`.
- Leads de intento temprano muestran badge `Intento capturado`.
- Detalle de lead muestra etapa operacional y recomendacion de contacto.
- CSV exporta la etapa operacional.
- El script valida `ADMIN_TOKEN` antes de crear datos.
- El script confirma que el lead creado aparece en `/api/admin/leads`.
- El script limpia datos de prueba por defecto, salvo `--keep-test-data`.

## Pruebas

- `npm.cmd run validate`
- `npm.cmd run build`
- `npx.cmd wrangler deploy --dry-run --assets ./out`
- Opcional con token real: `node scripts\test-specialist-intake-capture.mjs`

## Riesgo

Bajo. No cambia endpoints, D1, Worker, public UI, pagos ni flujo de registro. Solo mejora la lectura admin y agrega script.

## Rollback

Revertir el commit del ciclo. Los datos ya capturados en D1 no se modifican.
