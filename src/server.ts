import dotenv from "dotenv";
import initDB from "./config/db";
import app from "./app";

dotenv.config();
console.log("DB_URI presente:", !!process.env.DB_URI);

const PORT = Number(process.env.PORT) || 4252;

const startServer = async (): Promise<void> => {
  await initDB();

  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
};

startServer();
