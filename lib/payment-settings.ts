import type { Bank } from './shop';

// Public checkout instructions, embedded by Next.js at build time.
// Never use this pattern for passwords or private API credentials.
const paymentDetails: Bank = {
  bank_name: process.env.NEXT_PUBLIC_SHOP_BANK_NAME?.trim() || '',
  account_number: process.env.NEXT_PUBLIC_SHOP_BANK_ACCOUNT?.trim() || '',
  account_name: process.env.NEXT_PUBLIC_SHOP_BANK_HOLDER?.trim() || '',
};

export async function getPaymentDetails(): Promise<Bank> {
  if (!paymentDetails.bank_name || !paymentDetails.account_number || !paymentDetails.account_name) {
    throw new Error('payment_not_configured');
  }
  return { ...paymentDetails };
}
