import { Router } from "express";
import cloudinaryUpload from "../../shared/integrations/cloudinary/cloudinaryStorage";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "./cloudinaryController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";

const cloudinaryRoute = Router();

cloudinaryRoute.post(
  "/upload/cloud",
  verifyToken,
  authorizeAdmin,
  cloudinaryUpload.single("file"),
  uploadFileToCloudinary,
);

cloudinaryRoute.delete(
  "/delete/:publicId",
  verifyToken,
  authorizeAdmin,
  deleteFileFromCloudinary,
);

export default cloudinaryRoute;
