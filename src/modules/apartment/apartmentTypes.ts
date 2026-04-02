import { Document, Types } from "mongoose";

export interface IBookedDate {
  _id?: Types.ObjectId;
  start: Date;
  end: Date;
}

export interface IApartmentAmenities {
  general: string[];
  kitchen: string[];
  bathroom: string[];
  outdoor: string[];
  laundry: string[];
}

export interface IApartmentAreaImages {
  bathroom: string[];
  kitchen: string[];
  bedroom: string[];
  balconyOrTerrace: string[];
}

export interface IApartment {
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: IApartmentAmenities;
  images: string[];
  areaImages: IApartmentAreaImages;
  bookedDates: IBookedDate[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IApartmentDocument extends IApartment, Document {
  _id: Types.ObjectId;
}

export interface IApartmentResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: IApartmentAmenities;
  images: string[];
  areaImages: IApartmentAreaImages;
  bookedDates: IBookedDate[];
  createdAt?: Date;
  updatedAt?: Date;
}
