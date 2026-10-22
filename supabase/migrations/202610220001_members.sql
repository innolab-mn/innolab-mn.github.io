begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 50),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 50),
  created_at timestamptz not null default now(),
  constraint valid_username check (
    char_length(username) between 3 and 24
    and username = lower(normalize(btrim(username), NFC))
    and username ~ '^[[:alnum:]][[:alnum:]_.-]*$'
  )
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
create policy "Members can read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
-- No client insert/update/delete grants: identity fields are written only by
-- the signup trigger. Future roles and permissions must never come from metadata.

create function public.create_member_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, first_name, last_name)
  values (new.id, lower(normalize(btrim(new.raw_user_meta_data->>'username'), NFC)),
    btrim(new.raw_user_meta_data->>'first_name'), btrim(new.raw_user_meta_data->>'last_name'));
  return new;
end;
$$;
revoke all on function public.create_member_profile() from public, anon, authenticated;
create trigger create_member_profile after insert on auth.users
  for each row execute function public.create_member_profile();

-- This lookup is executable ONLY by the Edge Function's service role.
-- Never expose username-to-email mappings to the browser or anonymous REST API.
create function public.member_login_email(login_username text)
returns text language sql stable security definer set search_path = '' as $$
  select u.email from auth.users u join public.profiles p on p.id = u.id
  where p.username = lower(normalize(btrim(login_username), NFC)) limit 1;
$$;
revoke all on function public.member_login_email(text) from public, anon, authenticated;
grant execute on function public.member_login_email(text) to service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.member_login_limits (
  bucket_key text not null,
  bucket_start timestamptz not null,
  attempts integer not null default 1,
  primary key (bucket_key, bucket_start)
);
alter table private.member_login_limits enable row level security;

create function public.consume_member_login_limit(bucket text, max_attempts integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  start_at timestamptz;
  attempt_count integer;
begin
  if char_length(bucket) > 100 or max_attempts < 1 or window_seconds < 1 then
    return false;
  end if;
  start_at := to_timestamp(floor(extract(epoch from now()) / window_seconds) * window_seconds);
  -- Bounded retention; no raw usernames, passwords, email addresses, or IPs.
  delete from private.member_login_limits where bucket_start < now() - interval '1 day';
  insert into private.member_login_limits as limits (bucket_key, bucket_start, attempts)
    values (bucket, start_at, 1)
    on conflict (bucket_key, bucket_start) do update set attempts = least(limits.attempts + 1, max_attempts + 1)
    returning attempts into attempt_count;
  return attempt_count <= max_attempts;
end;
$$;
revoke all on function public.consume_member_login_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_member_login_limit(text, integer, integer) to service_role;

commit;
