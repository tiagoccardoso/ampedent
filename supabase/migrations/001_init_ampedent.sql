create type public.booking_status as enum ('pending', 'completed', 'canceled');
create type public.admin_role as enum ('admin', 'superadmin');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  first_name text not null check (char_length(first_name) <= 20),
  last_name text not null check (char_length(last_name) <= 20),
  email text not null,
  phone text not null check (char_length(phone) <= 20),
  message text check (char_length(message) <= 255),
  status public.booking_status not null default 'pending',
  date date not null,
  time text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  name text not null unique,
  password text not null,
  role public.admin_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_date_idx on public.bookings (date);
create index bookings_status_idx on public.bookings (status);
create index bookings_scheduled_idx on public.bookings (status, date, time);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();
