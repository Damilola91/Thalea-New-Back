import type { NextFunction, Request, Response } from "express";

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
