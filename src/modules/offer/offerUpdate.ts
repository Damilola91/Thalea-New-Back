import { UpdateOfferDto } from "./offerDto";
import { mapOfferResponse } from "./offerMapper";
import { findOfferById, updateOfferById } from "./offerRepository";
import { IOfferResponse } from "./offerTypes";
import { normalizeUpdateOfferData, validateOfferDateRange } from "./offerUtils";
import {
  validateOfferBusinessRules,
  validateUpdateOfferInput,
} from "./offerValidation";

export const updateOfferRecord = async (
  offerId: string,
  data: UpdateOfferDto,
): Promise<IOfferResponse | null> => {
  validateUpdateOfferInput(data);

  const existingOffer = await findOfferById(offerId);

  if (!existingOffer) {
    return null;
  }

  const normalizedData = normalizeUpdateOfferData(data);

  const mergedData = {
    title: normalizedData.title ?? existingOffer.title,
    description: normalizedData.description ?? existingOffer.description,
    type: normalizedData.type ?? existingOffer.type,
    discountType: normalizedData.discountType ?? existingOffer.discountType,
    discountValue: normalizedData.discountValue ?? existingOffer.discountValue,
    startDate: normalizedData.startDate ?? existingOffer.startDate,
    endDate: normalizedData.endDate ?? existingOffer.endDate,
    isActive: normalizedData.isActive ?? existingOffer.isActive,
    apartmentIds: normalizedData.apartmentIds ?? existingOffer.apartmentIds,
    conditionType: normalizedData.conditionType ?? existingOffer.conditionType,
    conditionValue:
      normalizedData.conditionValue ?? existingOffer.conditionValue,
  };

  validateOfferBusinessRules({
    type: mergedData.type,
    discountType: mergedData.discountType,
    discountValue: mergedData.discountValue,
    conditionType: mergedData.conditionType,
    conditionValue: mergedData.conditionValue,
  });

  validateOfferDateRange(mergedData.startDate, mergedData.endDate);

  const updatedOffer = await updateOfferById(offerId, normalizedData);

  if (!updatedOffer) {
    return null;
  }

  return mapOfferResponse(updatedOffer);
};
