import { z } from "zod";

const bookedDateSchema = z.object({
  _id: z.string().optional(),
  start: z.coerce.date({
    error: "start non valida",
  }),
  end: z.coerce.date({
    error: "end non valida",
  }),
});

const apartmentAmenitiesSchema = z.object({
  general: z.array(z.string()).default([]),
  kitchen: z.array(z.string()).default([]),
  bathroom: z.array(z.string()).default([]),
  outdoor: z.array(z.string()).default([]),
  laundry: z.array(z.string()).default([]),
});

const apartmentAreaImagesSchema = z.object({
  bathroom: z.array(z.string()).default([]),
  kitchen: z.array(z.string()).default([]),
  bedroom: z.array(z.string()).default([]),
  balconyOrTerrace: z.array(z.string()).default([]),
});

export const createApartmentSchema = z.object({
  name: z.string().trim().min(1, "Il nome dell'appartamento è obbligatorio"),
  description: z
    .string()
    .trim()
    .min(1, "La descrizione dell'appartamento è obbligatoria"),
  address: z
    .string()
    .trim()
    .min(1, "L'indirizzo dell'appartamento è obbligatorio"),
  pricePerNight: z.number().min(0, "pricePerNight non valido"),
  maxGuests: z
    .number()
    .int("maxGuests deve essere un intero")
    .min(1, "maxGuests non valido"),
  amenities: apartmentAmenitiesSchema.optional(),
  images: z
    .array(z.string().trim().min(1))
    .min(1, "Almeno un'immagine principale è obbligatoria"),
  areaImages: apartmentAreaImagesSchema.optional(),
  bookedDates: z.array(bookedDateSchema).optional(),
});

export const updateApartmentSchema = z
  .object({
    name: z.string().trim().min(1, "Nome non valido").optional(),
    description: z.string().trim().min(1, "Descrizione non valida").optional(),
    address: z.string().trim().min(1, "Indirizzo non valido").optional(),
    pricePerNight: z.number().min(0, "pricePerNight non valido").optional(),
    maxGuests: z
      .number()
      .int("maxGuests deve essere un intero")
      .min(1, "maxGuests non valido")
      .optional(),
    amenities: apartmentAmenitiesSchema.optional(),
    images: z
      .array(z.string().trim().min(1))
      .min(1, "Se images viene passato, deve contenere almeno un'immagine")
      .optional(),
    areaImages: apartmentAreaImagesSchema.optional(),
    bookedDates: z.array(bookedDateSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Almeno un campo deve essere fornito per l'aggiornamento",
  });

export type CreateApartmentInput = z.infer<typeof createApartmentSchema>;
export type UpdateApartmentInput = z.infer<typeof updateApartmentSchema>;
