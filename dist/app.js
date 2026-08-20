"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const requestLogger_1 = __importDefault(require("./middlewares/requestLogger"));
const security_1 = require("./middlewares/security");
const swagger_1 = require("./config/swagger");
const userRoute_1 = __importDefault(require("./modules/user/userRoute"));
const authRoute_1 = __importDefault(require("./modules/auth/authRoute"));
const apartmentRoute_1 = __importDefault(require("./modules/apartment/apartmentRoute"));
const bookingRoute_1 = __importDefault(require("./modules/booking/bookingRoute"));
const orderRoute_1 = __importDefault(require("./modules/order/orderRoute"));
const newsletterRoute_1 = __importDefault(require("./modules/newsletter/newsletterRoute"));
const offerRoute_1 = __importDefault(require("./modules/offer/offerRoute"));
const cloudinaryRoute_1 = __importDefault(require("./modules/cloudinary/cloudinaryRoute"));
const stripeWebhookRoute_1 = __importDefault(require("./modules/stripe/stripeWebhookRoute"));
const healthRoute_1 = __importDefault(require("./modules/health/healthRoute"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const errorResponse_1 = __importDefault(require("./middlewares/errorResponse"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
const allowedOrigins = [
    env_1.env.FRONTEND_URL,
    "https://www.thaleapalermoapartment.it",
    "https://nuovo-frontend-thalea.vercel.app",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
};
app.use(requestLogger_1.default);
app.use(security_1.helmetMiddleware);
app.use(security_1.globalRateLimit);
// ⚠️ Webhook Stripe — prima di express.json() per preservare il body grezzo
app.use("/api/stripe", stripeWebhookRoute_1.default);
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
app.use((0, cookie_parser_1.default)());
// Swagger — solo in development
if (env_1.env.NODE_ENV !== "production") {
    app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
}
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Thalea backend running" });
});
app.use("/health", healthRoute_1.default);
app.use("/api/users", userRoute_1.default);
app.use("/api/auth", authRoute_1.default);
app.use("/api/apartments", apartmentRoute_1.default);
app.use("/api/bookings", bookingRoute_1.default);
app.use("/api/orders", orderRoute_1.default);
app.use("/api/newsletter", newsletterRoute_1.default);
app.use("/api/offers", offerRoute_1.default);
app.use("/api/cloudinary", cloudinaryRoute_1.default);
app.use(notFound_1.default);
app.use(errorResponse_1.default);
exports.default = app;
