# Kaizen 2026-07-05 — Funnel SEC: landing de mailing + atribución

Rama: `kaizen/claude-sec-mailing-funnel` (desde `main`)
Contexto: Benjamin tiene la base pública de certificados SEC y les envía
mailing. Codex ya construyó el modelo de referencia externa
(`externalCertifiedSpecialists`, policy con gates, fichas prototipo fake,
página DSR `/privacidad/solicitudes`, noindex vía Worker) con la importación
masiva de datos reales **bloqueada hasta revisión legal**
(`allowRealSecImportDefault: false`).

## Revisión del trabajo de Codex

Sólido: separación reclamado/no reclamado, campos permitidos/prohibidos,
disclaimer legal, tests de policy, flujo DSR. **Gap encontrado**: las fichas
enlazan al registro con `source=external_public_registry`, pero
`normalizeAcquisitionSource` degradaba cualquier source desconocido a
`"direct"` → la atribución SEC se perdía en leads y CRM.

## Cambios de este ciclo (frontend, sin tocar la política legal)

1. **Sources tipados** (`specialistAcquisition.ts`): nuevos ids `sec_mailing`
   ("Mailing SEC") y `sec_registro_publico` ("Registro público SEC") + alias
   `sec`, `sec_outreach` → sec_mailing y `external_public_registry` →
   sec_registro_publico. Esto repara la atribución de las fichas de Codex sin
   tocar su código y habilita el tracking del mailing.
2. **Landing `/sec`** — destino corto para el mailing (oficiospro.cl/sec):
   - Hero premium (tablero eléctrico) "Tu certificación SEC merece una vitrina
     profesional", con disclaimer de no afiliación en el propio hero.
   - 3 pasos sin letra chica; bloque de valor "Que tu autorización trabaje
     para ti"; captura rápida (`SpecialistQuickLeadForm`, source sec_mailing).
   - Bloque "Sobre nuestros correos y tus datos": por qué contactamos (fuente
     pública), qué NO publicamos, y enlace directo a
     `/privacidad/solicitudes` para opt-out/corrección/eliminación.
   - CTA principal trackeado (`click_offer_services`, source=sec_mailing,
     campaign=sec_outreach) → registro con origen visible ("Llegaste por
     Mailing SEC").
3. **Sitemap**: `/sec` agregado (0.6, monthly).

## Qué NO se hizo (a propósito)

- No se cargaron nombres reales de la base SEC: la política de Codex exige
  revisión legal para la importación masiva y los datos visibles siguen siendo
  prototipos `fakeData`. Mostrar nombres/comunas reales espera esa aprobación
  (decisión Benjamin + legal), aunque la fuente sea pública.
- No se tocó worker, D1, ni la policy de Codex.

## Verificación

- `/sec` completa en preview (hero, pasos, valor, transparencia, DSR link,
  chips sin promesas), CTA con query de atribución correcta.
- Registro reconoce ambos orígenes: "Llegaste por Mailing SEC" y "Llegaste por
  Registro público SEC" (alias reparado).
- 390px sin overflow, consola limpia.
- `validate` / `build` / `dry-run` / `soro:audit` según validaciones estándar.

## Métricas del funnel

- `page_view` en /sec (source sec_mailing) → `click_offer_services` →
  `specialist_application_started/submitted` con source sec_mailing; leads de
  captura rápida con ese origen visibles en /admin/crm/acquisition.

## Handoffs / decisiones

- **Benjamin + legal**: aprobar la carga real de la base SEC (nombre, comuna,
  labor) según la política de Codex; con eso las fichas dejan el prototipo.
- **Codex**: cuando se apruebe, pipeline de importación con
  `assertRealSecImportAllowed` + refresco periódico y hash de fuente.
- **Mailing**: usar `https://www.oficiospro.cl/sec?source=sec` (o
  `?source=sec_mailing&utm_campaign=<oleada>`) como URL del botón del correo
  para atribución por campaña.
