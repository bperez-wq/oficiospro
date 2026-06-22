# Founder bottleneck reduction

## Objetivo

Reducir la dependencia de Benjamin como cuello de botella operativo sin quitarle control sobre decisiones sensibles.

## Modelo de trabajo

1. La IA propone tres ciclos semanales.
2. Benjamin elige una prioridad.
3. Codex ejecuta el ciclo tecnico completo.
4. Claude mejora experiencia y conversion.
5. Grok audita riesgos y benchmarks.
6. ChatGPT sintetiza salida y aprendizaje.
7. Benjamin aprueba deploy, ajuste o siguiente ciclo.
8. Las metricas deciden la prioridad siguiente.

## Que puede delegar Benjamin

- Auditorias.
- Backlog.
- Prompts.
- Documentacion.
- Mejoras UX no criticas.
- Scripts de medicion.
- SEO controlado.
- Tracking.
- QA repetitivo.
- Preparacion de PRs.
- Reportes semanales.

## Que no debe delegar sin revisar

- Cambios de modelo de negocio.
- Cobros reales.
- Comisiones.
- Pagos y checkout.
- Worker/D1/migraciones.
- Datos sensibles.
- Legal/tributario.
- Promesas publicas.
- Alianzas.
- Contratacion.
- Deploys sensibles.

## Alertas que requieren aprobacion

- Riesgo de seguridad.
- Cambio en datos reales.
- Cambio de precios o comision.
- Cambio que afecte pagos o checkout.
- Captura de documentos personales.
- Mensajes que prometan ingresos, cupos o convenios.
- Migraciones D1.
- Endpoints productivos nuevos.

## Como reportar riesgos

Cada IA debe reportar:

- Riesgo.
- Impacto potencial.
- Modulo afectado.
- Probabilidad.
- Mitigacion.
- Decision requerida.

## Como evitar cambios desordenados

- Un ciclo, un objetivo.
- Un commit claro.
- No mezclar UX con pagos o D1.
- No tocar archivos generados.
- No modificar cambios locales ajenos.
- No reescribir paginas completas si bastan cambios incrementales.
- Documentar todo cambio operacional.

## Uso de backlog

`docs/billion-dollar-backlog.md` contiene apuestas compuestas de crecimiento.

`docs/kaizen-backlog.md` contiene problemas operativos y ciclos especificos.

Cuando una IA detecte una oportunidad, debe agregarla primero como backlog o proponerla en el cierre semanal antes de ejecutarla si el riesgo no es bajo.

## Rutina recomendada para Benjamin

- Lunes: elegir una prioridad entre tres.
- Miercoles: revisar si el alcance sigue correcto.
- Viernes: revisar validacion y commit.
- Sabado: aprobar deploy o ajuste.
- Domingo: leer aprendizaje y siguiente recomendacion.

## Reduccion de cuello de botella con salud del modelo

El reporte semanal debe llegar a Benjamin con decisiones ya separadas:

- IA puede preparar: instrumentacion, UX, docs, scripts, reportes y experimentos de bajo riesgo.
- Benjamin debe aprobar: precios, comision, cobros, contratos, legal/tributario, alianzas, pagos, Worker, D1 y lanzamientos.

Asi Benjamin no revisa todo desde cero: solo decide sobre prioridades sensibles, mientras las IAs avanzan en medicion, diagnostico y paquetes de trabajo.
