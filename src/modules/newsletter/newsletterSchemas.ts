import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z.email("Email non valida"),
});

export const sendNewsletterSchema = z
  .object({
    subject: z.string().trim().min(1, "Subject obbligatorio"),
    text: z.string().optional(),
    html: z.string().optional(),
  })
  .refine((data) => Boolean(data.text || data.html), {
    message: "Devi fornire text oppure html",
    path: ["text"],
  });

export type SubscribeNewsletterSchemaData = z.infer<
  typeof subscribeNewsletterSchema
>;
export type SendNewsletterSchemaData = z.infer<typeof sendNewsletterSchema>;
