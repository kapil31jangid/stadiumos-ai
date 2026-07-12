-- StadiumOS Supabase PostgreSQL Database Schema
-- Run this in the Supabase SQL Editor to set up the database structure.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ROLES TABLE
create table public.roles (
  id text primary key,
  name text not null,
  permissions text[]
);

-- Seed roles
insert into public.roles (id, name, permissions) values
('fan', 'Fan', array['read:zones', 'read:transport', 'read:announcements']),
('volunteer', 'Volunteer', array['read:zones', 'read:incidents', 'write:incidents', 'read:tasks']),
('security', 'Security', array['read:zones', 'read:incidents', 'write:incidents', 'write:alerts']),
('organizer', 'Organizer', array['read:zones', 'write:zones', 'read:incidents', 'write:announcements']),
('venue_staff', 'Venue Staff', array['read:zones', 'write:maintenance', 'read:tasks']);

-- 2. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  role text references public.roles(id) default 'fan',
  language text default 'en',
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger for profiles updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Trigger for new auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Spectator'),
    'fan',
    'en'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. CROWD ZONES TABLE
create table public.crowd_zones (
  id text primary key,
  zone_name text not null,
  occupancy double precision not null default 0.0,
  capacity integer not null default 100,
  status text not null default 'Normal',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger on_crowd_zone_updated
  before update on public.crowd_zones
  for each row execute procedure public.handle_updated_at();

-- Seed crowd zones
insert into public.crowd_zones (id, zone_name, occupancy, capacity, status) values
('gate_a', 'East Gate A', 0.25, 5000, 'Normal'),
('gate_b', 'West Gate B', 0.18, 4000, 'Normal'),
('concourse_1', 'Level 1 Concourse', 0.45, 8000, 'Normal'),
('food_court', 'Central Plaza Food Court', 0.65, 2000, 'Normal'),
('vip_lounge', 'Executive VIP Lounge', 0.12, 500, 'Normal');

-- 4. INCIDENTS TABLE
create table public.incidents (
  id uuid default gen_random_uuid() primary key,
  zone_id text references public.crowd_zones(id) on delete set null,
  type text not null,
  location text not null,
  severity text not null,
  status text not null default 'Active',
  summary text,
  description text,
  ai_summary text,
  ai_priority text,
  ai_response text,
  reported_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial incidents
insert into public.incidents (type, location, severity, status, description) values
('HVAC Outage', 'Concourse B', 'Medium', 'Active', 'AC system shut down in corridor B.'),
('Gate Congestion', 'East Gate A', 'High', 'Active', 'High ticket scanning delays.');

-- 5. TASKS TABLE
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  assigned_to uuid references public.profiles(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete set null,
  priority text not null default 'Medium',
  status text not null default 'Pending',
  estimated_completion timestamp with time zone
);

-- 6. ANNOUNCEMENTS TABLE
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  language text default 'en',
  severity text not null default 'Low',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TRANSPORT TABLE
create table public.transport (
  id text primary key,
  parking_wait integer not null default 0,
  metro_wait integer not null default 0,
  bus_wait integer not null default 0,
  rideshare_wait integer not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger on_transport_updated
  before update on public.transport
  for each row execute procedure public.handle_updated_at();

-- Seed transport Wait times
insert into public.transport (id, parking_wait, metro_wait, bus_wait, rideshare_wait) values
('main_station', 10, 18, 2, 5);

-- 8. SUSTAINABILITY TABLE
create table public.sustainability (
  id text primary key,
  power_usage double precision not null default 0.0,
  water_usage double precision not null default 0.0,
  waste_level double precision not null default 0.0,
  recommendation text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger on_sustainability_updated
  before update on public.sustainability
  for each row execute procedure public.handle_updated_at();

-- Seed sustainability metrics
insert into public.sustainability (id, power_usage, water_usage, waste_level, recommendation) values
('main_metrics', 380.0, 42.0, 15.0, 'Optimize lighting schedules during non-peak window.');

-- 9. NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  target_role text references public.roles(id) on delete set null,
  message text not null,
  priority text not null default 'Medium',
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================= ROW LEVEL SECURITY (RLS) =================
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.crowd_zones enable row level security;
alter table public.incidents enable row level security;
alter table public.tasks enable row level security;
alter table public.announcements enable row level security;
alter table public.transport enable row level security;
alter table public.sustainability enable row level security;
alter table public.notifications enable row level security;

-- Roles Policies
create policy "Allow select for all roles" on public.roles for select using (true);

-- Profiles Policies
create policy "Allow select own profile" on public.profiles for select using (auth.uid() = id);
create policy "Allow update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow select all profiles for authenticated" on public.profiles for select using (auth.role() = 'authenticated');

-- Zones Policies
create policy "Allow select for all zones" on public.crowd_zones for select using (true);
create policy "Allow update for operational staff" on public.crowd_zones for update using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('organizer', 'venue_staff')
  )
);

-- Incidents Policies
create policy "Allow insert incidents for authenticated" on public.incidents for insert with check (auth.role() = 'authenticated');
create policy "Allow select incidents for staff" on public.incidents for select using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('volunteer', 'security', 'organizer', 'venue_staff')
  )
);
create policy "Allow update incidents for staff" on public.incidents for update using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('volunteer', 'security', 'organizer', 'venue_staff')
  )
);

-- Tasks Policies
create policy "Allow select tasks for staff" on public.tasks for select using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('volunteer', 'security', 'organizer', 'venue_staff')
  )
);
create policy "Allow update tasks for staff" on public.tasks for update using (
  auth.uid() = assigned_to or
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('organizer', 'venue_staff')
  )
);

-- Announcements Policies
create policy "Allow select announcements for everyone" on public.announcements for select using (true);
create policy "Allow insert announcements for organizer" on public.announcements for insert with check (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'organizer'
  )
);

-- Transport Policies
create policy "Allow select transport for everyone" on public.transport for select using (true);
create policy "Allow update transport for organizer" on public.transport for update using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'organizer'
  )
);

-- Sustainability Policies
create policy "Allow select sustainability for everyone" on public.sustainability for select using (true);
create policy "Allow update sustainability for venue staff" on public.sustainability for update using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'venue_staff'
  )
);

-- Notifications Policies
create policy "Allow select notifications for users" on public.notifications for select using (
  target_role is null or
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = target_role
  )
);
create policy "Allow insert notifications for staff" on public.notifications for insert with check (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('security', 'organizer')
  )
);
