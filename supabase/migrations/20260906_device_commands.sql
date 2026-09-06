-- CreatorTV Phase 2: Remote Command Queue & Enhanced Station State
alter table if exists public.devices
    add column if not exists pending_command jsonb default null,
    add column if not exists active_video_id text default null,
    add column if not exists last_command_at timestamptz default null;

create index if not exists idx_devices_station_slug on public.devices(station_slug);
