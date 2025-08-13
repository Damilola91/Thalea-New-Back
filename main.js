const express = require("express");
const cors = require("cors");
const init = require("./db");
require("dotenv").config();
const apartmentRoute = require("./routes/apartment");
const bookingRoute = require("./routes/booking");
const orderRoute = require("./routes/order");

const PORT = process.env.PORT || 4252;

const server = express();

server.use(express.json());
server.use(cors());

server.use("/", apartmentRoute);
server.use("/", bookingRoute);
server.use("/", orderRoute);
init();

server.listen(PORT, () => console.log(`Server is runnin' on PORT ${PORT}`));
