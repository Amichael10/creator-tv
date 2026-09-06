-- CreatorTV: Single Devices Table
create extension if not exists "pgcrypto";

create table if not exists public.devices (
    id uuid primary key default gen_random_uuid(),
    pair_code varchar(6) unique,
    device_secret_hash text not null,
    paired boolean not null default false,
    station_slug text,
    pair_code_expires_at timestamptz,
    paired_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_devices_pair_code on public.devices(pair_code);
create index if not exists idx_devices_paired on public.devices(paired);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create or replace trigger trigger_devices_updated_at
    before update on public.devices
    for each row
    execute function public.handle_updated_at();

alter table public.devices enable row level security;
