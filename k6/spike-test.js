/**
 * SPIKE TEST — Sudden burst of users
 * Simulates a flash crowd (e.g. event registration opens).
 * Goes from 0 to 500 users instantly, then drops back.
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL  = "http://localhost:4000";
const TEST_USER = { usermail: "csph919810@gmail.com", password: "Test@1234" };

const errorRate   = new Rate("error_rate");
const reqDuration = new Trend("req_duration", true);

export const options = {
  stages: [
    { duration: "10s", target: 5   },  // baseline
    { duration: "10s", target: 500 },  // instant spike
    { duration: "1m",  target: 500 },  // hold the spike
    { duration: "10s", target: 5   },  // drop back
    { duration: "30s", target: 0   },  // cool down
  ],

  thresholds: {
    http_req_failed:   ["rate<0.20"],   // allow up to 20% errors during spike
    http_req_duration: ["p(95)<5000"],  // p95 under 5s during spike
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

  // Simulate everyone hitting events at the same time (registration spike)
  const r = http.get(`${BASE_URL}/api/cpsh/events`, { headers });
  reqDuration.add(r.timings.duration);
  check(r, { "not crashed": (r) => r.status < 500 });
  errorRate.add(r.status >= 500);

  sleep(1);
}
