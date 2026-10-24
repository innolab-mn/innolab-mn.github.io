begin;

create table private.member_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('member','admin','superadmin'))
);
alter table private.member_roles enable row level security;
create function public.member_role() returns text language sql stable security definer set search_path = '' as $$
  select coalesce((select role from private.member_roles where user_id = auth.uid()), 'member');
$$;
revoke all on function public.member_role() from public, anon;
grant execute on function public.member_role() to authenticated;

create table public.member_contacts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null default '' check (char_length(phone) <= 30),
  address text not null default '' check (char_length(address) <= 1000)
);
alter table public.member_contacts enable row level security;
revoke all on public.member_contacts from anon, authenticated;
grant select, insert, update on public.member_contacts to authenticated;
create policy "Own contact details" on public.member_contacts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.shop_catalog (
  slug text primary key, title text not null, price numeric(14,2) not null check(price > 0),
  image text, active boolean not null default true, updated_at timestamptz not null default now()
);
alter table public.shop_catalog enable row level security;
revoke all on public.shop_catalog from anon, authenticated;
grant select on public.shop_catalog to anon, authenticated;
grant all on public.shop_catalog to service_role;
create policy "Published catalog" on public.shop_catalog for select using (active);

create function public.sync_shop_catalog(products jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if jsonb_typeof(products) is distinct from 'array' or jsonb_array_length(products) not between 1 and 1000 then raise exception 'invalid_catalog'; end if;
  update public.shop_catalog set active=false;
  insert into public.shop_catalog(slug,title,price,image,active)
    select p.slug,p.title,p.price,p.image,true from jsonb_to_recordset(products) as p(slug text,title text,price numeric,image text)
    on conflict(slug) do update set title=excluded.title,price=excluded.price,image=excluded.image,active=true,updated_at=now();
end; $$;
revoke all on function public.sync_shop_catalog(jsonb) from public,anon,authenticated;
grant execute on function public.sync_shop_catalog(jsonb) to service_role;

create table public.shop_payment_settings (
  id boolean primary key default true check(id), bank_name text not null default '',
  account_number text not null default '', account_name text not null default ''
);
insert into public.shop_payment_settings(id) values(true);
alter table public.shop_payment_settings enable row level security;
revoke all on public.shop_payment_settings from anon, authenticated;
grant select on public.shop_payment_settings to anon, authenticated;
create policy "Public bank transfer details" on public.shop_payment_settings for select using(true);

create table public.shop_orders (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null, phone text not null, address text not null,
  items jsonb not null, total numeric(14,2) not null check(total > 0),
  status text not null default 'pending_payment' check(status in ('pending_payment','paid','processing','completed','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index shop_orders_user_date on public.shop_orders(user_id, created_at desc);
create index shop_orders_phone_date on public.shop_orders(phone, created_at desc);
create index shop_orders_date on public.shop_orders(created_at desc);
alter table public.shop_orders enable row level security;
revoke all on public.shop_orders from anon, authenticated;
grant select on public.shop_orders to authenticated;
create policy "Own orders or staff" on public.shop_orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.member_role()) in ('admin','superadmin'));

create table private.shop_audit (
  id bigint generated always as identity primary key, actor uuid, action text not null,
  target text not null, details jsonb not null, created_at timestamptz not null default now()
);
alter table private.shop_audit enable row level security;

create function public.place_shop_order(request_id uuid, customer_name text, customer_phone text, customer_address text, cart jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare line jsonb; product public.shop_catalog; quantity integer; lines jsonb := '[]'; amount numeric := 0;
  old_order public.shop_orders; clean_phone text := regexp_replace(btrim(customer_phone),'[ ()-]','','g'); bank public.shop_payment_settings;
begin
  if request_id is null or customer_name is null or clean_phone is null or customer_address is null
    or char_length(btrim(customer_name)) not between 2 and 120 or clean_phone !~ '^\+?[0-9]{6,15}$'
    or char_length(btrim(customer_address)) not between 5 and 1000
    or jsonb_typeof(cart) is distinct from 'array' then raise exception 'invalid_order'; end if;
  if jsonb_array_length(cart) not between 1 and 20 then raise exception 'invalid_cart'; end if;
  -- Serialize duplicates and checkout limits; no client can choose prices or payment state.
  perform pg_advisory_xact_lock(240024);
  select * into old_order from public.shop_orders where id = request_id;
  if found then
    if old_order.user_id is distinct from auth.uid() or old_order.customer_name <> btrim(customer_name)
      or old_order.phone <> clean_phone or old_order.address <> btrim(customer_address) then raise exception 'request_conflict'; end if;
    return jsonb_build_object('id',old_order.id,'total',old_order.total);
  end if;
  select * into bank from public.shop_payment_settings where id;
  if bank.bank_name = '' or bank.account_number = '' or bank.account_name = '' then raise exception 'payment_not_configured'; end if;
  if (select count(*) from public.shop_orders where phone = clean_phone and created_at > now()-interval '1 hour') >= 5
    or (select count(*) from public.shop_orders where created_at > now()-interval '1 hour') >= 100 then raise exception 'rate_limited'; end if;
  if (select count(distinct value->>'slug') from jsonb_array_elements(cart)) <> jsonb_array_length(cart) then raise exception 'invalid_cart'; end if;
  for line in select value from jsonb_array_elements(cart) loop
    if (line->>'quantity') !~ '^[0-9]{1,2}$' or line->>'quantity' is null then raise exception 'invalid_quantity'; end if;
    quantity := (line->>'quantity')::integer;
    if quantity not between 1 and 99 then raise exception 'invalid_quantity'; end if;
    select * into product from public.shop_catalog where slug = line->>'slug' and active;
    if not found then raise exception 'product_unavailable'; end if;
    if (line->>'price')::numeric is distinct from product.price then raise exception 'price_changed'; end if;
    amount := amount + product.price * quantity;
    lines := lines || jsonb_build_array(jsonb_build_object('slug',product.slug,'title',product.title,'price',product.price,'quantity',quantity,'image',product.image));
  end loop;
  insert into public.shop_orders(id,user_id,customer_name,phone,address,items,total)
    values(request_id,auth.uid(),btrim(customer_name),clean_phone,btrim(customer_address),lines,amount);
  return jsonb_build_object('id',request_id,'total',amount);
end; $$;
revoke all on function public.place_shop_order(uuid,text,text,text,jsonb) from public;
grant execute on function public.place_shop_order(uuid,text,text,text,jsonb) to anon, authenticated;

create function public.admin_members(search_text text default '', page_offset integer default 0)
returns table(id uuid, username text, first_name text, last_name text, email text, phone text, address text, role text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.member_role() not in ('admin','superadmin') then raise exception 'forbidden'; end if;
  if page_offset < 0 or char_length(search_text)>120 then raise exception 'invalid_page'; end if;
  return query select p.id,p.username,p.first_name,p.last_name,u.email::text,coalesce(c.phone,''),coalesce(c.address,''),coalesce(r.role,'member'),p.created_at
    from public.profiles p join auth.users u on u.id=p.id left join public.member_contacts c on c.user_id=p.id
    left join private.member_roles r on r.user_id=p.id
    where concat_ws(' ',p.username,p.first_name,p.last_name,u.email,c.phone) ilike '%'||search_text||'%'
    order by p.created_at desc,p.id limit 50 offset page_offset;
end; $$;

create function public.admin_set_role(target_id uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
declare previous_role text;
begin
  perform pg_advisory_xact_lock(240025);
  if public.member_role() <> 'superadmin' then raise exception 'forbidden'; end if;
  if new_role not in ('member','admin','superadmin') or new_role is null then raise exception 'invalid_role'; end if;
  if not exists(select 1 from public.profiles where id=target_id) then raise exception 'member_not_found'; end if;
  select role into previous_role from private.member_roles where user_id=target_id;
  if previous_role='superadmin' and new_role <> 'superadmin' and
    (select count(*) from private.member_roles where role='superadmin') <= 1 then raise exception 'last_superadmin'; end if;
  insert into private.member_roles values(target_id,new_role) on conflict(user_id) do update set role=excluded.role;
  insert into private.shop_audit(actor,action,target,details) values(auth.uid(),'set_role',target_id::text,jsonb_build_object('from',coalesce(previous_role,'member'),'to',new_role));
end; $$;

create function public.admin_order_status(order_id uuid, new_status text) returns void
language plpgsql security definer set search_path = '' as $$
declare previous_status text;
begin
  if public.member_role() not in ('admin','superadmin') then raise exception 'forbidden'; end if;
  select status into previous_status from public.shop_orders where id=order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if not ((previous_status='pending_payment' and new_status in ('paid','cancelled')) or
    (previous_status='paid' and new_status in ('processing','cancelled')) or
    (previous_status='processing' and new_status in ('completed','cancelled'))) then raise exception 'invalid_transition'; end if;
  update public.shop_orders set status=new_status,updated_at=now() where id=order_id;
  insert into private.shop_audit(actor,action,target,details) values(auth.uid(),'order_status',order_id::text,jsonb_build_object('from',previous_status,'to',new_status));
end; $$;

create function public.admin_save_bank(bank text, account text, holder text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.member_role() <> 'superadmin' then raise exception 'forbidden'; end if;
  if bank is null or account is null or holder is null or char_length(btrim(bank)) not between 2 and 120
    or char_length(btrim(account)) not between 6 and 80 or char_length(btrim(holder)) not between 2 and 120 then raise exception 'invalid_bank'; end if;
  update public.shop_payment_settings set bank_name=btrim(bank),account_number=btrim(account),account_name=btrim(holder) where id;
  insert into private.shop_audit(actor,action,target,details) values(auth.uid(),'bank_settings','bank','{}');
end; $$;

create function public.admin_audit(page_offset integer default 0)
returns table(actor uuid, action text, target text, details jsonb, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.member_role() not in ('admin','superadmin') then raise exception 'forbidden'; end if;
  if page_offset < 0 then raise exception 'invalid_page'; end if;
  return query select a.actor,a.action,a.target,a.details,a.created_at from private.shop_audit a order by a.id desc limit 50 offset page_offset;
end; $$;
revoke all on function public.admin_members(text,integer),public.admin_set_role(uuid,text),public.admin_order_status(uuid,text),public.admin_save_bank(text,text,text),public.admin_audit(integer) from public,anon;
grant execute on function public.admin_members(text,integer),public.admin_set_role(uuid,text),public.admin_order_status(uuid,text),public.admin_save_bank(text,text,text),public.admin_audit(integer) to authenticated;
commit;
