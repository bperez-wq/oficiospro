# Registros públicos de oficios en Chile — plan de base de datos y outreach

Investigación de fuentes públicas legítimas para construir la base de contactos de especialistas, y kit de outreach (llamada/correo) para usarla sin quemar la marca ni infringir la ley de datos.

## 1. Registros públicos encontrados (verificados)

### SEC — Instaladores eléctricos y de gas autorizados ⭐ (la mejor fuente)

- **Qué es:** registro oficial de instaladores eléctricos (clases A-D / TE) y de gas autorizados, con buscador público pensado para que la ciudadanía los encuentre y contacte.
- **Dónde:** buscador simple `https://wlhttp.sec.cl/buscadorinstaladores/buscador.do` · nuevo buscador en sec.cl (Área Ciudadana) · Registro Nacional de Instaladores `https://wlhttp.sec.cl/rnii/home` · validador `https://wlhttp.sec.cl/validadorInstaladores/`
- **Filtros:** región, comuna, clase de licencia, nombre/RUT.
- **Datos:** nombre, comuna/región, clase de autorización y datos de contacto de instaladores vigentes.
- **Por qué es oro:** son exactamente los electricistas y gásfiters certificados que OficiosPro quiere (la certificación es señal de calidad), publicados con el propósito de ser contactados por su oficio. Además permite VERIFICAR credenciales de quien se registre en la plataforma.

### ChileValora — Personas certificadas en competencias laborales ⭐

- **Qué es:** registro público oficial de personas con certificación de competencias laborales por oficio (construcción, gasfitería, jardinería, mantención, etc.).
- **Dónde:** `https://certificacion.chilevalora.cl/ChileValora-publica/candidatosList.html` (búsqueda por nombre, RUN o sector productivo) + catálogo de perfiles laborales por sector.
- **Datos:** nombre, perfil certificado, año, unidades de competencia. **No publica teléfono/correo** → sirve para dimensionar mercado por oficio/sector, verificar certificaciones y para alianza institucional con ChileValora/centros certificadores (que sí llegan a las personas).

### MINVU — Registros Técnicos (contratistas y constructores)

- **Qué es:** Registro Nacional de Contratistas y Registro de Constructores de Vivienda Social (personas naturales y jurídicas habilitadas para obras).
- **Dónde:** consultas en línea `https://appregistrostecnicos.minvu.cl/informacionlineat.aspx` · portal proveedores técnicos `https://proveedores-tecnicos.minvu.gob.cl/`
- **Uso:** contratistas medianos/grandes — más útil para el segmento empresas/B2B de OficiosPro que para especialistas individuales.

### SISS — Instaladores sanitarios no profesionales

- **Qué es:** credenciales históricas de instaladores sanitarios (RIDAA antiguo); quienes la obtuvieron hasta 2003 la renuevan cada 3 años ante la SISS.
- **Dónde:** listados en oficinas de atención de las empresas sanitarias y link en `siss.gob.cl`.
- **Uso:** universo acotado y de mayor edad; segunda prioridad. Útil para verificación.

### Fuentes complementarias

- **datos.gob.cl:** sin dataset directo de instaladores; revisar periódicamente etiquetas "trabajo".
- **Mercado Público / ChileProveedores:** proveedores de servicios de mantención (segmento empresas).
- **Municipalidades (patentes):** dispersas y de acceso variable; no priorizar.

## 2. Reglas de uso (no negociables)

1. **Contacto individual y personalizado, nunca masivo.** Nada de listas para spam telefónico o de correo. La nueva ley de protección de datos (que reemplaza la 19.628) endurece las sanciones desde fines de 2026: partir bien hoy evita problemas mañana.
2. **Propósito declarado al primer contacto:** "vi tu registro como instalador autorizado SEC" — transparencia total sobre de dónde salió el dato.
3. **Opt-out inmediato:** si dice que no le interesa, se marca `no_contactar` y no se insiste jamás.
4. **Registrar la fuente de cada contacto** en la base (campo `fuente`). Sin fuente conocida, no se contacta.
5. **Volumen sano:** 10-20 contactos personalizados por día máximo, priorizando comunas piloto.
6. **El registro público también sirve al revés:** verificar credenciales SEC/ChileValora de quienes se registren en OficiosPro → insignia "certificación verificada" en el perfil (diferenciador real de la plataforma).

## 3. Estructura de la base (plantilla en `content/outreach/outreach-base-template.csv`)

| Campo | Ejemplo |
|---|---|
| nombre | Juan Pérez |
| oficio | electricista |
| certificacion | SEC clase D |
| region / comuna | RM / Maipú |
| telefono / email | +569... / — |
| fuente | buscador SEC (fecha) |
| fecha_captura | 2026-07-02 |
| estado | por_contactar / contactado / interesado / registrado / no_contactar |
| canal_contacto | llamada / correo / whatsapp |
| fecha_contacto | |
| notas | |
| consentimiento | sí/no/pendiente |

## 4. Guion de llamada (30-45 segundos, luego escuchar)

> Hola, ¿hablo con [nombre]? Mi nombre es Benjamín Pérez. Lo encontré en el registro de instaladores autorizados de la SEC — primero que nada, felicitaciones por la certificación, no todos la tienen.
>
> Le cuento cortito el motivo: estoy construyendo OficiosPro.cl, una plataforma chilena para que especialistas certificados como usted muestren sus trabajos y los encuentren clientes en su comuna. Estamos en etapa fundador y ando invitando personalmente a los mejores instaladores de [comuna].
>
> Crear el perfil es gratis y su certificación SEC aparecería verificada. ¿Le interesa que le mande el link por WhatsApp para que lo mire con calma?

Reglas: si dice no, agradecer y marcar `no_contactar`. No prometer pega. No presionar. El objetivo de la llamada es el WhatsApp con link, no el registro en el momento.

## 5. Correo tipo (asunto: "Vi tu registro SEC — invitación de OficiosPro")

> Hola [nombre],
>
> Te escribo personalmente (nada automatizado). Encontré tu registro como instalador autorizado en el buscador público de la SEC y quería invitarte a algo que estamos construyendo.
>
> OficiosPro.cl es una plataforma chilena para que especialistas certificados muestren sus trabajos con fotos y los encuentren clientes de su comuna. Estamos en etapa fundador: los primeros perfiles tienen prioridad de revisión y visibilidad. Crear el perfil es gratis, sin mensualidad, y tu certificación SEC aparecería verificada — eso te diferencia de inmediato.
>
> De frente: no prometemos trabajos garantizados (la demanda depende de cada comuna). Prometemos una vitrina seria para que tu trabajo hable por ti.
>
> Si te interesa: https://www.oficiospro.cl/especialistas-fundadores?utm_source=email&utm_medium=direct&utm_campaign=sec_outreach
>
> Y si prefieres que no te vuelva a escribir, respóndeme "no gracias" y listo.
>
> Saludos,
> Benjamín Pérez — OficiosPro.cl

## 6. Flujo operativo semanal

1. Lunes: elegir comuna piloto y extraer manualmente 30-50 instaladores del buscador SEC (región + comuna + clase).
2. Martes-jueves: 10-20 contactos/día (llamada corta o correo personalizado). Registrar todo en la base.
3. WhatsApp de seguimiento con link medido (`utm_source=whatsapp&utm_medium=direct&utm_campaign=sec_outreach`).
4. Viernes: revisar conversión por fuente en `/admin/crm/acquisition` y decidir la comuna siguiente.
5. Cada registro nuevo: verificar credencial SEC y marcar el perfil.

## 7. Pendientes / oportunidades

- Insignia "Certificación SEC verificada" en perfiles (producto — alto valor, diferenciador).
- Alianza con ChileValora / centros certificadores para difusión a personas certificadas (vía institucional del playbook).
- MINVU contratistas → pipeline B2B empresas.
- Evaluar automatización de VERIFICACIÓN (no de contacto) contra el validador SEC cuando haya volumen de registros.
