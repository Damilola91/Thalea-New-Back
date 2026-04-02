import { stripe } from "../../config/stripe";
import { findRawBookingById } from "../booking/bookingRepository";
import { CreatePaymentOrderDto } from "./orderDto";
import { createOrder, findOrderById } from "./orderRepository";
import { IOrderDocument, IOrderResponse } from "./orderTypes";

const allowedCheckoutPaymentMethods = ["card"] as const;

const mapOrderResponse = (order: IOrderDocument): IOrderResponse => {
  return {
    id: order._id.toString(),
    bookingId: order.bookingId,
    amount: order.amount.toString(),
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    status: order.status,
    transactionId: order.transactionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const createPaymentOrderService = async (
  data: CreatePaymentOrderDto,
) => {
  const { bookingId, paymentMethod } = data;

  if (!bookingId || !paymentMethod) {
    const error = new Error(
      "bookingId e paymentMethod sono obbligatori",
    ) as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  if (!allowedCheckoutPaymentMethods.includes(paymentMethod as "card")) {
    const error = new Error("Metodo di pagamento non valido") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const booking = await findRawBookingById(bookingId);

  if (!booking) {
    const error = new Error("Prenotazione non trovata") as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }

  if (!booking.totalPrice || booking.totalPrice <= 0) {
    const error = new Error("Il prezzo totale non è valido") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const amount = Math.round(Number(booking.totalPrice) * 100);
  const receiptEmail = booking.guestEmail;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    payment_method_types: [paymentMethod],
    receipt_email: receiptEmail,
  });

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
    clientSecret: paymentIntent.client_secret,
    orderId: savedOrder._id.toString(),
    stripeStatus: paymentIntent.status,
    order: mapOrderResponse(savedOrder),
  };
};

export const getOrderByIdService = async (
  orderId: string,
): Promise<IOrderResponse | null> => {
  const order = await findOrderById(orderId);

  if (!order) {
    return null;
  }

  return mapOrderResponse(order);
};
