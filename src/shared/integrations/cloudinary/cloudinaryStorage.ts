import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";

import cloudinary from "./cloudinaryConfig";
import type { CloudinaryStorageParams } from "./cloudinaryTypes";

const buildPublicId = (originalname: string): string => {
  const nameWithoutExtension =
    originalname.split(".").slice(0, -1).join(".") || originalname;

  return nameWithoutExtension
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");
};

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: async (
    _req: Request,
    file: Express.Multer.File,
  ): Promise<CloudinaryStorageParams> => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      throw new Error("File not supported");
    }

    return {
      folder: "SICILIAN-TASTE-SERVER-UPLOADS",
      allowed_formats: [
        "jpg",
        "png",
        "jpeg",
        "gif",
        "webp",
        "mp4",
        "mov",
        "avi",
        "hevc",
        "avif",
      ],
      resource_type: isVideo ? "video" : "image",
      public_id: buildPublicId(file.originalname),
    };
  },
});

const cloudinaryUpload = multer({
  storage: cloudStorage,
});

export default cloudinaryUpload;
