import { IOfferDocument, IOfferResponse } from "./offerTypes";

export const mapOfferResponse = (offer: IOfferDocument): IOfferResponse => {
  return {
    id: offer._id.toString(),
    title: offer.title,
    description: offer.description,
    type: offer.type,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    startDate: offer.startDate,
    endDate: offer.endDate,
    isActive: offer.isActive,
    apartmentIds: offer.apartmentIds?.map((id) => id.toString()) || [],
    conditionType: offer.conditionType,
    conditionValue: offer.conditionValue,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  };
};
