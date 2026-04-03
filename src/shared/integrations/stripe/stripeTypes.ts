export interface CreateStripePaymentIntentParams {
  amount: number;
  currency?: string;
  paymentMethodTypes: string[];
  receiptEmail?: string;
  idempotencyKey?: string;
}

export interface StripePaymentIntentResult {
  id: string;
  clientSecret: string | null;
  status: string;
}

export interface NormalizedStripeError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
  cause?: unknown;
}
