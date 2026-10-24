export type CartItem = { slug: string; title: string; price: number; image?: string; quantity: number };
export type Bank = { bank_name: string; account_number: string; account_name: string };
export type ShopOrder = { id: string; customer_name: string; phone: string; address: string; items: CartItem[]; total: number; status: string; created_at: string };
export const money = (value: number, locale: string) => new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'mn-MN', { maximumFractionDigits: 2 }).format(value) + ' ₮';
export const cartKey = 'innolab-cart-v1';
export function readCart(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(cartKey) || '[]');
    return Array.isArray(raw) ? raw.filter(x => x && typeof x.slug === 'string' && typeof x.title === 'string' && Number.isFinite(x.price) && x.price > 0 && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 99).slice(0,20) : [];
  } catch { return []; }
}
export function writeCart(items: CartItem[]) {
  localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new Event('innolab-cart'));
}
export const orderStatus = (status: string, en: boolean) => ({
  pending_payment: en ? 'Awaiting bank transfer' : 'Төлбөр хүлээгдэж байна',
  paid: en ? 'Payment confirmed' : 'Төлбөр баталгаажсан',
  processing: en ? 'Preparing order' : 'Бэлтгэж байна',
  completed: en ? 'Completed' : 'Дууссан', cancelled: en ? 'Cancelled' : 'Цуцалсан',
}[status] || status);
