import { CreateOfferDto, UpdateOfferDto } from "./offerDto";
import { createOfferRecord } from "./offerCreation";
import { mapOfferResponse } from "./offerMapper";
import {
  deleteOfferById,
  findAllOffers,
  findOfferById,
} from "./offerRepository";
import { IOfferResponse } from "./offerTypes";
import { updateOfferRecord } from "./offerUpdate";

export const createOfferService = async (
  data: CreateOfferDto,
): Promise<IOfferResponse> => {
  return await createOfferRecord(data);
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
  return await updateOfferRecord(offerId, data);
};

export const deleteOfferService = async (offerId: string): Promise<boolean> => {
  const deletedOffer = await deleteOfferById(offerId);
  return !!deletedOffer;
};
