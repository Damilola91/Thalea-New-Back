import initDB from "./config/db";
import app from "./app";
import { env } from "./config/env";
import logger from "./shared/utils/logger/logger";

const PORT = env.PORT ?? 4252;

const startServer = async (): Promise<void> => {
  try {
    logger.info("Starting server...");

    await initDB();

    app.listen(PORT, () => {
      logger.info(`Server running on PORT ${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
