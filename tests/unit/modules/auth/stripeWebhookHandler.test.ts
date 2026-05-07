import { describe, it, expect, vi, beforeEach } from "vitest";

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

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      webhooks: { constructEvent: mockConstructEvent },
      balance: { retrieve: vi.fn().mockResolvedValue({}) },
    };
  }),
}));

vi.mock("../../../src/config/env", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_API_VERSION: "2023-10-16",
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

import { handleStripeWebhook } from "../../../../src/modules/stripe/stripeWebhookHandler";

const mockRawBody = Buffer.from("{}");
const mockSignature = "stripe-sig-test";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleStripeWebhook — payment_intent.succeeded", () => {
  it("processa correttamente un pagamento riuscito", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      id: "evt_001",
      data: { object: { id: "pi_001", status: "succeeded" } },
    });
    mockFindOrder.mockResolvedValue({
      _id: { toString: () => "order-001" },
      bookingId: { toString: () => "booking-001" },
      status: "pending",
    });
    mockUpdateOrderStatusIfPending.mockResolvedValue(true);
    mockGetBookingToConfirm.mockResolvedValue({
      _id: { toString: () => "booking-001" },
      status: "pending",
    });
    mockConfirmBookingRecord.mockResolvedValue({
      _id: { toString: () => "booking-001" },
      status: "confirmed",
    });
    mockFinalizeConfirmedBooking.mockResolvedValue({});

    await handleStripeWebhook(mockRawBody, mockSignature);

    expect(mockUpdateOrderStatusIfPending).toHaveBeenCalledWith("order-001");
    expect(mockConfirmBookingRecord).toHaveBeenCalled();
    expect(mockFinalizeConfirmedBooking).toHaveBeenCalled();
  });

  it("non processa se l'ordine è già stato pagato (idempotenza)", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      id: "evt_002",
      data: { object: { id: "pi_002", status: "succeeded" } },
    });
    mockFindOrder.mockResolvedValue({
      _id: { toString: () => "order-002" },
      bookingId: { toString: () => "booking-002" },
      status: "paid",
    });
    mockUpdateOrderStatusIfPending.mockResolvedValue(false);

    await handleStripeWebhook(mockRawBody, mockSignature);

    expect(mockConfirmBookingRecord).not.toHaveBeenCalled();
  });

  it("gestisce ordine non trovato senza errori", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      id: "evt_003",
      data: { object: { id: "pi_999", status: "succeeded" } },
    });
    mockFindOrder.mockResolvedValue(null);

    await expect(
      handleStripeWebhook(mockRawBody, mockSignature),
    ).resolves.not.toThrow();
    expect(mockUpdateOrderStatusIfPending).not.toHaveBeenCalled();
  });
});

describe("handleStripeWebhook — payment_intent.payment_failed", () => {
  it("marca l'ordine come failed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.payment_failed",
      id: "evt_004",
      data: { object: { id: "pi_fail_001" } },
    });
    mockFindOrder.mockResolvedValue({
      _id: { toString: () => "order-003" },
      status: "pending",
    });
    mockMarkOrderAsFailedIfPending.mockResolvedValue(true);

    await handleStripeWebhook(mockRawBody, mockSignature);

    expect(mockMarkOrderAsFailedIfPending).toHaveBeenCalledWith("order-003");
  });
});

describe("handleStripeWebhook — firma non valida", () => {
  it("lancia errore se la firma non è valida", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Unable to extract timestamp and signatures from header");
    });

    await expect(
      handleStripeWebhook(mockRawBody, "firma-invalida"),
    ).rejects.toThrow("Unable to extract timestamp");
  });
});
