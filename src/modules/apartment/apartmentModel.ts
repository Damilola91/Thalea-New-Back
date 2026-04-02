import { Schema, model } from "mongoose";
import {
  IApartmentDocument,
  IApartmentAmenities,
  IApartmentAreaImages,
  IBookedDate,
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

const amenitiesSchema = new Schema<IApartmentAmenities>(
  {
    general: { type: [String], default: [] },
    kitchen: { type: [String], default: [] },
    bathroom: { type: [String], default: [] },
    outdoor: { type: [String], default: [] },
    laundry: { type: [String], default: [] },
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
