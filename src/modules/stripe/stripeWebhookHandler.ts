import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import {
  logStripeError,
  logStripeEvent,
} from "../../shared/integrations/stripe/stripeLogger";
import {
  findOrderByStripePaymentIntentId,
  updateOrderStatusById,
} from "../order/orderRepository";
import {
  confirmBookingRecord,
  finalizeConfirmedBooking,
  getBookingToConfirm,
} from "../booking/bookingConfirmation";

export const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string,
): Promise<void> => {
  // Verifica la firma — se non corrisponde lancia un errore e la route risponde 400
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  logStripeEvent("webhook_received", { type: event.type, id: event.id });

  switch (event.type) {
    case "payment_intent.succeeded": {
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    }

    case "payment_intent.payment_failed": {
      await handlePaymentIntentFailed(event.data.object);
      break;
    }

    default:
      logStripeEvent("webhook_unhandled_event", { type: event.type });
  }
};

const handlePaymentIntentSucceeded = async (paymentIntent: {
  id: string;
  status: string;
}): Promise<void> => {
  logStripeEvent("webhook_payment_intent_succeeded", {
    paymentIntentId: paymentIntent.id,
  });

  const order = await findOrderByStripePaymentIntentId(paymentIntent.id);

  if (!order) {
    logStripeError("webhook_order_not_found", {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  // Idempotenza — se già pagato non facciamo nulla
  if (order.status === "paid") {
    logStripeEvent("webhook_order_already_paid", {
      orderId: order._id.toString(),
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  await updateOrderStatusById(order._id.toString(), "paid");

  const booking = await getBookingToConfirm(order.bookingId.toString());

  if (booking.status === "confirmed") {
    logStripeEvent("webhook_booking_already_confirmed", {
      bookingId: booking._id.toString(),
    });
    return;
  }

  const confirmedBooking = await confirmBookingRecord(booking);
  await finalizeConfirmedBooking(confirmedBooking);

  logStripeEvent("webhook_booking_confirmed", {
    bookingId: confirmedBooking._id.toString(),
    orderId: order._id.toString(),
  });
};

const handlePaymentIntentFailed = async (paymentIntent: {
  id: string;
}): Promise<void> => {
  logStripeError("webhook_payment_intent_failed", {
    paymentIntentId: paymentIntent.id,
  });

  const order = await findOrderByStripePaymentIntentId(paymentIntent.id);

  if (!order) {
    logStripeError("webhook_order_not_found_on_failure", {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  if (order.status !== "pending") {
    return;
  }

  await updateOrderStatusById(order._id.toString(), "failed");

  logStripeEvent("webhook_order_marked_failed", {
    orderId: order._id.toString(),
    paymentIntentId: paymentIntent.id,
  });
};
