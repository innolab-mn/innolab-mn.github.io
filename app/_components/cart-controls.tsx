"use client";
import { useEffect, useState } from 'react';
import { localeHref, type Locale } from '@/lib/i18n';
import { readCart, writeCart } from '@/lib/shop';

export function CartLink({ locale }: {locale: Locale}) {
  const [count,setCount] = useState(0);
  useEffect(()=>{ const update=()=>setCount(readCart().reduce((sum,x)=>sum+x.quantity,0)); update(); window.addEventListener('innolab-cart',update); window.addEventListener('storage',update); return ()=>{window.removeEventListener('innolab-cart',update);window.removeEventListener('storage',update);}; },[]);
  return <a className="cart-link" href={localeHref('/cart',locale)} aria-label={locale==='en'?`Cart, ${count} items`:`Сагс, ${count} бараа`}><svg className="cart-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 3h2l3 13h11l2-9H6M9 21h.01M18 21h.01" strokeLinecap="round" strokeLinejoin="round"/></svg><span className="cart-label">{locale==='en'?'Cart':'Сагс'}</span><span className="cart-count" aria-hidden="true">{count}</span></a>;
}
export function AddToCart({ product, locale }: {product: {slug:string;title:string;price:number;image?:string};locale:Locale}) {
  const [message,setMessage]=useState(''); const en=locale==='en';
  if (!(Number(product.price)>0)) return null;
  function add(){
    try {const items=readCart(); const existing=items.find(x=>x.slug===product.slug);
      if(existing){existing.quantity=Math.min(99,existing.quantity+1);existing.price=Number(product.price);}
      else {if(items.length>=20) throw new Error(); items.push({...product,price:Number(product.price),quantity:1});}
      writeCart(items);setMessage(en?'Added to cart.':'Сагсанд нэмлээ.');
    } catch{setMessage(en?'Unable to save cart. Check browser storage or the 20-product limit.':'Сагс хадгалагдсангүй. Хөтчийн хадгалалт эсвэл 20 төрлийн барааны хязгаарыг шалгана уу.');}
  }
  return <div className="shop-add"><button className="button" type="button" onClick={add}>{en?'Add to cart':'Сагсанд нэмэх'} <span aria-hidden="true">＋</span></button><span className="shop-feedback" role="status">{message}</span></div>;
}
