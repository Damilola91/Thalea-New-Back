import mongoose from "mongoose";
import { env } from "./env";
import logger from "../shared/utils/logger/logger";

const initDB = async (): Promise<void> => {
  try {
    const dbUri = env.DB_URI;

    /**
     * Mask URI (sicurezza log)
     */
    const safeUri = dbUri.replace(/\/\/(.*?):(.*?)@/, "//***:***@");

    logger.info("Connecting to database...");
    logger.debug({ dbUri: safeUri }, "Database URI");

    await mongoose.connect(dbUri);

    logger.info("Database connected successfully");
  } catch (error) {
    logger.error({ err: error }, "Database connection failed");
    process.exit(1);
  }
};

export default initDB;
