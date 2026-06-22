# Handoff Claude - Business health input seguro

## Alerta

- Estado: `insufficient_data`.
- Metrica: `specialistApplicationSubmitRate`.
- Evidencia: `reports/business-health/2026-06-22.md` no tenia fuente local ni live persistida para medicion semanal.

## ChatGPT

- Sintetizar que el cuello de botella actual no es cambiar modelo ni precios, sino medir con evidencia.
- Priorizar ciclos que aumenten datos reales antes de optimizar conclusiones.

## Codex

- Implementado: `scripts/collect-business-health-input.mjs`.
- Implementado: snapshot agregado compartido en `scripts/business-health-snapshot.mjs`.
- Proteccion: `reports/business-health/input/*.json` queda fuera de Git.
- Validar: `npm.cmd run business-health:report`, `npm.cmd run validate`, `npm.cmd run build`, dry-run.

## Claude

- Mejorar, si Benjamin lo pide, la claridad UX de `/admin/crm/business-health` para explicar:
  - como generar input semanal;
  - que significa `insufficient_data`;
  - que no se guardan datos personales;
  - cual es la proxima accion operativa.
- No tocar:
  - Worker;
  - D1;
  - `wrangler.toml`;
  - pagos;
  - scripts de collector/reporting;
  - precios o comision.

## Grok

- Auditar si las metricas actuales son suficientes para decidir foco hogar vs B2B.
- Revisar riesgos de sesgo si el input semanal depende solo de eventos instrumentados.

## Benjamin

- Decision requerida: configurar `ADMIN_TOKEN` local solo al correr collector.
- Decision requerida: definir cadencia semanal de ejecucion antes del cierre Kaizen.
