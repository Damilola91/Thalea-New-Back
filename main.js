const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const init = require("./db");
require("dotenv").config();
const apartmentRoute = require("./routes/apartment");
const bookingRoute = require("./routes/booking");
const orderRoute = require("./routes/order");
const userRoute = require("./routes/user");
const loginRoute = require("./routes/login");
const newsletterRoute = require("./routes/subscribe");

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://www.thaleapalermoapartment.it",
  "https://nuovo-frontend-thalea.vercel.app",
];

const PORT = process.env.PORT || 4252;

const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    credentials: true,
  })
);

server.use("/", apartmentRoute);
server.use("/", bookingRoute);
server.use("/", orderRoute);
server.use("/", userRoute);
server.use("/", loginRoute);
server.use("/", newsletterRoute);

init();

server.listen(PORT, () => console.log(`Server is runnin' on PORT ${PORT}`));
