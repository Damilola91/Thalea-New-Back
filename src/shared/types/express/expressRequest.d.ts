import "express-serve-static-core";
import type { Logger } from "pino";

interface JwtPayload {
  userId: string;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    id: string;
    log: Logger;
    user?: JwtPayload;
  }
}
