# CampusSphere Load Tests

Four k6 scripts to measure latency and simulate user load.

---

## Prerequisites

1. k6 installed — verify with `k6 version`
2. Docker stack running — `docker compose up -d`
3. A valid user in the database — update `usermail` and `password` in each script if needed
4. Grafana open at `http://localhost:3000` to watch metrics live

---

## Test Types

| Script | Users | Duration | Purpose |
|--------|-------|----------|---------|
| `latency-test.js` | 20 | 1 min | Measure p50/p95/p99 response times |
| `stress-test.js` | 0→200 | ~4 min | Find the breaking point |
| `spike-test.js` | 0→500 | ~2 min | Simulate a sudden burst |
| `soak-test.js` | 50 | 30 min | Detect memory leaks / degradation |

---

## How to Run

Run from the project root. Make sure the backend is up first.

### 1. Latency Test (start here)
```bash
k6 run k6/latency-test.js
```
What to watch in Grafana:
- HTTP Request Duration (p50/p95/p99)
- In-Flight Requests
- Node.js Heap Used

### 2. Stress Test
```bash
k6 run k6/stress-test.js
```
What to watch in Grafana:
- HTTP Error Rate (4xx/5xx) — should spike as users increase
- Event Loop Lag — rises under pressure
- In-Flight Requests — watch for queue buildup

### 3. Spike Test
```bash
k6 run k6/spike-test.js
```
What to watch in Grafana:
- Request rate jumping from ~5 to ~500 req/s instantly
- Whether the server recovers after the spike drops

### 4. Soak Test (long running)
```bash
k6 run k6/soak-test.js
```
What to watch in Grafana:
- Node.js Heap Used — should stay flat, not grow over time
- Event Loop Lag — should stay under 100ms
- HTTP p95 latency — should not degrade over 30 minutes

---

## Reading k6 Output

After each run k6 prints a summary:

```
✓ health ok
✓ login ok

checks.........................: 98.50%  ✓ 5910  ✗ 89
data_received..................: 4.2 MB  70 kB/s
data_sent......................: 1.1 MB  18 kB/s
http_req_duration..............: avg=142ms  min=8ms  med=98ms  max=4.2s  p(90)=310ms  p(95)=480ms
http_req_failed................: 1.48%   ✓ 89    ✗ 5910
http_reqs......................: 5999    99.98/s
iteration_duration.............: avg=2.1s
iterations.....................: 2001    33.35/s
vus............................: 20      min=20   max=20
```

Key numbers to look at:

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| `http_req_duration p(95)` | < 300ms | 300–1000ms | > 1s |
| `http_req_failed` | < 1% | 1–5% | > 5% |
| `http_req_duration avg` | < 200ms | 200–500ms | > 500ms |

---

## Updating Credentials

All scripts share a single `TEST_USER` constant at the top of each file.
Change it to a real user in your Atlas database:

```js
const TEST_USER = { usermail: "your@email.com", password: "yourpassword" };
```

---

## Fix k6 PATH on Windows

If `k6` is not recognized in your terminal, add it to PATH permanently:

```powershell
# Find k6 location
Get-ChildItem "C:\k6" -Recurse -Filter "k6.exe"

# Add to PATH for current session
$env:PATH += ";C:\k6\k6-v0.55.0-windows-amd64"

# Or run directly with full path
C:\k6\k6-v0.55.0-windows-amd64\k6.exe run k6/latency-test.js
```

To add permanently: System Properties → Environment Variables → Path → New → paste the folder path.

---

## Viewing Results in Grafana

k6 results appear automatically in Grafana via Prometheus because the backend
exposes `campussphere_http_request_duration_seconds` and
`campussphere_http_requests_total` — these update in real time as k6 hammers
the endpoints.

Open `http://localhost:3000` → CampusSphere Overview dashboard while a test runs.

To see k6's own metrics (VUs, iterations) in Grafana natively, you can output
results to Prometheus remote write:

```bash
k6 run --out experimental-prometheus-rw k6/stress-test.js
```

This requires setting `K6_PROMETHEUS_RW_SERVER_URL`:
```bash
$env:K6_PROMETHEUS_RW_SERVER_URL = "http://localhost:9090/api/v1/write"
k6 run --out experimental-prometheus-rw k6/stress-test.js
```

---

## What Each Test Tells You

**Latency test** — baseline numbers. Run this first to know your normal p95.
If p95 > 500ms with only 20 users, you have a problem before load even starts.

**Stress test** — find where things break. The ramp from 10→200 users shows
exactly at which VU count errors start appearing and latency spikes.

**Spike test** — resilience check. Does the server crash under a sudden burst?
Does it recover when load drops? A good server should recover within seconds.

**Soak test** — memory leak detection. If heap grows steadily over 30 minutes
without GC bringing it back down, you have a leak. Event loop lag creeping up
means the server is getting overwhelmed over time.
