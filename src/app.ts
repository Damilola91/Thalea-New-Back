import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import requestLogger from "./middlewares/requestLogger";
import { helmetMiddleware, globalRateLimit } from "./middlewares/security";
import { swaggerSpec } from "./config/swagger";
import userRoute from "./modules/user/userRoute";
import authRoute from "./modules/auth/authRoute";
import apartmentRoute from "./modules/apartment/apartmentRoute";
import bookingRoute from "./modules/booking/bookingRoute";
import orderRoute from "./modules/order/orderRoute";
import newsletterRoute from "./modules/newsletter/newsletterRoute";
import offerRoute from "./modules/offer/offerRoute";
import cloudinaryRoute from "./modules/cloudinary/cloudinaryRoute";
import stripeWebhookRoute from "./modules/stripe/stripeWebhookRoute";
import healthRoute from "./modules/health/healthRoute";
import notFoundMiddleware from "./middlewares/notFound";
import errorMiddleware from "./middlewares/errorResponse";
import { env } from "./config/env";

const app = express();

const allowedOrigins: string[] = [
  env.FRONTEND_URL,
  "https://www.thaleapalermoapartment.it",
  "https://nuovo-frontend-thalea.vercel.app",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
};

app.use(requestLogger);
app.use(helmetMiddleware);
app.use(globalRateLimit);

// ⚠️ Webhook Stripe — prima di express.json() per preservare il body grezzo
app.use("/api/stripe", stripeWebhookRoute);

app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Swagger — solo in development
if (env.NODE_ENV !== "production") {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Thalea backend running" });
});

app.use("/health", healthRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/apartments", apartmentRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/orders", orderRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/offers", offerRoute);
app.use("/api/cloudinary", cloudinaryRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
