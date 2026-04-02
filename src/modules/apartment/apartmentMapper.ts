import { IApartmentDocument, IApartmentResponse } from "./apartmentTypes";

export const mapApartmentResponse = (
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
