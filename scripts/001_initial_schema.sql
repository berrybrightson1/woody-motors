-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Create Profiles table (References Auth.Users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin', 'mechanic')),
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 2. Create Vehicles table (Inventory)
create table if not exists public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  make text not null,
  model text not null,
  year integer not null,
  price decimal(12,2) not null,
  mileage integer,
  transmission text,
  fuel_type text,
  engine_size text,
  description text,
  images text[] default '{}',
  status text default 'available' check (status in ('available', 'reserved', 'sold')),
  features text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Vehicles
alter table public.vehicles enable row level security;

create policy "Vehicles are viewable by everyone." on public.vehicles
  for select using (true);

create policy "Only admins can modify vehicles." on public.vehicles
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Create Service Bookings table
create table if not exists public.service_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_details text not null, -- Manual entry if not a bought vehicle
  service_type text not null,
  booking_date date not null,
  booking_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Service Bookings
alter table public.service_bookings enable row level security;

create policy "Users can view their own bookings." on public.service_bookings
  for select using (auth.uid() = user_id);

create policy "Users can create their own bookings." on public.service_bookings
  for insert with check (auth.uid() = user_id);

create policy "Mechanics and admins can view all bookings." on public.service_bookings
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'mechanic')
    )
  );

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_vehicles_updated
  before update on public.vehicles
  for each row execute procedure public.handle_updated_at();

-- Trigger for new user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'customer');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
