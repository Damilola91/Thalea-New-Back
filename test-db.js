const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("✅ DB connection successful"))
  .catch((err) => console.error("❌ DB connection failed:", err));
