begin;
-- Set innolab.bank_account in the private SQL session before running this file.
do $$ begin
  if coalesce(btrim(current_setting('innolab.bank_account',true)),'')='' then
    raise exception 'bank_account_not_configured';
  end if;
end; $$;
update public.shop_payment_settings
set account_number=btrim(current_setting('innolab.bank_account',true))
where id;
insert into private.shop_audit(actor,action,target,details)
values(null,'bank_settings','bank','{"field":"account_number","source":"owner_requested_migration"}');
commit;
