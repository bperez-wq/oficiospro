# Kaizen operating system OficiosPro

## Proposito

Este sistema ordena la mejora continua de OficiosPro entre Benjamin, ChatGPT, Codex, Claude y Grok.

La regla central es:

observar -> diagnosticar -> priorizar -> implementar -> validar -> desplegar -> medir -> repetir.

El objetivo no es hacer mas cambios, sino hacer mejores cambios: pequenos, trazables, seguros y medibles.

## Roles

### Benjamin

- Define prioridad de negocio y riesgo aceptable.
- Aprueba cambios sensibles: pagos, D1, Worker, Cloudflare, admin, datos reales y despliegues.
- Decide que entra al piloto y que queda en backlog.
- Revisa produccion despues de deploy.

### ChatGPT

- Sintetiza hallazgos, planes y decisiones.
- Convierte auditorias largas en backlog accionable.
- Ayuda a escribir prompts para Codex, Claude y Grok.
- Mantiene criterios de producto, negocio y operacion alineados.

### Codex

- Implementa cambios en el repo.
- Revisa codigo antes de modificar.
- Mantiene cambios pequenos y verificables.
- Ejecuta validaciones locales.
- Crea commits claros sin subir carpetas generadas.

### Claude

- Apoya UX, copy, flujos, jerarquia visual y consistencia de interfaz.
- Propone mejoras incrementales sobre componentes existentes.
- No debe rehacer pantallas completas si el objetivo es ajuste quirurgico.
- Debe respetar Home, CRM, Bolsa, checkout, pagos, filtros y arquitectura actual.

### Grok

- Actua como auditor externo.
- Busca inconsistencias, riesgos, duplicados, promesas exageradas y puntos ciegos.
- Puede auditar SEO, UX, conversion, operacion y seguridad.
- Entrega hallazgos priorizados, no implementaciones directas.

## Flujo semanal

1. Observacion
   - Revisar feedback real, errores, logs, CRM, Search Console, analitica, conversion y captacion.
   - Separar hechos de opiniones.

2. Diagnostico
   - Definir causa probable.
   - Identificar modulo afectado.
   - Confirmar si el problema impacta usuarios, especialistas, admin, pagos, CRM, SEO o Cloudflare.

3. Priorizacion
   - Puntuar impacto, urgencia y riesgo.
   - Elegir pocos cambios de alto valor.
   - Pasar lo demas a `docs/kaizen-backlog.md`.

4. Implementacion
   - Crear o usar feature branch.
   - Leer codigo antes de tocar.
   - Hacer cambios incrementales.
   - No borrar avances existentes.

5. Validacion
   - Ejecutar validaciones proporcionales al cambio.
   - Para codigo: `npm run validate`, `npm run build`.
   - Para Cloudflare: `wrangler deploy --dry-run --assets ./out`.
   - Para docs-only: validar formato, links internos y que no haya cambios funcionales.

6. Despliegue
   - Confirmar branch, commit y estado limpio.
   - Usar PR/merge a main si corresponde.
   - Deploy manual solo cuando Benjamin lo aprueba.

7. Medicion
   - Definir metrica antes del deploy.
   - Revisar resultado despues: conversion, errores, leads, tiempo de carga, tickets, CRM, pagos.

8. Repeticion
   - Registrar aprendizaje.
   - Actualizar backlog.
   - Evitar repetir el mismo problema.

## Definicion de terminado

Un cambio esta terminado cuando:

- El problema original queda resuelto o documentado como bloqueado.
- No rompe modulos criticos.
- Tiene validacion suficiente para su riesgo.
- Tiene commit claro.
- Si requiere deploy, existe checklist de release completado.
- Si afecta operacion, queda documentado para Benjamin y futuras IA.

## Reglas de seguridad

- No tocar `worker/index.ts`, D1, migraciones, `wrangler.toml`, pagos o Mercado Pago sin una razon explicita.
- No exponer tokens, secretos, RUT, cedulas, selfies, datos bancarios ni datos sensibles en logs o docs publicos.
- No usar datos demo como datos reales.
- No prometer cobertura, SLA, ingresos, especialistas disponibles o pagos si no existe respaldo operacional.
- No borrar secciones, datasets, assets, perfiles, rutas, CRM, Bolsa, checkout o admin sin instruccion explicita.
- No subir `node_modules/`, `.next/`, `out/` ni `work/`.

## Reglas de ramas

- Todo cambio importante debe tener branch descriptiva.
- Todo PR debe apuntar a `main`, salvo decision explicita de Benjamin.
- No hacer merge automatico sin aprobacion.
- No usar `git push origin main` esperando que suba una feature branch.
- Si se trabaja en feature branch, usar una de estas opciones:
  - abrir PR y mergear a `main`;
  - `git checkout main` y mergear la feature de forma consciente;
  - `git push origin feature-name` si la rama debe revisarse remota.
- Antes de push: revisar `git status`, `git log --oneline -5` y branch actual.

## Checklist de deploy

- `git status` limpio o solo archivos esperados.
- Branch correcta.
- Commit existe y el mensaje explica el cambio.
- `npm run validate` pasa cuando aplica.
- `npm run build` pasa cuando aplica.
- `wrangler deploy --dry-run --assets ./out` pasa cuando aplica.
- No existe `public/_redirects`.
- No hay carpetas generadas en Git.
- Cloudflare tiene variables/secrets requeridos.
- Benjamin aprueba deploy.
- Despues del deploy, revisar URL real y trafico.

## Checklist mobile

- Header y menu funcionan.
- Modales centrados y cerrables.
- Formularios no quedan con botones pegados.
- Inputs, selects y chips no se superponen.
- CTAs principales son visibles.
- Cards mantienen densidad y legibilidad.
- Imagenes no cortan rostros cuando son perfiles.
- Filtros funcionan con scroll/drawer si aplica.
- No hay overflow horizontal accidental.

## Checklist de no romper modulos criticos

Antes de cerrar un cambio, confirmar que no se rompio:

- Home.
- `/especialistas`.
- Perfil publico de especialista.
- `/especialistas-fundadores`.
- Bolsa y `/bolsa`.
- Checkout.
- Mercado Pago.
- Sistema de creditos.
- CRM y `/admin/crm`.
- `/admin/leads`.
- Login admin real.
- Lead capture.
- Worker.
- D1.
- Cloudflare static assets.
- SEO: `robots.txt`, sitemap y rutas indexables.
