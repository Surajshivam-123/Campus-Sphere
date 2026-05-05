# Contributing to Campus Sphere

Thanks for your interest in contributing! This guide covers everything you need to get the project running locally and start making meaningful contributions.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
  - [1. Fork & Clone](#1-fork--clone)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Environment Variables](#4-environment-variables)
- [Running the App](#running-the-app)
  - [Option A — Docker (recommended)](#option-a--docker-recommended)
  - [Option B — Manual (without Docker)](#option-b--manual-without-docker)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Contribution Workflow](#contribution-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Reporting Issues](#reporting-issues)

---

## Project Overview

Campus Sphere is a full-stack campus event management platform. It supports:

- Event creation, registration, and scheduling
- Club management with real-time chat
- Team formation and messaging
- Sports modules (Cricket, Coding contests)
- Google OAuth and OTP-based email login
- Real-time features via Socket.IO
- Monitoring via Prometheus + Grafana

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, React Router v7   |
| Backend    | Node.js 18+, Express 5, MongoDB, Mongoose       |
| Real-time  | Socket.IO                                       |
| Auth       | JWT, Passport.js (Google OAuth), OTP via email  |
| Cache      | Redis (optional — app works without it)         |
| Storage    | Cloudinary (image uploads)                      |
| Code exec  | Judge0 (coding contest submissions)             |
| Monitoring | Prometheus, Grafana                             |
| Container  | Docker, Docker Compose                          |

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/) *(for the Docker path)*
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB instance
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) enabled (for OTP emails)
- *(Optional)* A [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce) key for Judge0 (coding contests)
- *(Optional)* A running [Redis](https://redis.io/) instance

---

## Local Setup

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/campus-sphere.git
cd campus-sphere
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

### 3. Frontend Setup

```bash
cd Frontend/client
npm install
```

### 4. Environment Variables

The backend requires a `.env` file. An example is provided:

```bash
cp Backend/.env.example Backend/.env
```

Open `Backend/.env` and fill in the values:

| Variable                  | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| `MONGODB_URI`             | MongoDB connection string (Atlas URI or `mongodb://localhost:27017/dbname`) |
| `PORT`                    | Port the backend listens on (default: `4000`)                               |
| `NODE_ENV`                | `development` or `production`                                               |
| `ACCESS_TOKEN_SECRET`     | Random secret string for JWT access tokens                                  |
| `ACCESS_TOKEN_EXPIRY`     | Access token expiry (e.g. `1d`)                                             |
| `REFRESH_TOKEN_SECRET`    | Random secret string for JWT refresh tokens                                 |
| `REFRESH_TOKEN_EXPIRY`    | Refresh token expiry (e.g. `7d`)                                            |
| `CLOUDINARY_NAME`         | Your Cloudinary cloud name                                                  |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                                                          |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                                                       |
| `FRONTEND_ORIGIN`         | Frontend URL for CORS (e.g. `http://localhost:5173`)                        |
| `FRONTEND_ORIGIN_WITH_PATH` | Full frontend URL including base path                                     |
| `FRONTEND_BASE_PATH`      | Base path of the frontend (e.g. `/Campus-Sphere` for GitHub Pages)          |
| `REDIS_URL`               | Redis connection URL (e.g. `redis://localhost:6379`) — optional             |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID                                                      |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret                                                  |
| `GOOGLE_CALLBACK_URL`     | Must match the redirect URI set in Google Cloud Console                     |
| `EMAIL_USER`              | Gmail address used to send OTP emails                                       |
| `EMAIL_PASS`              | Gmail App Password (not your regular Gmail password)                        |
| `JUDGE0_URL`              | Judge0 API base URL (RapidAPI or self-hosted)                               |
| `JUDGE0_API_KEY`          | RapidAPI key for Judge0 (leave empty if self-hosting)                       |

> **Tip:** Generate strong JWT secrets with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

The frontend reads from `Frontend/client/.env`. For local development, the defaults work out of the box — no changes needed unless you're running the backend on a non-default port.

---

## Running the App

### Option A — Docker (recommended)

This spins up the full stack (frontend, backend, MongoDB, Redis, Prometheus, Grafana) with a single command.

```bash
# First time — copy and fill in the env file
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your secrets, then:

docker compose up --build
```

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost            |
| Backend    | http://localhost:4000       |
| Prometheus | http://localhost:9090       |
| Grafana    | http://localhost:3000 (admin / admin) |

```bash
# Stop containers (data is preserved)
docker compose stop

# Stop and remove containers (data is preserved)
docker compose down

# Stop and wipe all data
docker compose down -v

# Rebuild a single service after code changes
docker compose up --build backend
docker compose up --build frontend

# View logs
docker compose logs -f
docker compose logs backend
```

### Option B — Manual (without Docker)

You'll need MongoDB and Redis running locally (or use Atlas/cloud Redis).

**Backend:**

```bash
cd Backend
npm start
# Server starts on http://localhost:4000
```

**Frontend:**

```bash
cd Frontend/client
npm run dev
# Dev server starts on http://localhost:5173
```

**Lint the frontend:**

```bash
cd Frontend/client
npm run lint
```

---

## Project Structure

```
campus-sphere/
├── Backend/
│   ├── src/
│   │   ├── app.js              # Express app setup, middleware, route registration
│   │   ├── index.js            # Server entry point
│   │   ├── socket.js           # Socket.IO setup
│   │   ├── config/             # App config and Passport.js OAuth setup
│   │   ├── constants/          # Shared constants
│   │   ├── controllers/        # Route handler logic
│   │   ├── db/                 # MongoDB connection
│   │   ├── middlewares/        # Auth, error handling, file upload, validation
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic layer
│   │   ├── sports/
│   │   │   ├── cricket/        # Cricket-specific controllers, models, routes
│   │   │   └── coding/         # Coding contest controllers, models, routes
│   │   └── utils/              # ApiError, ApiResponse, AsyncHandler, Cloudinary, mailer, Redis
│   ├── public/                 # Static files and temp uploads
│   ├── .env.example            # Environment variable template
│   └── Dockerfile
│
├── Frontend/
│   └── client/
│       ├── src/
│       │   ├── App.jsx         # Root component with routing
│       │   ├── components/     # Reusable UI components
│       │   ├── config/         # API base URL, fetch helpers, socket client
│       │   ├── hooks/          # Custom React hooks
│       │   ├── pages/          # Page-level components
│       │   └── routes/         # React Router route definitions
│       ├── public/
│       ├── nginx.conf          # Nginx config (used in Docker)
│       └── Dockerfile
│
├── compose.yaml                # Docker Compose for the full stack
├── DOCKER.md                   # Detailed Docker documentation
└── CONTRIBUTING.md             # This file
```

---

## API Routes

All API routes are prefixed with `/api/cpsh`.

| Prefix                        | Resource                        |
|-------------------------------|---------------------------------|
| `/users`                      | Auth, profile, Google OAuth     |
| `/events`                     | Event CRUD                      |
| `/participants`               | Event participation             |
| `/members`                    | Club membership                 |
| `/teams`                      | Team management                 |
| `/schedule`                   | Event scheduling                |
| `/clubs`                      | Club CRUD and chat              |
| `/event-messages`             | Event chat messages             |
| `/team-messages`              | Team chat messages              |
| `/cricket-players`            | Cricket player management       |
| `/cricket-format`             | Cricket format configuration    |
| `/matches`                    | Cricket match management        |
| `/coding/contest`             | Coding contests                 |
| `/coding/problems`            | Contest problems                |
| `/coding/submissions`         | Code submissions (via Judge0)   |

Health check: `GET /health`  
Prometheus metrics: `GET /metrics`

---

## Contribution Workflow

1. **Create a branch** from `main` for your change:

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes.** Keep commits focused and descriptive.

3. **Test your changes** manually before opening a PR. Make sure the app builds and runs without errors.

4. **Push your branch** and open a Pull Request against `main`:

   ```bash
   git push -u origin feat/your-feature-name
   ```

5. Fill in the PR description — what changed, why, and how to test it.

6. Address any review feedback and get at least one approval before merging.

### Branch naming

| Type    | Pattern                    | Example                        |
|---------|----------------------------|--------------------------------|
| Feature | `feat/<short-description>` | `feat/club-join-requests`      |
| Bug fix | `fix/<short-description>`  | `fix/token-refresh-loop`       |
| Docs    | `docs/<short-description>` | `docs/api-reference`           |
| Chore   | `chore/<short-description>`| `chore/update-dependencies`    |

### Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add OTP resend cooldown
fix: resolve CORS error on Google OAuth callback
docs: update environment variable table
chore: bump mongoose to 8.x
```

---

## Code Style Guidelines

**Backend (Node.js)**
- ES Modules (`import`/`export`) — no `require()`
- Use `AsyncHandler` wrapper for all async route handlers to avoid unhandled promise rejections
- Return responses using `ApiResponse` and throw errors using `ApiError` from `src/utils/`
- Keep controllers thin — move business logic into `src/services/`
- Validate request bodies using the `validate.middleware.js` middleware

**Frontend (React)**
- Functional components with hooks only — no class components
- Use the custom hooks in `src/hooks/` for API calls and auth state
- Use `fetchWithAuth` from `src/config/fetchWithAuth.js` for authenticated requests
- Tailwind CSS for styling — avoid inline styles
- Keep page components in `src/pages/` and reusable UI in `src/components/`

---

## Reporting Issues

- Search [existing issues](https://github.com/Surajshivam-123/campus-sphere/issues) before opening a new one.
- Include steps to reproduce, expected behavior, and actual behavior.
- Attach screenshots or logs where relevant.
- For security vulnerabilities, please open a private issue or contact the maintainers directly rather than posting publicly.
