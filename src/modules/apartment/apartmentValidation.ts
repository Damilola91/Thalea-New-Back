import { CreateApartmentDto, UpdateApartmentDto } from "./apartmentDto";
import { createAppError } from "./apartmentErrors";

export const validateCreateApartmentInput = (
  data: CreateApartmentDto,
): void => {
  if (!data.name?.trim()) {
    throw createAppError("Il nome dell'appartamento è obbligatorio", 400);
  }

  if (!data.description?.trim()) {
    throw createAppError(
      "La descrizione dell'appartamento è obbligatoria",
      400,
    );
  }

  if (!data.address?.trim()) {
    throw createAppError("L'indirizzo dell'appartamento è obbligatorio", 400);
  }

  if (typeof data.pricePerNight !== "number" || data.pricePerNight < 0) {
    throw createAppError("pricePerNight non valido", 400);
  }

  if (typeof data.maxGuests !== "number" || data.maxGuests < 1) {
    throw createAppError("maxGuests non valido", 400);
  }

  if (!Array.isArray(data.images) || data.images.length === 0) {
    throw createAppError("Almeno un'immagine principale è obbligatoria", 400);
  }
};

export const validateUpdateApartmentInput = (
  data: UpdateApartmentDto,
): void => {
  if (
    data.pricePerNight !== undefined &&
    (typeof data.pricePerNight !== "number" || data.pricePerNight < 0)
  ) {
    throw createAppError("pricePerNight non valido", 400);
  }

  if (
    data.maxGuests !== undefined &&
    (typeof data.maxGuests !== "number" || data.maxGuests < 1)
  ) {
    throw createAppError("maxGuests non valido", 400);
  }

  if (data.images !== undefined) {
    if (!Array.isArray(data.images) || data.images.length === 0) {
      throw createAppError(
        "Se images viene passato, deve contenere almeno un'immagine",
        400,
      );
    }
  }
};
