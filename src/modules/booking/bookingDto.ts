export interface CheckAvailabilityDto {
  checkIn: string;
  checkOut: string;
  guestsCount: number;
}

export interface CompleteBookingDto {
  apartment: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  notes?: string;
}

export interface ConfirmBookingDto {
  paymentIntentId: string;
  orderId: string;
}
