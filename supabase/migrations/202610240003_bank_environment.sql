-- Apply only after the website built with NEXT_PUBLIC_SHOP_BANK_* is live.
begin;
alter table public.shop_payment_settings add column if not exists enabled boolean not null default false;
-- Payment instructions are now static Next.js build configuration. Retain empty legacy
-- columns for backwards compatibility, without storing bank details here.
update public.shop_payment_settings set bank_name='',account_number='',account_name='',enabled=true where id;
create or replace function public.place_shop_order(request_id uuid, customer_name text, customer_phone text, customer_address text, cart jsonb)
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
  if bank.enabled is not true then raise exception 'payment_not_configured'; end if;
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
create or replace function public.admin_save_bank(bank text, account text, holder text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  raise exception 'bank_settings_managed_by_environment';
end; $$;
revoke all on function public.admin_save_bank(text,text,text) from public,anon,authenticated;
insert into private.shop_audit(actor,action,target,details) values(null,'bank_storage_moved','environment','{}');
commit;
