import { UpdateApartmentDto } from "./apartmentDto";
import { mapApartmentResponse } from "./apartmentMapper";
import {
  clearApartmentBookedDatesById,
  updateApartmentById,
} from "./apartmentRepository";
import { updateApartmentSchema } from "./apartmentSchemas";
import { IApartmentResponse } from "./apartmentTypes";
import { normalizeUpdateApartmentData } from "./apartmentUtils";

export const updateApartmentRecord = async (
  apartmentId: string,
  updateData: UpdateApartmentDto,
): Promise<IApartmentResponse | null> => {
  const validatedData = updateApartmentSchema.parse(updateData);

  const normalizedData = normalizeUpdateApartmentData(validatedData);
  const updatedApartment = await updateApartmentById(
    apartmentId,
    normalizedData,
  );

  if (!updatedApartment) {
    return null;
  }

  return mapApartmentResponse(updatedApartment);
};

export const clearApartmentBookedDatesRecord = async (
  apartmentId: string,
): Promise<IApartmentResponse | null> => {
  const updatedApartment = await clearApartmentBookedDatesById(apartmentId);

  if (!updatedApartment) {
    return null;
  }

  return mapApartmentResponse(updatedApartment);
};
