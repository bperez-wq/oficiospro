# Auditoría de diseño — Plataforma OficiosPro (estándar premium global)

Objetivo: llevar todas las páginas al estándar de la Home actual (marketplace premium 9,3/10). Rama: `feature/claude-continue-design`.

## Tabla de auditoría

| Página | Nota antes | Problemas principales | Prioridad | Cambios propuestos | Archivos/componentes | Estado |
|---|---|---|---|---|---|---|
| `/especialistas` | 8,5 | Ya rediseñada (grid 4/3/2/1, cards compactas, sidebar 240px sticky, mapa abajo, bag-first). Falta: drawer de filtros mobile más pulido, header contextual con más jerarquía | Máxima | Polish menor; mantener filtros/intención | `SpecialistsExplorer`, `SpecialistGridCard` | ✅ Hecho en iteraciones previas; polish pendiente |
| Perfil especialista | 7,0 | CTA mobile genérico ("Ver más"), perfil decide pero no captura intención a Bolsa | Alta | CTA sticky con label por pricingMode + "Agregar a Bolsa" (bag-first) | `SpecialistPublicProfile` | ✅ Esta iteración |
| `/club-hogar` | 6,5 | Sin comparador "sin suscripción vs Club", sobre-promesa "24 meses", sin FAQ, sin CTA sticky mobile, créditos abstractos | Alta | Comparador con ejemplos reales (calefont/filtración/electricidad/jardín), descuento desde `commercialConfig`, copy prudente "según plan vigente", FAQ accordion, sticky CTA | `club-hogar/page`, `VisualFaqAccordion`, `StickyMobileCTA` | ✅ Esta iteración |
| `/empresas` | 7,5 | Buen dashboard preview; faltaban casos de uso visuales y CTA de ventas | Alta | Cards visuales de segmentos (reutiliza `HomeBusinessUseCases`), CTAs "Solicitar cuenta empresa" + "Hablar con ventas" | `empresas/page` | ✅ Esta iteración |
| `/soporte` | 5,5 | Listas de temas no accionables (texto plano sin respuestas) | Alta | Centro de ayuda con chips de temas, 3 cards por rol con FAQ accordion con respuestas reales | `soporte/page`, `VisualFaqAccordion` | ✅ Esta iteración |
| 404 / estados vacíos | 5,0 | 404 frío, sin conversión | Media | `PremiumEmptyState` reutilizable con icono, patrón y 3 CTAs | `not-found`, `PremiumEmptyState` | ✅ Esta iteración |
| `/bolsa` | 8,5 | Ya al estándar (grupos, comparación, resumen sticky, estados) | Alta | Mantener; toast de feedback pendiente | `bolsa/page` | ✅ Previo |
| `/checkout` | 7,5 | Ya tiene resumen, proveedores, documento tributario (boleta/factura), comercio OP SpA | Alta | Pendiente: estados visuales post-pago (aprobado/rechazado) y separación visual por tipo de cobro | `checkout/page` | ◻ Pendiente (no tocar lógica MP sin necesidad) |
| `/registro-especialista` | 7,0 | Formulario largo; ya tiene prefill y multiservicio | Media | Hero emocional, ejemplo de perfil publicado, progreso por pasos más visual | `registro-especialista/page`, `Forms.tsx` (1.589 líneas — riesgo medio) | ◻ Pendiente |
| `/dashboard-cliente` | 6,5 | Funcional, KPIs planos | Media | `DashboardMetricCard` ya existe; agregar accesos rápidos + bolsa + empty states | `Dashboards.tsx` | ◻ Pendiente |
| `/dashboard-especialista` | 7,0 | Ya tiene estado tributario (SpecialistTaxStatusCard); falta ranking/completar perfil | Media | KPIs arriba + acciones rápidas | `Dashboards.tsx` | ◻ Pendiente |
| `/dashboard-empresa` | 6,5 | Igual que cliente | Media | KPIs + sucursales + reportes | `Dashboards.tsx` | ◻ Pendiente |
| `/admin` | 7,5 | 17 secciones funcionales + panel financiero nuevo; tablas mejorables | Baja | Tablas compactas con estados de color (patrón `FinanceTable` ya creado), KPIs arriba | `AdminPanel.tsx` (2.100+ líneas — riesgo alto, ir por sección) | ◻ Pendiente |
| Login modal | 7,5 | Funciona; visual aceptable | Baja | Polish menor | `LoginEntryModal` | ◻ Pendiente |

## Design system (componentes reutilizables)

Ya existentes y en uso: `SpecialistGridCard`, `SpecialistCompactCard`, `FeaturedSpecialistsStrip`, `WorkProofGallery`, `HowItWorksFlow`, `QuickProblemLinks`, `HomeCategoryAccordion`, `HomeCreditPreview`, `HomeBusinessUseCases`, `DashboardMetricCard`, `MarketplaceCard`, `EmptyState`, `StickyMobileCTA`, `CartDrawer`, `SectionHeader`, `AppHero`/`PlatformNav`.

Creados en esta iteración:
- **`VisualFaqAccordion`** — FAQ con `<details>` nativo (sin JS, accesible, indexable), consistente con los accordions de la Home. Usado en `/club-hogar` y `/soporte`.
- **`PremiumEmptyState`** — estado vacío/404 con icono, patrón de fondo, título fuerte y CTAs. Usado en `not-found`; listo para dashboards y rutas auxiliares.

Convenciones a mantener: radios 18–32px según jerarquía; sombras `sm → card → lift`; chips 11–13px font-black; botones `min-h-10/11/12`; hover `-translate-y-0.5/1` + borde brand; `active:scale-[0.98]`; `prefers-reduced-motion` global ya activo.

## Copywriting

- "24 meses" reemplazado por "acumulables según plan vigente" (Club Hogar, Home) mientras el modelo financiero se valida.
- Soporte ahora responde (Q&A reales) en vez de listar temas.
- Mantener: créditos = saldo de mantención; retención = pago protegido; "especialista" (no "técnico") como término principal.

## Pendientes priorizados (próximas iteraciones)

1. `/registro-especialista`: hero emocional + preview de perfil publicado (sin tocar validaciones ni `pending_secure_storage`).
2. Dashboards: fila de KPIs + acciones rápidas + `PremiumEmptyState` en vacíos.
3. Checkout: estados visuales post-pago y agrupación por tipo de cobro (sin tocar Mercado Pago).
4. Admin: tablas compactas con estados de color, sección por sección.
5. Filtros mobile de `/especialistas` como bottom sheet.
6. Toast global de feedback al agregar a Bolsa.
