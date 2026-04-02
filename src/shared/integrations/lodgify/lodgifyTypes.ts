export interface CreateLodgifyBookingDto {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestsCount: number;
  totalPrice: number;
}

export interface LodgifyPeriod {
  start: string;
  end: string;
  booking_status?: string;
  closed_period?: boolean;
  available?: number;
}

export interface LodgifyAvailabilityItem {
  periods?: LodgifyPeriod[];
}

export interface LodgifyOccupiedDatesResponse {
  occupiedDates: string[];
  error: string | null;
  status?: number;
}

export interface LodgifyAvailabilityResponse {
  available: boolean | null;
  error?: string;
  status?: number;
  data?: LodgifyAvailabilityItem[];
}

export interface LodgifyBookingResponse {
  id?: number;
  booking_id?: number;
  [key: string]: unknown;
}
