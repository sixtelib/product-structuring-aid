-- Add updated_at column if missing (safe to re-run)
alter table public.profiles
add column if not exists updated_at timestamptz;

-- Initialize to now() where null
update public.profiles
set updated_at = now()
where updated_at is null;

