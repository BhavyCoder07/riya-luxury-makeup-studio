-- Riya Luxury Makeup Studio - production database starter
-- Run in a Supabase SQL editor after creating a project.
-- Never paste a real admin password into this file.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('customer','admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.booking_status as enum ('PENDING','CONFIRMED','RESCHEDULED','REJECTED','CANCELLED','COMPLETED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.payment_status as enum ('ADVANCE_PENDING','ADVANCE_PAID','PARTIALLY_PAID','FULLY_PAID','REFUND_PENDING','REFUNDED');
exception when duplicate_object then null; end $$;


create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  price numeric(12,2) not null default 0,
  description text not null default '',
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  duration_minutes int not null default 60,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.availability_dates (
  date date primary key,
  is_closed boolean not null default false,
  note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  date date not null,
  time time without time zone not null,
  is_closed boolean not null default false,
  max_capacity int not null default 2,
  primary key (date,time)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null,
  user_id uuid not null references public.profiles(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  customer_name text not null,
  email text not null,
  phone text not null,
  appointment_date date not null,
  appointment_time time without time zone not null,
  status public.booking_status not null default 'PENDING',
  payment_status public.payment_status not null default 'ADVANCE_PENDING',
  total_amount numeric(12,2) not null default 0,
  advance_paid numeric(12,2) not null default 0,
  remaining_amount numeric(12,2) not null default 0,
  notes text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  status public.booking_status not null,
  note text,
  old_date date,
  new_date date,
  old_time time without time zone,
  new_time time without time zone,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_change_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_type text not null check (request_type in ('CANCELLATION','RESCHEDULE','DATE_CHANGE')),
  requested_date date,
  requested_time time without time zone,
  reason text,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  method text not null default 'MANUAL',
  note text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  image_url text not null,
  caption text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.jewellery_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  image_url text not null,
  rental numeric(12,2) not null,
  deposit numeric(12,2) not null,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  service text,
  approved boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','ARCHIVED')),
  created_at timestamptz not null default now()
);

create table if not exists public.bridal_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  event_date date,
  function_type text,
  preferred_service text,
  preferred_time time without time zone,
  functions_count int not null default 1,
  message text,
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','CLOSED')),
  created_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  enabled boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bookings_slot_idx on public.bookings (appointment_date, appointment_time, status);
create index if not exists bookings_user_idx on public.bookings (user_id, created_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- Capacity enforcement helper: a confirmed/rescheduled booking counts toward capacity.
create or replace function public.confirmed_slot_count(p_date date, p_time time)
returns int language sql stable as $$
  select count(*)::int from public.bookings
  where appointment_date = p_date
    and appointment_time = p_time
    and status in ('CONFIRMED','RESCHEDULED');
$$;

-- Safe booking insert function. The frontend should call this RPC instead of inserting directly.
create or replace function public.create_booking_atomic(
  p_booking_code text,
  p_service_id uuid,
  p_service_name text,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_date date,
  p_time time,
  p_total numeric,
  p_notes text default null,
  p_max_capacity int default 2
)
returns public.bookings
language plpgsql
security definer
set search_path=public
as $$
declare
  v_booking public.bookings;
  v_count int;
  v_capacity int;
  v_start time;
  v_end time;
begin
  select coalesce((value->>'maxBookingsPerSlot')::int,2), coalesce((value->>'workingStart')::time,'09:00'), coalesce((value->>'workingEnd')::time,'21:00') into v_capacity,v_start,v_end from public.site_settings where key='booking';
  v_capacity := coalesce(v_capacity,2);
  v_start := coalesce(v_start,'09:00');
  v_end := coalesce(v_end,'21:00');

  if p_date < current_date then
    raise exception 'PAST_DATE';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_date::text || '|' || p_time::text, 0));

  if p_time < v_start or p_time >= v_end then
    raise exception 'OUTSIDE_HOURS';
  end if;

  if exists(select 1 from public.availability_dates where date = p_date and is_closed) then
    raise exception 'DATE_CLOSED';
  end if;

  if exists(select 1 from public.availability_slots where date = p_date and time = p_time and is_closed) then
    raise exception 'SLOT_CLOSED';
  end if;

  v_count := public.confirmed_slot_count(p_date, p_time);
  if v_count >= v_capacity then
    raise exception 'SLOT_FULL';
  end if;

  insert into public.bookings (
    booking_code, user_id, service_id, service_name, customer_name, email, phone,
    appointment_date, appointment_time, status, payment_status, total_amount,
    advance_paid, remaining_amount, notes
  ) values (
    p_booking_code, auth.uid(), p_service_id, p_service_name, p_customer_name, p_email, p_phone,
    p_date, p_time, 'PENDING', 'ADVANCE_PENDING', p_total,
    0, p_total, p_notes
  ) returning * into v_booking;

  insert into public.booking_status_history (booking_id,status,note,created_by)
  values (v_booking.id,'PENDING','Booking request received.',auth.uid());

  insert into public.notifications(user_id,title,message)
  values (auth.uid(),'Booking request received','Your booking '||p_booking_code||' is pending review.');

  return v_booking;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.availability_dates enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.booking_change_requests enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.jewellery_items enable row level security;
alter table public.reviews enable row level security;
alter table public.contact_messages enable row level security;
alter table public.bridal_enquiries enable row level security;
alter table public.social_links enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

-- Public read for published catalog content.
drop policy if exists public_services_select on public.services;
create policy public_services_select on public.services for select using (active = true or public.is_admin());
drop policy if exists public_portfolio_select on public.portfolio_items;
create policy public_portfolio_select on public.portfolio_items for select using (published = true or public.is_admin());
drop policy if exists public_jewellery_select on public.jewellery_items;
create policy public_jewellery_select on public.jewellery_items for select using (true);
drop policy if exists public_reviews_select on public.reviews;
create policy public_reviews_select on public.reviews for select using (approved = true or public.is_admin());
drop policy if exists public_social_select on public.social_links;
create policy public_social_select on public.social_links for select using (enabled = true or public.is_admin());
drop policy if exists public_settings_select on public.site_settings;
create policy public_settings_select on public.site_settings for select using (key in ('business','booking','social') or public.is_admin());

-- Profiles
create policy profile_self_select on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy profile_self_update on public.profiles for update using (id=auth.uid() or public.is_admin());

-- Customers can see their own bookings/history/notifications/change requests.
create policy bookings_self_select on public.bookings for select using (user_id=auth.uid() or public.is_admin());
create policy bookings_admin_update on public.bookings for update using (public.is_admin()) with check (public.is_admin());
create policy booking_history_self_select on public.booking_status_history for select using (exists(select 1 from public.bookings b where b.id=booking_id and (b.user_id=auth.uid() or public.is_admin())));
create policy booking_change_self on public.booking_change_requests for all using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy payments_self_select on public.payments for select using (exists(select 1 from public.bookings b where b.id=booking_id and (b.user_id=auth.uid() or public.is_admin())));
create policy notifications_self on public.notifications for all using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());

-- Public forms: insert only, admin reads.
create policy contact_insert_public on public.contact_messages for insert with check (true);
create policy contact_admin on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
create policy enquiry_insert_public on public.bridal_enquiries for insert with check (true);
create policy enquiry_admin on public.bridal_enquiries for all using (public.is_admin()) with check (public.is_admin());

-- Admin management for catalog/content.
create policy service_admin_write on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy availability_admin on public.availability_dates for all using (public.is_admin()) with check (public.is_admin());
create policy slots_admin on public.availability_slots for all using (public.is_admin()) with check (public.is_admin());
create policy portfolio_admin on public.portfolio_items for all using (public.is_admin()) with check (public.is_admin());
create policy jewellery_admin on public.jewellery_items for all using (public.is_admin()) with check (public.is_admin());
create policy reviews_self_insert on public.reviews for insert with check (user_id=auth.uid());
create policy reviews_admin on public.reviews for all using (public.is_admin()) with check (public.is_admin());
create policy social_admin on public.social_links for all using (public.is_admin()) with check (public.is_admin());
create policy settings_admin on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy audit_admin on public.audit_logs for all using (public.is_admin()) with check (public.is_admin());

-- Trigger to auto-create a customer profile after auth signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,name,phone) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1)), new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- IMPORTANT: after creating your real owner/admin auth user, run:
-- update public.profiles set role='admin' where id='<ADMIN_AUTH_USER_UUID>';


revoke all on function public.create_booking_atomic(text,uuid,text,text,text,text,date,time,numeric,text,int) from public;
grant execute on function public.create_booking_atomic(text,uuid,text,text,text,text,date,time,numeric,text,int) to authenticated;

-- Admin recovery OTP records (used by an Edge Function).
create table if not exists public.admin_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.admin_recovery_codes enable row level security;
create policy admin_recovery_none on public.admin_recovery_codes for all using (false) with check (false);
