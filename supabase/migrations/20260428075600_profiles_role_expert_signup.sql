-- Add role to profiles and support expert signup metadata
-- Values: assure | expert | admin

alter table public.profiles
  add column if not exists role text not null default 'assure',
  add column if not exists specialite text;

alter table public.profiles
  drop constraint if exists profiles_role_chk;

alter table public.profiles
  add constraint profiles_role_chk
  check (role in ('assure', 'expert', 'admin'));

-- Update handle_new_user to populate profiles + user_roles
-- Expected metadata keys:
-- - role: 'assure' | 'expert' | 'admin'
-- - full_name / name
-- - phone
-- - specialite
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_role text;
begin
  desired_role := coalesce(new.raw_user_meta_data->>'role', 'assure');
  if desired_role not in ('assure', 'expert', 'admin') then
    desired_role := 'assure';
  end if;

  insert into public.profiles (id, full_name, phone, role, specialite)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), ''),
    nullif(coalesce(new.raw_user_meta_data->>'phone', ''), ''),
    desired_role,
    nullif(coalesce(new.raw_user_meta_data->>'specialite', ''), '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role,
    specialite = excluded.specialite,
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, desired_role::public.app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

-- Ensure trigger exists (replace to pick up new function body)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

