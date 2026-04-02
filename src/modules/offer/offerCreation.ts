import { CreateOfferDto } from "./offerDto";
import { mapOfferResponse } from "./offerMapper";
import { createOffer } from "./offerRepository";
import { IOfferResponse } from "./offerTypes";
import { normalizeCreateOfferData } from "./offerUtils";
import { validateCreateOfferInput } from "./offerValidation";

export const createOfferRecord = async (
  data: CreateOfferDto,
): Promise<IOfferResponse> => {
  validateCreateOfferInput(data);

  const normalizedData = normalizeCreateOfferData(data);
  const createdOffer = await createOffer(normalizedData);

  return mapOfferResponse(createdOffer);
};
