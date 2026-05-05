import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import {
  logStripeError,
  logStripeEvent,
} from "../../shared/integrations/stripe/stripeLogger";
import {
  findOrderByStripePaymentIntentId,
  updateOrderStatusIfPending,
  markOrderAsFailedIfPending,
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
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  logStripeEvent("webhook_received", {
    type: event.type,
    id: event.id,
  });

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;

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

  if (paymentIntent.status !== "succeeded") {
    return;
  }

  const order = await findOrderByStripePaymentIntentId(paymentIntent.id);

  if (!order) {
    logStripeError("webhook_order_not_found", {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  // FIX: idempotenza atomica
  const updated = await updateOrderStatusIfPending(order._id.toString());

  if (!updated) {
    logStripeEvent("webhook_order_already_processed", {
      orderId: order._id.toString(),
    });
    return;
  }

  const booking = await getBookingToConfirm(order.bookingId.toString());

  // FIX: null safety
  if (!booking) {
    logStripeError("webhook_booking_not_found", {
      bookingId: order.bookingId.toString(),
    });
    return;
  }

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

  const updated = await markOrderAsFailedIfPending(order._id.toString());

  if (!updated) return;

  logStripeEvent("webhook_order_marked_failed", {
    orderId: order._id.toString(),
    paymentIntentId: paymentIntent.id,
  });
};
