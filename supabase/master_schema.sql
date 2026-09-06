-- CreatorTV Master Supabase Schema
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run

create extension if not exists "pgcrypto";

-- 1. Create or update the devices table
create table if not exists public.devices (
    id uuid primary key default gen_random_uuid(),
    pair_code varchar(10) unique,
    device_secret_hash text not null,
    paired boolean not null default false,
    station_slug text,
    pair_code_expires_at timestamptz,
    paired_at timestamptz,
    pending_command jsonb default null,
    active_video_id text default null,
    last_command_at timestamptz default null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Add columns if table already existed without them
alter table public.devices
    add column if not exists pending_command jsonb default null,
    add column if not exists active_video_id text default null,
    add column if not exists last_command_at timestamptz default null;

-- 3. Create high-performance query indexes
create index if not exists idx_devices_pair_code on public.devices(pair_code);
create index if not exists idx_devices_paired on public.devices(paired);
create index if not exists idx_devices_station_slug on public.devices(station_slug);

-- 4. Enable automatic timestamp updating
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_devices_updated_at on public.devices;
create trigger trigger_devices_updated_at
    before update on public.devices
    for each row
    execute function public.handle_updated_at();

-- 5. Open RLS policy so both anon API keys and service_role keys can pair seamlessly
alter table public.devices enable row level security;
drop policy if exists "Allow public full access on devices" on public.devices;
create policy "Allow public full access on devices" on public.devices
    for all
    using (true)
    with check (true);
