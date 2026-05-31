import { lodgifyRequest } from "./lodgifyClient";
import { getLodgifyPropertyId, getLodgifyRoomTypeId } from "./lodgifyConfig";
import { CreateLodgifyBookingDto } from "../../shared/integrations/lodgify/lodgifyTypes";
import { formatLodgifyDate } from "./lodgifyUtils";

export interface LodgifyBookingResponse {
  id?: number;
  booking_id?: number;
  [key: string]: unknown;
}

export const createLodgifyBooking = async (
  data: CreateLodgifyBookingDto,
): Promise<LodgifyBookingResponse> => {
  const url = "https://api.lodgify.com/v1/reservation/booking";

  const body = {
    source_text: "Direct Booking (API)",
    arrival: formatLodgifyDate(data.checkIn),
    departure: formatLodgifyDate(data.checkOut),
    property_id: getLodgifyPropertyId(),
    status: "Tentative",
    bookability: "InstantBooking",
    rooms: [
      {
        room_type_id: getLodgifyRoomTypeId(),
        quantity: 1,
        adults: data.guestsCount,
      },
    ],
    guest: {
      name: data.guestName,
      first_name: data.guestName.split(" ")[0] || data.guestName,
      last_name: data.guestName.split(" ").slice(1).join(" ") || data.guestName,
      email: data.guestEmail,
      phone: data.guestPhone || null,
    },
    total: data.totalPrice,
    currency_code: "EUR",
  };

  // lodgifyRequest restituisce già il JSON parsato
  const response = (await lodgifyRequest(url, {
    method: "POST",
    body,
  })) as LodgifyBookingResponse;
  return response;
};

export const setBookingAsBookedLodgify = async (
  lodgifyBookingId: number,
): Promise<Record<string, unknown>> => {
  const response = (await lodgifyRequest(
    `https://api.lodgify.com/v1/reservation/booking/${lodgifyBookingId}/book?requestPayment=false`,
    { method: "PUT" },
  )) as Record<string, unknown>;

  return response;
};
