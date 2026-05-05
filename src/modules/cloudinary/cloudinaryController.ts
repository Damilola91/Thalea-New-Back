import type { NextFunction, Request, Response } from "express";
import cloudinary from "../../shared/integrations/cloudinary/cloudinaryConfig";

interface UploadedFileResponse {
  url?: string;
  public_id?: string;
}

export const uploadFileToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const uploadedFile: UploadedFileResponse = {
      url:
        "path" in file
          ? (file as Express.Multer.File & { path?: string }).path
          : undefined,
      public_id:
        "filename" in file
          ? (file as Express.Multer.File & { filename?: string }).filename
          : undefined,
    };

    res.status(201).json({
      message: "File uploaded successfully",
      file: uploadedFile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFileFromCloudinary = async (
  req: Request<{ publicId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      res.status(400).json({ message: "public_id mancante" });
      return;
    }

    // Prima prova come image, poi come video
    const imageResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (imageResult.result === "ok") {
      res.status(200).json({
        statusCode: 200,
        message: "File eliminato con successo",
        public_id: publicId,
      });
      return;
    }

    const videoResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    if (videoResult.result === "ok") {
      res.status(200).json({
        statusCode: 200,
        message: "File eliminato con successo",
        public_id: publicId,
      });
      return;
    }

    res.status(404).json({
      statusCode: 404,
      message: "File non trovato su Cloudinary",
    });
  } catch (error) {
    next(error);
  }
};
