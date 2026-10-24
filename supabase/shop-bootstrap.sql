-- Run after the roles/shop migration and the generated catalog seed.
-- Match exactly one existing, confirmed account; never derive staff roles from signup metadata.
-- First set innolab.bootstrap_email in your private SQL session to the owner's email.
begin;
do $$
declare member_id uuid;
begin
  select id into strict member_id from auth.users
    where lower(email)=lower(current_setting('innolab.bootstrap_email',true)) and email_confirmed_at is not null;
  insert into private.member_roles(user_id,role) values(member_id,'superadmin')
    on conflict(user_id) do update set role='superadmin';
  insert into private.shop_audit(actor,action,target,details)
    values(member_id,'bootstrap_superadmin',member_id::text,'{}');
end; $$;
update public.shop_payment_settings set bank_name='Худалдаа Хөгжлийн Банк',account_number='444433221100',account_name='Цогтгэрэл' where id;
commit;
