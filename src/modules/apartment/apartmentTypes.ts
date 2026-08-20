import { Document, Types } from "mongoose";

export const SUPPORTED_LOCALES = ["it", "en", "de", "fr", "es", "zh"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Singola voce multilingua.
 * `it` è obbligatorio e funge da fallback quando una traduzione manca.
 */
export interface ILocalizedText {
  it: string;
  en?: string;
  de?: string;
  fr?: string;
  es?: string;
  zh?: string;
}

export interface IBookedDate {
  _id?: Types.ObjectId;
  start: Date;
  end: Date;
}

export type AmenityCategory =
  | "general"
  | "kitchen"
  | "bathroom"
  | "outdoor"
  | "laundry";

export interface IApartmentAmenities {
  general: ILocalizedText[];
  kitchen: ILocalizedText[];
  bathroom: ILocalizedText[];
  outdoor: ILocalizedText[];
  laundry: ILocalizedText[];
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
