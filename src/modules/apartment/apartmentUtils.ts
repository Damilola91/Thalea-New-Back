import { CreateApartmentDto, UpdateApartmentDto } from "./apartmentDto";

export const normalizeCreateApartmentData = (
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

export const normalizeUpdateApartmentData = (
  apartmentData: UpdateApartmentDto,
): UpdateApartmentDto => {
  return {
    ...apartmentData,
    ...(apartmentData.amenities
      ? {
          amenities: {
            general: apartmentData.amenities.general ?? [],
            kitchen: apartmentData.amenities.kitchen ?? [],
            bathroom: apartmentData.amenities.bathroom ?? [],
            outdoor: apartmentData.amenities.outdoor ?? [],
            laundry: apartmentData.amenities.laundry ?? [],
          },
        }
      : {}),
    ...(apartmentData.areaImages
      ? {
          areaImages: {
            bathroom: apartmentData.areaImages.bathroom ?? [],
            kitchen: apartmentData.areaImages.kitchen ?? [],
            bedroom: apartmentData.areaImages.bedroom ?? [],
            balconyOrTerrace: apartmentData.areaImages.balconyOrTerrace ?? [],
          },
        }
      : {}),
  };
};
