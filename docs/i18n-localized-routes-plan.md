# Plan corto — Rutas por idioma pregeneradas (`/{lang}/`)

Evolución del i18n client-side actual a **páginas pregeneradas por idioma** (SEO real + primera carga
correcta por idioma), sobre **un solo código** (no duplicar plataforma). Requiere aprobación de Benjamín
por impacto en routing/SEO/build. No toca Worker/D1/pagos.

## Objetivo
- HTML ya armado en cada idioma (sin "flash" de swap en cliente) → más rápido para no-español.
- SEO por idioma: URL propia, `hreflang`, sitemap por idioma, canonical correcto.

## Decisiones a confirmar (Benjamín)
1. **Locale por defecto sin prefijo:** `es` se mantiene en las URLs actuales (`/`, `/especialistas`, …)
   para no perder el SEO ya ganado en Chile; los demás idiomas van con prefijo (`/en/…`, `/pt/…`). ✅ recomendado.
2. **Qué idiomas pregenerar primero:** sugiero arrancar con **en + pt** (mercados grandes) y sumar fr/de/it
   después, para acotar tamaño de build. (Config, no recódigo.)

## Pasos de implementación
1. **Diccionario server-side:** exponer `getServerDict(locale)` / `tServer(locale)` para render en build
   (los diccionarios ya son TS puros, importables en server). El i18n client-side queda para componentes
   dinámicos (modales, formularios).
2. **Routing:** agregar segmento `src/app/[lang]/…` con `generateStaticParams` por locale; `es` sigue en raíz.
   Las páginas leen su `lang` y renderizan el texto desde el diccionario server-side.
3. **Switcher:** al cambiar idioma, **navega** a la URL localizada (`/en/…`) en vez de solo estado cliente;
   persiste preferencia para la próxima visita.
4. **SEO:** `hreflang` + `canonical` por página y `sitemap` por idioma (extender `scripts/generate-sitemap.mjs`).
5. **Build/Cloudflare:** se multiplica el nº de páginas (≈350 × idiomas). Validar conteo de assets y dry-run.
6. **Fallback:** si falta una traducción, cae a `es` (igual que hoy).

## Riesgos / costo
- Cambio transversal de routing y del flujo de datos de cada página (medio-alto).
- Build más largo y más archivos estáticos.
- Requiere traducciones razonablemente completas (en curso): el alcance de idiomas pregenerados se ajusta
  a lo traducido.

## Recomendación de secuencia
1. Terminar traducciones clave sobre el i18n actual (modales/dashboards) — en curso.
2. Implementar `/{lang}/` para **es (raíz) + en + pt**.
3. Medir tracción por idioma (Market Lab / analítica) y recién ahí sumar fr/de/it + activar indexación.

## Estado
PENDIENTE DE APROBACIÓN. Al aprobar, se implementa sobre la rama `kaizen/claude-2026-06-28-global-ux`
(o una rama hija) sin rehacer lo ya construido.
