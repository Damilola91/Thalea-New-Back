import pinoHttp from "pino-http";
import logger from "../shared/utils/logger/logger";

const requestLogger = pinoHttp({
  logger,

  genReqId: (req) => {
    const incoming = req.headers["x-request-id"];

    if (typeof incoming === "string" && incoming.trim()) {
      return incoming;
    }

    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  },

  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
    err(err) {
      return {
        message: err.message,
        stack: err.stack,
      };
    },
  },

  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} -> ${res.statusCode}`,

  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} -> ${res.statusCode} ERROR: ${err.message}`,
});

export default requestLogger;
