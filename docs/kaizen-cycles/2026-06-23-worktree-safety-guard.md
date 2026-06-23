# Ciclo Kaizen - Worktree safety guard

## Problema

Los ciclos paralelos de Codex y Claude estan dejando cambios mezclados en el mismo worktree. Tambien aparecieron archivos accidentales como `_synctest.txt`, `tatus --short`, `ersBenjaminoficiosprooficiospro` y `tsconfig.tsbuildinfo`. Esto aumenta el riesgo de usar `git add .` y contaminar PRs con trabajo ajeno o artefactos generados.

## Evidencia

`git status --short` del 2026-06-23 mostro cambios simultaneos en formularios, CRM, paginas publicas, componentes founders, reporte de business health y archivos accidentales. El riesgo afecta commits, PRs y deploys.

## Hipotesis

Si existe un comando Kaizen que audite rama, estado, staged files, artefactos generados, archivos accidentales y modulos criticos, Benjamin, Codex y Claude podran detectar contaminacion antes de commitear.

## Metrica afectada

- Reducir commits contaminados.
- Reducir PRs con archivos no relacionados.
- Reducir errores operativos antes de deploy.

## Alcance

- Crear `scripts/kaizen-worktree-audit.mjs`.
- Agregar script `npm.cmd run kaizen:audit`.
- Actualizar checklist de release.
- Registrar backlog y handoff.

## Archivos permitidos

- `scripts/kaizen-worktree-audit.mjs`
- `package.json`
- `docs/kaizen-release-checklist.md`
- `docs/kaizen-backlog.md`
- `docs/kaizen-cycles/*`
- `docs/kaizen-handoffs/*`

## Archivos prohibidos

- `worker/index.ts`
- `wrangler.toml`
- migraciones D1
- pagos, checkout, Mercado Pago
- formularios y UX en curso de Claude
- cambios sueltos preexistentes

## Criterios de aceptacion

- `npm.cmd run kaizen:audit` imprime rama, ultimos commits, worktree, staged files, warnings y errores.
- Detecta artefactos generados: `.next`, `out`, `work`, `node_modules`, `*.tsbuildinfo`.
- Detecta archivos accidentales observados.
- Advierte si hay cambios en Worker, wrangler, migraciones o pagos.
- Modo estricto disponible con `npm.cmd run kaizen:audit -- --strict`.
- No bloquea validaciones normales ni toca producto.

## Pruebas

- `npm.cmd run kaizen:audit`
- `npm.cmd run validate`
- `npm.cmd run build`
- `npx.cmd wrangler deploy --dry-run --assets ./out`

## Riesgo

Bajo. Es un script de auditoria local y documentacion. No toca runtime, D1, Worker, pagos ni UI.

## Rollback

Revertir el commit del ciclo. El flujo de build/deploy queda como estaba.
