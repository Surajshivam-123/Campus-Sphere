/**
 * LATENCY TEST
 * Measures response time percentiles (p50, p95, p99) under normal load.
 * Simulates 20 concurrent users for 1 minute.
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

// ── CONFIG — update these to a real user in your Atlas database ──────────────
const BASE_URL  = "http://localhost:4000";
const TEST_USER = { usermail: "csph4", password: "csph4" };
// ─────────────────────────────────────────────────────────────────────────────

// Custom metrics
const loginLatency   = new Trend("login_latency",   true);
const eventsLatency  = new Trend("events_latency",  true);
const healthLatency  = new Trend("health_latency",  true);
const errorRate      = new Rate("error_rate");

export const options = {
  vus: 20,           // 20 virtual users
  duration: "1m",    // run for 1 minute

  thresholds: {
    // 95% of all requests must finish within 500ms
    http_req_duration: ["p(95)<500"],
    // login p95 must be under 1s
    login_latency: ["p(95)<1000"],
    // error rate must stay below 5%
    error_rate: ["rate<0.05"],
  },
};

// Runs once before the test — get a valid token
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/cpsh/users/login`,
    JSON.stringify(TEST_USER),
    { headers: { "Content-Type": "application/json" } }
  );
  const token = res.json("data.accessToken");
  if (!token) console.warn("⚠️  Login failed in setup — running without auth token. Check TEST_USER credentials.");
  return { token };
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    ...(data.token ? { Authorization: `Bearer ${data.token}` } : {}),
  };

  // 1. Health check
  const health = http.get(`${BASE_URL}/health`);
  healthLatency.add(health.timings.duration);
  check(health, { "health 200": (r) => r.status === 200 });
  errorRate.add(health.status >= 400);

  sleep(0.5);

  // 2. Login
  const login = http.post(
    `${BASE_URL}/api/cpsh/users/login`,
    JSON.stringify(TEST_USER),
    { headers }
  );
  loginLatency.add(login.timings.duration);
  check(login, {
    "login 200": (r) => r.status === 200,
    "login has token": (r) => r.json("data.accessToken") !== undefined,
  });
  errorRate.add(login.status >= 400);

  sleep(0.5);

  // 3. Get events list
  const events = http.get(`${BASE_URL}/api/cpsh/events`, { headers });
  eventsLatency.add(events.timings.duration);
  check(events, { "events not 500": (r) => r.status !== 500 });
  errorRate.add(events.status >= 500);

  sleep(1);
}
