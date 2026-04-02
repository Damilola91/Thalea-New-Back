import OfferModel from "./offerModel";
import { IOfferDocument } from "./offerTypes";

interface CreateOfferRepositoryData {
  title: string;
  description?: string;
  type: "discount" | "conditional";
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  apartmentIds?: string[];
  conditionType?: "min_nights" | "early_booking" | "last_minute";
  conditionValue?: number;
}

export const createOffer = async (
  offerData: CreateOfferRepositoryData,
): Promise<IOfferDocument> => {
  const newOffer = new OfferModel(offerData);
  return await newOffer.save();
};

export const findAllOffers = async (): Promise<IOfferDocument[]> => {
  return await OfferModel.find().sort({ createdAt: -1 });
};

export const findOfferById = async (
  offerId: string,
): Promise<IOfferDocument | null> => {
  return await OfferModel.findById(offerId);
};

export const updateOfferById = async (
  offerId: string,
  updateData: Partial<CreateOfferRepositoryData>,
): Promise<IOfferDocument | null> => {
  return await OfferModel.findByIdAndUpdate(
    offerId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};

export const deleteOfferById = async (
  offerId: string,
): Promise<IOfferDocument | null> => {
  return await OfferModel.findByIdAndDelete(offerId);
};
