import { CreatePaymentOrderDto } from "./orderDto";
import { createAppError } from "./orderErrors";

const allowedCheckoutPaymentMethods = ["card"] as const;

export const validateCreatePaymentOrderInput = (
  data: CreatePaymentOrderDto,
): void => {
  const { bookingId, paymentMethod } = data;

  if (!bookingId || !paymentMethod) {
    throw createAppError("bookingId e paymentMethod sono obbligatori", 400);
  }

  if (!allowedCheckoutPaymentMethods.includes(paymentMethod as "card")) {
    throw createAppError("Metodo di pagamento non valido", 400);
  }
};
