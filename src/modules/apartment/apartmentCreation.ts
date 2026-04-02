import { CreateApartmentDto } from "./apartmentDto";
import { mapApartmentResponse } from "./apartmentMapper";
import { createApartment } from "./apartmentRepository";
import { IApartmentResponse } from "./apartmentTypes";
import { normalizeCreateApartmentData } from "./apartmentUtils";
import { validateCreateApartmentInput } from "./apartmentValidation";

export const createApartmentRecord = async (
  apartmentData: CreateApartmentDto,
): Promise<IApartmentResponse> => {
  validateCreateApartmentInput(apartmentData);

  const normalizedData = normalizeCreateApartmentData(apartmentData);
  const createdApartment = await createApartment(normalizedData);

  return mapApartmentResponse(createdApartment);
};
