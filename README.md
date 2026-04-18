# Campus Sphere

A full-stack campus event management platform. Organizers can create and manage events, participants can join via invite codes, and the platform supports live cricket scoring, coding contests with real-time leaderboards, team management, and a full observability stack.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [API Reference](#api-reference)
7. [Real-time (Socket.IO)](#real-time-socketio)
8. [Cricket Tournament System](#cricket-tournament-system)
9. [Coding Contest Platform](#coding-contest-platform)
10. [Caching Strategy](#caching-strategy)
11. [Authentication](#authentication)
12. [Monitoring & Observability](#monitoring--observability)
13. [Docker Deployment](#docker-deployment)

---

## Features

- **Event Management** — create events with posters, invite codes, rules, and participant limits
- **Two join models** — Participants (individuals) and Members (team/staff) via unique codes
- **Cricket Tournaments** — full tournament lifecycle: format setup → teams → schedule → live ball-by-ball scoring
- **Coding Contests** — problem sets, Judge0 code execution, binary/partial scoring, live leaderboard
- **Real-time updates** — Socket.IO for live match scores, contest events, and submission results
- **Three auth methods** — password, email OTP, Google OAuth
- **Redis caching** — with automatic in-memory fallback
- **Observability** — Prometheus metrics + Grafana dashboards + alert rules

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, TailwindCSS 4, React Router 7, Socket.IO Client |
| Backend | Node.js ≥18, Express 5, Socket.IO 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Cache | Redis 7 (ioredis) with in-memory fallback |
| Auth | JWT, Passport + Google OAuth 2.0, bcrypt |
| File Storage | Multer (temp) + Cloudinary |
| Email | Nodemailer (Gmail) |
| Code Execution | Judge0 (RapidAPI or self-hosted) |
| Monitoring | Prometheus, Grafana, prom-client |
| Reverse Proxy | Nginx |
| Containers | Docker Compose |

---

## Project Structure

```
campus-sphere/
├── Backend/
│   └── src/
│       ├── config/          # App config, Passport strategy
│       ├── constants/       # HTTP status codes, cookie options
│       ├── controllers/     # Event, user, team, participant, member, schedule
│       ├── db/              # MongoDB connection + command monitoring
│       ├── middlewares/     # Auth, event access, metrics, multer, validation, error
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # User service, join request service
│       ├── sports/
│       │   ├── cricket/     # Cricket controllers, models, routes
│       │   └── coding/      # Contest, problem, submission controllers/models/routes
│       ├── utils/           # ApiError, ApiResponse, AsyncHandler, cloudinary, mailer, redis, metrics
│       ├── app.js           # Express app setup
│       ├── socket.js        # Socket.IO server
│       └── index.js         # Entry point
├── Frontend/
│   └── client/
│       └── src/
│           ├── components/  # Shared UI components
│           ├── config/      # API config, fetchWithAuth, socket
│           ├── hooks/       # Custom React hooks
│           └── pages/       # Route-level page components
├── monitoring/
│   ├── prometheus/          # prometheus.yml + alert rules
│   └── grafana/
│       └── provisioning/    # Auto-provisioned datasources, dashboards, alerts
├── compose.yaml             # Full Docker Compose stack
└── DOCKER.md                # Docker setup guide
```

---

## Getting Started

### Prerequisites

- Docker Desktop (recommended)
- Or: Node.js ≥18 + MongoDB + Redis for local dev

### With Docker (recommended)

```bash
# 1. Copy and fill in environment variables
cp Backend/.env.example Backend/.env
# Edit Backend/.env — fill in JWT secrets, Cloudinary, Google OAuth, etc.

# 2. Start everything
docker compose up --build

# 3. Access the app
# Frontend:   http://localhost
# Backend:    http://localhost:4000
# Grafana:    http://localhost:3000  (admin / admin)
# Prometheus: http://localhost:9090
```

### Local Development (without Docker)

```bash
# Backend
cd Backend
npm install
cp .env.example .env   # fill in your values
npm start              # starts on port 4000

# Frontend
cd Frontend/client
npm install
npm run dev            # starts on port 5173
```

---

## Environment Variables

Copy `Backend/.env.example` to `Backend/.env` and fill in the values below.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string |
| `PORT` | yes | Server port (default: 4000) |
| `NODE_ENV` | no | `development` or `production` |
| `ACCESS_TOKEN_SECRET` | yes | JWT secret for access tokens |
| `ACCESS_TOKEN_EXPIRY` | no | Default: `1d` |
| `REFRESH_TOKEN_SECRET` | yes | JWT secret for refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | no | Default: `7d` |
| `CLOUDINARY_NAME` | yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | yes | Cloudinary API secret |
| `FRONTEND_ORIGIN` | yes | Frontend URL for CORS (e.g. `http://localhost:5173`) |
| `REDIS_URL` | no | Redis URL (default: `redis://localhost:6379`) |
| `GOOGLE_CLIENT_ID` | no | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | no | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | no | OAuth callback URL |
| `EMAIL_USER` | no | Gmail address for OTP emails |
| `EMAIL_PASS` | no | Gmail App Password |
| `JUDGE0_URL` | no | Judge0 endpoint (default: RapidAPI hosted) |
| `JUDGE0_API_KEY` | no | RapidAPI key for Judge0 |

> When running via Docker Compose, `MONGODB_URI`, `REDIS_URL`, `FRONTEND_ORIGIN`, and `GOOGLE_CALLBACK_URL` are automatically overridden to point at internal service names.

---

## API Reference

All routes are available under `/api/v1/` (and legacy `/api/cpsh/` for backward compatibility).

### Users — `/api/v1/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | no | Register with avatar upload |
| POST | `/login` | no | Password login |
| POST | `/logout` | yes | Logout, clear tokens |
| POST | `/refresh-token` | no | Rotate access/refresh tokens |
| GET | `/profile` | yes | Get current user |
| POST | `/send-otp` | no | Send OTP to email |
| POST | `/verify-otp` | no | Verify OTP and login |
| GET | `/auth/google` | no | Google OAuth redirect |
| GET | `/auth/google/callback` | no | Google OAuth callback |

### Events — `/api/v1/events`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create` | yes | Create event with poster |
| PATCH | `/update/:eventId` | yes | Update event details |
| DELETE | `/delete/:eventId` | yes | Delete event |
| GET | `/get-all-events` | yes | Organizer's events |
| GET | `/get-single-event/:eventId` | yes | Get event by ID |
| GET | `/public` | no | All public events |
| PATCH | `/:eventId/assign-scorer` | yes | Assign scorer updater |
| DELETE | `/:eventId/revoke-scorer` | yes | Revoke scorer |

### Participants — `/api/v1/participants`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/participate/:participantCode` | yes | Join event as participant |
| GET | `/participate/:participantCode` | yes | Get event by participant code |
| GET | `/my-events` | yes | User's participated events |
| GET | `/get-all-participants/:eventId` | yes | All participants for event |
| DELETE | `/delete-participant/:participantId` | yes | Leave event |

### Members — `/api/v1/members`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/participate/:memberCode` | yes | Join event as member |
| GET | `/get-all-events` | yes | User's member events |
| PATCH | `/edit-role/:memberId` | yes | Update member role |
| GET | `/get-member/:eventId` | yes | All members for event |

### Teams — `/api/v1/teams`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create-team/:eventId` | yes | Create team with logo |
| GET | `/get-team/:eventId` | yes | User's team for event |
| GET | `/get-event-teams/:eventId` | yes | All teams for event |
| PATCH | `/update-team/:eventId` | yes | Update team |
| DELETE | `/delete-team/:eventId` | yes | Delete team |

### Schedule — `/api/v1/schedule`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:eventId` | yes | Get schedule |
| POST | `/:eventId/ai` | yes | AI-generate schedule (Gemini) |
| POST | `/:eventId/manual` | yes | Save manual schedule |

### Cricket — `/api/v1/sports/cricket`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/format/:eventId` | yes | Save tournament format |
| GET | `/format/:eventId` | yes | Get format |
| POST | `/players/join-team/:teamCode/:eventId` | yes | Join team as player |
| GET | `/players/my-team/:eventId` | yes | User's team + players |
| DELETE | `/players/leave-team/:eventId` | yes | Leave team |
| DELETE | `/players/remove-player/:playerId` | yes | Captain removes player |
| GET | `/matches/event/:eventId/is-live` | no | Check if any match is live |
| GET | `/matches/event/:eventId` | yes | All matches for event |
| GET | `/matches/:matchId` | yes | Single match |
| POST | `/matches/event/:eventId/init` | yes | Init matches from schedule |
| PATCH | `/matches/:matchId/start` | yes | Start match, record toss |
| POST | `/matches/:matchId/delivery` | yes | Record delivery (ball-by-ball) |
| POST | `/matches/:matchId/submit-squad` | yes | Captain submits squad |
| POST | `/matches/:matchId/confirm-xi` | yes | Scorer confirms playing XI |
| PATCH | `/matches/:matchId` | yes | Update match metadata |

### Coding — `/api/v1/coding`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/contest/:eventId` | yes | Save contest settings |
| GET | `/contest/:eventId` | yes | Get contest |
| POST | `/contest/:eventId/schedule` | yes | Schedule contest |
| POST | `/contest/:eventId/start` | yes | Start contest |
| POST | `/contest/:eventId/pause` | yes | Pause contest |
| POST | `/contest/:eventId/resume` | yes | Resume contest |
| POST | `/contest/:eventId/extend` | yes | Extend duration |
| POST | `/contest/:eventId/end` | yes | End contest |
| POST | `/contest/:eventId/restart` | yes | Reset to draft |
| POST | `/problems/:eventId` | yes | Create problem |
| GET | `/problems/:eventId` | yes | Get problems |
| PATCH | `/problems/:problemId` | yes | Update problem |
| DELETE | `/problems/:problemId` | yes | Delete problem |
| POST | `/submissions/:eventId/:problemId` | yes | Submit code |
| GET | `/submissions/:submissionId` | yes | Get submission |
| GET | `/submissions/:eventId/my-submissions` | yes | User's submissions |
| GET | `/submissions/:eventId/leaderboard` | yes | Contest leaderboard |

---

## Real-time (Socket.IO)

The backend runs a Socket.IO server on the same port as the HTTP server.

### Rooms

| Room | Purpose |
|---|---|
| `match:<matchId>` | Live match score viewers |
| `event:<eventId>` | Event-wide updates (matches + contests) |
| `user:<userId>` | Personal notifications (submission results) |
| `captain:<userId>` | Captain-specific notifications |
| `organizer:<userId>` | Organizer join request notifications |

### Client → Server Events

```
join:match <matchId>       leave:match <matchId>
join:event <eventId>       leave:event <eventId>
join:contest <eventId>     leave:contest <eventId>
join:user <userId>
join:captain <userId>
join:organizer <userId>
```

### Server → Client Events

| Event | Payload | Trigger |
|---|---|---|
| `match:updated` | Full match object | Every delivery, status change |
| `leaderboard:updated` | `{ eventId }` | Submission accepted |
| `submission:result` | `{ submissionId, status, score, passedCount, totalCount }` | Judging complete |
| `contest:started` | `{ endTime }` | Contest goes live |
| `contest:paused` | `{ pausedAt }` | Contest paused |
| `contest:resumed` | `{ endTime }` | Contest resumed |
| `contest:extended` | `{ endTime, addedMinutes }` | Duration extended |
| `contest:ended` | — | Contest ended |
| `contest:scheduled` | `{ scheduledStartTime }` | Contest scheduled |

---

## Cricket Tournament System

The cricket module supports full tournament management from setup to live scoring.

### Lifecycle

```
Format Setup → Team Creation → Player Registration → Schedule Generation
    → Match Init → Toss → Squad Submission → XI Confirmation → Live Scoring → Result
```

### Tournament Formats

- Knockout, League, Round Robin, Double Elimination

### Match States

```
upcoming → toss_done → squads_ready → live → completed / abandoned
```

### Live Scoring

Ball-by-ball input via `POST /matches/:matchId/delivery` with fields:

```json
{
  "runs": 4,
  "isWicket": false,
  "isWide": false,
  "isNoBall": false,
  "isBye": false,
  "isLegBye": false,
  "batsmanName": "Player A",
  "bowlerName": "Player B",
  "striker": "Player A",
  "nonStriker": "Player C"
}
```

The server handles:
- Batsman/bowler stat updates
- Over completion and strike rotation
- Innings transition
- Chase detection and result calculation
- Immediate Socket.IO broadcast (DB save happens in background)

---

## Coding Contest Platform

### Contest Lifecycle

```
draft → scheduled → live → paused → resumed → ended
                                  ↑___________↓ (can extend while live/paused)
```

### Supported Languages

C++, Python, Java, JavaScript (via Judge0 language IDs)

### Scoring Modes

- **Binary** — full points only if all test cases pass
- **Partial** — proportional points based on test cases passed

### Leaderboard Ranking

1. Total score (descending)
2. Last accepted submission time (ascending) — earlier is better

Leaderboard is cached in Redis for 15 seconds and invalidated on each accepted submission.

### Judge0 Setup

**Option 1 — RapidAPI (free tier):**
```
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key
```

**Option 2 — Self-hosted:**
```
JUDGE0_URL=http://localhost:2358
# Leave JUDGE0_API_KEY empty
```

---

## Caching Strategy

Redis is used as the primary cache with automatic fallback to an in-memory `Map` if Redis is unavailable — the app never crashes due to cache failure.

| Cache Key | TTL | Invalidated on |
|---|---|---|
| `event:<id>` | 5 min | Event update/delete |
| `events:organizer:<id>` | 2 min | Event create/update/delete |
| `events:public` | 2 min | Any event change |
| `matches:event:<id>` | 10 sec | Match update |
| `match:<id>` | 10 sec | Delivery recorded |
| `contest:<id>` | 60 sec | Contest state change |
| `leaderboard:<id>` | 15 sec | Submission accepted |

---

## Authentication

### Password Login

Standard email/password with bcrypt hashing. Returns JWT access + refresh tokens as HTTP-only cookies.

### OTP Login

1. `POST /users/send-otp` — sends a 6-digit OTP to the email (valid 10 minutes)
2. `POST /users/verify-otp` — verifies OTP, returns tokens

### Google OAuth

1. `GET /users/auth/google` — redirects to Google consent screen
2. `GET /users/auth/google/callback` — creates/finds user, sends welcome email on first login, redirects to frontend with token

### Token Refresh

`POST /users/refresh-token` — validates refresh token, issues new access + refresh token pair.

### Event Access Control

The `verifyEventAccess` middleware checks if the user is any of:
- Event organizer
- Assigned scorer updater
- Member (joined via memberCode)
- Participant (joined via participantCode)
- Cricket player (in a team for this event)
- Coding participant (has a submission for this event)

---

## Monitoring & Observability

### Prometheus Metrics

Exposed at `GET /metrics` on the backend.

| Metric | Type | Description |
|---|---|---|
| `campussphere_http_request_duration_seconds` | Histogram | Request latency by method/route/status |
| `campussphere_http_requests_total` | Counter | Total requests |
| `campussphere_http_requests_in_flight` | Gauge | Concurrent requests |
| `campussphere_socket_connections_active` | Gauge | Active Socket.IO connections |
| `campussphere_db_operation_duration_seconds` | Histogram | MongoDB operation times by op/collection |
| `campussphere_mongodb_connection_state` | Gauge | 1 = connected, 0 = disconnected |
| `campussphere_nodejs_*` | Various | Default Node.js metrics (heap, GC, event loop) |

### Grafana Dashboards

Access at `http://localhost:3000` (admin / admin)

**CampusSphere Overview:**
- HTTP request rate, latency (p50/p95/p99), error rate
- In-flight requests, active Socket.IO connections
- Node.js heap memory, event loop lag, GC duration
- MongoDB connection state, operation duration (p95)
- Redis memory usage, commands/sec
- Scrape health table

**Windows Host Metrics:**
- CPU usage (total + per core)
- Memory used/free/total
- Disk read/write bytes/sec, free space per volume
- Network bytes sent/received
- Running processes and threads

### Alert Rules

| Alert | Condition |
|---|---|
| BackendDown | Backend unreachable for 1 min |
| HighErrorRate | >5% 5xx responses for 2 min |
| SlowRequests | p95 latency >2s for 5 min |
| HighInFlightRequests | >100 concurrent requests for 2 min |
| HighHeapUsage | Heap >90% for 5 min |
| RedisDown | Redis exporter unreachable for 1 min |
| HighRedisMemory | Redis using >85% max memory for 5 min |

### Windows Host Metrics Setup

Install `windows_exporter` natively (runs outside Docker):

1. Download the `.msi` from [windows_exporter releases](https://github.com/prometheus-community/windows_exporter/releases)
2. Run the installer — it registers as a Windows Service
3. Verify: `http://localhost:9182/metrics`

> If skipped, the `windows-host` Prometheus target shows DOWN but everything else works fine.

---

## Docker Deployment

### Services

| Service | Port | Description |
|---|---|---|
| frontend | 80 | React SPA + Nginx reverse proxy |
| backend | 4000 | Node.js API + Socket.IO |
| mongo | — | MongoDB 7 (internal only) |
| redis | — | Redis 7 (internal only) |
| prometheus | 9090 | Metrics collection |
| grafana | 3000 | Dashboards |
| redis-exporter | 9121 | Redis metrics for Prometheus |

### Startup Order

```
mongo (healthy) ──┐
                  ├──► backend ──► frontend
redis (healthy) ──┘
                  └──► prometheus ──► grafana
```

### Common Commands

```bash
# First time
cp Backend/.env.example Backend/.env
docker compose up --build

# Day-to-day
docker compose up           # start
docker compose stop         # pause (keeps data)
docker compose down         # stop + remove containers (keeps volumes)
docker compose down -v      # stop + wipe all data

# Logs
docker compose logs -f
docker compose logs backend

# Rebuild one service after code change
docker compose up --build backend
docker compose up --build frontend

# Restart Grafana after dashboard changes
docker compose restart grafana
```

### Useful URLs

| Service | URL |
|---|---|
| App | http://localhost |
| Backend API | http://localhost:4000 |
| Backend Health | http://localhost:4000/health |
| Backend Metrics | http://localhost:4000/metrics |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Prometheus Targets | http://localhost:9090/targets |
| Redis Exporter | http://localhost:9121/metrics |
| Windows Exporter | http://localhost:9182/metrics |
