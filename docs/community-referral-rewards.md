# Recompensa por recomendar especialistas (1 credito)

Objetivo: convertir a la comunidad en red de captacion. Quien recomienda o ayuda a
incorporar a un buen especialista gana **1 credito ($1.000)** cuando ese especialista
queda incorporado en la plataforma.

## Que ya esta hecho (frontend, en vivo)

- Seccion destacada en Home "Recomienda y gana" (`CommunityReferralBanner`), con entrada
  en navegacion (header) y footer (ancla `/#recomienda-gana`).
- `RecommendSpecialistCard` muestra el incentivo ("Gana 1 credito cuando el especialista
  se incorpore"), pide nombre/contacto del recomendado, motivo, y **nombre + contacto de
  quien recomienda** (para acreditarle el premio).
- Cada recomendacion se registra HOY via `submitConversionEvent`
  (`type: "specialist_recommendation"`) -> tabla `conversion_events`, con payload:
  `recommendedName, recommendedContact, reason, recommenderName, recommenderContact,
  trade, commune, region, recommendationSource, rewardProgram: "refer_specialist_1_credit",
  rewardCredits: 1, rewardStatus: "pending_specialist_approval"`.

## Que falta (backend, financiero, admin-confirmado)

Mueve creditos reales, asi que va con humano en el loop (anti-fraude) y validacion.

Condicion de pago (definida): **se acredita 1 credito al referidor cuando el especialista
recomendado queda aprobado/incorporado.** No se paga por la sola recomendacion.

### 1. Persistir la recomendacion como referido

Reusar `external_provider_suggestions` (migracion 0010, ya preparada) o una tabla
`referral_rewards`. Campos minimos: `referrerName`, `referrerContact`, `recommendedName`,
`recommendedContact`, `trade`, `commune`, `status` (pending|matched|granted|rejected),
`rewardCredits` (1), `specialistApplicationId` (cuando se vincule), `grantedCreditEventId`,
`createdAt`, `updatedAt`. Poblar desde el interceptor de `createConversionEvent` cuando
`type === "specialist_recommendation"` (mismo patron del handoff de external providers).

### 2. Vincular recomendado -> especialista aprobado

El matching es difuso (nombre/telefono del recomendado vs la postulacion real). Opciones:
- **Recomendado (simple):** panel admin lista referidos `pending`; al aprobar un
  especialista, el admin elige el referido que corresponde y confirma. Un clic.
- **Asistido:** al aprobar (ver `worker/index.ts`, ruta de moderacion de
  `specialist_applications`, donde `status -> approved`), buscar referidos `pending` cuyo
  contacto/nombre coincida y crear una tarea CRM "Confirmar recompensa de referido".

### 3. Acreditar el credito

Reusar la primitiva existente `addCredits` / endpoint `POST /api/credits/add` (ya escribe
en `credit_wallets`). Al confirmar:
- `addCredits({ userId|wallet del referidor, credits: 1, reason: "referral_reward",
  reference: referralId })`.
- Marcar el referido `status = "granted"` y guardar `grantedCreditEventId`.
- Notificar al referidor (email/wsp) con el contacto que dejo.

Requisito: el referidor necesita una cuenta/wallet. Si solo dejo contacto, el admin lo
resuelve (crea/asocia wallet) antes de acreditar. Esto tambien frena el abuso.

### 4. Anti-fraude (reglas sugeridas)

- Pago solo tras aprobacion del especialista (ya definido).
- Un credito por especialista nuevo (no por recomendaciones repetidas del mismo).
- No auto-recomendaciones (mismo contacto referidor = recomendado).
- Tope/alerta si un mismo referidor supera N referidos en poco tiempo (revision manual).

## Resumen de activacion

1. (Hecho) Frontend captura referidor + incentivo visible.
2. Persistir referidos (interceptor en `createConversionEvent`).
3. Panel admin de "Referidos pendientes" + accion "Acreditar 1 credito" (usa `addCredits`).
4. (Opcional) Gancho al aprobar especialista para sugerir el match.
5. Notificacion al referidor.

No tocar pagos/checkout/MercadoPago. El credito de recompensa se emite por el ledger
interno, no por pasarela de pago.
