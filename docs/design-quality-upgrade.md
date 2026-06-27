# Design Quality Upgrade — OficiosPro

Ciclo Kaizen de rediseno grafico premium. Objetivo: que cada pagina importante se acerque a 9,3/10 en diseno, sintiendose como plataforma tecnologica moderna, confiable, humana y chilena, no como un MVP funcional.

Rol asumido: equipo de diseno senior (Direccion Creativa, Product/UI/UX, CRO, Design System, Mobile, Brand, Accesibilidad, Frontend orientado a diseno).

Restricciones: sin tocar backend, Worker, D1, wrangler, pagos, comision 9,5% + IVA, ni logica critica. Sin datos demo como reales. Sin promesas de ingresos/convenios. Reutilizar componentes antes de crear nuevos.

---

## 1. Diagnostico (auditoria visual)

El sistema visual base (src/app/globals.css) ya es fuerte: tokens de radio/sombra, fondo con gradientes, botones con hover-lift y focus-ring, `card-hover`, chips semanticos, `stat-tile` con barra de gradiente, utilidades `reveal`/`hover-lift`/`shine`/`animate-gradient`, y `prefers-reduced-motion` ya respetado. Conclusion: el gap premium NO esta en los tokens sino en la **composicion por pagina** (imagen, jerarquia, prueba social, densidad de texto).

Puntajes conceptuales (estado actual estimado):

| Pagina | Estado | Brecha principal |
|---|---|---|
| `/` Home | 8.3 | Hero potente, pero separacion cliente/especialista y prueba social viva pueden subir |
| `/especialistas` | 8.5 | Marketplace solido; cards comparables y estados de cobertura pueden pulirse |
| `/especialistas-fundadores` | 8.4 | Buen landing; collage/hero e imagenes reales suman emocion |
| `/registro-especialista` | 8.2 | Form de 6 pasos con barra de progreso; confianza y microcopy ya mejorados |
| `/trabajos/[oficio]` | 8.3 | SEO + lead form + closing CTA; falta densidad visual de prueba |
| `/instituciones` | 8.4 | Hero + dashboard mock; serio y claro |
| `/referidos/especialistas` | 8.3 | Herramienta viral con copiar/WhatsApp + gamificacion |
| `/admin/crm/business-health` | 8.6 | Dashboard ejecutivo rediseñado (cabecera, dimensiones, handoffs IA) |
| `/admin/crm/acquisition` | 8.2 | KPIs + embudos + empty states |

Ejes a elevar transversalmente: (a) mas imagen real de oficios donde aporta; (b) jerarquia tipografica del hero; (c) cards mas comparables y con prueba; (d) estados vacios comerciales; (e) mobile-first del embudo; (f) microcopy emocional y honesto.

---

## 2. Direccion creativa

Concepto: "Tecnologia confiable para hacer visible el oficio."

Personalidad: chilena, cercana, profesional, moderna, confiable, humana, activa, tecnologica. No corporativa fria ni startup generica.

Referencias adaptadas (no copiar): Mercado Libre (marketplace vivo), ClassPass (creditos/beneficios), Airbnb/Booking (confianza/perfiles), Apple (claridad/jerarquia), Notion/Linear (UI limpia), gobierno digital moderno (instituciones serias).

Principios de diseno:
- Una idea por seccion, jerarquia clara (eyebrow -> titulo -> lead -> accion).
- Imagen real con proposito, nunca decorativa vacia ni rostro que parezca usuario registrado.
- Prueba social honesta (perfiles del set del proyecto etiquetados, sin metricas falsas).
- CTA primario unico y potente: "Ofrecer mis servicios" (especialista) / "Buscar especialista" (cliente).
- Mobile-first: hero no demasiado alto, CTA visible, touch targets grandes.
- Accesibilidad: contraste, foco visible, no depender solo del color, reduced-motion.

---

## 3. Sistema visual y componentes

Reutilizar primero (ya existen): `btn-primary/secondary/sun/accent/dark`, `eyebrow`, `eyebrow-pill`, `section`, `section-title`, `section-lead`, `panel`, `card-hover`, `chip-*`, `stat-tile`, `field`, `enterprise-shell`, `surface-grid`, `hero-aura`, `gradient-text`, `reveal`, `hover-lift`, `shine`.

Componentes React existentes reutilizables: `DesignSystem` (DashboardMetricCard, EmptyState, MarketplaceCard), `PageHero`/`AppHero`, `SectionHeader`, `PremiumCard`, `PremiumEmptyState`, `TrustBadge`, `VisualFaqAccordion`, `WorkProofGallery`, `SpecialistGridCard/CompactCard`, `FeaturedSpecialistsStrip`, `HowItWorksFlow`, founders/*, institutions/*, referrals/*.

Brecha de componentes (crear solo si no hay equivalente): `PremiumCTASection` (band de cierre reutilizable — ya iniciado como `closingCta` en SeoProgrammaticPage), `ProofCard` (tarjeta de trabajo/resultado), `VisualMetricCard` premium. Antes de crear, confirmar que `PremiumCard`/`stat-tile`/`DashboardMetricCard` no cubren el caso.

---

## 4. Imagenes y visuales

Fuente: public/assets/oficios/ (+ perfiles/, equipo/, industria/, carpinteria/...), src/data/visualAssets.ts (heroCollageImages, categoryImages, femaleProfileImages, teamImages, profileImages).

Reglas: solo assets internos; alt text siempre; object-fit/position cuidando rostros; no repetir la misma imagen; etiquetar perfiles referenciales ("set del proyecto, se reemplaza por fundadores reales"); optimizar para mobile.

Donde suman: hero fundadores, Home (collage + work proof), /trabajos por oficio, instituciones, referidos, registro, club-hogar, empresas.

---

## 5. Priorizacion (impacto / riesgo)

Alto impacto, bajo riesgo (Claude, incrementos controlados):
1. Home: reforzar separacion cliente/especialista y peso del CTA "Ofrecer mis servicios"; tira de prueba social viva.
2. /especialistas-fundadores: hero con imagen/collage, cards de valor visuales, proceso 4 pasos, oficios populares, CTA repetido.
3. /especialistas: cards mas comparables, estados de cobertura/forming, empty states comerciales, franja de confianza.
4. /trabajos/[oficio]: closing CTA (hecho), densidad de prueba, "categoria en formacion" visible.
5. /instituciones y /referidos: pulido de hero, cards y CTAs (ya con base buena).
6. Dashboards admin: jerarquia de KPIs, empty states, embudo (business-health ya rediseñado).

Mediano impacto:
- Microinteracciones (`hover-lift`, `reveal`, chips activos) aplicadas consistentemente.
- Skeletons/empty states premium en listados.
- Tipografia de hero y espaciados afinados.

Requiere Codex/backend (handoff, NO implementar aqui):
- Imagenes optimizadas/responsive (next/image o pipeline de assets) si se quiere performance real.
- Datos reales para metricas (rating, verificados, disponibilidad) hoy referenciales.
- Cualquier cambio que toque Worker/D1/pagos/endpoints.

---

## 6. Decisiones mobile

- Hero: limitar alto en mobile; CTA primario visible sin scroll excesivo.
- Embudo (Home -> fundadores -> registro): botones grandes, una columna, sin scroll horizontal.
- Filtros /especialistas: drawer/colapsable (ya existe `StickyMobileCTA` + filtros colapsables).
- Asistente flotante: subido por encima de barras sticky para no tapar CTAs.
- Touch targets >= 44px; chips y cards legibles; texto no excesivo.

---

## 7. Accesibilidad y confianza

- Contraste suficiente; foco visible (focus-ring ya en botones/inputs; extender a links/cards clave).
- Labels en formularios; mensajes de error comprensibles.
- No depender solo del color (iconos/texto en estados, ej. STATUS_META del dashboard).
- Sin dark patterns ni falsa urgencia; sin metricas falsas (marcar piloto/referencial).
- `prefers-reduced-motion` respetado (ya en globals.css).

---

## 8. Antes / despues conceptual

- Antes: paginas correctas pero con sensacion de "documento informativo" en algunas secciones; cards simples; prueba social limitada.
- Despues (objetivo): marketplace vivo, jerarquia clara, imagen real con proposito, CTAs potentes y repetidos, confianza honesta visible, mobile comodo.

---

## 9. Pendientes / proximo ciclo

- Implementar incrementos por pagina (orden de la seccion 5), uno por commit, validando build en cada uno.
- Consolidar `PremiumCTASection` reutilizable a partir de `closingCta`.
- Revisar performance de imagenes (handoff Codex).
- Auditoria de claims: marcar 4,9 / "verificados" / "disponible ahora" / "35 min" como piloto/referencial donde no haya dato real.

---

## 10. Handoff para Codex

- Pipeline de imagenes responsive/optimizadas (next/image o equivalente) sin romper export estatico a ./out.
- Exponer metricas reales (rating, verificados, disponibilidad, SLA) desde D1/admin para reemplazar valores referenciales.
- Mantener validaciones: `npm.cmd run validate`, `npm.cmd run build`, `npx.cmd wrangler deploy --dry-run --assets ./out`.
- Cualquier cambio de Worker/D1/wrangler/pagos queda fuera del alcance de diseno.
