# Docker Setup — Campus Sphere

This document explains how Docker is used to containerize and run the Campus Sphere application.

---

## Overview

The application is split into 4 containers managed by Docker Compose:

```
Browser
  └── http://localhost (port 80)
        └── Frontend (Nginx)
              ├── serves React SPA
              ├── /api/*       → proxied to Backend (port 3000)
              └── /socket.io/* → proxied to Backend (WebSocket)

Backend (Node.js + Express)
  ├── connects to MongoDB
  └── connects to Redis
```

---

## Containers

### 1. `frontend` — React + Nginx
- **Dockerfile:** `Frontend/client/Dockerfile`
- Uses a **multi-stage build**:
  - Stage 1 (`builder`): installs Node.js deps and runs `vite build` to produce a static `dist/` folder
  - Stage 2: copies the `dist/` into an Nginx image — no Node.js in the final image
- `VITE_API_URL` is intentionally set to empty at build time so the app uses relative URLs (`/api/...`) instead of hardcoded hostnames
- Nginx serves the SPA and proxies API/WebSocket traffic to the backend container
- Accessible at: `http://localhost`

### 2. `backend` — Node.js + Express
- **Dockerfile:** `Backend/Dockerfile`
- Installs only production dependencies (`npm ci --omit=dev`)
- Reads config from `Backend/.env` (secrets, Cloudinary, Google OAuth, etc.)
- `MONGODB_URI` and `REDIS_URL` are overridden by Compose to point at the internal `mongo` and `redis` service names
- Accessible at: `http://localhost:4000`

### 3. `mongo` — MongoDB 7
- Uses the official `mongo:7` image — no custom Dockerfile needed
- Data is persisted in a named volume `mongo_data` so it survives container restarts
- Has a healthcheck; the backend waits for it to be healthy before starting

### 4. `redis` — Redis 7
- Uses the official `redis:7-alpine` image
- Data persisted in `redis_data` volume
- The backend has a graceful fallback to in-memory cache if Redis is unavailable
- Has a healthcheck; the backend waits for it to be healthy before starting

---

## Nginx Proxy (why it matters)

Inside Docker, containers talk to each other using **service names** (e.g. `http://backend:3000`), not `localhost`. The browser however only knows `localhost`.

Nginx bridges this gap:

```
Browser → GET /api/events
  → Nginx receives it on port 80
  → Nginx forwards to http://backend:3000/api/events
  → Response sent back to browser
```

This is configured in `Frontend/client/nginx.conf`.

---

## Startup Order

Docker Compose enforces this order via `depends_on`:

```
mongo (healthy) ──┐
                  ├──► backend (starts) ──► frontend (starts)
redis (healthy) ──┘
```

---

## Volumes

| Volume       | Used by | Purpose                        |
|--------------|---------|--------------------------------|
| `mongo_data` | mongo   | Persists database across restarts |
| `redis_data` | redis   | Persists cache across restarts    |

---

## Common Commands

```bash
# First time setup
cp Backend/.env.example Backend/.env
# Fill in secrets in Backend/.env, then:
docker compose up --build

# Start (after first build)
docker compose up

# Stop (pause, keeps data)
docker compose stop

# Start again after stop
docker compose start

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and wipe all data volumes
docker compose down -v

# View logs
docker compose logs -f
docker compose logs backend
docker compose logs frontend

# Rebuild a single service after code change
docker compose up --build backend
docker compose up --build frontend
```

---

## Environment Variables

Secrets are never baked into the Docker image. They are injected at runtime via `Backend/.env`.

The `compose.yaml` overrides two variables regardless of what's in `.env`:

| Variable      | Overridden to                        | Reason                              |
|---------------|--------------------------------------|-------------------------------------|
| `MONGODB_URI` | `mongodb://mongo:27017/campussphere` | Points to the internal mongo service |
| `REDIS_URL`   | `redis://redis:6379`                 | Points to the internal redis service |

All other variables (JWT secrets, Cloudinary, Google OAuth, etc.) must be filled in `Backend/.env`.


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