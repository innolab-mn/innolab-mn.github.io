import { getAllProducts } from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import Checkout from '@/app/_components/checkout';
export const metadata={title:'Сагс — InnoLab',robots:{index:false,follow:true}};
export default async function CartPage({locale='mn'}:{locale?:Locale}={}) {
  const products=(await getAllProducts(false)).filter((p:any)=>Number(p.price)>0).map((p:any)=>({slug:p.slug,title:p.title,price:Number(p.price),image:p.imageCollection?.items?.[0]?.url}));
  return <Checkout locale={locale} products={products}/>;
}
