-- COLORA Staff accounts / secure content gate.
-- Apply to a NEW Supabase project. Disable public sign-ups in Auth settings.
-- Supabase Auth owns password hashes; no password is recorded in these tables.
begin;
create table if not exists public.colora_staff_allowlist (
  email text primary key check (email = lower(btrim(email))),
  access_role text not null check (access_role in ('staff','senior'))
);
revoke all on public.colora_staff_allowlist from anon, authenticated;
-- This repository is PUBLIC. Employee email addresses are intentionally NOT
-- hardcoded in SQL or Git history. Provision exactly five private mappings
-- using the admin-only environment variable COLORA_AUTH_ALLOWLIST_JSON
-- via scripts/invite-colora-staff.mjs before sending invitations.


create table if not exists public.colora_staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  access_role text not null check(access_role in ('staff','senior')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.colora_staff_members enable row level security;
revoke all on public.colora_staff_members from anon;
revoke all on public.colora_staff_members from authenticated;
grant select on public.colora_staff_members to authenticated;
drop policy if exists colora_read_own_active_membership on public.colora_staff_members;
create policy colora_read_own_active_membership on public.colora_staff_members
  for select to authenticated
  using (user_id=(select auth.uid()) and active=true);

create or replace function public.colora_provision_member()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare granted_role text;
begin
 select access_role into granted_role
 from public.colora_staff_allowlist
 where email=lower(btrim(new.email));
 if granted_role is not null then
   insert into public.colora_staff_members(user_id,email,access_role,active)
   values(new.id,lower(btrim(new.email)),granted_role,true)
   on conflict(user_id) do update set
     email=excluded.email,access_role=excluded.access_role;
 end if;
 return new;
end;
$$;
revoke all on function public.colora_provision_member() from public, anon, authenticated;
drop trigger if exists colora_auth_member_created on auth.users;
create trigger colora_auth_member_created
  after insert on auth.users for each row execute function public.colora_provision_member();

-- Backfill verified, existing invitees; does NOT authorize unlisted emails.
insert into public.colora_staff_members(user_id,email,access_role,active)
select u.id, lower(btrim(u.email)), a.access_role, true
from auth.users u join public.colora_staff_allowlist a
on a.email=lower(btrim(u.email))
where u.email_confirmed_at is not null
on conflict (user_id) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('colora-staff-private','colora-staff-private',false,10485760,array['text/html'])
on conflict(id) do update set public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- RLS evaluated by Postgres against authenticated JWT, never a UI flag.
drop policy if exists colora_member_read_staff on storage.objects;
create policy colora_member_read_staff on storage.objects
 for select to authenticated using (
 bucket_id='colora-staff-private' and name='staff.html'
 and exists (select 1 from public.colora_staff_members m
  where m.user_id=(select auth.uid()) and m.active=true)
);
drop policy if exists colora_senior_read_senior on storage.objects;
create policy colora_senior_read_senior on storage.objects
 for select to authenticated using (
 bucket_id='colora-staff-private' and name='senior.html'
 and exists (select 1 from public.colora_staff_members m
  where m.user_id=(select auth.uid()) and m.active=true and m.access_role='senior')
);
-- No client INSERT/UPDATE/DELETE policies on the bucket. Only the
-- server-side service-role upload process can publish private HTML.
commit;
