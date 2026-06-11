# Plan de uso de imágenes — Banco de oficios OficiosPro

Origen: banco propio de 35 fotos realistas (1168×784, JPG, 150–450 KB). Se auditaron una por una; se incorporaron **33** (se descartó 1 duplicada de poda y 1 oscura de bodega). Estructura: `public/assets/oficios/<categoria>/`. Mapeo central: `src/data/visualAssets.ts` (categoryImages, serviceImages, fallbackSpecialistImage, workProofImages, businessUseCaseImages, heroCollageImages).

## Inventario y uso

| Imagen (nueva ruta en /assets/oficios/) | Categoría | Calidad | Uso principal | Alt text | Prioridad |
|---|---|---|---|---|---|
| gasfiteria/gasfiteria-trabajo-01.jpg | Gasfitería | ★★★ | Hero collage Home, fallback gasfíter | Gasfíter reparando una filtración bajo el lavaplatos | Alta |
| gasfiteria/gasfiteria-griferia-01.jpg | Gasfitería | ★★★ | Proof gallery "Baño reparado", Club Hogar | Gasfíter reparando la grifería del baño | Alta |
| gasfiteria/gasfiteria-red-exterior-01.jpg | Gasfitería | ★★ | Cards red exterior/visita técnica | Técnico revisando la red de agua exterior de una casa | Media |
| gasfiteria/gasfiteria-medidor-01.jpg | Gasfitería | ★★ | Confianza/medidores, emergencias gas | Técnico certificado revisando un medidor en la red exterior | Media |
| calefont/calefont-mantencion-01.jpg | Calefont | ★★★ | Club Hogar hero rail, ejemplos de créditos | Especialista revisando un calefont a domicilio | Alta |
| calefont/calefont-revision-01.jpg | Calefont | ★★ | Card calefont alternativa | Técnico revisando un calefont interior | Media |
| electricidad/electricidad-tablero-01.jpg | Electricidad | ★★★ | Hero collage, proof "Tablero renovado", fallback electricista | Electricista revisando un tablero eléctrico domiciliario | Alta |
| electricidad/electricidad-luminaria-01.jpg | Electricidad | ★★ | Card luminarias, ejemplos créditos | Técnico cambiando una luminaria en el techo | Media |
| electricidad/electricidad-instalacion-01.jpg | Electricidad | ★★ | Obras/remodelación | Electricista instalando un enchufe en una remodelación | Media |
| electricidad/electricidad-medidor-01.jpg | Electricidad | ★★ | Empresas/emergencia eléctrica | Técnico eléctrico inspeccionando un medidor exterior | Media |
| climatizacion/aire-acondicionado-instalacion-01.jpg | Climatización | ★★★ | Hero collage, proof "Aire instalado", empresas | Técnico instalando un aire acondicionado exterior | Alta |
| climatizacion/aire-acondicionado-mantencion-01.jpg | Climatización | ★★ | Mantención split interior | Técnico realizando mantención a un aire acondicionado | Media |
| pintura/pintura-fachada-01.jpg | Pintura | ★★★ | Terminaciones/remodelación | Pintor pintando la fachada de una casa | Media |
| pintura/pintura-interior-01.jpg | Pintura | ★★ | Oficinas/interiores | Pintor pintando un interior con rodillo | Media |
| pintura/pintura-cielo-01.jpg | Pintura | ★★ | Variante interiores | Pintor pintando el cielo de una habitación | Baja |
| pintura/terminaciones-ceramica-01.jpg | Terminaciones | ★★★ | Remodelación/construcción | Maestro instalando cerámica en un baño | Media |
| jardineria/jardineria-poda-01.jpg | Jardinería | ★★★ | Hero collage, proof "Jardín recuperado", fallback jardinero | Jardinero realizando mantención de áreas verdes | Alta |
| jardineria/jardineria-pasto-01.jpg | Jardinería | ★★ | Cards jardín | Jardinero cortando el pasto de un jardín | Media |
| jardineria/jardineria-plantacion-01.jpg | Jardinería | ★★ | Paisajismo | Jardinero plantando flores en un jardín | Baja |
| piscinas/piscina-mantencion-01.jpg | Piscinas | ★★★ | Comunidades (casos B2B), Club Hogar | Especialista realizando mantención de una piscina | Alta |
| cerrajeria/cerrajeria-cerradura-01.jpg | Cerrajería | ★★★ | Emergencias/seguridad, fallback cerrajero | Cerrajero reparando la cerradura de una puerta | Media |
| cerrajeria/cerrajeria-puerta-01.jpg | Cerrajería | ★★ | Variante emergencias | Cerrajero ajustando la cerradura de una puerta | Baja |
| carpinteria/carpinteria-maestro-01.jpg | Carpintería | ★★ | Registro especialista (humana), maestro general | Maestro carpintero midiendo en su taller | Media |
| carpinteria/carpinteria-taller-01.jpg | Carpintería | ★★ | Variante taller | Carpintero trabajando en un mueble a medida | Baja |
| industria/industria-mantencion-01.jpg | Industria | ★★★ | Categoría industria | Técnico de mantención industrial trabajando en planta | Media |
| industria/industria-bombas-01.jpg | Industria | ★★★ | Casos B2B "Industria y bodegas" | Técnico realizando mantención de bombas industriales | Alta |
| industria/industria-tablero-01.jpg | Industria | ★★ | Electricidad industrial | Electricista industrial revisando un tablero de control | Media |
| industria/industria-soldadura-01.jpg | Industria | ★★ | Soldadura/estructuras | Soldador trabajando con protección facial en taller | Baja |
| industria/industria-planta-01.jpg | Industria | ★★ | Dashboard/empresas (constante `enterprise`) | Técnicos trabajando en una planta industrial | Media |
| agro/agro-packing-01.jpg | Agroindustria | ★★★ | Categoría agroindustria/packing | Trabajadores seleccionando fruta en un packing | Media |
| agro/agro-camara-frio-01.jpg | Agroindustria | ★★★ | Casos B2B "Restaurantes y frío" | Operario revisando cajas en una cámara de frío | Alta |
| agro/agro-campo-01.jpg | Agricultura | ★★ | Categoría agricultura/campos | Trabajadores agrícolas en faena de poda en el campo | Media |
| agro/agro-cosecha-01.jpg | Agricultura | ★★ | Variante temporada | Cuadrilla cosechando fruta en un huerto | Baja |

Descartadas: poda mecánica (duplicada con agro-campo) y bodega con grúas (oscura).

## Integraciones hechas en esta iteración

1. **Constantes de `src/data/mock.ts`** (`bathroom/electrical/garden/hvac/home/enterprise`) → fotos reales. Esto propaga automáticamente a: proof gallery de la Home, casos de uso de Club Hogar, galerías/trabajos de especialistas y dashboard empresa.
2. **Hero Home (desktop)**: collage 2×2 con gasfitería, electricidad, climatización y jardinería (`heroCollageImages`); primera imagen eager, resto lazy. Oculto en mobile (sin cambios de scroll).
3. **Casos B2B** (`HomeBusinessUseCases`, usado en Home y /empresas): piscina (comunidades), cámara de frío (restaurantes), bombas industriales (industria).
4. **Club Hogar**: rail superior con calefont; "Lo que incluye" con grifería.
5. **Fallback por oficio** (`fallbackSpecialistImage`): `SpecialistGridCard` y `SpecialistCompactCard` muestran imagen contextual del oficio si el especialista no tiene foto (sin fingir que es su foto personal: es imagen del servicio).
6. `loading="lazy"` en todas las imágenes bajo el fold; hero collage primera imagen sin lazy.

## Criterios aplicados

- Imagen correcta por servicio (gasfitería↔filtraciones/calefont, electricidad↔tablero/luminarias, piscinas↔comunidades/Club Hogar, A/C↔climatización/empresas, frío↔restaurantes/packing).
- Sin repetición excesiva: cada foto tiene 1 uso principal; los reusos son cross-página, no dentro de la misma vista.
- Overlay de gradiente donde hay texto encima (proof gallery, casos B2B).
- Alt text descriptivo en todas; sin datos personales, patentes ni documentos visibles.
- Sin conversión de formato (JPG originales <450 KB; no rompe build).

## Integraciones segunda ronda (cobertura 33/33)

7. **QuickProblemLinks**: los chips de "¿Qué necesitas resolver?" ahora llevan **foto circular del oficio** (32px) en vez de emoji — 12 fotos en uso, sigue siendo chip compacto.
8. **HomeCreditPreview**: los 3 ejemplos del simulador llevan miniatura 56px (calefont, luminaria, pasto).
9. **Club Hogar — comparador**: las 4 filas de servicios en ambas columnas llevan miniatura 40px (calefont, red exterior, luminaria, plantación).
10. **/especialistas — banner contextual**: cuando hay categoría activa (query param o filtro) aparece un banner h-24/32 con la imagen del rubro (`categoryImages`) + overlay y pill de confianza. Cubre las 19 categorías mapeadas (fachada, cerámica, packing, cosecha, etc.).
11. **/soporte**: cada card de rol lleva banner superior h-24 con overlay (pintura interior / taller carpintería / medidor comercial).
12. **/empresas**: la sección corporativa oscura ahora tiene **fondo fotográfico** (tablero industrial al 15% + gradiente enterprise) — primer uso de imagen como background.
13. **/registro-especialista**: panel lateral con foto humana grande ("Haz visible tu oficio", carpintero) + tira de 3 mini-fotos de oficios reales (instalación eléctrica, soldadura, medidor).

Verificado por script: **33/33 imágenes referenciadas** en `src/` y 0 rutas rotas.

## Pendientes

- Generar variantes webp/responsive (srcset) antes de producción masiva.
- Registro especialista: hero humano con carpinteria-maestro-01 (junto al rediseño pendiente de esa página).
- Perfil especialista: galería con imágenes por servicio cuando se reorganice la sección.
- Miniaturas por tipo en checkout (créditos/plan/visita) con iconografía.
- Texto "Imagen referencial del servicio" si el fallback de oficio genera confusión en pruebas con usuarios.
