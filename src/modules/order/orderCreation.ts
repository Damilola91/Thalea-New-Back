import { findRawBookingById } from "../booking/bookingRepository";
import { CreatePaymentOrderDto } from "./orderDto";
import { createAppError } from "./orderErrors";
import { mapOrderResponse } from "./orderMapper";
import { createStripePaymentIntentForOrder } from "./orderPayment";
import { createOrder } from "./orderRepository";
import { IOrderResponse } from "./orderTypes";
import { validateCreatePaymentOrderInput } from "./orderValidation";

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
  validateCreatePaymentOrderInput(data);

  const { bookingId, paymentMethod } = data;

  const booking = await findRawBookingById(bookingId);

  if (!booking) {
    throw createAppError("Prenotazione non trovata", 404);
  }

  if (!booking.totalPrice || booking.totalPrice <= 0) {
    throw createAppError("Il prezzo totale non è valido", 400);
  }

  const amount = Math.round(Number(booking.totalPrice) * 100);
  const receiptEmail = booking.guestEmail;

  const paymentIntent = await createStripePaymentIntentForOrder(
    amount,
    paymentMethod,
    receiptEmail,
  );

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
