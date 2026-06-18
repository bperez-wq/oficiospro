# UTM links playbook

Usa estos links para medir fuentes reales sin mezclar campanas.

## Links base

Instagram bio:

```text
https://www.oficiospro.cl/especialistas-fundadores?utm_source=instagram&utm_medium=bio&utm_campaign=especialistas_fundadores
```

Instagram story:

```text
https://www.oficiospro.cl/especialistas-fundadores?utm_source=instagram&utm_medium=story&utm_campaign=especialistas_fundadores
```

WhatsApp:

```text
https://www.oficiospro.cl/especialistas-fundadores?utm_source=whatsapp&utm_medium=referral&utm_campaign=especialistas_fundadores
```

Facebook grupos:

```text
https://www.oficiospro.cl/especialistas-fundadores?utm_source=facebook&utm_medium=group&utm_campaign=oficios_comuna
```

OMIL:

```text
https://www.oficiospro.cl/instituciones?utm_source=omil&utm_medium=partner&utm_campaign=piloto_comunal
```

## Convencion

- `utm_source`: canal o socio. Ejemplos: `instagram`, `whatsapp`, `facebook`, `omil`, `referido_especialista`.
- `utm_medium`: formato. Ejemplos: `bio`, `story`, `group`, `referral`, `partner`.
- `utm_campaign`: objetivo. Ejemplos: `especialistas_fundadores`, `oficios_comuna`, `piloto_comunal`.

## Reglas

- No reutilizar el mismo link para canales distintos.
- No poner nombres personales en UTMs.
- No poner telefonos, RUT ni emails en UTMs.
- Mantener campanas simples y en minuscula.
- Usar guion bajo para separar palabras.

## Como medir Instagram

1. Usar el link de bio en el perfil.
2. Usar el link de story solo en historias.
3. Revisar en `/admin/crm/acquisition`:
   - `utmSource = instagram`
   - `utmMedium = bio` o `story`
   - `utmCampaign = especialistas_fundadores`

## Como medir WhatsApp

1. Usar el link WhatsApp en mensajes directos o grupos.
2. Si es referido, preferir `/referidos/especialistas`.
3. Revisar eventos `referral_link_created` y postulaciones con source de referido.

## Como medir Facebook

1. Usar el link de grupos en publicaciones comunales.
2. Cambiar campana si la publicacion es por comuna, por ejemplo `oficios_nunoa`.
3. Revisar clicks, landing views e inicios.

## Como medir instituciones

1. Enviar el link OMIL a instituciones.
2. Pedir que no lo compartan en canales masivos si la conversacion es piloto.
3. Revisar `institution_contact_submitted` y leads de contacto institucional.

## Cierre semanal

Registrar en `docs/kaizen-backlog.md`:

- fuente con mas visitas
- fuente con mas clicks
- fuente con mas postulaciones
- principal paso de abandono
- experimento de la semana siguiente
