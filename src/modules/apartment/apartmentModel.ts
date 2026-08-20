import { Schema, model } from "mongoose";
import {
  IApartmentDocument,
  IApartmentAmenities,
  IApartmentAreaImages,
  IBookedDate,
  ILocalizedText,
} from "./apartmentTypes";

const bookedDateSchema = new Schema<IBookedDate>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

/**
 * Voce multilingua: solo `it` è obbligatorio.
 * Le altre lingue sono opzionali e il frontend fa fallback su `it`.
 */
const localizedTextSchema = new Schema<ILocalizedText>(
  {
    it: { type: String, required: true, trim: true },
    en: { type: String, trim: true },
    de: { type: String, trim: true },
    fr: { type: String, trim: true },
    es: { type: String, trim: true },
    zh: { type: String, trim: true },
  },
  { _id: false },
);

const amenitiesSchema = new Schema<IApartmentAmenities>(
  {
    general: { type: [localizedTextSchema], default: [] },
    kitchen: { type: [localizedTextSchema], default: [] },
    bathroom: { type: [localizedTextSchema], default: [] },
    outdoor: { type: [localizedTextSchema], default: [] },
    laundry: { type: [localizedTextSchema], default: [] },
  },
  { _id: false },
);

const areaImagesSchema = new Schema<IApartmentAreaImages>(
  {
    bathroom: { type: [String], default: [] },
    kitchen: { type: [String], default: [] },
    bedroom: { type: [String], default: [] },
    balconyOrTerrace: { type: [String], default: [] },
  },
  { _id: false },
);

const apartmentSchema = new Schema<IApartmentDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    amenities: {
      type: amenitiesSchema,
      default: () => ({
        general: [],
        kitchen: [],
        bathroom: [],
        outdoor: [],
        laundry: [],
      }),
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) =>
          Array.isArray(value) && value.length > 0,
        message: "At least one main image is required",
      },
    },
    areaImages: {
      type: areaImagesSchema,
      default: () => ({
        bathroom: [],
        kitchen: [],
        bedroom: [],
        balconyOrTerrace: [],
      }),
    },
    bookedDates: {
      type: [bookedDateSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const ApartmentModel = model<IApartmentDocument>("Apartment", apartmentSchema);

export default ApartmentModel;
