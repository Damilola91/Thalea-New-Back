import mongoose from "mongoose";
import { env } from "./env";
import logger from "../shared/utils/logger/logger";

const initDB = async (): Promise<void> => {
  try {
    const safeUri = env.DB_URI.replace(/\/\/(.*?):(.*?)@/, "//***:***@");
    logger.info({ scope: "db", event: "connecting", uri: safeUri });

    await mongoose.connect(env.DB_URI);
    logger.info({ scope: "db", event: "connected" });
  } catch (error) {
    logger.error({ scope: "db", event: "connection_failed", error });
    process.exit(1);
  }
};

export default initDB;
