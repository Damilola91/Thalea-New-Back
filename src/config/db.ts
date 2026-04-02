import mongoose from "mongoose";

const initDB = async (): Promise<void> => {
  try {
    const dbUri = process.env.DB_URI;

    console.log("DB_URI presente:", !!dbUri);

    if (!dbUri) {
      throw new Error("DB_URI mancante nel file .env");
    }

    const safeUri = dbUri.replace(/\/\/(.*?):(.*?)@/, "//***:***@");
    console.log("DB_URI backend:", safeUri);

    await mongoose.connect(dbUri);
    console.log("Database connection successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default initDB;
