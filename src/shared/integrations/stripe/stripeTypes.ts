export interface CreateStripePaymentIntentParams {
  amount: number;
  currency?: string;
  paymentMethodTypes: string[];
  receiptEmail?: string;
}

export interface StripePaymentIntentResult {
  id: string;
  clientSecret: string | null;
  status: string;
}
