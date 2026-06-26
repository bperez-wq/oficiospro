# Pilot readiness check

## Objetivo

Verificar rapidamente si OficiosPro esta lista para piloto despues de un merge o antes de un deploy. El check revisa rutas publicas, SEO, admin y CRM sin tocar pagos, Worker, D1 ni Mercado Pago.

## Uso seguro

Modo offline para validar el script sin hacer requests:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
npm run pilot:readiness -- --offline
```

Modo live contra produccion:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
$env:PILOT_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="VALOR_REAL_DEL_SECRETO"
npm run pilot:readiness
```

No uses valores de ejemplo como `TU_TOKEN_REAL`, `VALOR_REAL_DEL_SECRETO` o `PEGA_AQUI_TOKEN`. El script los detecta como placeholder, omite checks admin y los reporta como warnings para no confundirlos con una falla real de Cloudflare.

Modo estricto para gate de deploy:

```powershell
$env:PILOT_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="VALOR_REAL_DEL_SECRETO"
npm run pilot:readiness:strict
```

En modo estricto, si falta un token admin real o el token parece placeholder, el release gate falla. Usa este modo antes de deploy productivo.

El reporte queda en:

```text
reports/pilot-readiness/YYYY-MM-DD.md
```

## Checks incluidos

Publicos:

- `/`
- `/especialistas`
- `/registro-especialista`
- `/especialistas-fundadores`
- `/bolsa`
- `/club-hogar`
- `/empresas`
- `/sitemap.xml`
- `/robots.txt`
- `/api/health`

Admin/CRM si existe `ADMIN_TOKEN`:

- `/api/admin/leads?limit=1`
- `/api/admin/crm/overview`
- `/api/admin/crm/opportunities?limit=1`
- `/api/admin/crm/tasks?limit=1`
- `/api/admin/crm/work-queue`
- `/api/admin/crm/reports`
- `/api/admin/virtual-quotes?limit=1`
- `/api/admin/conversion-events?limit=1`

## Write checks

Los checks de escritura estan apagados por defecto. Para probar lead capture con datos e2e marcados:

```powershell
$env:ADMIN_TOKEN="VALOR_REAL_DEL_SECRETO"
$env:PILOT_READINESS_WRITE_TESTS="1"
npm run pilot:readiness
```

Usa `example.com`, `isTest=true`, `source=e2e_test` y `testRunId`.

Importante:

- Requiere token admin real para pedir limpieza automatica despues del write check.
- Si el token falta o es placeholder, el write check se omite con warning.
- El cleanup usa `/api/admin/crm/cleanup-test-data`.

## Reglas

- No imprime ni guarda tokens.
- No guarda datos personales.
- No hace deploy.
- No ejecuta migraciones.
- No toca pagos.
- Si falla un check critico, bloquear deploy hasta revisar causa.
