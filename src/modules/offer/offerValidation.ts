import { CreateOfferDto, UpdateOfferDto } from "./offerDto";
import { ConditionType, DiscountType, OfferType } from "./offerTypes";
import { createAppError } from "./offerErrors";

interface OfferBusinessRulesInput {
  type?: OfferType;
  discountType?: DiscountType;
  discountValue?: number;
  conditionType?: ConditionType;
  conditionValue?: number;
}

export const validateOfferBusinessRules = (
  data: OfferBusinessRulesInput,
): void => {
  if (
    data.type === "conditional" &&
    (!data.conditionType || data.conditionValue === undefined)
  ) {
    throw createAppError(
      "Conditional offers require conditionType and conditionValue",
      400,
    );
  }

  if (data.type === "discount" && data.conditionType) {
    throw createAppError("Discount offers cannot have conditionType", 400);
  }

  if (data.type === "discount" && data.conditionValue !== undefined) {
    throw createAppError("Discount offers cannot have conditionValue", 400);
  }

  if (
    data.discountType === "percentage" &&
    data.discountValue !== undefined &&
    (data.discountValue <= 0 || data.discountValue > 100)
  ) {
    throw createAppError(
      "Percentage discountValue must be between 1 and 100",
      400,
    );
  }

  if (
    data.discountType === "fixed" &&
    data.discountValue !== undefined &&
    data.discountValue <= 0
  ) {
    throw createAppError("Fixed discountValue must be greater than 0", 400);
  }
};

export const validateCreateOfferInput = (data: CreateOfferDto): void => {
  if (!data.title?.trim()) {
    throw createAppError("title is required", 400);
  }

  if (!data.type) {
    throw createAppError("type is required", 400);
  }

  if (!data.discountType) {
    throw createAppError("discountType is required", 400);
  }

  if (data.discountValue === undefined) {
    throw createAppError("discountValue is required", 400);
  }

  if (!data.startDate) {
    throw createAppError("startDate is required", 400);
  }

  if (!data.endDate) {
    throw createAppError("endDate is required", 400);
  }

  validateOfferBusinessRules(data);
};

export const validateUpdateOfferInput = (data: UpdateOfferDto): void => {
  if (data.title !== undefined && !data.title.trim()) {
    throw createAppError("title cannot be empty", 400);
  }

  validateOfferBusinessRules(data);
};
