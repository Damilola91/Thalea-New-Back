import { Types } from "mongoose";
import ApartmentModel from "./apartmentModel";
import { CreateApartmentDto, UpdateApartmentDto } from "./apartmentDto";
import { IApartmentDocument } from "./apartmentTypes";

export const createApartment = async (
  apartmentData: CreateApartmentDto,
): Promise<IApartmentDocument> => {
  const newApartment = new ApartmentModel(apartmentData);
  return await newApartment.save();
};

export const findAllApartments = async (): Promise<IApartmentDocument[]> => {
  return await ApartmentModel.find().sort({ createdAt: -1 });
};

export const findApartmentById = async (
  apartmentId: string,
): Promise<IApartmentDocument | null> => {
  return await ApartmentModel.findById(apartmentId);
};

export const updateApartmentById = async (
  apartmentId: string,
  updateData: UpdateApartmentDto,
): Promise<IApartmentDocument | null> => {
  return await ApartmentModel.findByIdAndUpdate(
    apartmentId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};

export const clearApartmentBookedDatesById = async (
  apartmentId: string,
): Promise<IApartmentDocument | null> => {
  return await ApartmentModel.findByIdAndUpdate(
    apartmentId,
    { $set: { bookedDates: [] } },
    { new: true, runValidators: true },
  );
};

export const addApartmentBookedDate = async (
  apartmentId: string,
  bookingId: string,
  start: Date,
  end: Date,
): Promise<IApartmentDocument | null> => {
  return await ApartmentModel.findByIdAndUpdate(
    apartmentId,
    {
      $push: {
        bookedDates: {
          _id: new Types.ObjectId(bookingId),
          start,
          end,
        },
      },
    },
    { new: true },
  );
};

export const removeApartmentBookedDateByBookingId = async (
  apartmentId: string,
  bookingId: string,
): Promise<IApartmentDocument | null> => {
  return await ApartmentModel.findByIdAndUpdate(
    apartmentId,
    {
      $pull: {
        bookedDates: {
          _id: new Types.ObjectId(bookingId),
        },
      },
    },
    { new: true },
  );
};

export const deleteApartmentById = async (
  apartmentId: string,
): Promise<IApartmentDocument | null> => {
  return await ApartmentModel.findByIdAndDelete(apartmentId);
};
