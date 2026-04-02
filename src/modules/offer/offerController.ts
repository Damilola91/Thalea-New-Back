import { NextFunction, Request, Response } from "express";
import { CreateOfferDto, UpdateOfferDto } from "./offerDto";
import {
  createOfferService,
  deleteOfferService,
  getAllOffersService,
  getOfferByIdService,
  updateOfferService,
} from "./offerService";

export const createOfferController = async (
  req: Request<{}, {}, CreateOfferDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const offer = await createOfferService(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOffersController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const offers = await getAllOffersService();

    res.status(200).json({
      statusCode: 200,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

export const getOfferByIdController = async (
  req: Request<{ offerId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const offer = await getOfferByIdService(req.params.offerId);

    if (!offer) {
      res.status(404).json({
        statusCode: 404,
        message: "Offer not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      offer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOfferController = async (
  req: Request<{ offerId: string }, {}, UpdateOfferDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const offer = await updateOfferService(req.params.offerId, req.body);

    if (!offer) {
      res.status(404).json({
        statusCode: 404,
        message: "Offer not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOfferController = async (
  req: Request<{ offerId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deleted = await deleteOfferService(req.params.offerId);

    if (!deleted) {
      res.status(404).json({
        statusCode: 404,
        message: "Offer not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
