# Handoff IA - Release gate unificado

## Alerta

- Estado: validando.
- Metrica: seguridad operativa antes de PR, merge o deploy.
- Evidencia: los comandos de validacion estaban dispersos y dependian de memoria operativa. En ciclos previos hubo intentos de deploy sin build, rutas fuera del repo y checks incompletos.

## ChatGPT

- Sintetizar el estado de la rama antes de pedir merge.
- Priorizar si conviene desplegar este gate junto con los cambios de estabilidad del Worker.

## Codex

- Implementado: `npm.cmd run release:gate`.
- Incluye: auditoria Kaizen, `validate`, tests unitarios, auditoria SEO, readiness offline sin escribir reporte, build y Cloudflare dry-run.
- No toca: pagos, precios, D1 remoto, migraciones, Mercado Pago ni deploy real.
- Validar: ejecutar `npm.cmd run release:gate` antes de PR, merge o deploy sensible.

## Claude

- Mejorar UX/copy solo despues de correr o pedir este gate cuando el cambio toca codigo.
- No tocar: `worker/index.ts`, D1, pagos, scripts de release ni configuracion Cloudflare salvo instruccion explicita.
- Si el trabajo es solo visual, confirmar que no rompe Home, `/especialistas`, `/registro-especialista`, Bolsa y checkout.

## Grok

- Auditar si el gate cubre las rutas criticas suficientes para piloto.
- Revisar riesgos faltantes: accesibilidad, performance mobile, errores visuales y contenido legal.

## Benjamin

- Decision requerida: aprobar merge/deploy cuando el PR tenga `release:gate` en verde.
- Nota: `/api/health` solo respondera en produccion despues de desplegar la rama que lo incluye.
