"use client";
import { CopyValue, Notice } from './feedback';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { localeHref, type Locale } from '@/lib/i18n';
import { getSupabase } from '@/lib/supabase';
import { getPaymentDetails } from '@/lib/payment-settings';
import { readCart, writeCart, money, type Bank, type CartItem } from '@/lib/shop';
import { useMember } from './use-member';

export default function Checkout({ locale, products }: { locale: Locale; products: Omit<CartItem, 'quantity'>[] }) {
  const en = locale === 'en'; const { member, ready, error: memberError } = useMember();
  const [items, setItems] = useState<CartItem[]>([]); const [loaded, setLoaded] = useState(false);
  const [bank, setBank] = useState<Bank | null>(null); const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [address, setAddress] = useState('');
  const dirty = useRef(false); const request = useRef<string | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [saveContact, setSaveContact] = useState(true);
  const [receipt, setReceipt] = useState<{ id: string; total: number } | null>(null);
  useEffect(() => { if (receipt) document.getElementById('order-success')?.focus(); }, [receipt]);
  useEffect(() => { setItems(readCart()); setLoaded(true); }, []);
  useEffect(() => {
    let active = true;
    getPaymentDetails().then(data => { if (active) setBank(data); }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (member && !dirty.current) { setName(`${member.firstName} ${member.lastName}`.trim()); setPhone(member.phone); setAddress(member.address); } }, [member]);
  const current = items.map(item => ({ item, product: products.find(p => p.slug === item.slug) }));
  const changed = current.some(({ item, product }) => !product || Number(product.price) !== item.price);
  const total = items.reduce((sum, x) => sum + x.quantity * x.price, 0);
  const bankReady = Boolean(bank?.bank_name && bank.account_number && bank.account_name);
  function update(next: CartItem[]) { try { writeCart(next); setItems(next); request.current = null; setError(''); } catch { setError(en ? 'Your browser could not save the cart.' : 'Хөтөч сагсыг хадгалж чадсангүй.'); } }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || !ready || changed || !bankReady) return; setError(''); setBusy(true);
    try {
      const db = getSupabase(); if (!db) throw new Error('unavailable');
      request.current ||= crypto.randomUUID();
      const { data, error } = await db.rpc('place_shop_order', { request_id: request.current, customer_name: name.trim(), customer_phone: phone.trim(), customer_address: address.trim(), cart: items.map(({ slug, quantity, price }) => ({ slug, quantity, price })) });
      if (error) throw error;
      if (!data?.id || !data.total) throw new Error('unavailable');
      setReceipt(data); try { writeCart([]); } catch {/* The persisted order remains successful if local storage is unavailable. */ }
      if (member && saveContact) { const { error: contactError } = await db.from('member_contacts').upsert({ user_id: member.id, phone: phone.trim(), address: address.trim() }); if (contactError) setError(en ? 'Order saved. Contact details could not be saved to your profile.' : 'Захиалга бүртгэгдсэн. Холбоо барих мэдээллийг профайлд хадгалж чадсангүй.'); }
    } catch (err: any) {
      const msg = err?.message || '';
      setError(msg.includes('price_changed') ? (en ? 'The price has changed. Reload this page and review your cart.' : 'Үнэ өөрчлөгдсөн байна. Хуудсаа шинэчилж сагсаа шалгана уу.') :
        msg.includes('product_unavailable') ? (en ? 'An item is unavailable. Please contact the club.' : 'Бараа захиалах боломжгүй байна. Клубтэй холбогдоно уу.') :
          msg.includes('rate_limited') ? (en ? 'Too many orders. Please try again later or contact us.' : 'Захиалгын хязгаарт хүрлээ. Дараа дахин оролдох эсвэл бидэнтэй холбогдоно уу.') :
            msg.includes('payment_not_configured') ? (en ? 'Bank transfer details are not configured yet.' : 'Дансны мэдээлэл хараахан тохируулагдаагүй байна.') :
              (en ? 'We could not confirm your order. Retry without changing the form to avoid duplicates.' : 'Захиалга баталгаажсангүй. Давхар захиалга үүсгэхгүйн тулд мэдээллээ өөрчлөхгүйгээр дахин оролдоно уу.'));
    } finally { setBusy(false); }
  }
  const bankDetails = bank && <dl className="facts"><div><dt>{en ? 'Bank' : 'Банк'}</dt><dd>{bank.bank_name}</dd></div><div><dt>{en ? 'Account / IBAN' : 'Данс / IBAN'}</dt><dd><CopyValue value={bank.account_number} label={en ? 'Account / IBAN' : 'Данс / IBAN'} locale={locale} /></dd></div><div><dt>{en ? 'Account holder' : 'Данс эзэмшигч'}</dt><dd>{bank.account_name}</dd></div></dl>;
  if (!loaded) return <section className="container shop-page" role="status"><h1>{en ? 'Your cart.' : 'Таны сагс.'}</h1><p>{en ? 'Loading cart…' : 'Сагс ачаалж байна…'}</p></section>;
  if (receipt) return <section className="container shop-page"><div className="shop-success"><p className="eyebrow">INNOLAB / {en ? 'ORDER RECEIVED' : 'ЗАХИАЛГА БҮРТГЭГДЛЭЭ'}</p><h1 id="order-success" tabIndex={-1}>{en ? 'Your order is awaiting payment.' : 'Захиалга бүртгэгдлээ. Төлбөрөө шилжүүлнэ үү.'}</h1><CopyValue value={receipt.id} label={en ? 'Payment reference / order number' : 'Гүйлгээний утга / Захиалгын дугаар'} locale={locale} /><h2>{money(receipt.total, locale)}</h2>{bankDetails}<p>{en ? 'Use the full order reference above in your transfer. An administrator will confirm payment after checking the bank statement. Delivery costs and timing will be agreed separately.' : 'Гүйлгээний утгад дээрх захиалгын дугаарыг бүтнээр бичнэ үү. Админ дансны хуулгатай тулгаж төлбөрийг баталгаажуулна. Хүргэлтийн зардал, хугацааг тусад нь тохиролцоно.'}</p><p>{en ? 'Keep this reference. Guest orders are followed up by phone.' : 'Захиалгын дугаараа хадгална уу. Зочны захиалгаар утсаар холбогдоно.'}</p>{error && <Notice>{error}</Notice>}<a className="button" href={localeHref(member ? '/members' : '/products', locale)}>{en ? 'Continue' : 'Үргэлжлүүлэх'} →</a></div></section>;
  return <section className="container shop-page"><header className="shop-page-heading"><p className="eyebrow">INNOLAB / {en ? 'SHOP' : 'ДЭЛГҮҮР'}</p><h1>{en ? 'Your cart.' : 'Таны сагс.'}</h1><p>{en ? 'Choose, review, then pay by bank transfer.' : 'Бараагаа сонгоод, мэдээллээ шалгаж, дансаар төлөөрэй.'}</p></header>
    {!items.length ? <div className="empty-state"><h2>{en ? 'Your cart is empty.' : 'Сагс хоосон байна.'}</h2><a className="button" href={localeHref('/products', locale)}>{en ? 'Explore products' : 'Бүтээгдэхүүн үзэх'} →</a></div> : <div className="checkout-grid"><div><h2>{en ? 'Order summary' : 'Захиалгын бараа'}</h2><div className="cart-items">{current.map(({ item, product }) => <article className="cart-row" key={item.slug}>{item.image && <img src={item.image + '?w=200&fm=webp'} width="96" height="96" alt="" />}<div><a href={localeHref('/products/' + item.slug, locale)}>{item.title}</a><p>{money(item.price, locale)}</p><label>{en ? 'Quantity' : 'Тоо ширхэг'}<input type="number" min="1" max="99" value={item.quantity} disabled={busy} onChange={e => { const quantity = Number(e.target.value); if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99) update(items.map(x => x.slug === item.slug ? { ...x, quantity } : x)); }} /></label>{!product && <p className="auth-field-error">{en ? 'No longer listed' : 'Жагсаалтаас хасагдсан'}</p>}</div><div className="cart-line-end"><strong>{money(item.price * item.quantity, locale)}</strong><button type="button" className="text-link" disabled={busy} onClick={() => update(items.filter(x => x.slug !== item.slug))}>{en ? 'Remove' : 'Хасах'}</button></div></article>)}</div>
      {changed && <div className="auth-error-summary" role="alert"><p>{en ? 'Products or prices changed. Update the cart before ordering.' : 'Бараа эсвэл үнэ өөрчлөгдсөн байна. Сагсаа шинэчилнэ үү.'}</p><button className="button button-outline" onClick={() => update(current.filter(x => x.product).map(({ item, product }) => ({ ...product!, quantity: item.quantity })))}>{en ? 'Update cart' : 'Сагс шинэчлэх'}</button></div>}
      <div className="cart-total"><span>{en ? 'Product subtotal' : 'Барааны нийт дүн'}</span><strong>{money(total, locale)}</strong></div><p className="shop-note">{en ? 'Delivery and availability will be confirmed separately. VAT is not included in listed prices.' : 'Хүргэлт, бэлэн эсэхийг тусад нь баталгаажуулна. Барааны үнэд НӨАТ ороогүй.'}</p></div>
      <form className="checkout-form" onSubmit={submit}><h2>{en ? 'Contact & delivery' : 'Холбоо барих, хүргэлт'}</h2><p>{member ? (en ? 'Your profile details are filled in. Review them before ordering.' : 'Таны мэдээллийг автоматаар бөглөлөө. Захиалахаасаа өмнө шалгана уу.') : (en ? 'You can order without an account.' : 'Бүртгэлгүйгээр захиалж болно.')} {!member && <a className="text-link" href={localeHref('/login', locale)}>{en ? 'Sign in' : 'Нэвтрэх'}</a>}</p>
        {memberError && <p role="alert">{en ? 'Profile could not be loaded. Reload before ordering.' : 'Профайл ачаалсангүй. Захиалахаас өмнө хуудсаа шинэчилнэ үү.'}</p>}
        <label htmlFor="order-name">{en ? 'Full name' : 'Овог, нэр'} *</label><input id="order-name" autoComplete="name" required minLength={2} maxLength={120} value={name} disabled={busy} onChange={e => { dirty.current = true; request.current = null; setName(e.target.value); }} />
        <label htmlFor="order-phone">{en ? 'Phone number' : 'Утасны дугаар'} *</label><input id="order-phone" type="tel" autoComplete="tel" required pattern="\+?[0-9 ()\-]{6,30}" maxLength={30} value={phone} disabled={busy} onChange={e => { dirty.current = true; request.current = null; setPhone(e.target.value); }} />
        <label htmlFor="order-address">{en ? 'Delivery address' : 'Хүргэлтийн хаяг'} *</label><textarea id="order-address" autoComplete="street-address" required minLength={5} maxLength={1000} value={address} disabled={busy} onChange={e => { dirty.current = true; request.current = null; setAddress(e.target.value); }} />
        {member && <label className="shop-checkbox"><input type="checkbox" checked={saveContact} onChange={e => setSaveContact(e.target.checked)} />{en ? 'Save phone and address to my profile' : 'Утас, хаягийг профайлд хадгалах'}</label>}
        <fieldset className="bank-option"><legend>{en ? 'Payment method' : 'Төлбөрийн арга'}</legend><p><strong>{en ? 'Bank transfer' : 'Дансаар төлөх'}</strong></p>{bankReady ? bankDetails : <p role="status">{loadError ? (en ? 'Bank transfer details are not configured yet. Please contact the club.' : 'Дансны мэдээлэл хараахан тохируулагдаагүй байна. Клубтэй холбогдоно уу.') : (en ? 'Bank transfer details are being configured. Ordering will open once ready.' : 'Дансны мэдээлэл тохируулагдаж байна. Тохируулсны дараа захиалга нээгдэнэ.')}</p>}{loadError && <a className="text-link" href={localeHref('/contact', locale)}>{en ? 'Contact the club' : 'Клубтэй холбогдох'}</a>}</fieldset>
        <p className="shop-note">{en ? 'Your name, phone and address are used by InnoLab staff to fulfill this order.' : 'Таны нэр, утас, хаягийг InnoLab-ийн ажилтан захиалгыг гүйцэтгэхэд ашиглана.'}</p>
        {error && <Notice tone="error">{error}</Notice>}<button className="button" disabled={busy || !ready || memberError || changed || !bankReady}>{busy ? (en ? 'Submitting…' : 'Бүртгэж байна…') : (en ? 'Place order · bank transfer' : 'Захиалах · дансаар төлөх')} →</button>
      </form></div>}
  </section>;
}
