import { Router } from "express";

import cloudinaryUpload from "../../shared/integrations/cloudinary/cloudinaryStorage";
import { uploadFileToCloudinary } from "./cloudinaryController";

const cloudinaryRoute = Router();

cloudinaryRoute.post(
  "/upload/cloud",
  cloudinaryUpload.single("file"),
  uploadFileToCloudinary,
);

export default cloudinaryRoute;
