import { describe, it, expect } from "vitest";
import {
  register,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestsInFlight,
  activeSocketConnections,
  dbOperationDuration,
  mongoConnectionState,
} from "../../src/utils/metrics.js";

describe("Metrics Utility", () => {
  it("should have Prometheus registry initialized", async () => {
    expect(register).toBeDefined();
    const metricsString = await register.metrics();
    expect(typeof metricsString).toBe("string");
  });

  it("should record http metrics correctly", async () => {
    expect(httpRequestDuration).toBeDefined();
    expect(httpRequestTotal).toBeDefined();
    expect(httpRequestsInFlight).toBeDefined();

    httpRequestTotal.inc({ method: "GET", route: "/health", status_code: "200" });
    httpRequestsInFlight.inc();
    httpRequestsInFlight.dec();

    const metricsString = await register.metrics();
    expect(metricsString).toContain("campussphere_http_requests_total");
  });

  it("should record socket and db metrics correctly", async () => {
    expect(activeSocketConnections).toBeDefined();
    expect(dbOperationDuration).toBeDefined();
    expect(mongoConnectionState).toBeDefined();

    activeSocketConnections.set(5);
    mongoConnectionState.set(1);

    const metricsString = await register.metrics();
    expect(metricsString).toContain("campussphere_socket_connections_active");
    expect(metricsString).toContain("campussphere_mongodb_connection_state");
  });
});
