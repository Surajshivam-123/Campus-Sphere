/**
 * STRESS TEST — Simulate too many users
 * Ramps up from 0 → 200 virtual users to find the breaking point.
 * Watch Grafana dashboards while this runs.
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
    { duration: "30s", target: 10  },  // warm up
    { duration: "1m",  target: 50  },  // normal load
    { duration: "1m",  target: 100 },  // heavy load
    { duration: "1m",  target: 200 },  // stress — breaking point
    { duration: "30s", target: 0   },  // cool down
  ],

  thresholds: {
    http_req_failed:   ["rate<0.10"],   // allow up to 10% errors under stress
    http_req_duration: ["p(95)<2000"],  // p95 must stay under 2s
    error_rate:        ["rate<0.10"],
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

  // Randomly pick an endpoint to simulate realistic mixed traffic
  const rand = Math.random();

  if (rand < 0.3) {
    // 30% — health check (lightest)
    const r = http.get(`${BASE_URL}/health`);
    reqDuration.add(r.timings.duration);
    check(r, { "health ok": (r) => r.status === 200 });
    errorRate.add(r.status >= 400);

  } else if (rand < 0.6) {
    // 30% — login (hits DB + bcrypt)
    const r = http.post(
      `${BASE_URL}/api/cpsh/users/login`,
      JSON.stringify(TEST_USER),
      { headers }
    );
    reqDuration.add(r.timings.duration);
    check(r, { "login ok": (r) => r.status === 200 || r.status === 401 });
    errorRate.add(r.status >= 500);

  } else if (rand < 0.8) {
    // 20% — events list (DB read)
    const r = http.get(`${BASE_URL}/api/cpsh/events`, { headers });
    reqDuration.add(r.timings.duration);
    check(r, { "events not 500": (r) => r.status !== 500 });
    errorRate.add(r.status >= 500);

  } else {
    // 20% — teams list (DB read)
    const r = http.get(`${BASE_URL}/api/cpsh/teams`, { headers });
    reqDuration.add(r.timings.duration);
    check(r, { "teams not 500": (r) => r.status !== 500 });
    errorRate.add(r.status >= 500);
  }

  sleep(Math.random() * 2 + 0.5); // random think time 0.5–2.5s
}
