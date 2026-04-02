import {
  IApartmentAmenities,
  IApartmentAreaImages,
  IBookedDate,
} from "./apartmentTypes";

export interface CreateApartmentDto {
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  amenities?: IApartmentAmenities;
  images: string[];
  areaImages?: IApartmentAreaImages;
  bookedDates?: IBookedDate[];
}

export interface UpdateApartmentDto {
  name?: string;
  description?: string;
  address?: string;
  pricePerNight?: number;
  maxGuests?: number;
  amenities?: IApartmentAmenities;
  images?: string[];
  areaImages?: IApartmentAreaImages;
  bookedDates?: IBookedDate[];
}
