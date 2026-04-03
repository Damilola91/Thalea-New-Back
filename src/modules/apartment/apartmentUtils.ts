import { CreateApartmentInput, UpdateApartmentInput } from "./apartmentSchemas";

export const normalizeCreateApartmentData = (
  apartmentData: CreateApartmentInput,
) => {
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
    bookedDates:
      apartmentData.bookedDates?.map((date) => ({
        start: date.start,
        end: date.end,
      })) ?? [],
  };
};

export const normalizeUpdateApartmentData = (
  apartmentData: UpdateApartmentInput,
) => {
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
    ...(apartmentData.bookedDates
      ? {
          bookedDates: apartmentData.bookedDates.map((date) => ({
            start: date.start,
            end: date.end,
          })),
        }
      : {}),
  };
};
