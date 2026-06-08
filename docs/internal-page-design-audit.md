# Internal Page Design Audit

## Criterio

Las páginas internas deben sentirse parte del mismo sistema premium del home: navegación secundaria clara, hero consistente, cards con jerarquía, CTAs visibles, confianza operacional y contacto directo cuando corresponde.

## Estado Por Página

- Especialistas: mantiene buscador, filtros Región -> Comuna, cards premium y reputación. Se reforzó narrativa de evidencia y pago protegido.
- Categorías: cubiertas por catálogo y marketplace; deben seguir usando cards de servicio con datos reales.
- Ficha de especialista: mantiene perfil, trabajos, comentarios, agenda y CTAs.
- Club Hogar: se ajustó lenguaje para saldo disponible, créditos retenidos, historial de uso y términos de vigencia.
- Empresas: se reforzó externalización controlada, centros de costo, reportes, facturación y trazabilidad.
- Trabaja con nosotros / registro especialista: se reforzó perfil profesional, pagos trazables, documentación, soporte y no prometer empleo o ingresos.
- Agenda especialista: mantiene disponibilidad y operación de reservas.
- Checkout: mantiene créditos, contexto de pago y eventos de interés.
- Dashboards: mantienen datos de créditos, reservas, reputación y operación.
- Formularios: se corrigió la postulación para que el especialista declare CLP y OficiosPro calcule créditos internamente.
- Contacto: queda un único correo visible `bperez@oficiospro.cl`.
- Términos, privacidad y FAQ: mantienen lenguaje base; deben ampliarse con revisión legal cuando el modelo esté validado.
- Impacto: nueva página premium para narrativa país, formalización, trazabilidad y CTAs.

## Componentes Compartidos

Se agregaron componentes para mantener consistencia:

- `PageShell`
- `PageHero`
- `PremiumCard`
- `TrustBadge`
- `SectionHeader`
- `StickyMobileCTA`
- `ContactTrustStrip`
- `OperationalDashboardMock`

## Próximos Ajustes Recomendados

- Usar `PageShell` y `PageHero` gradualmente en páginas internas nuevas.
- Convertir secciones repetidas de cards a `PremiumCard` cuando se toque cada página.
- Agregar pruebas visuales de mobile para `/impacto`, `/empresas`, `/club-hogar` y `/registro-especialista`.
- Revisar textos legales de créditos, expiración, boleta/factura y relación con especialistas con abogado/contador.
