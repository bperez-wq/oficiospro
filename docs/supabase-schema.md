# Modelo inicial Supabase para OficiosPro

Este documento deja preparada la estructura de datos para migrar la plataforma mock desde `localStorage` hacia Supabase. La primera versión debe separar identidad, perfiles, créditos, reservas, empresas y reputación.

Archivo SQL ejecutable: [`supabase/schema.sql`](../supabase/schema.sql).

## users

Usuarios base de la plataforma. Puede mapearse con `auth.users.id`.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Igual a `auth.users.id` cuando se conecte Supabase Auth |
| role | text | `client`, `specialist`, `company_admin`, `admin` |
| full_name | text | Nombre visible |
| email | text unique | Email de acceso |
| phone | text | WhatsApp o teléfono |
| commune | text | Comuna principal |
| status | text | `active`, `pending`, `blocked` |
| created_at | timestamptz | Fecha de creación |

## specialists

Perfil profesional del técnico.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Perfil especialista |
| user_id | uuid references users(id) | Dueño del perfil |
| specialty | text | Ej: Gasfíter, Electricista, Técnico HVAC |
| category_id | uuid references categories(id) | Categoría principal |
| commune | text | Base operacional |
| service_radius_km | integer | Radio de atención |
| bio | text | Descripción profesional |
| base_credits | integer | Precio base dinámico en créditos |
| response_time_minutes | integer | Promedio calculado |
| rating_avg | numeric | Promedio de reviews |
| completed_jobs | integer | Trabajos finalizados |
| recommendation_rate | numeric | Porcentaje recomendado |
| verification_status | text | `pending`, `approved`, `rejected` |
| badges | jsonb | Verificado, Top especialista, Certificado |
| certifications | jsonb | SEC, HVAC, CCTV, etc. |
| gallery | jsonb | URLs de trabajos realizados |
| created_at | timestamptz | Fecha de creación |

## categories

Categorías comerciales.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Categoría |
| name | text | Hogar, Climatización, Tecnología, Industrial |
| description | text | Texto descriptivo |
| sort_order | integer | Orden en la UI |
| is_active | boolean | Visible o no |

## services

Servicios reservables.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Servicio |
| category_id | uuid references categories(id) | Categoría |
| name | text | Ej: Visita gasfitería |
| description | text | Detalle |
| base_credits | integer | Créditos base |
| dynamic_pricing_enabled | boolean | Ajuste por demanda |
| is_active | boolean | Visible o no |

## bookings

Reservas de clientes o empresas.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Reserva |
| client_user_id | uuid references users(id) | Cliente persona |
| company_id | uuid references companies(id) nullable | Empresa si aplica |
| company_branch_id | uuid references company_branches(id) nullable | Sucursal si aplica |
| specialist_id | uuid references specialists(id) | Técnico asignado |
| service_id | uuid references services(id) | Servicio solicitado |
| status | text | `requested`, `confirmed`, `in_progress`, `completed`, `cancelled` |
| scheduled_at | timestamptz | Fecha y hora |
| commune | text | Comuna del trabajo |
| address | text | Dirección, idealmente privada |
| credits_amount | integer | Créditos cobrados |
| payment_release_status | text | `held`, `released`, `disputed` |
| notes | text | Detalle del cliente |
| created_at | timestamptz | Fecha de creación |

## credits_wallet

Billetera de créditos por cliente o empresa.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Billetera |
| owner_type | text | `user` o `company` |
| user_id | uuid references users(id) nullable | Si es cliente |
| company_id | uuid references companies(id) nullable | Si es empresa |
| balance | integer | Saldo actual |
| expires_at | timestamptz nullable | Vencimiento general si aplica |
| created_at | timestamptz | Fecha de creación |

## credit_transactions

Historial contable de créditos.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Movimiento |
| wallet_id | uuid references credits_wallet(id) | Billetera |
| booking_id | uuid references bookings(id) nullable | Reserva asociada |
| type | text | `subscription_load`, `booking_hold`, `booking_release`, `refund`, `manual_adjustment` |
| amount | integer | Positivo o negativo |
| description | text | Detalle visible |
| expires_at | timestamptz nullable | Vencimiento por lote |
| created_at | timestamptz | Fecha del movimiento |

## reviews

Evaluaciones verificadas.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Review |
| booking_id | uuid references bookings(id) unique | Una review por reserva |
| client_user_id | uuid references users(id) | Autor |
| specialist_id | uuid references specialists(id) | Evaluado |
| quality_rating | integer | 1 a 5 |
| punctuality_rating | integer | 1 a 5 |
| price_rating | integer | 1 a 5 |
| communication_rating | integer | 1 a 5 |
| recommended | boolean | Recomendación |
| comment | text | Comentario |
| created_at | timestamptz | Fecha |

## companies

Cuentas corporativas.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Empresa |
| legal_name | text | Razón social |
| rut | text unique | RUT |
| contact_name | text | Contacto operacional |
| contact_email | text | Email |
| contact_phone | text | Teléfono |
| plan | text | `pyme`, `empresa`, `corporativo` |
| billing_status | text | `active`, `pending`, `blocked` |
| status | text | `pending`, `active`, `rejected` |
| created_at | timestamptz | Fecha |

## company_branches

Sucursales o ubicaciones de empresa.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Sucursal |
| company_id | uuid references companies(id) | Empresa |
| name | text | Nombre interno |
| commune | text | Comuna |
| address | text | Dirección |
| priority_level | text | `normal`, `priority`, `critical` |
| is_active | boolean | Activa o no |

## subscriptions

Planes de clientes y empresas.

| Campo | Tipo sugerido | Notas |
| --- | --- | --- |
| id | uuid primary key | Suscripción |
| owner_type | text | `user` o `company` |
| user_id | uuid references users(id) nullable | Cliente |
| company_id | uuid references companies(id) nullable | Empresa |
| plan_name | text | Básico, Plus, Premium, Pyme, Empresa, Corporativo |
| monthly_price_clp | integer | Precio mensual |
| monthly_credits | integer | Créditos cargados |
| status | text | `active`, `paused`, `cancelled` |
| started_at | timestamptz | Inicio |
| renewed_at | timestamptz | Última renovación |
| cancelled_at | timestamptz nullable | Baja |

## Relaciones principales

- `users` puede tener un perfil en `specialists`.
- `companies` tiene varias `company_branches`.
- `credits_wallet` pertenece a un usuario o empresa.
- `credit_transactions` registra cada carga, uso, devolución o ajuste de créditos.
- `bookings` conecta cliente o empresa con especialista y servicio.
- `reviews` se crean solo sobre reservas finalizadas.
- `subscriptions` alimenta la billetera de créditos mensual.

## Próximo paso técnico

1. Crear estas tablas en Supabase.
2. Conectar Supabase Auth para login y roles.
3. Reemplazar los helpers de `localStorage` por consultas a Supabase.
4. Agregar Row Level Security por rol.
5. Integrar pagos recién cuando el flujo de reservas y créditos esté validado.
