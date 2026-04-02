import {
  clearApartmentBookedDatesById,
  createApartment,
  deleteApartmentById,
  findAllApartments,
  findApartmentById,
  updateApartmentById,
} from "./apartmentRepository";
import { CreateApartmentDto, UpdateApartmentDto } from "./apartmentDto";
import { IApartmentDocument, IApartmentResponse } from "./apartmentTypes";

const mapApartmentResponse = (
  apartment: IApartmentDocument,
): IApartmentResponse => {
  return {
    id: apartment._id.toString(),
    name: apartment.name,
    description: apartment.description,
    address: apartment.address,
    pricePerNight: apartment.pricePerNight,
    maxGuests: apartment.maxGuests,
    amenities: apartment.amenities,
    images: apartment.images,
    areaImages: apartment.areaImages,
    bookedDates: apartment.bookedDates,
    createdAt: apartment.createdAt,
    updatedAt: apartment.updatedAt,
  };
};

const normalizeCreateApartmentData = (
  apartmentData: CreateApartmentDto,
): CreateApartmentDto => {
  return {
    ...apartmentData,
    amenities: {
      general: apartmentData.amenities?.general ?? [],
      kitchen: apartmentData.amenities?.kitchen ?? [],
      bathroom: apartmentData.amenities?.bathroom ?? [],
      outdoor: apartmentData.amenities?.outdoor ?? [],
      laundry: apartmentData.amenities?.laundry ?? [],
    },
    areaImages: {
      bathroom: apartmentData.areaImages?.bathroom ?? [],
      kitchen: apartmentData.areaImages?.kitchen ?? [],
      bedroom: apartmentData.areaImages?.bedroom ?? [],
      balconyOrTerrace: apartmentData.areaImages?.balconyOrTerrace ?? [],
    },
    bookedDates: apartmentData.bookedDates ?? [],
  };
};

export const createApartmentService = async (
  apartmentData: CreateApartmentDto,
): Promise<IApartmentResponse> => {
  const normalizedData = normalizeCreateApartmentData(apartmentData);
  const createdApartment = await createApartment(normalizedData);
  return mapApartmentResponse(createdApartment);
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
  const updatedApartment = await updateApartmentById(apartmentId, updateData);

  if (!updatedApartment) {
    return null;
  }

  return mapApartmentResponse(updatedApartment);
};

export const clearApartmentBookedDatesService = async (
  apartmentId: string,
): Promise<IApartmentResponse | null> => {
  const updatedApartment = await clearApartmentBookedDatesById(apartmentId);

  if (!updatedApartment) {
    return null;
  }

  return mapApartmentResponse(updatedApartment);
};

export const deleteApartmentService = async (
  apartmentId: string,
): Promise<boolean> => {
  const deletedApartment = await deleteApartmentById(apartmentId);
  return !!deletedApartment;
};
