import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  bookingId: z
    .string()
    .trim()
    .min(1, "bookingId e paymentMethod sono obbligatori"),
  paymentMethod: z.literal("card", {
    error: "Metodo di pagamento non valido",
  }),
});

export type CreatePaymentOrderSchemaData = z.infer<
  typeof createPaymentOrderSchema
>;
