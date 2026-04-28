-- Add email to profiles and populate it from auth.users on signup

alter table public.profiles
  add column if not exists email text;

-- Backfill for existing rows (best-effort; auth.users is readable in SQL editor/service context)
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

-- Update handle_new_user to store NEW.email into profiles.email
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

  insert into public.profiles (id, full_name, phone, role, specialite, email)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), ''),
    nullif(coalesce(new.raw_user_meta_data->>'phone', ''), ''),
    desired_role,
    nullif(coalesce(new.raw_user_meta_data->>'specialite', ''), ''),
    nullif(coalesce(new.email, ''), '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role,
    specialite = excluded.specialite,
    email = excluded.email,
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, desired_role::public.app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

