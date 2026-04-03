import { CreateApartmentDto } from "./apartmentDto";
import { mapApartmentResponse } from "./apartmentMapper";
import { createApartment } from "./apartmentRepository";
import { createApartmentSchema } from "./apartmentSchemas";
import { IApartmentResponse } from "./apartmentTypes";
import { normalizeCreateApartmentData } from "./apartmentUtils";

export const createApartmentRecord = async (
  apartmentData: CreateApartmentDto,
): Promise<IApartmentResponse> => {
  const validatedData = createApartmentSchema.parse(apartmentData);

  const normalizedData = normalizeCreateApartmentData(validatedData);
  const createdApartment = await createApartment(normalizedData);

  return mapApartmentResponse(createdApartment);
};
