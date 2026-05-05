import dotenv from "dotenv";
dotenv.config();

import initDB from "./config/db";
import app from "./app";

const PORT = Number(process.env.PORT) || 4252;

const startServer = async (): Promise<void> => {
  await initDB();

  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
};

startServer();
