import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import userRoute from "./modules/user/userRoute";
// import authRoute from './modules/auth/auth.route';
// import apartmentRoute from './modules/apartment/apartment.route';
// import bookingRoute from './modules/booking/booking.route';
// import orderRoute from './modules/order/order.route';
// import newsletterRoute from './modules/newsletter/newsletter.route';

import notFoundMiddleware from "./middlewares/notFound";
import errorMiddleware from "./middlewares/errorResponse";

const app = express();

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://www.thaleapalermoapartment.it",
  "https://nuovo-frontend-thalea.vercel.app",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors(corsOptions));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Thalea backend running",
  });
});

app.use("/api/users", userRoute);

// app.use('/api/auth', authRoute);
// app.use('/api/apartments', apartmentRoute);
// app.use('/api/bookings', bookingRoute);
// app.use('/api/orders', orderRoute);
// app.use('/api/newsletter', newsletterRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
