import {
  httpRequestDuration,
  httpRequestTotal,
  httpRequestsInFlight,
} from "../utils/metrics.js";

export const metricsMiddleware = (req, res, next) => {
  // Skip the metrics endpoint itself
  if (req.path === "/metrics") return next();

  const start = process.hrtime();
  httpRequestsInFlight.inc();

  res.on("finish", () => {
    const [s, ns] = process.hrtime(start);
    const duration = s + ns / 1e9;

    // Normalize route: use matched route pattern or fall back to path
    const route = req.route?.path
      ? `${req.baseUrl || ""}${req.route.path}`
      : req.path;

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    httpRequestsInFlight.dec();
  });

  next();
};
