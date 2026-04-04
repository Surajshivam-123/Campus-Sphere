# Campus Sphere — Project Documentation

> A full-stack campus event management platform supporting cricket tournaments, cultural events, and workshops with real-time live scoring.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Database Design (ERD)](#4-database-design-erd)
5. [Backend — API Reference](#5-backend--api-reference)
6. [Backend — Data Flow](#6-backend--data-flow)
7. [Authentication Flow](#7-authentication-flow)
8. [WebSocket / Real-time Flow](#8-websocket--real-time-flow)
9. [Caching Strategy](#9-caching-strategy)
10. [Frontend — Application Structure](#10-frontend--application-structure)
11. [Frontend — Route Map](#11-frontend--route-map)
12. [Frontend — State & Data Layer](#12-frontend--state--data-layer)
13. [Cricket Tournament Workflow](#13-cricket-tournament-workflow)
14. [File Upload Flow](#14-file-upload-flow)
15. [Infrastructure & Deployment](#15-infrastructure--deployment)
16. [Environment Variables](#16-environment-variables)
17. [Project File Structure](#17-project-file-structure)

---

## 1. Project Overview

Campus Sphere is a web application that lets students and organizers manage campus events end-to-end. An organizer creates an event, shares invite codes, and participants/members join. For cricket events, the platform handles team formation, AI-generated tournament schedules, ball-by-ball live scoring, and real-time scoreboards via WebSockets.

**Core capabilities:**
- Create and manage events (Cricket, Cultural, Workshop)
- Two join models: Participant (individual) and Member (team/staff)
- Full cricket tournament lifecycle: format → teams → schedule → live scoring
- Real-time score updates via Socket.IO
- Three authentication methods: password, OTP email, Google OAuth
- Redis caching with automatic in-memory fallback

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│   React 19 + Vite + TailwindCSS + Socket.IO Client             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │  Pages   │  │  Hooks   │  │ Services │  │  Socket.IO   │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────┬──────────┘
                         │ HTTP (REST)                 │ WS
                         ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (Node.js)                    │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────────┐  │
│  │ Middleware │  │  Routers   │  │      Socket.IO Server    │  │
│  │ verifyJWT  │  │ /api/v1/*  │  │  join:match / join:event │  │
│  │ eventAccess│  │ /api/cpsh/*│  │  emit: match:updated     │  │
│  │ multer     │  └────────────┘  └──────────────────────────┘  │
│  └────────────┘                                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────────┐  │
│  │Controllers │  │  Services  │  │         Utils            │  │
│  │ user       │  │ UserService│  │ ApiError / ApiResponse   │  │
│  │ event      │  └────────────┘  │ AsyncHandler / cloudinary│  │
│  │ match ...  │                  │ mailer / redis           │  │
│  └────────────┘                  └──────────────────────────┘  │
└──────────┬──────────────────────────────────┬───────────────────┘
           │ Mongoose ODM                      │ ioredis
           ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────┐
│      MongoDB        │             │        Redis        │
│  (Atlas / local)    │             │  (Docker / local)   │
└─────────────────────┘             └─────────────────────┘
                                              │
                                    ┌─────────────────────┐
                                    │    RedisInsight      │
                                    │  (GUI — port 8001)  │
                                    └─────────────────────┘
```

---

## 3. Tech Stack

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js ≥ 18 | JavaScript server runtime |
| Framework | Express 5 | HTTP routing and middleware |
| Database | MongoDB + Mongoose 8 | Document store and ODM |
| Auth | JWT (jsonwebtoken) | Access + refresh token auth |
| Auth | Passport + Google OAuth 2.0 | Social login |
| Password | bcrypt | Password hashing |
| Cache | Redis (ioredis) + in-memory fallback | Response caching |
| Real-time | Socket.IO 4 | WebSocket server |
| File Upload | Multer | Multipart form handling |
| Image Hosting | Cloudinary | Avatar / poster / logo storage |
| Email | Nodemailer | OTP email delivery |
| Config | dotenv | Environment variable loading |

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| UI Library | React 19 | Component-based UI |
| Build Tool | Vite 7 | Dev server and bundler |
| Routing | React Router DOM 7 | Client-side routing |
| HTTP Client | Axios | REST API calls |
| Real-time | Socket.IO Client 4 | Live score updates |
| Styling | TailwindCSS 4 | Utility-first CSS |
| Animation | Framer Motion | Page and component animations |
| Icons | react-icons, lucide-react, FontAwesome | Icon sets |

### Infrastructure

| Service | Technology | Purpose |
|---|---|---|
| Cache | Redis 7 (Alpine) | Primary cache store |
| Cache GUI | RedisInsight | Redis management UI |
| Containers | Docker Compose | Local dev infrastructure |

---

## 4. Database Design (ERD)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIP DIAGRAM                     │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌──────────────────────────────────────────────┐
│    User     │         │                    Event                     │
│─────────────│         │──────────────────────────────────────────────│
│ _id (PK)    │◄────────│ organizer (FK → User)                        │
│ fullname    │         │ _id (PK)                                     │
│ username    │         │ eventName                                    │
│ email       │         │ festivalName                                 │
│ password    │         │ organization                                 │
│ googleId    │         │ mode                                         │
│ avatar      │         │ description                                  │
│ refreshToken│         │ category                                     │
│ createdAt   │         │ sports / cultural / others                   │
└─────────────┘         │ startDate                                    │
       │                │ location                                     │
       │                │ maxParticipants                              │
       │                │ rules[]                                      │
       │                │ poster                                       │
       │                │ memberCode (unique)                          │
       │                │ participantCode (unique)                     │
       │                └──────────────────────────────────────────────┘
       │                        │              │              │
       │              ┌─────────┘    ┌─────────┘    ┌────────┘
       │              ▼              ▼              ▼
       │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
       │   │  Participant │  │    Member    │  │  CricketFormat   │
       │   │──────────────│  │──────────────│  │──────────────────│
       │◄──│ owner(FK)    │  │ owner(FK)    │◄─┤ event(FK,unique) │
       │   │ event(FK)    │  │ event(FK)    │  │ tournamentType   │
       │   │ identityNum  │  │ name         │  │ overs            │
       │   └──────────────┘  │ role         │  │ playersPerTeam   │
       │                     └──────────────┘  │ createdBy(FK)    │
       │                                        └──────────────────┘
       │
       │   ┌──────────────────────────────────────────────────────┐
       │   │                       Team                           │
       │   │──────────────────────────────────────────────────────│
       │◄──│ owner (FK → User)                                    │
       │   │ event (FK → Event)                                   │
       │   │ _id (PK)                                             │
       │   │ name                                                 │
       │   │ teamlogo                                             │
       │   │ teamCode (unique per event)                          │
       └───┤                                                      │
           └──────────────────────────────────────────────────────┘
                    │                          │
                    ▼                          ▼
       ┌──────────────────────┐    ┌──────────────────────────────┐
       │   Cricket_Player     │    │           Match              │
       │──────────────────────│    │──────────────────────────────│
       │ team (FK → Team)     │    │ event (FK → Event)           │
       │ owner (FK → User)    │    │ team1 / team2 (String names) │
       │ balls                │    │ team1Id / team2Id (FK→ Team) │
       │ runs                 │    │ venue / date / round         │
       │ wickets              │    │ overs                        │
       │ overs                │    │ status (upcoming/live/       │
       └──────────────────────┘    │         completed/abandoned) │
                                   │ tossWinner / tossDecision    │
       ┌──────────────────────┐    │ currentInnings (1 or 2)      │
       │      Schedule        │    │ innings1 (embedded)          │
       │──────────────────────│    │ innings2 (embedded)          │
       │ event (FK, unique)   │    │ result                       │
       │ createdBy (FK)       │    │ createdBy (FK → User)        │
       │ method (AI/Manual)   │    └──────────────────────────────┘
       │ matches[]            │              │
       │  ├ team1 / team2     │    ┌─────────┴──────────────────────┐
       │  ├ date / venue      │    │     Innings (embedded doc)     │
       │  └ round             │    │────────────────────────────────│
       └──────────────────────┘    │ battingTeam                    │
                                   │ runs / wickets / overs / balls │
                                   │ extras                         │
                                   │ batsmen[]                      │
                                   │  ├ name / runs / balls         │
                                   │  ├ fours / sixes               │
                                   │  └ isOut / isOnStrike          │
                                   │ bowlers[]                      │
                                   │  ├ name / overs / balls        │
                                   │  └ runs / wickets / maidens    │
                                   │ ballByBall[]                   │
                                   │  ├ over / ball / runs          │
                                   │  ├ isWicket/isWide/isNoBall    │
                                   │  └ commentary                  │
                                   └────────────────────────────────┘
```

---

## 5. Backend — API Reference

Both `/api/v1/` and `/api/cpsh/` prefixes are supported (legacy compatibility).

### Users — `/api/v1/users`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/register` | No | `fullname, username, email, password` + file: `avatar` | Register new user |
| POST | `/login` | No | `usermail, password` | Login with email or username |
| POST | `/logout` | JWT | — | Logout, clear refresh token |
| POST | `/refresh-token` | No | cookie: `refreshToken` | Get new access token |
| GET | `/profile` | JWT | — | Get current user profile |
| POST | `/send-otp` | No | `email` | Send 6-digit OTP to email |
| POST | `/verify-otp` | No | `email, otp` | Verify OTP and login |
| GET | `/auth/google` | No | — | Redirect to Google OAuth |
| GET | `/auth/google/callback` | No | — | Google OAuth callback |

### Events — `/api/v1/events`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/create` | JWT | event fields + file: `poster` | Create new event |
| DELETE | `/delete/:eventId` | JWT | — | Delete event |
| PATCH | `/update/:eventId` | JWT | event fields + optional file: `poster` | Update event |
| GET | `/get-all-events` | JWT | — | Get organizer's own events |
| GET | `/get-single-event/:eventId` | No | — | Get event by ID |
| GET | `/public` | No | — | Get all public events |

### Participants — `/api/v1/participants`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/participate/:participantCode` | JWT | `identityNumber` | Join event as participant |
| GET | `/participate/:participantCode` | No | — | Get event by participant code |
| GET | `/my-events` | JWT | — | Get all events user participates in |
| GET | `/get-all-participants/:eventId` | JWT | — | Get all participants for event |
| GET | `/get-single-participant/:eventId` | JWT | — | Get current user's participation |
| DELETE | `/delete-participant/:participantId` | JWT | — | Remove participation |

### Members — `/api/v1/members`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/participate/:memberCode` | JWT | — | Join event as member |
| GET | `/participate/:memberCode` | No | — | Get event by member code |
| GET | `/get-all-events` | JWT | — | Get all events user is member of |
| PATCH | `/edit-role/:memberId` | JWT | `role` | Update member role |
| GET | `/get-member/:eventId` | JWT | — | Get all members for event |

### Teams — `/api/v1/teams`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/create-team/:eventId` | JWT | `name` + file: `teamlogo` | Create cricket team |
| GET | `/get-team/:eventId` | JWT | — | Get user's team for event |
| GET | `/get-event-teams/:eventId` | JWT | — | Get all teams for event |
| PATCH | `/update-team/:eventId` | JWT | `name` + optional file: `teamlogo` | Update team |
| DELETE | `/delete-team/:eventId` | JWT | — | Delete team |

### Cricket Players — `/api/v1/cricket-players`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/join-team/:teamCode/:eventId` | JWT | — | Join team with team code |
| GET | `/my-team/:eventId` | JWT | — | Get team user is in |
| DELETE | `/leave-team/:eventId` | JWT | — | Leave team |
| DELETE | `/remove-player/:playerId` | JWT | — | Captain removes player |

### Cricket Format — `/api/v1/cricket-format`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/:eventId` | JWT | `tournamentType, overs, playersPerTeam` | Save tournament format |
| GET | `/:eventId` | JWT | — | Get format for event |

### Schedule — `/api/v1/schedule`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| GET | `/:eventId` | JWT | — | Get schedule for event |
| POST | `/:eventId/ai` | JWT | — | Generate schedule with Gemini AI |
| POST | `/:eventId/manual` | JWT | `matches[]` | Save manual schedule |

### Matches — `/api/v1/matches`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/event/:eventId` | JWT + EventAccess | Get all matches for event |
| GET | `/:matchId` | JWT + EventAccess | Get single match |
| POST | `/event/:eventId/init` | JWT + EventAccess | Initialize matches from schedule |
| PATCH | `/:matchId/start` | JWT + EventAccess | Start match, set toss |
| POST | `/:matchId/delivery` | JWT + EventAccess | Record a delivery (ball-by-ball) |
| PATCH | `/:matchId` | JWT + EventAccess | Update match metadata |

> **EventAccess** = user must be organizer, member, participant, or cricket player of that event.

---

## 6. Backend — Data Flow

### Request Lifecycle

```
Incoming HTTP Request
        │
        ▼
┌───────────────────┐
│   CORS Middleware │  ← Validates origin against allowed list
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Body Parser /    │  ← JSON (50kb limit), URL-encoded, cookies
│  Cookie Parser    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Route Matcher   │  ← /api/v1/* or /api/cpsh/*
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  verifyJWT        │  ← Reads cookie or Authorization header
│  (if protected)   │     Decodes JWT → attaches req.user
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  verifyEventAccess│  ← Checks organizer / member / participant
│  (match routes)   │     / cricket player role
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Multer           │  ← Saves file to public/temp (if upload)
│  (if file upload) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Controller      │  ← Validates input, calls service/model
└───────────────────┘
        │
        ├──► Redis cacheGet() ──► Cache HIT → return cached data
        │
        ▼
┌───────────────────┐
│   MongoDB Query   │  ← Mongoose model operations
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Redis cacheSet() │  ← Store result with TTL
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  ApiResponse      │  ← { statusCode, data, message, success }
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Error Middleware │  ← Catches any thrown ApiError
│  (global)         │     Returns consistent error shape
└───────────────────┘
```

### Standard API Response Shape

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Event found successfully",
  "success": true
}
```

### Standard Error Shape

```json
{
  "statusCode": 404,
  "message": "Event not found",
  "errors": [],
  "success": false
}
```

---

## 7. Authentication Flow

### 7.1 Email / Password Login

```
Client                          Server                        MongoDB
  │                               │                              │
  │── POST /login ──────────────► │                              │
  │   { usermail, password }      │── findOne({email/username})─►│
  │                               │◄─ User document ────────────│
  │                               │                              │
  │                               │── bcrypt.compare(password)   │
  │                               │                              │
  │                               │── generateAccessToken()      │
  │                               │   (JWT, 1d expiry)           │
  │                               │── generateRefreshToken()     │
  │                               │   (JWT, 7d expiry)           │
  │                               │                              │
  │                               │── save refreshToken to DB ──►│
  │                               │                              │
  │◄── Set-Cookie: accessToken ───│
  │◄── Set-Cookie: refreshToken ──│
  │◄── 200 { user, tokens } ──────│
```

### 7.2 OTP Login

```
Client                    Server                  Redis              Email
  │                          │                      │                  │
  │── POST /send-otp ───────►│                      │                  │
  │   { email }              │── crypto.randomInt() │                  │
  │                          │── cacheSet(otp, 600s)►│                  │
  │                          │── sendOtpEmail() ────────────────────►  │
  │◄── 200 "OTP sent" ───────│                      │                  │
  │                          │                      │                  │
  │── POST /verify-otp ─────►│                      │                  │
  │   { email, otp }         │── cacheGet(otp) ────►│                  │
  │                          │◄─ stored OTP ────────│                  │
  │                          │── compare OTPs       │                  │
  │                          │── cacheDel(otp) ─────►│                  │
  │                          │── generateTokens()   │                  │
  │◄── Set-Cookie + 200 ─────│                      │                  │
```

### 7.3 Google OAuth Flow

```
Client                    Server                    Google
  │                          │                          │
  │── GET /auth/google ─────►│                          │
  │                          │── passport.authenticate()│
  │◄── 302 redirect ─────────│──────────────────────── ►│
  │                          │                          │
  │                          │◄── profile + tokens ─────│
  │                          │                          │
  │                          │── findOrCreate User      │
  │                          │── generateTokens()       │
  │◄── 302 /auth/callback ───│
  │    ?token=<accessToken>  │
  │                          │
  │── store token in         │
  │   localStorage           │
```

### 7.4 Token Refresh

```
Client                          Server
  │                               │
  │── POST /refresh-token ───────►│
  │   cookie: refreshToken        │── findOne({ refreshToken })
  │                               │── generateTokens() (rotates both)
  │◄── new accessToken ───────────│
  │◄── new refreshToken ──────────│
```

### 7.5 Protected Route Guard (Frontend)

```
User navigates to protected route
        │
        ▼
  ProtectedRoute component
        │
        ▼
  useAuth() → isAuthenticated?
        │
   No ──┴── Yes
   │              │
   ▼              ▼
redirect      render page
to /login
```

---

## 8. WebSocket / Real-time Flow

Socket.IO is used exclusively for live cricket score broadcasting.

### Connection & Room Model

```
Client (LiveScoreboard / ScoreInput)
        │
        │── socket.connect(VITE_API_URL)
        │
        │── emit("join:match", matchId)   ← joins room "match:<id>"
        │── emit("join:event", eventId)   ← joins room "event:<id>"
        │
        │   [Score Input page records a delivery]
        │
        │── POST /api/v1/matches/:matchId/delivery
        │                │
        │                ▼
        │         Server updates Match in MongoDB
        │                │
        │                ▼
        │         emitMatchUpdate(match)
        │                │
        │         io.to("match:<id>").emit("match:updated", match)
        │         io.to("event:<id>").emit("match:updated", match)
        │                │
        │◄───────────────┘
        │   receive "match:updated" event
        │
        ▼
  LiveScoreboard re-renders with new data
```

### Socket Events Reference

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `join:match` | `matchId: string` | Subscribe to a match room |
| Client → Server | `join:event` | `eventId: string` | Subscribe to all matches in event |
| Client → Server | `leave:match` | `matchId: string` | Unsubscribe from match room |
| Client → Server | `leave:event` | `eventId: string` | Unsubscribe from event room |
| Server → Client | `match:updated` | Full match object | Fired on every score change |

---

## 9. Caching Strategy

Redis is the primary cache. If Redis is unavailable, the system automatically falls back to an in-memory `Map` with TTL support — no crash, no data loss.

### Cache Keys & TTLs

| Cache Key Pattern | TTL | Invalidated When |
|---|---|---|
| `event:<eventId>` | 5 min | Event updated or deleted |
| `events:organizer:<userId>` | 2 min | Event created, updated, or deleted |
| `events:public` | 2 min | Any event created or deleted |
| `match:<matchId>` | 10 sec | Delivery added, match started/updated |
| `matches:event:<eventId>` | 10 sec | Any match in event changes |
| `schedule:<eventId>` | 5 min | Schedule saved |
| `format:<eventId>` | 5 min | Format saved |
| `member:events:<userId>` | 2 min | Member joins or leaves |
| `otp:<email>` | 10 min | OTP verified (deleted) or expired |

### Cache Flow

```
Request arrives
      │
      ▼
cacheGet(key)
      │
   HIT ──────────────────────────────► return cached data (fast path)
      │
   MISS
      │
      ▼
MongoDB query
      │
      ▼
cacheSet(key, data, TTL)
      │
      ▼
return data
```

### Fallback Behavior

```
cacheGet / cacheSet called
        │
        ▼
  redisAvailable?
        │
   Yes ─┴─ No
   │           │
   ▼           ▼
Redis       In-memory Map
(ioredis)   (with TTL check)
```

---

## 10. Frontend — Application Structure

```
Frontend/client/src/
│
├── main.jsx                  ← App entry, BrowserRouter (base: /Campus-Sphere)
├── App.jsx                   ← Renders <AppRoutes />
├── index.css                 ← Global styles
│
├── config/
│   ├── api.js                ← Base API URL (VITE_API_URL or Vite proxy)
│   ├── fetchWithAuth.js      ← fetch() wrapper with Authorization header
│   └── socket.js             ← Socket.IO client instance (lazy connect)
│
├── routes/
│   ├── Route.jsx             ← All 40+ route definitions
│   ├── ProtectedRoute.jsx    ← Redirects to /login if not authenticated
│   └── PublicRoute.jsx       ← Redirects to /home if already authenticated
│
├── hooks/
│   ├── useAuth.js            ← Auth context + provider (login/logout/register)
│   ├── useFetch.js           ← useFetch, useLazyFetch, useMutation
│   ├── useApi.js             ← useList, useItem, useCreate, useUpdate, useDelete
│   ├── useForm.js            ← Form state, validation, submission
│   ├── useEvents.js          ← Event-specific data hooks
│   ├── useTeams.js           ← Team-specific data hooks
│   ├── useEventAccess.js     ← Checks if user can access match data
│   └── useEventParticipant.js← Fetches participant record for event
│
├── services/
│   ├── api.service.js        ← Axios instance with interceptors (token refresh)
│   ├── event.service.js      ← All event API calls
│   ├── participant.service.js← Participant API calls
│   ├── user.service.js       ← User API calls (login, register, profile)
│   └── index.js              ← Barrel export
│
├── components/
│   └── shared/
│       ├── FormInput.jsx         ← Reusable text input
│       ├── FormSelect.jsx        ← Reusable select dropdown
│       ├── FormTextarea.jsx      ← Reusable textarea
│       ├── EventCard.jsx         ← Event display card (hosted/participant variants)
│       ├── CopyToClipboard.jsx   ← Copy text to clipboard button
│       └── index.js              ← Barrel export
│
├── pages/
│   ├── Front/                ← Landing page (Front, Top, Features, Foot)
│   ├── Home/                 ← Dashboard (Home, Navbar, Option, AllEvents, Body)
│   ├── EventCreation/        ← Create event forms (CreateEvent, Cricket, Workshop, Cultural, Rule)
│   ├── EditEvent/            ← Update event (UpdateEvent)
│   ├── MyHostedEvent/        ← Organizer's event list (EventList)
│   ├── ParticipateEvent/     ← Join + view as participant (JoinEvent, EventDetails)
│   ├── MyParticipatedEvents/ ← Participant dashboard (MyEvents, CricketDetails, JoinTeam, etc.)
│   ├── JoinMember/           ← Join + view as member (JoinMember, EventDetailsMember)
│   ├── MyTeam/               ← Team views (Myteam, EventCardTeam)
│   ├── Cricket/              ← Cricket management (Cricket, LiveScoreboard, MatchManager, etc.)
│   ├── Schedule/             ← Tournament schedule (SchedulePage)
│   ├── Login.jsx             ← Login page
│   ├── Register.jsx          ← Registration page
│   ├── Profile.jsx           ← User profile
│   ├── AuthCallback.jsx      ← Google OAuth token handler
│   └── LoadingPage.jsx       ← Loading spinner page
│
└── assets/
    └── download.jpeg
```

---

## 11. Frontend — Route Map

```
/                           → Front (landing page, public)
/login                      → Login (public only)
/register                   → Register (public only)
/auth/callback              → AuthCallback (Google OAuth token handler)

/home                       → Home dashboard (protected)
/choice                     → Role selection (protected)
/all-events                 → Browse all public events (protected)
/profile                    → User profile (protected)

── Event Organizer ──────────────────────────────────────────────
/new-events-hosted                          → Create event
/events-hosted                              → My hosted events list
/update-event/:eventId                      → Edit event
/event/:eventName/:eventId/workshop         → Workshop event setup
/event/:eventName/:eventId/sports/cricket   → Cricket event setup
/cricket-format/:eventId                    → Set cricket format
/cricket-format/:eventId/view               → View cricket format (read-only)
/cricket-match-manager/:eventId             → Manage matches (start, toss)
/cricket-schedule/:eventId                  → View/generate schedule

── Participant ───────────────────────────────────────────────────
/join-event                                 → Join event with participant code
/event-details/:identityNumber/:participantCode/:participantId → Event details
/my-events                                  → My participated events

── Member ────────────────────────────────────────────────────────
/joinMember                                 → Join event with member code
/get-event/:memberCode                      → Event details as member
/my-events-member                           → My member events

── Cricket / Teams ───────────────────────────────────────────────
/cricket-event-details/:eventId/...         → Cricket event details (participant)
/join-team/:eventId                         → Join a cricket team
/cricket-create-team/:eventId               → Create a team
/cricket-team-creator/:eventId              → Team captain view
/cricket-team-member/:eventId               → Team member view

── Live Scoring ──────────────────────────────────────────────────
/cricket-scoreboard/:eventId                → Live scoreboard (all matches)
/match/:matchId/scorecard                   → Single match scorecard
/match/:matchId/score-input                 → Ball-by-ball score input
```

---

## 12. Frontend — State & Data Layer

### Axios Interceptor Chain

```
Request                              Response
   │                                     │
   ▼                                     ▼
Add Authorization header          Unwrap response.data
from localStorage token           (returns data directly)
   │                                     │
   ▼                                     ▼
Send request                      On 401 → try refresh token
                                         │
                                    Success → retry original request
                                         │
                                    Fail → redirect to /login
```

### Hook Hierarchy

```
useAuth (Context)
  └── Provides: user, isAuthenticated, login(), logout(), register()
      └── Used by: ProtectedRoute, PublicRoute, Navbar, all pages

useFetch(url, options, deps)
  └── Auto-fetches on mount and dep change
  └── Returns: { data, loading, error, refetch }

useLazyFetch()
  └── Manual trigger
  └── Returns: { data, loading, error, fetchData(url) }

useMutation()
  └── POST / PATCH / PUT / DELETE
  └── Returns: { data, loading, error, mutate(url, method, body) }

useApi (built on useFetch/useMutation)
  ├── useList(url)         → paginated list
  ├── useItem(url, id)     → single item
  ├── useCreate(url)       → POST
  ├── useUpdate(url)       → PATCH
  └── useDelete(url)       → DELETE

useForm(initialValues, validate, onSubmit)
  └── Returns: { values, errors, touched, handleChange,
                 handleBlur, handleSubmit, isSubmitting }

useEvents / useTeams
  └── Thin wrappers over useFetch pointing to specific endpoints
```

---

## 13. Cricket Tournament Workflow

This is the most complex feature. Here's the full lifecycle:

```
STEP 1 — Create Event
  Organizer fills CreateEvent form
  → POST /events/create (with poster image)
  → Event saved with unique memberCode + participantCode
  → Organizer redirected to cricket event setup page

STEP 2 — Set Cricket Format
  Organizer sets: tournamentType, overs, playersPerTeam
  → POST /cricket-format/:eventId
  → CricketFormat document saved

STEP 3 — Teams Join
  Participants join event → POST /participants/participate/:participantCode
  Each participant creates a team → POST /teams/create-team/:eventId
  Team gets a unique teamCode
  Other players join team → POST /cricket-players/join-team/:teamCode/:eventId

STEP 4 — Generate Schedule
  Organizer visits SchedulePage
  → POST /schedule/:eventId/ai   (Gemini AI generates bracket)
    OR
  → POST /schedule/:eventId/manual (organizer inputs matches)
  → Schedule saved with matches[]

STEP 5 — Initialize Matches
  → POST /matches/event/:eventId/init
  → Reads schedule + format, creates Match documents
  → Each match: upcoming status, team names, overs set

STEP 6 — Start a Match
  Organizer opens MatchManager
  → PATCH /matches/:matchId/start
  → Body: { tossWinner, tossDecision: "bat"|"bowl" }
  → Match status → "live", innings1.battingTeam set

STEP 7 — Live Scoring
  Score Input page records each delivery
  → POST /matches/:matchId/delivery
  → Body: { runs, isWicket, isWide, isNoBall, isBye, isLegBye,
             batsmanName, bowlerName, commentary }
  → Server updates innings stats, ball-by-ball log
  → emitMatchUpdate() broadcasts to all watchers via Socket.IO
  → LiveScoreboard receives "match:updated" and re-renders

STEP 8 — Innings Transition
  After 10 wickets OR max overs reached in innings 1:
  → currentInnings flips to 2
  → innings2.battingTeam set to other team

STEP 9 — Match Completion
  After innings 2 ends OR target chased:
  → match.status → "completed"
  → match.result set (e.g. "Team A won by 5 wickets")
  → Final emitMatchUpdate() sent

STEP 10 — View Results
  MatchScorecard page shows full innings breakdown:
  batsmen stats, bowler figures, ball-by-ball commentary
```

### Tournament Types

| Type | Description |
|---|---|
| Knockout | Single elimination — loser is out |
| League | Round-robin within groups |
| Round Robin | Every team plays every other team |
| Double Elimination | Two losses to be eliminated |

### Match Status State Machine

```
  [upcoming]
      │
      │ startMatch() — toss set
      ▼
   [live]
      │
      │ innings end / target chased
      ▼
 [completed]

  [live] ──── manual override ────► [abandoned]
```

---

## 14. File Upload Flow

```
Client selects file (avatar / poster / team logo)
        │
        ▼
multipart/form-data request sent
        │
        ▼
Multer middleware
  └── diskStorage → saves to ./public/temp/<filename>
        │
        ▼
Controller reads req.file.path
        │
        ▼
uploadOnCloudinary(localPath)
  └── cloudinary.uploader.upload(localPath)
  └── fs.unlinkSync(localPath)  ← deletes local temp file
        │
        ▼
Returns { url, public_id, ... }
        │
        ▼
URL stored in MongoDB document
(avatar / poster / teamlogo field)
```

### Supported Upload Types

| Field | Used In | Max Size |
|---|---|---|
| `avatar` | User registration | 5 MB |
| `poster` | Event create/update | 5 MB |
| `teamlogo` | Team create/update | 5 MB |

---

## 15. Infrastructure & Deployment

### Docker Compose (Local Dev)

```yaml
# docker-compose.yml
services:
  redis:          # Redis 7 Alpine — port 6379, AOF persistence
  redisinsight:   # Redis GUI — port 8001
```

Start with:
```bash
docker-compose up -d
```

### Running Locally

```bash
# Backend
cd Backend
cp .env.example .env   # fill in your values
npm install
npm start              # node src/index.js

# Frontend
cd Frontend/client
npm install
npm run dev            # Vite dev server on http://localhost:5173
```

### Production Build

```bash
# Frontend
cd Frontend/client
npm run build          # outputs to dist/
```

### Vite Proxy (Dev)

In development, `VITE_API_URL` is empty so all `/api/*` requests are proxied by Vite to the backend, avoiding CORS issues.

### Deployment Checklist

- [ ] Set all required environment variables (see Section 16)
- [ ] MongoDB Atlas cluster created and URI set
- [ ] Cloudinary account and credentials set
- [ ] Google OAuth app created, callback URL set
- [ ] Gmail app password set for Nodemailer
- [ ] Redis instance running (or Docker Compose)
- [ ] `FRONTEND_ORIGIN` and `FRONTEND_ORIGIN_WITH_PATH` set on backend
- [ ] `VITE_API_URL` set on frontend build

---

## 16. Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | Yes | Server port (e.g. 3000) |
| `ACCESS_TOKEN_SECRET` | Yes | JWT access token signing secret |
| `ACCESS_TOKEN_EXPIRY` | No | Access token expiry (default: `1d`) |
| `REFRESH_TOKEN_SECRET` | Yes | JWT refresh token signing secret |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh token expiry (default: `7d`) |
| `CLOUDINARY_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | Google OAuth callback URL |
| `REDIS_URL` | No | Redis URL (default: `redis://localhost:6379`) |
| `FRONTEND_ORIGIN` | No | Frontend base URL for CORS |
| `FRONTEND_ORIGIN_WITH_PATH` | No | Frontend URL with base path |
| `FRONTEND_BASE_PATH` | No | Frontend base path (e.g. `/Campus-Sphere`) |
| `EMAIL_USER` | No | Gmail address for OTP emails |
| `EMAIL_PASS` | No | Gmail app password |
| `NODE_ENV` | No | `development` or `production` |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI schedule |

### Frontend (`Frontend/client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend base URL (empty = use Vite proxy) |
| `VITE_SOCKET_URL` | No | Socket.IO server URL |

---

## 17. Project File Structure

```
campus-sphere/
│
├── docker-compose.yml              ← Redis + RedisInsight services
│
├── Backend/
│   ├── .env                        ← Environment variables
│   ├── .env.example                ← Template for env vars
│   ├── package.json
│   └── src/
│       ├── index.js                ← Entry point: HTTP server + Socket.IO + DB connect
│       ├── app.js                  ← Express app: middleware + route mounting
│       ├── socket.js               ← Socket.IO init + emitMatchUpdate()
│       │
│       ├── config/
│       │   ├── index.js            ← Centralized config with env validation
│       │   └── passport.js         ← Google OAuth 2.0 strategy
│       │
│       ├── constants/
│       │   └── index.js            ← HTTP_STATUS, COOKIE_OPTIONS, PAGINATION, etc.
│       │
│       ├── db/
│       │   └── index.js            ← connectDB() via Mongoose
│       │
│       ├── models/
│       │   ├── user.model.js       ← User schema (auth methods, bcrypt hook)
│       │   ├── event.model.js      ← Event schema (codes, poster, rules)
│       │   ├── participant.model.js← Participant ↔ Event link
│       │   ├── members.model.js    ← Member ↔ Event link (with role)
│       │   ├── team.model.js       ← Cricket team
│       │   ├── cricketPlayer.model.js ← Player stats in a team
│       │   ├── cricketFormat.model.js ← Tournament format config
│       │   ├── match.model.js      ← Full match + innings + ball-by-ball
│       │   ├── schedule.model.js   ← Tournament schedule/bracket
│       │   └── cricket.model.js    ← Legacy cricket schema (unused)
│       │
│       ├── controllers/
│       │   ├── user.controller.js
│       │   ├── event.controller.js
│       │   ├── participant.controller.js
│       │   ├── member.controller.js
│       │   ├── team.controller.js
│       │   ├── cricketPlayer.controller.js
│       │   ├── cricketFormat.controller.js
│       │   ├── schedule.controller.js
│       │   └── match.controller.js
│       │
│       ├── routes/
│       │   ├── user.route.js
│       │   ├── event.route.js
│       │   ├── participant.route.js
│       │   ├── member.route.js
│       │   ├── team.route.js
│       │   ├── cricketPlayer.route.js
│       │   ├── cricketFormat.route.js
│       │   ├── schedule.route.js
│       │   └── match.route.js
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.js       ← verifyJWT
│       │   ├── eventAccess.middleware.js← verifyEventAccess
│       │   ├── multer.middleware.js     ← File upload config
│       │   ├── error.middleware.js      ← Global error + 404 handler
│       │   └── validate.middleware.js   ← Schema validation (Zod/Joi)
│       │
│       ├── services/
│       │   └── user.service.js          ← UserService class (all user business logic)
│       │
│       └── utils/
│           ├── ApiError.js             ← Custom error class
│           ├── ApiResponse.js          ← Standard response wrapper
│           ├── AsyncHandler.js         ← Async try/catch wrapper
│           ├── cloudinary.js           ← Upload/delete on Cloudinary
│           ├── mailer.js               ← OTP email via Nodemailer
│           └── redis.js                ← cacheGet/cacheSet/cacheDel + fallback
│
└── Frontend/client/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx                    ← BrowserRouter + AuthProvider
        ├── App.jsx                     ← <AppRoutes />
        ├── index.css
        │
        ├── config/
        │   ├── api.js                  ← VITE_API_URL base URL
        │   ├── fetchWithAuth.js        ← fetch() with auth header
        │   └── socket.js               ← Socket.IO client
        │
        ├── routes/
        │   ├── Route.jsx               ← All route definitions
        │   ├── ProtectedRoute.jsx
        │   └── PublicRoute.jsx
        │
        ├── hooks/
        │   ├── useAuth.js              ← Auth context + provider
        │   ├── useFetch.js             ← useFetch, useLazyFetch, useMutation
        │   ├── useApi.js               ← Higher-level CRUD hooks
        │   ├── useForm.js              ← Form state management
        │   ├── useEvents.js            ← Event data hooks
        │   ├── useTeams.js             ← Team data hooks
        │   ├── useEventAccess.js       ← Match access check
        │   ├── useEventParticipant.js  ← Participant record hook
        │   └── index.js                ← Barrel export
        │
        ├── services/
        │   ├── api.service.js          ← Axios instance + interceptors
        │   ├── event.service.js        ← Event API methods
        │   ├── participant.service.js  ← Participant API methods
        │   ├── user.service.js         ← User API methods
        │   └── index.js
        │
        ├── components/shared/
        │   ├── FormInput.jsx
        │   ├── FormSelect.jsx
        │   ├── FormTextarea.jsx
        │   ├── EventCard.jsx
        │   ├── CopyToClipboard.jsx
        │   └── index.js
        │
        └── pages/
            ├── Front/                  ← Landing page
            ├── Home/                   ← Dashboard + navigation
            ├── EventCreation/          ← Event creation forms
            ├── EditEvent/              ← Event editing
            ├── MyHostedEvent/          ← Organizer's events
            ├── ParticipateEvent/       ← Join + view as participant
            ├── MyParticipatedEvents/   ← Participant dashboard + cricket
            ├── JoinMember/             ← Join + view as member
            ├── MyTeam/                 ← Team views
            ├── Cricket/                ← Format, scoreboard, scoring
            ├── Schedule/               ← Tournament schedule
            ├── Login.jsx
            ├── Register.jsx
            ├── Profile.jsx
            ├── AuthCallback.jsx
            └── LoadingPage.jsx
```

---

*Documentation generated for Campus Sphere v1.0.0*
