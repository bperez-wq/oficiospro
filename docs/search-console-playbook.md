# Playbook Search Console — contenido orgánico y Soro

Rutina operativa para convertir datos de Google Search Console en decisiones editoriales. Complementa `docs/analytics-and-growth-tracking.md` y `docs/soro-seo-editorial-policy.md`.

## Métricas por pieza de contenido

Para cada guía o página de contenido (incluido lo originado en Soro):

- impresiones;
- clics orgánicos;
- CTR;
- posición media;
- leads generados (formulario/solicitud desde la página);
- registros de especialista atribuibles a la página;
- solicitudes de cliente atribuibles a la página;
- assisted conversions (página vista en el camino a conversión, vía eventos de `AnalyticsTracker`).

## Rutina semanal

1. Search Console → Rendimiento → filtrar últimas 4 semanas vs previas.
2. Anotar: queries nuevas con impresiones, páginas que suben/bajan posición, CTR bajo con posición <10 (título/meta a mejorar).
3. Revisar `/admin/crm/acquisition`: leads y registros por fuente orgánica.
4. Cruzar: páginas con tráfico, páginas con conversión.
5. Decidir los próximos 10 briefs de Soro con estos datos.
6. Registrar decisión en `docs/kaizen-backlog.md`.

## Rutina mensual

1. Aprobar o rechazar temas nuevos del backlog de `docs/soro-seo-topic-briefs.md`.
2. Regenerar sitemap si hubo aprobaciones (`npm run seo:sitemap`) y correr `npm run seo:audit`.
3. Revisar contenido de bajo desempeño (90 días sin tracción): actualizar, fusionar con otra página, o pasar a noindex/archivo.
4. Revisar cobertura e indexación en Search Console (páginas excluidas, soft-404, duplicados).

## Diagnóstico rápido

| Señal | Lectura | Acción |
|---|---|---|
| Impresiones sin clics | Título/meta no convencen o posición baja | Reescribir title/meta; reforzar respuesta directa |
| Clics sin leads | Contenido no conecta con CTA | Revisar CTA, enlaces internos, propuesta |
| Posición 5-15 estancada | Contenido casi competitivo | Ampliar respuesta, FAQ, enlaces internos |
| Impresiones cayendo | Contenido desactualizado o canibalizado | Actualizar o consolidar con canonical |
| Página sin impresiones en 90 días | Tema sin demanda o sin indexar | Verificar indexación; si indexada, noindex/archivar |

## Qué no hacer

- No crear más contenido para compensar contenido que no funciona: primero entender por qué no funciona.
- No indexar páginas para "probar": la prueba se hace con contenido en draft y criterio editorial.
- No reportar posiciones puntuales de un día como tendencia.
