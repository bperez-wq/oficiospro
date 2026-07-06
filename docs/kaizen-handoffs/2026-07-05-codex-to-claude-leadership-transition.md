# Handoff maestro Kaizen: Codex -> Claude

Fecha: 2026-07-05
Repo: `C:\Users\Benjamin\oficiospro\oficiospro`
Estado de liderazgo: Claude pasa a liderar la mejora continua de OficiosPro desde 2026-07-06.

## Proposito

Este documento deja a Claude con contexto operativo suficiente para continuar OficiosPro sin depender de Codex, sin duplicar trabajo y sin romper los avances existentes.

La regla madre se mantiene:

observar -> diagnosticar -> priorizar -> implementar -> validar -> desplegar -> medir -> repetir.

## Estado actual que Claude debe respetar

- OficiosPro ya no es solo un prototipo visual: existe Worker, D1, CRM, admin, formularios, SEO, Bolsa, checkout, creditos, landings y sistema de captacion.
- La plataforma sigue en piloto controlado. No debe prometer cobertura total, disponibilidad inmediata, pagos automaticos completos ni presencia global real.
- La base productiva usa Cloudflare Workers Static Assets + D1 con binding `DB`.
- Las rutas API deben pasar por Worker antes que assets. `wrangler.toml` ya usa `run_worker_first` para `/api/*` y `/registro-publico-externo/*`.
- El registro publico externo SEC existe solo como prototipo prudente, noindex y con datos ficticios. No importar datos reales sin revision legal.
- Los datos demo no deben aparecer como reales en produccion.
- El modelo economico vigente no se cambia sin Benjamin: comision 9,5% + IVA, minimo $3.000 + IVA, creditos como mecanismo de pago protegido.
- El modelo de acumulacion publica de creditos debe tratarse con cuidado: no cambiar reglas financieras sin aprobacion.

## Modulos criticos que Claude no debe romper

- Home y hero premium.
- Mega menu de categorias.
- `/especialistas` y filtros.
- Perfil publico de especialista.
- `/registro-especialista` y captura temprana de intentos.
- Bolsa y `/bolsa`.
- Checkout y Mercado Pago.
- Sistema de creditos.
- Worker y rutas `/api/*`.
- D1 remoto `oficiospro-leads`.
- `/admin`, `/admin/leads`, `/admin/crm` y dashboards internos.
- SEO programatico, sitemap y robots.
- Registro publico externo SEC noindex.
- Cloudflare deploy con static assets.

## Contrato de liderazgo para Claude

Claude puede liderar:

- UX y conversion.
- Claridad de copy.
- Mobile y responsive.
- Jerarquia visual.
- Estados vacios honestos.
- Confianza y onboarding.
- Mejoras incrementales sobre componentes existentes.
- Documentacion de handoff, QA y playbooks.

Claude debe pedir aprobacion de Benjamin antes de:

- Cambiar precios, comisiones, creditos o reglas financieras.
- Activar cobros reales nuevos.
- Tocar Mercado Pago.
- Modificar Worker, D1, migraciones o `wrangler.toml` salvo bug probado.
- Importar datos reales de fuentes publicas.
- Exponer datos personales.
- Crear SEO internacional indexable.
- Prometer cobertura, SLA o verificacion no respaldada.

Claude debe pedir apoyo tecnico a Codex o dejar handoff tecnico si:

- Hay fallas de Worker/API.
- Hay migraciones D1.
- Hay pruebas e2e/API complejas.
- Hay integracion con pagos.
- Hay seguridad, auth, tokens o datos sensibles.
- Hay necesidad de scripts de validacion.

## Ritual diario recomendado para Claude

Antes de tocar archivos:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
git status -sb
git branch --show-current
git log --oneline -10
```

Leer siempre:

- `docs/kaizen-operating-system.md`
- `docs/kaizen-backlog.md`
- `docs/ai-handoff-protocol.md`
- `docs/kaizen-release-checklist.md`
- el handoff mas reciente en `docs/kaizen-handoffs/`

Si hay cambios sueltos que no son de Claude, no revertir. Primero identificar origen y pedir instruccion si bloquean.

## Flujo de trabajo minimo

1. Elegir un solo problema.
2. Escribir evidencia.
3. Definir hipotesis.
4. Definir metrica afectada.
5. Definir alcance permitido y archivos prohibidos.
6. Implementar incrementalmente.
7. Validar.
8. Commit.
9. Actualizar backlog/handoff.
10. No hacer deploy real sin Benjamin.

## Validaciones por tipo de cambio

Docs-only:

```powershell
git diff --name-only
```

UX/frontend:

```powershell
npm.cmd run validate
npm.cmd run build
npx.cmd wrangler deploy --dry-run --assets ./out
```

Cambios sensibles o antes de release:

```powershell
npm.cmd run release:gate:strict
```

Si existe cambio Worker/API:

```powershell
npm.cmd run test:unit
npm.cmd run validate
npm.cmd run build
npx.cmd wrangler deploy --dry-run --assets ./out
```

## Estado de focos Kaizen permanentes

Claude debe revisar estos cinco puntos antes de cerrar cualquier ciclo visual o de conversion:

1. Densidad de red baja por comuna/oficio.
2. Perfiles dinamicos o estados tipo `Cargando perfil...`.
3. Funnel post-busqueda poco claro.
4. Onboarding especialista todavia manual.
5. Explicacion publica del sistema de creditos.

En cada respuesta final debe decir si el ciclo:

- mejora el punto;
- lo deja igual;
- o lo deja como riesgo pendiente.

## Primeros ciclos recomendados para Claude

### Ciclo A: claridad de liderazgo y operaciones admin

Problema: Benjamin necesita entender rapidamente que datos son reales, que datos son ejemplo y que accion viene despues.

Alcance sugerido:

- `/admin`
- `/admin/crm`
- estados vacios
- etiquetas de fuente de datos

No tocar:

- Worker
- D1
- endpoints
- auth

### Ciclo B: conversion especialista fundadores

Problema: el registro debe capturar intentos temprano y explicar el flujo sin friccion.

Alcance sugerido:

- `/registro-especialista`
- `/especialistas-fundadores`
- copy de revision humana
- estados de exito/error

No tocar:

- schema D1
- endpoints de captura
- precios

### Ciclo C: confianza post-busqueda

Problema: despues de buscar/cotizar/reservar, el usuario debe entender que pasa y no perder confianza si no hay match exacto.

Alcance sugerido:

- `/especialistas`
- drawer/filtros mobile
- empty states
- microcopy de siguiente paso

No tocar:

- algoritmos de pago
- Mercado Pago
- Worker salvo bug probado

### Ciclo D: contenido creditos sin cambiar modelo

Problema: explicar creditos, recargas, Club Hogar, empresas, reembolsos y disputas sin cambiar reglas financieras.

Alcance sugerido:

- FAQ
- Club Hogar
- Empresas
- Bolsa/checkout copy

No tocar:

- calculos
- comision
- ledger
- expiracion/acumulacion real sin aprobacion

## Comandos seguros de actualizacion

Para subir rama de Claude:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
git status -sb
git add RUTA_DEL_ARCHIVO_1 RUTA_DEL_ARCHIVO_2
git diff --cached --name-only
git commit -m "MENSAJE CLARO"
git push origin NOMBRE_DE_RAMA
```

No usar `git add .`.
No usar `git push origin main` si estas en una rama feature.

## Como cerrar un ciclo para Benjamin

Responder siempre con:

1. Problema elegido.
2. Evidencia.
3. Cambios realizados.
4. Archivos modificados.
5. Que NO se toco.
6. Validaciones.
7. Commit.
8. Riesgos pendientes.
9. Decision requerida de Benjamin.
10. Siguiente ciclo recomendado.

## Regla de traspaso final

Desde 2026-07-06, Claude es responsable de liderar la continuidad Kaizen. Codex queda como apoyo tecnico puntual para integraciones, Worker, D1, tests, scripts y release gates cuando Benjamin lo pida.
