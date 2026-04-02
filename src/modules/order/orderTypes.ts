import { Document, Types } from "mongoose";

export const allowedCurrencies = [
  "EUR",
  "USD",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
] as const;

export const allowedPaymentMethods = [
  "card",
  "paypal",
  "bank_transfer",
] as const;

export const allowedOrderStatuses = ["pending", "paid", "failed"] as const;

export type OrderCurrency = (typeof allowedCurrencies)[number];
export type OrderPaymentMethod = (typeof allowedPaymentMethods)[number];
export type OrderStatus = (typeof allowedOrderStatuses)[number];

export interface IOrder {
  bookingId: Types.ObjectId;
  amount: Types.Decimal128;
  currency: OrderCurrency;
  paymentMethod: OrderPaymentMethod;
  status: OrderStatus;
  transactionId?: string;
  stripePaymentIntentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}

export interface IOrderResponse {
  id: string;
  bookingId: Types.ObjectId | string;
  amount: string;
  currency: OrderCurrency;
  paymentMethod: OrderPaymentMethod;
  status: OrderStatus;
  transactionId?: string;
  stripePaymentIntentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
