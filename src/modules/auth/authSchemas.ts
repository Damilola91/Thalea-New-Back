import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email non valida"),
  password: z.string().min(1, "Password obbligatoria"),
});

export type LoginSchemaData = z.infer<typeof loginSchema>;
