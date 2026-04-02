import { CreateOfferDto, UpdateOfferDto } from "./offerDto";
import { ConditionType, DiscountType, OfferType } from "./offerTypes";
import { createAppError } from "./offerErrors";

export interface NormalizedCreateOfferData {
  title: string;
  description?: string;
  type: OfferType;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  apartmentIds?: string[];
  conditionType?: ConditionType;
  conditionValue?: number;
}

export interface NormalizedUpdateOfferData {
  title?: string;
  description?: string;
  type?: OfferType;
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  apartmentIds?: string[];
  conditionType?: ConditionType;
  conditionValue?: number;
}

export const parseOfferDate = (date: string): Date => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw createAppError("Invalid date format", 400);
  }

  return parsedDate;
};

export const validateOfferDateRange = (
  startDate: Date,
  endDate: Date,
): void => {
  if (endDate < startDate) {
    throw createAppError(
      "endDate must be greater than or equal to startDate",
      400,
    );
  }
};

export const normalizeCreateOfferData = (
  data: CreateOfferDto,
): NormalizedCreateOfferData => {
  const startDate = parseOfferDate(data.startDate);
  const endDate = parseOfferDate(data.endDate);

  validateOfferDateRange(startDate, endDate);

  return {
    ...data,
    startDate,
    endDate,
  };
};

export const normalizeUpdateOfferData = (
  data: UpdateOfferDto,
): NormalizedUpdateOfferData => {
  const normalizedData: NormalizedUpdateOfferData = {};

  if (data.title !== undefined) {
    normalizedData.title = data.title;
  }

  if (data.description !== undefined) {
    normalizedData.description = data.description;
  }

  if (data.type !== undefined) {
    normalizedData.type = data.type;
  }

  if (data.discountType !== undefined) {
    normalizedData.discountType = data.discountType;
  }

  if (data.discountValue !== undefined) {
    normalizedData.discountValue = data.discountValue;
  }

  if (data.startDate !== undefined) {
    normalizedData.startDate = parseOfferDate(data.startDate);
  }

  if (data.endDate !== undefined) {
    normalizedData.endDate = parseOfferDate(data.endDate);
  }

  if (data.isActive !== undefined) {
    normalizedData.isActive = data.isActive;
  }

  if (data.apartmentIds !== undefined) {
    normalizedData.apartmentIds = data.apartmentIds;
  }

  if (data.conditionType !== undefined) {
    normalizedData.conditionType = data.conditionType;
  }

  if (data.conditionValue !== undefined) {
    normalizedData.conditionValue = data.conditionValue;
  }

  return normalizedData;
};
