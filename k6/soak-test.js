/**
 * SOAK TEST — Sustained load over time
 * Runs 50 users for 30 minutes to detect memory leaks,
 * connection pool exhaustion, and gradual degradation.
 * Watch Node.js heap and event loop lag in Grafana.
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL  = "http://localhost:4000";
const TEST_USER = { usermail: "csph4", password: "csph4" };

const errorRate   = new Rate("error_rate");
const reqDuration = new Trend("req_duration", true);

export const options = {
  stages: [
    { duration: "2m",  target: 50 },  // ramp up
    { duration: "26m", target: 50 },  // hold — watch for degradation
    { duration: "2m",  target: 0  },  // ramp down
  ],

  thresholds: {
    http_req_failed:   ["rate<0.05"],
    http_req_duration: ["p(95)<1000"],
    error_rate:        ["rate<0.05"],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/cpsh/users/login`,
    JSON.stringify(TEST_USER),
    { headers: { "Content-Type": "application/json" } }
  );
  const token = res.json("data.accessToken");
  if (!token) console.warn("⚠️  Login failed in setup — check TEST_USER credentials.");
  return { token };
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    ...(data.token ? { Authorization: `Bearer ${data.token}` } : {}),
  };

  const rand = Math.random();

  if (rand < 0.4) {
    const r = http.get(`${BASE_URL}/health`);
    reqDuration.add(r.timings.duration);
    check(r, { "health ok": (r) => r.status === 200 });
    errorRate.add(r.status >= 400);
  } else if (rand < 0.7) {
    const r = http.get(`${BASE_URL}/api/cpsh/events`, { headers });
    reqDuration.add(r.timings.duration);
    check(r, { "events ok": (r) => r.status !== 500 });
    errorRate.add(r.status >= 500);
  } else {
    const r = http.post(
      `${BASE_URL}/api/cpsh/users/login`,
      JSON.stringify(TEST_USER),
      { headers }
    );
    reqDuration.add(r.timings.duration);
    check(r, { "login ok": (r) => r.status === 200 || r.status === 401 });
    errorRate.add(r.status >= 500);
  }

  sleep(Math.random() * 3 + 1); // 1–4s think time
}
