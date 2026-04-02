import { NextFunction, Request, Response } from "express";
import {
  clearApartmentBookedDatesService,
  createApartmentService,
  deleteApartmentService,
  getAllApartmentsService,
  getApartmentByIdService,
  updateApartmentService,
} from "./apartmentService";
import { CreateApartmentDto, UpdateApartmentDto } from "./apartmentDto";

export const createApartmentController = async (
  req: Request<{}, {}, CreateApartmentDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const createdApartment = await createApartmentService(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Apartment created successfully",
      apartment: createdApartment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApartmentsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const apartments = await getAllApartmentsService();

    res.status(200).json({
      statusCode: 200,
      apartments,
    });
  } catch (error) {
    next(error);
  }
};

export const getApartmentByIdController = async (
  req: Request<{ apartmentId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { apartmentId } = req.params;
    const apartment = await getApartmentByIdService(apartmentId);

    if (!apartment) {
      res.status(404).json({
        statusCode: 404,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      apartment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApartmentController = async (
  req: Request<{ apartmentId: string }, {}, UpdateApartmentDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { apartmentId } = req.params;
    const updatedApartment = await updateApartmentService(
      apartmentId,
      req.body,
    );

    if (!updatedApartment) {
      res.status(404).json({
        statusCode: 404,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Apartment updated successfully",
      apartment: updatedApartment,
    });
  } catch (error) {
    next(error);
  }
};

export const clearApartmentBookedDatesController = async (
  req: Request<{ apartmentId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { apartmentId } = req.params;
    const updatedApartment =
      await clearApartmentBookedDatesService(apartmentId);

    if (!updatedApartment) {
      res.status(404).json({
        statusCode: 404,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "All booked dates have been cleared successfully",
      apartment: updatedApartment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApartmentController = async (
  req: Request<{ apartmentId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { apartmentId } = req.params;
    const deleted = await deleteApartmentService(apartmentId);

    if (!deleted) {
      res.status(404).json({
        statusCode: 404,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Apartment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
