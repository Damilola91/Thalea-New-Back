import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Thalea Backend API",
      version: "1.0.0",
      description:
        "API per la gestione di prenotazioni, pagamenti e utenti dell'appartamento Thalea Palermo.",
    },
    servers: [
      {
        url:
          env.NODE_ENV === "production"
            ? "https://thalea-new-back.onrender.com"
            : `http://localhost:${env.PORT}`,
        description:
          env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            statusCode: { type: "number" },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*Route.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
