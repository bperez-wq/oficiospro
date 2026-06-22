# AI decision rights

Este documento define que puede hacer cada IA sin esperar a Benjamin y que decisiones quedan reservadas para aprobacion humana.

## Niveles de decision

### L1 - Proponer

Las IAs pueden proponer sin aprobacion previa:

- Ideas.
- Benchmarks.
- Copies.
- Auditorias.
- Backlog.
- Prompts.
- Documentacion.
- Hipotesis de modelo de negocio.
- Experimentos de bajo costo.

### L2 - Implementar con bajo riesgo

Las IAs pueden implementar y validar con bajo riesgo si el cambio es incremental:

- UX visual no critica.
- Documentacion.
- Scripts de auditoria.
- SEO controlado.
- Tracking.
- Componentes no criticos.
- Mejoras de formularios sin cambiar contratos de datos.
- Analytics.
- Tests.
- Empty states.
- Copy operativo que no promete resultados garantizados.

### L3 - Implementar, pero requiere aprobacion antes de deploy

Estos cambios pueden prepararse tecnicamente, pero no deben desplegarse sin aprobacion explicita de Benjamin:

- D1 y migraciones.
- Worker.
- Pagos.
- Checkout.
- Mercado Pago.
- Formalizacion.
- Admin.
- Seguridad.
- Datos sensibles.
- Cambios de comision.
- Modelos tributarios.
- Endpoints productivos nuevos.
- Captura o almacenamiento de documentos personales.

### L4 - Solo Benjamin

Estas decisiones no pueden tomarlas las IAs:

- Cambios de modelo de negocio.
- Lanzamiento masivo.
- Promesas publicas.
- Convenios gobierno.
- Cobros reales.
- Alianzas estrategicas.
- Contratacion humana.
- Inversion o capital.
- Cambios legales o contractuales.
- Promesas de ingresos a especialistas.

## Matriz por rol

| Tema | ChatGPT | Codex | Claude | Grok | Benjamin |
| --- | --- | --- | --- | --- | --- |
| Priorizacion semanal | propone | valida factibilidad | aporta UX | desafia | decide |
| Documentacion | crea | crea | crea UX | audita | aprueba si sensible |
| UX/copy | propone | implementa si aplica | lidera | audita | aprueba claims sensibles |
| Codigo producto | define alcance | lidera | no backend critico | audita | aprueba cambios sensibles |
| Worker/D1/pagos | propone plan | prepara con aprobacion | no toca | audita riesgo | decide |
| Modelo de negocio | propone hipotesis | mide/implementa tests bajo riesgo | mejora experimentos | cuestiona | decide |

## Decision rights de modelo de negocio

Las IAs pueden:

- Detectar senales.
- Proponer hipotesis.
- Disenar experimentos.
- Implementar pruebas de bajo riesgo.
- Medir resultados.
- Documentar aprendizajes.

Las IAs no pueden sin aprobacion de Benjamin:

- Cambiar precios reales.
- Cambiar comision real.
- Activar cobros.
- Prometer ingresos.
- Lanzar modelo institucional.
- Firmar alianzas.
- Publicar claims comerciales sensibles.
- Cambiar legal o tributario.
- Modificar contratos.
- Hacer lanzamiento masivo.

## Regla de pausa

Si una IA detecta que una tarea cruza de L2 a L3 o L4, debe pausar, documentar el riesgo y pedir aprobacion antes de continuar con deploy o cambios productivos.

