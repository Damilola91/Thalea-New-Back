import { z } from "zod";
import { allowedRoles } from "./userTypes";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio"),
  email: z.email("Email non valida"),
  password: z
    .string()
    .min(8, "La password è obbligatoria e deve contenere almeno 8 caratteri"),
  role: z.enum(allowedRoles, {
    error: "Ruolo non valido",
  }),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Nome non valido").optional(),
    email: z.email("Email non valida").optional(),
    password: z
      .string()
      .min(8, "La password deve contenere almeno 8 caratteri")
      .optional(),
    role: z
      .enum(allowedRoles, {
        error: "Ruolo non valido",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Almeno un campo deve essere fornito per l'aggiornamento",
  });

export const updatePasswordSchema = z.object({
  userId: z.string().trim().min(1, "userId mancante"),
  newPassword: z
    .string()
    .min(
      8,
      "La nuova password è obbligatoria e deve contenere almeno 8 caratteri.",
    ),
  token: z.string().trim().min(1, "Token mancante"),
});

export type CreateUserSchemaData = z.infer<typeof createUserSchema>;
export type UpdateUserSchemaData = z.infer<typeof updateUserSchema>;
export type UpdatePasswordSchemaData = z.infer<typeof updatePasswordSchema>;
