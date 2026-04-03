import { z } from "zod";

export const checkAvailabilitySchema = z.object({
  checkIn: z.iso.date("checkIn non valida"),
  checkOut: z.iso.date("checkOut non valida"),
  guestsCount: z
    .number()
    .int("guestsCount deve essere un intero")
    .min(1, "guestsCount deve essere almeno 1")
    .max(2, "guestsCount non può superare 2"),
});

export const completeBookingSchema = z.object({
  apartment: z.string().trim().min(1, "Campi obbligatori mancanti"),
  guestName: z.string().trim().min(1, "Campi obbligatori mancanti"),
  guestEmail: z.email("Email non valida"),
  guestPhone: z.string().trim().optional(),
  checkIn: z.iso.date("checkIn non valida"),
  checkOut: z.iso.date("checkOut non valida"),
  guestsCount: z
    .number()
    .int("guestsCount deve essere un intero")
    .min(1, "guestsCount deve essere almeno 1")
    .max(2, "guestsCount non può superare 2"),
  notes: z.string().trim().optional(),
});

export const confirmBookingSchema = z.object({
  paymentIntentId: z.string().trim().min(1, "Dati mancanti nella richiesta"),
  orderId: z.string().trim().min(1, "Dati mancanti nella richiesta"),
});

export type CheckAvailabilitySchemaData = z.infer<
  typeof checkAvailabilitySchema
>;
export type CompleteBookingSchemaData = z.infer<typeof completeBookingSchema>;
export type ConfirmBookingSchemaData = z.infer<typeof confirmBookingSchema>;
