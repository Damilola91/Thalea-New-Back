import { z } from "zod";
import {
  allowedConditionTypes,
  allowedDiscountTypes,
  allowedOfferTypes,
} from "./offerTypes";

const offerBaseSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  description: z.string().trim().optional(),
  type: z.enum(allowedOfferTypes, {
    error: "type non valido",
  }),
  discountType: z.enum(allowedDiscountTypes, {
    error: "discountType non valido",
  }),
  discountValue: z.number(),
  startDate: z.iso.date("startDate non valida"),
  endDate: z.iso.date("endDate non valida"),
  isActive: z.boolean().optional(),
  apartmentIds: z.array(z.string().trim().min(1)).optional(),
  conditionType: z
    .enum(allowedConditionTypes, {
      error: "conditionType non valido",
    })
    .optional(),
  conditionValue: z.number().optional(),
});

export const createOfferSchema = offerBaseSchema.superRefine((data, ctx) => {
  if (
    data.type === "conditional" &&
    (!data.conditionType || data.conditionValue === undefined)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Conditional offers require conditionType and conditionValue",
      path: ["conditionType"],
    });
  }

  if (data.type === "discount" && data.conditionType) {
    ctx.addIssue({
      code: "custom",
      message: "Discount offers cannot have conditionType",
      path: ["conditionType"],
    });
  }

  if (data.type === "discount" && data.conditionValue !== undefined) {
    ctx.addIssue({
      code: "custom",
      message: "Discount offers cannot have conditionValue",
      path: ["conditionValue"],
    });
  }

  if (
    data.discountType === "percentage" &&
    (data.discountValue <= 0 || data.discountValue > 100)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Percentage discountValue must be between 1 and 100",
      path: ["discountValue"],
    });
  }

  if (data.discountType === "fixed" && data.discountValue <= 0) {
    ctx.addIssue({
      code: "custom",
      message: "Fixed discountValue must be greater than 0",
      path: ["discountValue"],
    });
  }

  if (data.endDate < data.startDate) {
    ctx.addIssue({
      code: "custom",
      message: "endDate must be greater than or equal to startDate",
      path: ["endDate"],
    });
  }
});

export const updateOfferSchema = z
  .object({
    title: z.string().trim().min(1, "title cannot be empty").optional(),
    description: z.string().trim().optional(),
    type: z
      .enum(allowedOfferTypes, {
        error: "type non valido",
      })
      .optional(),
    discountType: z
      .enum(allowedDiscountTypes, {
        error: "discountType non valido",
      })
      .optional(),
    discountValue: z.number().optional(),
    startDate: z.iso.date("startDate non valida").optional(),
    endDate: z.iso.date("endDate non valida").optional(),
    isActive: z.boolean().optional(),
    apartmentIds: z.array(z.string().trim().min(1)).optional(),
    conditionType: z
      .enum(allowedConditionTypes, {
        error: "conditionType non valido",
      })
      .optional(),
    conditionValue: z.number().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateOfferSchemaData = z.infer<typeof createOfferSchema>;
export type UpdateOfferSchemaData = z.infer<typeof updateOfferSchema>;
