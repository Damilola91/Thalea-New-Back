import { CreateApartmentDto, UpdateApartmentDto } from "./apartmentDto";
import { createApartmentRecord } from "./apartmentCreation";
import { mapApartmentResponse } from "./apartmentMapper";
import {
  deleteApartmentById,
  findAllApartments,
  findApartmentById,
} from "./apartmentRepository";
import { IApartmentResponse } from "./apartmentTypes";
import {
  clearApartmentBookedDatesRecord,
  updateApartmentRecord,
} from "./apartmentUpdate";

export const createApartmentService = async (
  apartmentData: CreateApartmentDto,
): Promise<IApartmentResponse> => {
  return await createApartmentRecord(apartmentData);
};

export const getAllApartmentsService = async (): Promise<
  IApartmentResponse[]
> => {
  const apartments = await findAllApartments();
  return apartments.map(mapApartmentResponse);
};

export const getApartmentByIdService = async (
  apartmentId: string,
): Promise<IApartmentResponse | null> => {
  const apartment = await findApartmentById(apartmentId);

  if (!apartment) {
    return null;
  }

  return mapApartmentResponse(apartment);
};

export const updateApartmentService = async (
  apartmentId: string,
  updateData: UpdateApartmentDto,
): Promise<IApartmentResponse | null> => {
  return await updateApartmentRecord(apartmentId, updateData);
};

export const clearApartmentBookedDatesService = async (
  apartmentId: string,
): Promise<IApartmentResponse | null> => {
  return await clearApartmentBookedDatesRecord(apartmentId);
};

export const deleteApartmentService = async (
  apartmentId: string,
): Promise<boolean> => {
  const deletedApartment = await deleteApartmentById(apartmentId);
  return !!deletedApartment;
};
