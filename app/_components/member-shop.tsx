"use client";
import { CopyValue, Notice } from './feedback';
import { useEffect, useState, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase';
import { localeHref, type Locale } from '@/lib/i18n';
import { money, orderStatus, type ShopOrder } from '@/lib/shop';
import type { Member } from './use-member';
export default function MemberShop({member,locale}:{member:Member;locale:Locale}){
  const en=locale==='en';const [phone,setPhone]=useState(member.phone);const [address,setAddress]=useState(member.address);
  const [message,setMessage]=useState('');const [saveFailed,setSaveFailed]=useState(false);const [busy,setBusy]=useState(false);const [orders,setOrders]=useState<ShopOrder[]>([]);
  const [loading,setLoading]=useState(true);const [error,setError]=useState(false);const [revision,setRevision]=useState(0);const [page,setPage]=useState(0);
  useEffect(()=>{let active=true;setLoading(true);setError(false);getSupabase()!.from('shop_orders').select('*').eq('user_id',member.id).order('created_at',{ascending:false}).range(page*20,page*20+19).then(({data,error})=>{if(active){setOrders(data||[]);setError(Boolean(error));setLoading(false);}});return ()=>{active=false;};},[member.id,revision,page]);
  async function save(e:FormEvent){
    e.preventDefault(); if(busy) return; setBusy(true); setMessage(''); setSaveFailed(false);
    try { const {error}=await getSupabase()!.from('member_contacts').upsert({user_id:member.id,phone:phone.trim(),address:address.trim()}); if(error) throw error; setMessage(en?'Contact details saved.':'Холбоо барих мэдээлэл хадгалагдлаа.'); }
    catch { setSaveFailed(true); setMessage(en?'Could not save details. Please try again.':'Мэдээлэл хадгалагдсангүй. Дахин оролдоно уу.'); }
    finally { setBusy(false); }
  }
  return <section className="member-shop"><div className="section-heading"><h2>{en?'Shopping & delivery':'Захиалга, хүргэлт'}</h2>{member.role!=='member'&&<a className="button" href={localeHref('/admin',locale)}>{en?'Administration':'Удирдлага'} ↗</a>}</div>
    <form className="shop-contact-form" onSubmit={save}><h3>{en?'Saved contact details':'Хадгалсан холбоо барих мэдээлэл'}</h3><label htmlFor="member-phone">{en?'Phone':'Утас'}</label><input id="member-phone" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={e=>setPhone(e.target.value)}/><label htmlFor="member-address">{en?'Address':'Хаяг'}</label><textarea id="member-address" autoComplete="street-address" maxLength={1000} value={address} onChange={e=>setAddress(e.target.value)}/><button className="button button-outline" disabled={busy}>{en?'Save details':'Хадгалах'}</button><div aria-live="polite">{message&&<Notice tone={saveFailed?'error':'success'}>{message}</Notice>}</div></form>
    <h3>{en?'My orders':'Миний захиалгууд'}</h3>{loading?<p role="status">{en?'Loading…':'Ачаалж байна…'}</p>:error?<div role="alert"><p>{en?'Orders could not be loaded.':'Захиалгууд ачаалсангүй.'}</p><button className="text-link" onClick={()=>setRevision(x=>x+1)}>{en?'Retry':'Дахин оролдох'}</button></div>:!orders.length?<p>{en?'No orders yet.':'Одоогоор захиалга алга.'}</p>:orders.map(order=><article className="order-card" key={order.id}><p className="eyebrow">{new Date(order.created_at).toLocaleDateString(en?'en-US':'mn-MN')}</p><CopyValue value={order.id} label={en ? 'Order reference' : 'Захиалгын дугаар'} locale={locale} /><h3>{orderStatus(order.status,en)}</h3>{order.items.map(item=><p key={item.slug}>{item.title} × {item.quantity}</p>)}<strong>{money(order.total,locale)}</strong></article>)}
    <div className="actions"><button className="text-link" disabled={!page||loading} onClick={()=>setPage(x=>x-1)}>{en?'Previous':'Өмнөх'}</button><button className="text-link" disabled={orders.length<20||loading} onClick={()=>setPage(x=>x+1)}>{en?'Next':'Дараах'}</button></div>
  </section>;
}
