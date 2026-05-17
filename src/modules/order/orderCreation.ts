// orderCreation.ts

import { findRawBookingById } from "../booking/bookingRepository";

import { CreatePaymentOrderDto } from "./orderDto";

import { createAppError } from "./orderErrors";

import { mapOrderResponse } from "./orderMapper";

import { createStripePaymentIntentForOrder } from "./orderPayment";

import {
  createOrder,
  findOrderByStripePaymentIntentId,
} from "./orderRepository";

import { createPaymentOrderSchema } from "./orderSchemas";

import { IOrderResponse } from "./orderTypes";

export const createPaymentOrder = async (
  data: CreatePaymentOrderDto,
): Promise<{
  message: string;
  paymentIntentId: string;
  clientSecret: string | null;
  orderId: string;
  stripeStatus: string;
  order: IOrderResponse;
}> => {
  const validatedData = createPaymentOrderSchema.parse(data);

  const { bookingId, paymentMethod } = validatedData;

  const booking = await findRawBookingById(bookingId);

  if (!booking) {
    throw createAppError("Prenotazione non trovata", 404);
  }

  if (booking.status === "cancelled") {
    throw createAppError("La prenotazione è stata cancellata", 400);
  }

  if (booking.status === "confirmed") {
    throw createAppError("La prenotazione è già confermata", 400);
  }

  if (!booking.totalPrice || booking.totalPrice <= 0) {
    throw createAppError("Il prezzo totale non è valido", 400);
  }

  const amount = Math.round(Number(booking.totalPrice) * 100);

  const receiptEmail = booking.guestEmail;

  const idempotencyKey = `booking-${bookingId}-${amount}-${paymentMethod}`;

  const paymentIntent = await createStripePaymentIntentForOrder(
    amount,
    paymentMethod,
    receiptEmail,
    idempotencyKey,
  );

  const existingOrder = await findOrderByStripePaymentIntentId(
    paymentIntent.id,
  );

  if (existingOrder) {
    return {
      message: "Ordine già esistente",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.clientSecret,
      orderId: existingOrder._id.toString(),
      stripeStatus: paymentIntent.status,
      order: mapOrderResponse(existingOrder),
    };
  }

  const savedOrder = await createOrder({
    bookingId,
    amount: booking.totalPrice,
    currency: "EUR",
    paymentMethod,
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
  });

  return {
    message: "Pagamento in corso...",
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.clientSecret,
    orderId: savedOrder._id.toString(),
    stripeStatus: paymentIntent.status,
    order: mapOrderResponse(savedOrder),
  };
};
