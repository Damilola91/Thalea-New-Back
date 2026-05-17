import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import bodyParser from "body-parser";
import http from "http";

const {
  mockConstructEvent,
  mockFindOrder,
  mockUpdateOrderStatusIfPending,
  mockMarkOrderAsFailedIfPending,
  mockGetBookingToConfirm,
  mockConfirmBookingRecord,
  mockFinalizeConfirmedBooking,
} = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
  mockFindOrder: vi.fn(),
  mockUpdateOrderStatusIfPending: vi.fn(),
  mockMarkOrderAsFailedIfPending: vi.fn(),
  mockGetBookingToConfirm: vi.fn(),
  mockConfirmBookingRecord: vi.fn(),
  mockFinalizeConfirmedBooking: vi.fn(),
}));

vi.mock("../../../src/config/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
}));

vi.mock("../../../src/config/env", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test",
  },
}));

vi.mock("../../../src/shared/integrations/stripe/stripeLogger", () => ({
  logStripeEvent: vi.fn(),
  logStripeError: vi.fn(),
}));

vi.mock("../../../src/modules/order/orderRepository", () => ({
  findOrderByStripePaymentIntentId: mockFindOrder,
  updateOrderStatusIfPending: mockUpdateOrderStatusIfPending,
  markOrderAsFailedIfPending: mockMarkOrderAsFailedIfPending,
}));

vi.mock("../../../src/modules/booking/bookingConfirmation", () => ({
  getBookingToConfirm: mockGetBookingToConfirm,
  confirmBookingRecord: mockConfirmBookingRecord,
  finalizeConfirmedBooking: mockFinalizeConfirmedBooking,
}));

import { handleStripeWebhook } from "../../../src/modules/stripe/stripeWebhookHandler";

const app = express();
app.use(bodyParser.raw({ type: "*/*" }));

app.post("/webhook", async (req, res) => {
  try {
    await handleStripeWebhook(
      req.body,
      req.headers["stripe-signature"] as string,
    );
    res.status(200).send("ok");
  } catch {
    res.status(400).send("error");
  }
});

const startServer = async () => {
  return new Promise<http.Server>((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
};

const request = async (server: http.Server, path: string) => {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Server error");
  }

  const port = address.port;

  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: "POST",
    headers: {
      "stripe-signature": "valid_signature",
    },
    body: new TextEncoder().encode("{}"),
  });

  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Stripe webhook E2E flow", () => {
  it("completa flusso prenotazione", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      id: "evt_1",
      data: {
        object: {
          id: "pi_1",
          status: "succeeded",
        },
      },
    });

    mockFindOrder.mockResolvedValue({
      _id: { toString: () => "order_1" },
      bookingId: { toString: () => "booking_1" },
    });

    mockUpdateOrderStatusIfPending.mockResolvedValue(true);

    mockGetBookingToConfirm.mockResolvedValue({
      _id: { toString: () => "booking_1" },
      status: "pending",
    });

    mockConfirmBookingRecord.mockResolvedValue({
      _id: { toString: () => "booking_1" },
      status: "confirmed",
    });

    mockFinalizeConfirmedBooking.mockResolvedValue({
      id: "booking_1",
      status: "confirmed",
    });

    const server = await startServer();

    const res = await request(server, "/webhook");

    expect(res.status).toBe(200);

    expect(mockUpdateOrderStatusIfPending).toHaveBeenCalledWith("order_1");
    expect(mockConfirmBookingRecord).toHaveBeenCalled();
    expect(mockFinalizeConfirmedBooking).toHaveBeenCalled();

    server.close();
  });

  it("blocca se ordine già processato", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      id: "evt_2",
      data: {
        object: {
          id: "pi_2",
          status: "succeeded",
        },
      },
    });

    mockFindOrder.mockResolvedValue({
      _id: { toString: () => "order_2" },
      bookingId: { toString: () => "booking_2" },
    });

    mockUpdateOrderStatusIfPending.mockResolvedValue(false);

    const server = await startServer();

    const res = await request(server, "/webhook");

    expect(mockConfirmBookingRecord).not.toHaveBeenCalled();
    expect(mockFinalizeConfirmedBooking).not.toHaveBeenCalled();
    expect(res.status).toBe(200);

    server.close();
  });

  it("gestisce ordine non trovato", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      id: "evt_3",
      data: {
        object: {
          id: "pi_3",
          status: "succeeded",
        },
      },
    });

    mockFindOrder.mockResolvedValue(null);

    const server = await startServer();

    const res = await request(server, "/webhook");

    expect(res.status).toBe(200);
    expect(mockUpdateOrderStatusIfPending).not.toHaveBeenCalled();

    server.close();
  });
});

describe("Stripe failure flow", () => {
  it("marca ordine come failed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.payment_failed",
      id: "evt_4",
      data: {
        object: {
          id: "pi_4",
        },
      },
    });

    mockFindOrder.mockResolvedValue({
      _id: { toString: () => "order_4" },
    });

    mockMarkOrderAsFailedIfPending.mockResolvedValue(true);

    const server = await startServer();

    const res = await request(server, "/webhook");

    expect(mockMarkOrderAsFailedIfPending).toHaveBeenCalledWith("order_4");
    expect(res.status).toBe(200);

    server.close();
  });
});
