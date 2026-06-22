# Current platform state

Este resumen refleja el estado observable en el repo al crear el AI Operating System. No reemplaza una auditoria tecnica completa ni confirma configuraciones externas fuera del repo.

## CRM operativo

- Existen vistas admin para CRM, leads, pagos, creditos, payouts, seguridad, service requests, specialists y virtual quotes.
- `docs/crm-operational-model.md`, `docs/crm-daily-operations-playbook.md` y `docs/crm-end-to-end-test.md` documentan el modelo operacional.
- El CRM no debe sembrar datos demo como reales; `docs/crm-test-data-policy.md` define limpieza y deduplicacion de datos de prueba.
- Pendiente permanente: verificar en produccion que endpoints, secrets y D1 esten configurados antes de operar volumen real.

## D1

- El Worker usa binding `env.DB` para `oficiospro-leads` segun salidas de deploy previas y documentacion del repo.
- Hay migraciones D1 para leads, identidad/publicacion, fundacion operacional, cotizaciones virtuales y CRM.
- D1 es fuente operacional para leads y CRM donde ya hay endpoints conectados.
- Pendiente: no todo el producto es 100% durable en D1; algunas areas financieras siguen documentadas como base local o modelo preparado.

## Login admin

- `docs/admin-auth-setup.md` documenta acceso admin real con secretos.
- El login demo queda bloqueado en produccion cuando demo auth no esta habilitado.
- Las rutas admin requieren token/sesion segun flujo implementado.

## SEO

- Existen documentos de arquitectura, checklist editorial y reglas SEO.
- Hay scripts de sitemap/auditoria SEO en el repo.
- Pendiente: seguir auditando Search Console y no ampliar paginas programaticas sin score editorial suficiente.

## Taxonomia

- `docs/trade-taxonomy-expansion.md` y `src/data/tradeTaxonomy.ts` reflejan expansion por oficios, segmentos y cobertura.
- La taxonomia debe guiar SEO, CRM, filtros y adquisicion de especialistas.

## Formalizacion

- Existen docs y paginas relacionadas con formalizacion de especialistas.
- `docs/specialist-formalization-model.md` y `src/data/specialistFormalization.ts` estructuran informacion de formalizacion.
- Pendiente: validar procesos legales/tributarios antes de operar pagos reales complejos.

## Comision 9,5% + IVA

- `docs/platform-commission-model.md`, `src/config/taxConfig.ts` y docs tributarios indican comision estandar 9,5% + IVA.
- La UI publica no debe exponer margen ni payout interno.
- Cambiar comision real es decision L4 de Benjamin.

## Antifraude y factoring

- `docs/tax-document-anti-factoring-controls.md` documenta controles y tablas sugeridas.
- Debe tratarse como sistema sensible: no desplegar cambios reales sin aprobacion y validacion contable/legal.

## Adquisicion de especialistas

- Existen docs para organic growth, specialist acquisition, lead generation y conversion funnel.
- Hay instrumentacion de eventos del funnel especialista.
- Pendiente: medir conversion real por canal y por oficio/comuna.

## Analytics funnel

- `docs/analytics-and-growth-tracking.md` y `docs/conversion-funnel-specialists.md` documentan eventos, lectura y criterios.
- Los scripts de test deben marcar datos como `e2e_test` y limpiar basura de produccion.

## Paginas principales

El build reciente del repo incluye rutas estaticas como:

- `/`
- `/especialistas`
- `/especialistas/[id]`
- `/bolsa`
- `/checkout`
- `/club-hogar`
- `/contacto`
- `/dashboard-cliente`
- `/dashboard-empresa`
- `/dashboard-especialista`
- `/empresas`
- `/registro-especialista`
- `/admin`
- `/admin/crm`
- `/admin/leads`

## Pendientes criticos

- Confirmar configuraciones reales de Cloudflare cada vez que cambien secrets o bindings.
- Mantener datos demo fuera de vistas operativas de produccion.
- Evitar que pruebas E2E contaminen CRM real.
- Profundizar durabilidad de pagos, wallets, ledger y payouts antes de escalar cobros.
- Medir demanda y supply real antes de asumir que el modelo actual es suficiente.
- Definir experimentos de bajo costo si conversion, pago o retencion no muestran traccion.

