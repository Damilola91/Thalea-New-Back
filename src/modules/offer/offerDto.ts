import { ConditionType, DiscountType, OfferType } from "./offerTypes";

export interface CreateOfferDto {
  title: string;
  description?: string;
  type: OfferType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  apartmentIds?: string[];
  conditionType?: ConditionType;
  conditionValue?: number;
}

export interface UpdateOfferDto {
  title?: string;
  description?: string;
  type?: OfferType;
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  apartmentIds?: string[];
  conditionType?: ConditionType;
  conditionValue?: number;
}
