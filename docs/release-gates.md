# Release gates

Ningun cambio se considera terminado sin pasar por los gates que correspondan a su riesgo.

## Gate 0 - Alcance

- El objetivo esta escrito.
- El modulo afectado esta identificado.
- Se sabe si el cambio es L1, L2, L3 o L4 segun `docs/ai-decision-rights.md`.
- No se mezclan tareas no relacionadas.
- No se tocan cambios locales ajenos.

## Gate 1 - Git

- `git status` revisado.
- `git log --oneline -10` revisado.
- Branch correcta.
- Si se trabaja en feature branch, no usar `git push origin main` esperando que suba la rama.
- Usar PR/merge a main, `git checkout main` + merge feature, o `git push origin feature-name` segun corresponda.
- Commit claro.
- No incluir `node_modules/`, `.next/`, `out/` ni `work/`.

## Gate 2 - Validacion tecnica

Requerido para cambios de codigo:

- `npm.cmd run validate`.
- `npm.cmd run build`.
- `npm.cmd run deploy:dry-run` si afecta deploy o build.

Gate completo recomendado antes de PR, merge o deploy:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
npm.cmd run release:gate
```

Este comando ejecuta auditoria Kaizen, validacion, tests unitarios, auditoria SEO, readiness offline sin escribir reporte, build y dry-run de Cloudflare. No hace deploy real ni migraciones.

Para cambios solo docs:

- `npm.cmd run validate` si es rapido.
- Build opcional.
- No hacer deploy.

## Gate 3 - Modulos criticos

Confirmar que no se rompio:

- Home.
- `/especialistas`.
- Perfil especialista.
- Bolsa.
- `/bolsa`.
- Checkout.
- Mercado Pago.
- CRM.
- `/admin`.
- `/admin/leads`.
- `/admin/crm`.
- Worker.
- D1.
- SEO.
- Login.
- Dashboards.

## Gate 4 - Datos y confianza

- No hay datos demo tratados como reales.
- No hay credenciales hardcodeadas.
- No hay tokens en commits.
- No hay promesas falsas.
- No hay claims de ingresos garantizados.
- No se exponen margen, payout o datos internos en UI publica.
- No se guardan datos sensibles en lugares inseguros.

## Gate 5 - QA manual

Revisar en desktop y mobile:

- Pagina o flujo afectado.
- CTAs principales.
- Formularios.
- Empty states.
- Scroll y modales.
- Rutas vinculadas.

## Gate 6 - Deploy

Solo si corresponde:

1. Build local correcto.
2. Dry-run correcto.
3. Deploy Cloudflare.
4. Verificar version.
5. Confirmar trafico 100% si aplica.
6. Probar URL publica.
7. Registrar resultado.

## Gate 7 - Rollback basico

Antes de deploy sensible, tener claro:

- Commit anterior estable.
- Version anterior en Cloudflare.
- Que comando o accion revierte el deploy.
- Que datos podrian requerir limpieza manual.

## Definicion de bloqueado

Un release se bloquea si:

- Falla build o validate.
- Hay cambios no relacionados sin explicar.
- Hay riesgo L3/L4 sin aprobacion.
- Hay credenciales o datos sensibles.
- Hay datos demo en vistas operativas de produccion.
- El cambio puede afectar cobros reales sin prueba.
