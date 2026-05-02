-- Unify contact email on profiles.email ; remove legacy email_contact

update public.profiles
set email = nullif(btrim(email_contact), '')
where (email is null or btrim(coalesce(email, '')) = '')
  and email_contact is not null
  and btrim(email_contact) <> '';

alter table public.profiles
  drop column if exists email_contact;
