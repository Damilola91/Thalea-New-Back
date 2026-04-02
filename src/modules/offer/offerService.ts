import { CreateOfferDto, UpdateOfferDto } from "./offerDto";
import {
  createOffer,
  deleteOfferById,
  findAllOffers,
  findOfferById,
  updateOfferById,
} from "./offerRepository";
import { IOfferDocument, IOfferResponse } from "./offerTypes";

const mapOfferResponse = (offer: IOfferDocument): IOfferResponse => {
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

const validateOfferBusinessRules = (
  data: CreateOfferDto | UpdateOfferDto,
): void => {
  if (
    data.type === "conditional" &&
    (!data.conditionType || data.conditionValue === undefined)
  ) {
    const error = new Error(
      "Conditional offers require conditionType and conditionValue",
    ) as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  if (data.type === "discount") {
    if ("conditionType" in data && data.conditionType) {
      const error = new Error(
        "Discount offers cannot have conditionType",
      ) as Error & { status?: number };
      error.status = 400;
      throw error;
    }
  }

  if (
    data.discountType === "percentage" &&
    data.discountValue !== undefined &&
    (data.discountValue <= 0 || data.discountValue > 100)
  ) {
    const error = new Error(
      "Percentage discountValue must be between 1 and 100",
    ) as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  if (
    data.discountType === "fixed" &&
    data.discountValue !== undefined &&
    data.discountValue <= 0
  ) {
    const error = new Error(
      "Fixed discountValue must be greater than 0",
    ) as Error & { status?: number };
    error.status = 400;
    throw error;
  }
};

export const createOfferService = async (
  data: CreateOfferDto,
): Promise<IOfferResponse> => {
  validateOfferBusinessRules(data);

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate < startDate) {
    const error = new Error(
      "endDate must be greater than or equal to startDate",
    ) as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  const createdOffer = await createOffer({
    ...data,
    startDate,
    endDate,
  });

  return mapOfferResponse(createdOffer);
};

export const getAllOffersService = async (): Promise<IOfferResponse[]> => {
  const offers = await findAllOffers();
  return offers.map(mapOfferResponse);
};

export const getOfferByIdService = async (
  offerId: string,
): Promise<IOfferResponse | null> => {
  const offer = await findOfferById(offerId);

  if (!offer) {
    return null;
  }

  return mapOfferResponse(offer);
};

export const updateOfferService = async (
  offerId: string,
  data: UpdateOfferDto,
): Promise<IOfferResponse | null> => {
  validateOfferBusinessRules(data);

  const normalizedData: Record<string, unknown> = { ...data };

  if (data.startDate) {
    normalizedData.startDate = new Date(data.startDate);
  }

  if (data.endDate) {
    normalizedData.endDate = new Date(data.endDate);
  }

  const updatedOffer = await updateOfferById(offerId, normalizedData);

  if (!updatedOffer) {
    return null;
  }

  return mapOfferResponse(updatedOffer);
};

export const deleteOfferService = async (offerId: string): Promise<boolean> => {
  const deletedOffer = await deleteOfferById(offerId);
  return !!deletedOffer;
};
