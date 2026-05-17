// tests/unit/modules/bookingavailability.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockCheckLodgifyAvailability,
  mockGetLodgifyBookedDates,
  mockFindAllApartments,
  mockFindConfirmedBookingsInRange,
  mockFindOverlappingConfirmedBookings,
} = vi.hoisted(() => ({
  mockCheckLodgifyAvailability: vi.fn(),
  mockGetLodgifyBookedDates: vi.fn(),
  mockFindAllApartments: vi.fn(),
  mockFindConfirmedBookingsInRange: vi.fn(),
  mockFindOverlappingConfirmedBookings: vi.fn(),
}));

vi.mock("../../../src/modules/lodgify/lodgifyService", () => ({
  checkLodgifyAvailabilityService: mockCheckLodgifyAvailability,
  getLodgifyBookedDatesService: mockGetLodgifyBookedDates,
}));

vi.mock("../../../src/modules/apartment/apartmentRepository", () => ({
  findAllApartments: mockFindAllApartments,
  findApartmentById: vi.fn(),
  addApartmentBookedDate: vi.fn(),
  removeApartmentBookedDateByBookingId: vi.fn(),
}));

vi.mock("../../../src/modules/booking/bookingRepository", () => ({
  findConfirmedBookingsInRange: mockFindConfirmedBookingsInRange,
  findOverlappingConfirmedBookings: mockFindOverlappingConfirmedBookings,
}));

import { buildAvailabilityResponse } from "../../../src/modules/booking/bookingAvailability";

const mockApartment = {
  _id: { toString: () => "apt-001" },
  name: "Thalea Apartment",
  maxGuests: 4,
  pricePerNight: 130,
};

const checkIn = new Date("2026-06-01");
const checkOut = new Date("2026-06-04");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildAvailabilityResponse", () => {
  it("blocca quando Lodgify va in errore", async () => {
    mockCheckLodgifyAvailability.mockResolvedValue({
      available: null,
      error: "Timeout",
    });

    const result = await buildAvailabilityResponse(checkIn, checkOut, 2);

    expect(result.available).toBe(false);
    expect((result as any).availabilityCheck.lodgify).toBe("error");
    expect(mockFindOverlappingConfirmedBookings).not.toHaveBeenCalled();
  });

  it("blocca quando Lodgify dice non disponibile", async () => {
    mockCheckLodgifyAvailability.mockResolvedValue({
      available: false,
    });

    const result = await buildAvailabilityResponse(checkIn, checkOut, 2);

    expect(result.available).toBe(false);
    expect((result as any).source).toBe("lodgify");
    expect(mockFindOverlappingConfirmedBookings).not.toHaveBeenCalled();
  });

  it("restituisce available quando Lodgify e DB sono liberi", async () => {
    mockCheckLodgifyAvailability.mockResolvedValue({
      available: true,
    });

    mockFindAllApartments.mockResolvedValue([mockApartment]);

    mockFindOverlappingConfirmedBookings.mockResolvedValue([]);

    const result = await buildAvailabilityResponse(checkIn, checkOut, 2);

    expect((result as any).results[0].status).toBe("available");
  });

  it("restituisce unavailable quando il DB ha una prenotazione sovrapposta", async () => {
    mockCheckLodgifyAvailability.mockResolvedValue({
      available: true,
    });

    mockFindAllApartments.mockResolvedValue([mockApartment]);

    mockFindOverlappingConfirmedBookings.mockResolvedValue([
      {
        apartment: {
          toString: () => "apt-001",
        },
      },
    ]);

    const result = await buildAvailabilityResponse(checkIn, checkOut, 2);

    expect((result as any).results[0].status).toBe("unavailable");
  });

  it("filtra appartamenti per numero ospiti", async () => {
    mockCheckLodgifyAvailability.mockResolvedValue({
      available: true,
    });

    mockFindAllApartments.mockResolvedValue([
      {
        ...mockApartment,
        maxGuests: 2,
      },
    ]);

    mockFindOverlappingConfirmedBookings.mockResolvedValue([]);

    const result = await buildAvailabilityResponse(checkIn, checkOut, 3);

    expect((result as any).results).toHaveLength(0);
  });
});
