# Handoff Claude - Worktree safety guard

## Alerta

- Estado: riesgo operativo.
- Metrica: commits y PRs limpios.
- Evidencia: el worktree tenia cambios de varios ciclos y archivos accidentales antes del trabajo del 2026-06-23.

## ChatGPT

- Sintetizar que cada IA debe trabajar en ramas separadas y stagear solo rutas explicitas.
- Recordar que `git add .` queda prohibido en ciclos paralelos.

## Codex

- Implementado: `npm.cmd run kaizen:audit`.
- Implementado: deteccion de artefactos generados, archivos accidentales y modulos criticos.
- No se tocaron Worker, D1, pagos, formularios ni UI.

## Claude

Antes de editar UX:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
git branch --show-current
git status --short
npm.cmd run kaizen:audit
```

Antes de commit:

```powershell
git add RUTA_EXPLICITA_DEL_ARCHIVO
git diff --cached --name-only
npm.cmd run kaizen:audit
```

No tocar:

- `worker/index.ts`
- `wrangler.toml`
- migraciones D1
- pagos
- scripts Kaizen salvo solicitud explicita
- archivos accidentales o generados

## Grok

- Auditar si el flujo multiagente tiene pasos ambiguos que inducen a errores de PowerShell o Git.

## Benjamin

- Decision requerida: borrar manualmente archivos accidentales cuando ya no sean necesarios.
- Decision requerida: abrir PRs separados para Codex y Claude.
