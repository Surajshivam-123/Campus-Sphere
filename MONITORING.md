# CampusSphere Monitoring Guide

A step-by-step guide to get Prometheus + Grafana running and visualizing your data.

---

## Prerequisites

- Docker Desktop installed and running
- The project cloned locally
- A terminal open at the project root

---

## Step 1 — Install windows_exporter on your Windows host

Prometheus needs to scrape your Windows machine's CPU, memory, and disk metrics.
This runs **natively on Windows**, outside Docker.

1. Download the latest release from:
   https://github.com/prometheus-community/windows_exporter/releases

2. Grab the `.msi` installer (e.g. `windows_exporter-0.29.2-amd64.msi`)

3. Run the installer — it installs as a Windows Service that auto-starts.

4. Verify it's running by opening your browser:
   ```
   http://localhost:9182/metrics
   ```
   You should see a wall of text starting with `# HELP windows_...`

> If you skip this step, the `windows-host` job in Prometheus will show as DOWN,
> but everything else will still work fine.

---

## Step 2 — Start the full stack

From the project root:

```bash
docker compose up -d
```

This starts: backend, frontend, mongo, redis, prometheus, grafana,
mongodb-exporter, and redis-exporter.

Wait about 30 seconds for everything to initialize, then verify:

```bash
docker compose ps
```

All services should show `running` or `healthy`.

---

## Step 3 — Verify Prometheus is scraping

Open Prometheus in your browser:
```
http://localhost:9090
```

### Check scrape targets

Go to **Status → Targets** (top menu).

You should see these jobs and their state:

| Job | Expected State |
|-----|---------------|
| campussphere-backend | UP |
| mongodb | UP |
| redis | UP |
| prometheus | UP |
| windows-host | UP (if windows_exporter installed) |
| node-exporter | only if started with `--profile linux` |

If a target shows **DOWN**, click the error link next to it to see why.

### Run a test query

Click **Graph** in the top menu, paste this into the query box and hit Execute:

```
campussphere_http_requests_total
```

If you see results, Prometheus is successfully scraping your backend.

Try a few more to confirm everything is working:

```promql
# Request rate per second (last 5 min)
rate(campussphere_http_requests_total[5m])

# Node.js heap used
campussphere_nodejs_heap_size_used_bytes

# Redis memory
redis_memory_used_bytes

# MongoDB connections
mongodb_connections
```

---

## Step 4 — Open Grafana

```
http://localhost:3000
```

Login with:
- Username: `admin`
- Password: `admin`

Grafana will ask you to change the password — you can skip this for local dev.

---

## Step 5 — Verify the datasource

1. Click the **hamburger menu** (☰) → **Connections** → **Data sources**
2. You should see **Prometheus** already listed (auto-provisioned)
3. Click it → scroll down → click **Save & test**
4. You should see a green **"Successfully queried the Prometheus API"** message

If it fails, make sure Prometheus is running (`docker compose ps`).

---

## Step 6 — Open the pre-built dashboards

1. Click ☰ → **Dashboards**
2. Open the **CampusSphere** folder
3. You'll see two dashboards:

### CampusSphere Overview
Click to open. You'll see panels for:
- HTTP request rate and latency (p50/p95/p99)
- Error rate (4xx / 5xx)
- In-flight requests and active Socket.IO connections
- Node.js heap memory and event loop lag
- Process CPU and GC duration
- MongoDB connections and operation duration
- Redis memory and commands/sec
- Container CPU and memory
- Scrape health table (shows UP/DOWN for all jobs)

### Windows Host Metrics
Click to open. You'll see:
- CPU usage % (total and per core)
- Memory used/free/total
- Disk read/write bytes per second
- Disk free space per volume
- Network bytes sent/received
- Running processes and threads

> If panels show "No data", generate some traffic first (see Step 7).

---

## Step 7 — Generate traffic to see live data

The dashboards need real HTTP traffic to show meaningful graphs.
Open a terminal and run a few requests:

```bash
# Health check
curl http://localhost:4000/health

# Hit the metrics endpoint directly
curl http://localhost:4000/metrics

# Make some API calls (adjust to your actual routes)
curl http://localhost:4000/api/v1/events
curl http://localhost:4000/api/v1/users
```

Or use a loop to generate continuous traffic:

```bash
# Windows PowerShell
while ($true) { curl http://localhost:4000/health; Start-Sleep 2 }

# Git Bash / WSL
while true; do curl -s http://localhost:4000/health > /dev/null; sleep 2; done
```

Go back to Grafana → CampusSphere Overview and you should see the graphs updating.

---

## Step 8 — Explore data with Grafana Explore

For ad-hoc queries without a dashboard:

1. Click ☰ → **Explore**
2. Make sure **Prometheus** is selected in the top-left dropdown
3. Type a PromQL query in the query box

Useful queries to try:

```promql
# HTTP request rate by route
sum(rate(campussphere_http_requests_total[1m])) by (route)

# p95 latency across all routes
histogram_quantile(0.95,
  sum(rate(campussphere_http_request_duration_seconds_bucket[1m])) by (le)
)

# Error ratio (should be near 0)
sum(rate(campussphere_http_requests_total{status_code=~"5.."}[5m]))
/
sum(rate(campussphere_http_requests_total[5m]))

# Node.js heap usage %
campussphere_nodejs_heap_size_used_bytes
/
campussphere_nodejs_heap_size_total_bytes * 100

# Active socket connections
campussphere_socket_connections_active

# Redis hit rate
rate(redis_keyspace_hits_total[1m])
/
(rate(redis_keyspace_hits_total[1m]) + rate(redis_keyspace_misses_total[1m]))
```

Switch between **Table** and **Graph** views using the buttons at the top right of the results.

---

## Step 9 — Check Prometheus alert rules

1. In Prometheus (`http://localhost:9090`), go to **Alerts** in the top menu
2. You'll see all rules from `monitoring/prometheus/rules/alerts.yml`
3. Each rule shows one of three states:
   - **green (Inactive)** — condition is not met, all good
   - **yellow (Pending)** — condition is met but hasn't lasted long enough yet
   - **red (Firing)** — alert is active

Current rules and what triggers them:

| Alert | Triggers when |
|-------|--------------|
| BackendDown | Backend unreachable for 1 min |
| HighErrorRate | >5% of requests return 5xx for 2 min |
| SlowRequests | p95 latency >2s for 5 min |
| HighInFlightRequests | >100 concurrent requests for 2 min |
| HighHeapUsage | Heap >90% full for 5 min |
| MongoDBDown | MongoDB exporter unreachable for 1 min |
| RedisDown | Redis exporter unreachable for 1 min |
| HighRedisMemory | Redis using >85% of max memory for 5 min |
| HighMongoDBConnections | >200 active MongoDB connections for 5 min |

---

## Step 10 — Configure email alerts (optional)

To receive email notifications when alerts fire, add SMTP settings to `compose.yaml`
under the `grafana` service environment:

```yaml
grafana:
  environment:
    GF_SMTP_ENABLED: "true"
    GF_SMTP_HOST: "smtp.gmail.com:587"
    GF_SMTP_USER: "your-email@gmail.com"
    GF_SMTP_PASSWORD: "your-app-password"
    GF_SMTP_FROM_ADDRESS: "your-email@gmail.com"
    GF_SMTP_FROM_NAME: "CampusSphere Alerts"
```

Then update the recipient address in:
`monitoring/grafana/provisioning/alerting/contactpoints.yml`

```yaml
settings:
  addresses: your-real-email@example.com
```

Restart Grafana to apply:
```bash
docker compose restart grafana
```

---

## Step 11 — Build a custom panel (optional)

To add your own panel to a dashboard:

1. Open any dashboard → click **Edit** (top right)
2. Click **Add** → **Visualization**
3. In the query editor at the bottom, enter a PromQL expression, e.g.:
   ```promql
   rate(campussphere_http_requests_total{status_code="200"}[1m])
   ```
4. Choose a visualization type (Time series, Stat, Gauge, Bar chart, Table)
5. Set a title and configure units in the right panel (e.g. `reqps` for requests/sec)
6. Click **Apply** → **Save dashboard** (floppy disk icon, top right)

---

## Useful URLs Summary

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | none |
| Prometheus Targets | http://localhost:9090/targets | none |
| Prometheus Alerts | http://localhost:9090/alerts | none |
| Backend Metrics | http://localhost:4000/metrics | none |
| Backend Health | http://localhost:4000/health | none |
| MongoDB Exporter | http://localhost:9216/metrics | none |
| Redis Exporter | http://localhost:9121/metrics | none |
| Windows Exporter | http://localhost:9182/metrics | none (host only) |

---

## Troubleshooting

**Grafana shows "No data" on all panels**
- Make sure Prometheus is UP: `docker compose ps`
- Check the datasource: ☰ → Connections → Data sources → Prometheus → Save & test
- Generate some traffic (Step 7)

**A Prometheus target is DOWN**
- Go to http://localhost:9090/targets and click the error message
- Common cause: the exporter container crashed — check with `docker compose logs mongodb-exporter`

**windows-host target is DOWN**
- Make sure windows_exporter is installed and running (Step 1)
- Check: http://localhost:9182/metrics in your browser

**Grafana dashboards folder is empty**
- Check that the volume mount is correct: `docker compose logs grafana`
- The provisioning path must be `/etc/grafana/provisioning`

**Changes to dashboard JSON not showing in Grafana**
- Grafana re-reads dashboard files every 30 seconds (set in `dashboard.yml`)
- Or restart: `docker compose restart grafana`

---

## Stopping the stack

```bash
# Stop everything but keep data volumes
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v
```
