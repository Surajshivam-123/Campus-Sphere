import client from "prom-client";

// Collect default Node.js metrics (event loop, memory, CPU, GC, etc.)
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: "campussphere_" });

// ── HTTP metrics ──────────────────────────────────────────────────────────1───
// How long each request took, bucketed by time ranges
export const httpRequestDuration = new client.Histogram({
  name: "campussphere_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Total requests ever, never decreases
export const httpRequestTotal = new client.Counter({
  name: "campussphere_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// Requests currently being processed right now
export const httpRequestsInFlight = new client.Gauge({
  name: "campussphere_http_requests_in_flight",
  help: "Number of HTTP requests currently being processed",
  registers: [register],
});

// ── Business metrics ──────────────────────────────────────────────────────────
export const activeSocketConnections = new client.Gauge({
  name: "campussphere_socket_connections_active",
  help: "Number of active Socket.IO connections",
  registers: [register],
});

export const dbOperationDuration = new client.Histogram({
  name: "campussphere_db_operation_duration_seconds",
  help: "Duration of MongoDB operations in seconds",
  labelNames: ["operation", "collection"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const mongoConnectionState = new client.Gauge({
  name: "campussphere_mongodb_connection_state",
  help: "MongoDB connection state (1 = connected, 0 = disconnected)",
  registers: [register],
});

export { register };
