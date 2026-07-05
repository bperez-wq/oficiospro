# Kaizen 2026-07-05 — Heros premium: Especialistas, Impacto y los 3 dashboards

Rama: `kaizen/claude-dashboards-impacto-design` (desde `main` ya consolidado —
merge de toda la cadena kaizen confirmado en `6b0ca3c` por Codex/Benjamin).
Solicitado por Benjamin: pestañas Cliente, Especialistas, Impacto, Dashboard
Empresa y Especialista "aún no tienen diseño".

## Diagnóstico

Mismo patrón que Club Hogar/Empresas/Soporte/Referidos: contenido correcto,
heros planos (AppHero/PageHero blancos). Además, el hero del panel de
especialista mostraba **"Panel de Víctor Mendoza"** (nombre del catálogo demo)
para cualquier visitante — problema de diseño y de honestidad a la vez.

## Cambios (reutilizando `PremiumPhotoHero`, cero componentes nuevos)

- **/especialistas** (`SpecialistsHero`): hero brand con foto de gasfitería,
  textos i18n intactos, chips honestos ("Filtra por oficio y comuna",
  "Reputación visible", "Explora sin registrarte") y footnote de red en
  formación coherente con el explorador.
- **/dashboard-cliente**: hero brand con foto de pintura interior, chips
  (billetera/reservas/historial), footnote del pago protegido y CTA secundario
  a /especialistas.
- **/dashboard-empresa**: hero enterprise oscuro con foto de sala de bombas,
  chips corporativos y footnote de apertura controlada.
- **/dashboard-especialista**: hero brand con foto de maestro carpintero;
  **eliminado el nombre demo del título** → "Tu oficio, tu panel, tu
  respaldo."; CTAs "Completar mi Pasaporte" (tracked click_offer_services,
  source dashboard_hero) y "Gestionar agenda"; footnote honesto sobre estado
  local vs revisión oficial. El enlace "Ver perfil público" al perfil demo
  también salió del hero.
- **/impacto**: PageHero → PremiumPhotoHero con foto de equipo con cascos,
  badges convertidos a chips y footnote "cada capacidad se activa cuando la
  operación real la respalda".

## Honestidad

- Se elimina el nombre de especialista demo del hero del panel (antes parecía
  la cuenta de una persona real).
- Fotos decorativas aria-hidden; footnotes de etapa piloto en dashboards.

## Verificación

Preview: 5/5 páginas con hero premium, imágenes resolviendo, chips y footnotes
presentes, "Panel de Víctor Mendoza" ausente, 390px sin overflow, consola
limpia. `npm.cmd run validate` ✅ · `build` ✅ · `wrangler --dry-run` ✅

## Segundo pase (aprobado): agenda especialista + admin

- **/agenda-especialista**: hero premium con foto de climatización; se elimina
  el enlace del hero al perfil demo y el claim "Crear mi perfil verificado" →
  "Completar mi Pasaporte" (tracked) + "Volver a mi panel"; footnote honesto
  ("la disponibilidad que declares es referencial; cada reserva se confirma");
  la card interna con lenguaje de developer ("Listo para backend / conectar
  D1") pasa a lenguaje de especialista ("Conectada a tu Pasaporte").
- **/admin** (root): el header pasa a consola de operación enterprise oscura
  con pill "Operación interna OficiosPro" + pulso, y quick-links a CRM,
  captación, salud del negocio y formalización. Solo JSX del header; cero
  cambios en AdminPanel ni en lógica interna.
- Verificado con sesión mock de especialista: hero, chips, footnote y CTA
  presentes; 390px sin overflow real (una medición inicial dio falso positivo
  por viewport a 0 y se re-midió); consola limpia; sesión QA eliminada.

## Próximo

- Interiores de ClientDashboard/CompanyDashboard (demo-gated) podrían recibir
  estados vacíos motivadores en un pase posterior.
- Decisión Benjamin pendiente: copy de activación Club Hogar.
