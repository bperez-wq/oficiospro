# Pilot readiness check

## Objetivo

Verificar rapidamente si OficiosPro esta lista para piloto despues de un merge o antes de un deploy. El check revisa rutas publicas, SEO, admin y CRM sin tocar pagos, Worker, D1 ni Mercado Pago.

## Uso seguro

Modo offline para validar el script sin hacer requests:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
node scripts\pilot-readiness-check.mjs --offline
```

Modo live contra produccion:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
$env:PILOT_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="VALOR_REAL_DEL_SECRETO"
node scripts\pilot-readiness-check.mjs
```

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

Admin/CRM si existe `ADMIN_TOKEN`:

- `/api/admin/leads?limit=1`
- `/api/admin/crm/overview`
- `/api/admin/crm/opportunities?limit=1`
- `/api/admin/crm/tasks?limit=1`
- `/api/admin/conversion-events?limit=1`

## Write checks

Los checks de escritura estan apagados por defecto. Para probar lead capture con datos e2e marcados:

```powershell
$env:PILOT_READINESS_WRITE_TESTS="1"
node scripts\pilot-readiness-check.mjs
```

Usa `example.com`, `isTest=true` y `source=pilot_readiness_check`.

## Reglas

- No imprime ni guarda tokens.
- No guarda datos personales.
- No hace deploy.
- No ejecuta migraciones.
- No toca pagos.
- Si falla un check critico, bloquear deploy hasta revisar causa.
