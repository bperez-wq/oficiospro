# Kaizen cycle: worktree audit

## Problema

Benjamin, Codex y Claude han trabajado con archivos sueltos, artefactos de comandos y ejecuciones desde carpetas equivocadas. Eso aumenta el riesgo de commitear basura, mezclar ciclos o subir archivos generados.

## Evidencia

- Errores previos al ejecutar comandos desde `C:\Users\Benjamin`.
- Artefactos detectados anteriormente como `_synctest.txt`, `tatus --short` y `tsconfig.tsbuildinfo`.
- El worktree actual mantiene cambios ajenos que no deben mezclarse con nuevos commits.

## Hipotesis

Un script de auditoria de solo lectura antes de stagear reduce commits accidentales y hace mas seguro coordinar a Codex y Claude.

## Alcance

- Agregar `npm run kaizen:audit`.
- Detectar carpetas generadas y artefactos accidentales.
- Avisar si se trabaja en `main` o si hay demasiados archivos cambiados/staged.
- No borrar ni modificar archivos detectados.

## Criterios de aceptacion

- El script imprime branch, commits, worktree, warnings y errores.
- Sale con codigo 1 si detecta artefactos bloqueantes.
- No usa dependencias nuevas.
- `validate`, `build` y dry-run siguen pasando.

## Rollback

Revertir el commit del ciclo. No toca datos ni comportamiento productivo.
