import { CreateOfferDto } from "./offerDto";
import { mapOfferResponse } from "./offerMapper";
import { createOffer } from "./offerRepository";
import { createOfferSchema } from "./offerSchemas";
import { IOfferResponse } from "./offerTypes";
import { normalizeCreateOfferData } from "./offerUtils";

export const createOfferRecord = async (
  data: CreateOfferDto,
): Promise<IOfferResponse> => {
  const validatedData = createOfferSchema.parse(data);

  const normalizedData = normalizeCreateOfferData(validatedData);
  const createdOffer = await createOffer(normalizedData);

  return mapOfferResponse(createdOffer);
};
