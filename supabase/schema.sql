-- OficiosPro initial Supabase schema
-- Execute in Supabase SQL editor after reviewing RLS policies for production.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  role text not null check (role in ('client', 'specialist', 'company_admin', 'admin')),
  full_name text not null,
  email text not null unique,
  phone text,
  commune text,
  status text not null default 'active' check (status in ('active', 'pending', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  base_credits integer not null check (base_credits > 0),
  dynamic_pricing_enabled boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.specialists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  specialty text not null,
  commune text not null,
  service_radius_km integer not null default 12,
  bio text,
  base_credits integer not null default 30 check (base_credits > 0),
  response_time_minutes integer,
  rating_avg numeric(2, 1) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  completed_jobs integer not null default 0,
  recommendation_rate numeric(5, 2) not null default 0,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  badges jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  rut text unique,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  plan text not null default 'pyme' check (plan in ('pyme', 'empresa', 'corporativo')),
  billing_status text not null default 'pending' check (billing_status in ('pending', 'active', 'blocked')),
  status text not null default 'pending' check (status in ('pending', 'active', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_branches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  commune text not null,
  address text,
  priority_level text not null default 'normal' check (priority_level in ('normal', 'priority', 'critical')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('user', 'company')),
  user_id uuid references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  plan_name text not null,
  monthly_price_clp integer not null check (monthly_price_clp >= 0),
  monthly_credits integer not null default 0 check (monthly_credits >= 0),
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  started_at timestamptz not null default now(),
  renewed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  constraint subscriptions_owner_check check (
    (owner_type = 'user' and user_id is not null and company_id is null) or
    (owner_type = 'company' and company_id is not null and user_id is null)
  )
);

create table if not exists public.credits_wallet (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('user', 'company')),
  user_id uuid references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credits_wallet_owner_check check (
    (owner_type = 'user' and user_id is not null and company_id is null) or
    (owner_type = 'company' and company_id is not null and user_id is null)
  )
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid references public.users(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  company_branch_id uuid references public.company_branches(id) on delete set null,
  specialist_id uuid not null references public.specialists(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  commune text not null,
  address text,
  credits_amount integer not null check (credits_amount > 0),
  payment_release_status text not null default 'held' check (payment_release_status in ('held', 'released', 'disputed', 'refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.credits_wallet(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  type text not null check (type in ('subscription_load', 'booking_hold', 'booking_release', 'refund', 'manual_adjustment')),
  amount integer not null,
  description text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  client_user_id uuid references public.users(id) on delete set null,
  specialist_id uuid not null references public.specialists(id) on delete cascade,
  quality_rating integer not null check (quality_rating between 1 and 5),
  punctuality_rating integer not null check (punctuality_rating between 1 and 5),
  price_rating integer not null check (price_rating between 1 and 5),
  communication_rating integer not null check (communication_rating between 1 and 5),
  recommended boolean not null default true,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_specialists_category on public.specialists(category_id);
create index if not exists idx_specialists_commune on public.specialists(commune);
create index if not exists idx_specialists_verification on public.specialists(verification_status);
create index if not exists idx_bookings_client on public.bookings(client_user_id);
create index if not exists idx_bookings_company on public.bookings(company_id);
create index if not exists idx_bookings_specialist on public.bookings(specialist_id);
create index if not exists idx_credit_transactions_wallet on public.credit_transactions(wallet_id);

insert into public.categories (name, description, sort_order)
values
  ('Hogar', 'Gasfitería, electricidad, jardinería, pintura y cerrajería.', 1),
  ('Climatización', 'Aire acondicionado, bombas de calor, refrigeración y mantención HVAC.', 2),
  ('Tecnología', 'Cámaras, alarmas, redes, domótica y soporte computacional.', 3),
  ('Industrial', 'Soldadura, automatización, electricidad industrial y mantención de equipos.', 4)
on conflict (name) do update
set description = excluded.description,
    sort_order = excluded.sort_order;

insert into public.services (category_id, name, description, base_credits, dynamic_pricing_enabled)
select c.id, v.name, v.description, v.base_credits, true
from (
  values
    ('Hogar', 'Visita gasfitería', 'Diagnóstico o reparación básica de gasfitería domiciliaria.', 30),
    ('Hogar', 'Diagnóstico eléctrico', 'Revisión de enchufes, tableros, iluminación o fallas eléctricas.', 25),
    ('Hogar', 'Mantención de jardín', 'Mantención general de jardín residencial.', 35),
    ('Climatización', 'Mantención HVAC', 'Mantención de aire acondicionado, bombas de calor o HVAC.', 45),
    ('Tecnología', 'Instalación de cámaras', 'Instalación de CCTV, alarmas o redes domésticas.', 20),
    ('Industrial', 'Servicio industrial', 'Servicio técnico industrial o soldadura especializada.', 55)
) as v(category_name, name, description, base_credits)
join public.categories c on c.name = v.category_name
where not exists (
  select 1 from public.services s where s.name = v.name
);

-- RLS should be enabled before production. Example:
-- alter table public.users enable row level security;
-- create policy "Users can read their own profile" on public.users
--   for select using (auth.uid() = auth_user_id);
