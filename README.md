# Campus Sphere

> Full-stack campus event management platform with cricket tournament support, real-time live scoring, and multi-sport architecture.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [Backend — Project Structure](#5-backend--project-structure)
6. [Backend — API Reference](#6-backend--api-reference)
7. [Authentication Flow](#7-authentication-flow)
8. [WebSocket / Real-time](#8-websocket--real-time)
9. [Caching Strategy](#9-caching-strategy)
10. [Frontend — Project Structure](#10-frontend--project-structure)
11. [Frontend — Route Map](#11-frontend--route-map)
12. [Cricket Tournament Workflow](#12-cricket-tournament-workflow)
13. [Multi-Sport Architecture](#13-multi-sport-architecture)
14. [Environment Variables](#14-environment-variables)
15. [Getting Started](#15-getting-started)

---

## 1. Project Overview

Campus Sphere lets students and organizers manage campus events end-to-end. An organizer creates an event, shares invite codes, and participants or members join. For cricket events the platform handles team formation, AI-generated tournament schedules, ball-by-ball live scoring, and real-time scoreboards via WebSockets.

**Core capabilities**
- Create and manage events — Cricket, Cultural, Workshop, Coding
- Two join models: Participant (individual) and Member (team/staff)
- Full cricket tournament lifecycle: format → teams → schedule → live scoring
- Real-time score updates via Socket.IO
- Three auth methods: password, OTP email, Google OAuth
- Redis caching with automatic in-memory fallback
- Multi-sport architecture — adding a new sport requires zero changes to existing code

---

## 2. Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (access + refresh tokens) |
| Social Auth | Passport + Google OAuth 2.0 |
| Password | bcrypt |
| Cache | Redis (ioredis) + in-memory fallback |
| Real-time | Socket.IO 4 |
| File Upload | Multer |
| Image Hosting | Cloudinary |
| Email | Nodemailer (Gmail App Password) |
| Config | dotenv |

### Frontend

| Layer | Technology |
|---|---|
| UI Library | React 19 |
| Build Tool | Vite 7 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios + native fetch |
| Real-time | Socket.IO Client 4 |
| Styling | TailwindCSS 4 |
| Animation | Framer Motion |
| Icons | react-icons, lucide-react, FontAwesome |

### Infrastructure

| Service | Technology |
|---|---|
| Cache | Redis 7 Alpine (Docker) |
| Cache GUI | RedisInsight (port 8001) |
| Containers | Docker Compose |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT BROWSER                         │
│  React 19 + Vite + TailwindCSS + Socket.IO Client           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Pages   │  │  Hooks   │  │ Services │  │ Socket.IO  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└──────────────────────┬───────────────────────────┬──────────┘
                       │ HTTP REST                  │ WebSocket
                       ▼                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER (Node.js)                    │
│  ┌────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Middleware │  │     Routers      │  │  Socket.IO      │  │
│  │ verifyJWT  │  │ /api/v1/         │  │  join:match     │  │
│  │ eventAccess│  │ /api/cpsh/ (leg) │  │  emit:match:upd │  │
│  │ multer     │  └──────────────────┘  └─────────────────┘  │
│  └────────────┘                                              │
│  ┌────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │Controllers │  │    Services      │  │     Utils       │  │
│  │ user       │  │  UserService     │  │ ApiError        │  │
│  │ event      │  └──────────────────┘  │ ApiResponse     │  │
│  │ sports/    │                        │ AsyncHandler    │  │
│  │  cricket/* │                        │ cloudinary      │  │
│  └────────────┘                        └─────────────────┘  │
└──────────┬───────────────────────────────────┬──────────────┘
           │ Mongoose ODM                       │ ioredis
           ▼                                    ▼
┌──────────────────────┐            ┌──────────────────────┐
│       MongoDB        │            │        Redis         │
│   (Atlas / local)    │            │  (Docker / local)    │
└──────────────────────┘            └──────────────────────┘
```

---

## 4. Database Design

```
User ──────────────────────────────────────────────────────────────────────┐
 │  _id, fullname, username, email, password, googleId, avatar, refreshToken│
 └──────────────────────────────────────────────────────────────────────────┘
      │ organizer              │ owner                  │ owner
      ▼                        ▼                        ▼
   Event                  Participant               Member
    │  eventName            owner (→ User)           owner (→ User)
    │  festivalName         event (→ Event)          event (→ Event)
    │  category             identityNumber           name, role
    │  sports / cultural
    │  memberCode (unique)
    │  participantCode (unique)
    │  scorerUpdater (→ User)
    │
    ├──► CricketFormat (1:1)
    │     tournamentType, overs, playersPerTeam
    │
    ├──► Schedule (1:1)
    │     method (AI/Manual), matches[]
    │
    ├──► Team (1:many)
    │     name, teamCode, teamlogo, owner (→ User)
    │       │
    │       ├──► Cricket_Player (1:many)
    │       │     owner (→ User), balls, runs, wickets, overs
    │       │
    │       └──► Match (many:many via team1Id/team2Id)
    │
    └──► Match (1:many)
          team1, team2, team1Id, team2Id
          status: upcoming | toss_done | squads_ready | live | completed | abandoned
          tossWinner, tossDecision
          currentInnings (1 or 2)
          innings1, innings2 (embedded)
            ├ battingTeam, runs, wickets, overs, balls, extras
            ├ batsmen[] — name, runs, balls, fours, sixes, isOut
            ├ bowlers[]  — name, overs, balls, runs, wickets
            └ ballByBall[] — over, ball, runs, isWicket, isWide, commentary
          result
```

---

## 5. Backend — Project Structure

```
Backend/
├── .env                        ← Environment variables (never commit)
├── .env.example                ← Template for required variables
├── package.json
└── src/
    ├── index.js                ← Server entry — connects DB, starts HTTP + Socket
    ├── app.js                  ← Express app — middleware, route mounting
    ├── socket.js               ← Socket.IO init + emitMatchUpdate()
    │
    ├── config/
    │   ├── index.js            ← Validated config object from env vars
    │   └── passport.js         ← Google OAuth strategy
    │
    ├── constants/
    │   └── index.js            ← HTTP_STATUS, COOKIE_OPTIONS, EVENT_TYPES, etc.
    │
    ├── db/
    │   └── index.js            ← Mongoose connection
    │
    ├── middlewares/
    │   ├── auth.middleware.js       ← verifyJWT — decodes token, attaches req.user
    │   ├── eventAccess.middleware.js← verifyEventAccess — organizer/member/participant check
    │   ├── error.middleware.js      ← Global error handler + 404 handler
    │   ├── multer.middleware.js     ← Disk storage to public/temp/
    │   └── validate.middleware.js   ← Request body validation helper
    │
    ├── models/                 ← Generic / shared models
    │   ├── user.model.js
    │   ├── event.model.js
    │   ├── participant.model.js
    │   ├── members.model.js
    │   ├── team.model.js
    │   ├── match.model.js
    │   └── schedule.model.js
    │
    ├── controllers/            ← Generic controllers
    │   ├── user.controller.js
    │   ├── event.controller.js
    │   ├── participant.controller.js
    │   ├── member.controller.js
    │   ├── team.controller.js
    │   └── schedule.controller.js
    │
    ├── routes/                 ← Generic routes
    │   ├── user.route.js
    │   ├── event.route.js
    │   ├── participant.route.js
    │   ├── member.route.js
    │   ├── team.route.js
    │   └── schedule.route.js
    │
    ├── sports/                 ← Sport-specific code (one folder per sport)
    │   └── cricket/
    │       ├── models/
    │       │   ├── format.model.js     ← CricketFormat (tournamentType, overs, playersPerTeam)
    │       │   ├── player.model.js     ← Cricket_Player (team, owner, stats)
    │       │   └── cricket.model.js    ← Legacy cricket model
    │       ├── controllers/
    │       │   ├── format.controller.js  ← saveFormat, getFormat
    │       │   ├── player.controller.js  ← joinTeam, getMyTeam, leaveTeam, removePlayer
    │       │   └── match.controller.js   ← Full match lifecycle
    │       └── routes/
    │           ├── format.route.js
    │           ├── player.route.js
    │           └── match.route.js
    │
    ├── services/
    │   └── user.service.js     ← User business logic (register, login, profile)
    │
    └── utils/
        ├── ApiError.js         ← Custom error class with statusCode
        ├── ApiResponse.js      ← Standard response wrapper
        ├── AsyncHandler.js     ← Wraps async controllers, forwards errors
        ├── cloudinary.js       ← Upload + delete helpers
        ├── mailer.js           ← OTP email sender
        └── redis.js            ← cacheGet / cacheSet / cacheDel with fallback
```

### Route Mounting (app.js)

```
/api/v1/users                       → user routes
/api/v1/events                      → event routes
/api/v1/participants                 → participant routes
/api/v1/members                     → member routes
/api/v1/teams                       → team routes
/api/v1/schedule                    → schedule routes
/api/v1/sports/cricket/players      → cricket player routes
/api/v1/sports/cricket/format       → cricket format routes
/api/v1/sports/cricket/matches      → cricket match routes

/api/cpsh/*  →  same routers (legacy backward-compatibility)
```

---

## 6. Backend — API Reference

> All protected routes require `Authorization: Bearer <token>` header or `accessToken` cookie.
> `EventAccess` = user must be organizer, member, participant, or cricket player of that event.

### Users — `/api/v1/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register — body: `fullname, username, email, password` + file `avatar` |
| POST | `/login` | No | Login — body: `usermail, password` |
| POST | `/logout` | JWT | Logout, clears refresh token |
| POST | `/refresh-token` | No | Rotate tokens using refresh token cookie |
| GET | `/profile` | JWT | Get current user profile |
| POST | `/send-otp` | No | Send 6-digit OTP to email |
| POST | `/verify-otp` | No | Verify OTP and login |
| GET | `/auth/google` | No | Redirect to Google OAuth |
| GET | `/auth/google/callback` | No | Google OAuth callback |

### Events — `/api/v1/events`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create` | JWT | Create event — multipart with file `poster` |
| PATCH | `/update/:eventId` | JWT | Update event — optional file `poster` |
| DELETE | `/delete/:eventId` | JWT | Delete event |
| GET | `/get-all-events` | JWT | Get organizer's own events |
| GET | `/get-single-event/:eventId` | No | Get event by ID |
| GET | `/public` | No | Get all public events |
| PATCH | `/:eventId/assign-scorer` | JWT | Assign scorer to event |
| DELETE | `/:eventId/revoke-scorer` | JWT | Revoke scorer from event |

### Participants — `/api/v1/participants`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/participate/:participantCode` | JWT | Join event — body: `identityNumber` |
| GET | `/participate/:participantCode` | No | Get event by participant code |
| GET | `/my-events` | JWT | Get all events user participates in |
| GET | `/get-all-participants/:eventId` | JWT | Get all participants for event |
| GET | `/get-single-participant/:eventId` | JWT | Get current user's participation |
| DELETE | `/delete-participant/:participantId` | JWT | Leave event |

### Members — `/api/v1/members`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/participate/:memberCode` | JWT | Join event as member |
| GET | `/participate/:memberCode` | No | Get event by member code |
| GET | `/get-all-events` | JWT | Get all events user is member of |
| PATCH | `/edit-role/:memberId` | JWT | Update member role |
| GET | `/get-member/:eventId` | JWT | Get all members for event |

### Teams — `/api/v1/teams`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-team/:eventId` | JWT | Create team — body: `name` + file `teamlogo` |
| GET | `/get-team/:eventId` | JWT | Get user's team for event |
| GET | `/get-event-teams/:eventId` | JWT | Get all teams for event |
| PATCH | `/update-team/:eventId` | JWT | Update team name or logo |
| DELETE | `/delete-team/:eventId` | JWT | Delete team |

### Schedule — `/api/v1/schedule`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:eventId` | JWT | Get schedule for event |
| POST | `/:eventId/ai` | JWT | Generate schedule with Gemini AI |
| POST | `/:eventId/manual` | JWT | Save manual schedule |

### Cricket Players — `/api/v1/sports/cricket/players`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/join-team/:teamCode/:eventId` | JWT | Join team with team code |
| GET | `/my-team/:eventId` | JWT | Get team + players user is in |
| DELETE | `/leave-team/:eventId` | JWT | Leave team |
| DELETE | `/remove-player/:playerId` | JWT | Captain removes a player |

### Cricket Format — `/api/v1/sports/cricket/format`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/:eventId` | JWT | Save tournament format |
| GET | `/:eventId` | JWT | Get format for event |

### Cricket Matches — `/api/v1/sports/cricket/matches`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/event/:eventId/is-live` | No | Check if any match is currently live |
| GET | `/event/:eventId` | JWT + EventAccess | Get all matches for event |
| GET | `/:matchId` | JWT + EventAccess | Get single match |
| POST | `/event/:eventId/init` | JWT + EventAccess | Initialize matches from schedule |
| PATCH | `/:matchId/start` | JWT + EventAccess | Start match, record toss |
| POST | `/:matchId/delivery` | JWT + EventAccess | Record a delivery (ball-by-ball) |
| PATCH | `/:matchId` | JWT + EventAccess | Update match metadata |
| POST | `/:matchId/submit-squad` | JWT + EventAccess | Captain submits squad |
| POST | `/:matchId/confirm-xi` | JWT + EventAccess | Scorer confirms playing XI |

### Standard Response Shape

```json
{ "statusCode": 200, "data": {}, "message": "Success", "success": true }
```
```json
{ "statusCode": 404, "message": "Not found", "errors": [], "success": false }
```

---

## 7. Authentication Flow

### Password Login
```
POST /login { usermail, password }
  → bcrypt.compare
  → generateAccessToken()  (JWT, 1d)
  → generateRefreshToken() (JWT, 7d, saved to DB)
  → Set-Cookie: accessToken + refreshToken
```

### OTP Login
```
POST /send-otp { email }
  → generate 6-digit OTP
  → cacheSet(otp, 10min)
  → send email via Nodemailer

POST /verify-otp { email, otp }
  → cacheGet(otp) → compare
  → cacheDel(otp)
  → generateTokens() → Set-Cookie
```

### Google OAuth
```
GET /auth/google
  → passport.authenticate → redirect to Google

GET /auth/google/callback
  → passport callback → findOrCreate User
  → generateTokens()
  → redirect to /auth/callback?token=<accessToken>
  → frontend stores token in localStorage
```

### Token Refresh
```
POST /refresh-token (cookie: refreshToken)
  → verify JWT → findOne({ refreshToken })
  → rotate both tokens
  → Set-Cookie new tokens
```

### Frontend Route Guard
```
<ProtectedRoute>
  → useAuth() → isAuthenticated?
  → No  → redirect /login
  → Yes → render children
```

---

## 8. WebSocket / Real-time

Socket.IO is used exclusively for live cricket score broadcasting.

### Room Model
```
Client connects → socket.emit("join:match", matchId)
                → socket.emit("join:event", eventId)

Scorer POSTs delivery → server updates MongoDB
                      → emitMatchUpdate(match)
                      → io.to("match:<id>").emit("match:updated", match)
                      → io.to("event:<id>").emit("match:updated", match)

LiveScoreboard receives "match:updated" → re-renders
```

### Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `join:match` | `matchId` |
| Client → Server | `join:event` | `eventId` |
| Client → Server | `leave:match` | `matchId` |
| Client → Server | `leave:event` | `eventId` |
| Server → Client | `match:updated` | Full match object |

---

## 9. Caching Strategy

Redis is the primary cache. If Redis is unavailable the app falls back to an in-memory `Map` with TTL — no crash, no data loss.

| Cache Key | TTL | Invalidated When |
|---|---|---|
| `event:<eventId>` | 5 min | Event updated or deleted |
| `events:organizer:<userId>` | 2 min | Event created, updated, or deleted |
| `events:public` | 2 min | Any event created or deleted |
| `match:<matchId>` | 10 sec | Delivery added, match started/updated |
| `matches:event:<eventId>` | 10 sec | Any match in event changes |
| `cricketFormat:event:<eventId>` | 5 min | Format saved |
| `otp:<email>` | 10 min | OTP verified or expired |

---

## 10. Frontend — Project Structure

```
Frontend/client/
├── index.html
├── vite.config.js              ← Vite proxy: /api → http://localhost:3000
├── .env                        ← VITE_API_URL=http://localhost:3000
└── src/
    ├── main.jsx                ← BrowserRouter (base: /Campus-Sphere)
    ├── App.jsx                 ← Renders <AppRoutes />
    ├── index.css
    │
    ├── config/
    │   ├── api.js              ← API_URL = VITE_API_URL || '' (uses Vite proxy in dev)
    │   ├── fetchWithAuth.js    ← fetch() wrapper that adds Authorization header
    │   └── socket.js           ← Socket.IO client (lazy connect)
    │
    ├── routes/
    │   ├── Route.jsx           ← All route definitions
    │   ├── ProtectedRoute.jsx  ← Redirects to /login if not authenticated
    │   └── PublicRoute.jsx     ← Redirects to /home if already authenticated
    │
    ├── hooks/
    │   ├── index.js            ← Barrel export
    │   ├── useAuth.js          ← Auth context + provider
    │   ├── useFetch.js         ← useFetch, useLazyFetch, useMutation
    │   ├── useApi.js           ← useList, useItem, useCreate, useUpdate, useDelete
    │   ├── useForm.js          ← Form state + validation
    │   ├── useEvents.js        ← useEvents, useMyHostedEvents, useMyParticipatedEvents, useMyMemberEvents
    │   ├── useTeams.js         ← useMyTeams, useTeam, useEventTeams
    │   ├── useEventParticipant.js ← Fetches participant record for an event
    │   ├── useEventAccess.js   ← Checks if user can access match data
    │   ├── useScorerRole.js    ← Checks if user is assigned scorer for event
    │   └── useIsLive.js        ← Polls /is-live every 30s, returns { isLive }
    │
    ├── services/
    │   ├── index.js
    │   ├── api.service.js      ← Axios instance with token refresh interceptor
    │   ├── event.service.js    ← Event CRUD + create (FormData via fetch)
    │   ├── participant.service.js
    │   └── user.service.js
    │
    ├── components/
    │   └── shared/
    │       ├── index.js
    │       ├── EventCard.jsx       ← Unified card: basic | participant | team | hosted
    │       ├── FormInput.jsx
    │       ├── FormSelect.jsx
    │       ├── FormTextarea.jsx
    │       └── CopyToClipboard.jsx
    │
    ├── utils/
    │   ├── helpers.js          ← formatDateTime, formatDate
    │   ├── constants.js
    │   └── validation.js
    │
    └── pages/
        ├── LoadingPage.jsx
        ├── Login.jsx
        ├── Register.jsx
        ├── Profile.jsx
        ├── AuthCallback.jsx    ← Reads ?token= from Google OAuth redirect
        │
        ├── Front/              ← Landing page
        │   ├── Front.jsx
        │   ├── Top.jsx
        │   ├── Features.jsx
        │   └── Foot.jsx
        │
        ├── Home/               ← Dashboard
        │   ├── Home.jsx
        │   ├── Navbar.jsx
        │   ├── Body.jsx
        │   ├── Option.jsx      ← "I am" choice (Member / Participant)
        │   └── AllEvents.jsx
        │
        ├── EventCreation/      ← Create event forms
        │   ├── CreateEvent.jsx
        │   ├── WorkshopEventDetails.jsx
        │   ├── CulturalEventDetails.jsx
        │   └── Rule.jsx
        │
        ├── EditEvent/
        │   └── UpdateEvent.jsx
        │
        ├── MyHostedEvent/
        │   └── EventList.jsx
        │
        ├── ParticipateEvent/   ← Join as participant
        │   ├── JoinEvent.jsx
        │   └── EventDetails.jsx
        │
        ├── MyParticipatedEvents/
        │   ├── MyEvents.jsx
        │   ├── EventCardParticipant.jsx
        │   └── ParticipateateasMember.jsx
        │
        ├── JoinMember/         ← Join as member
        │   ├── JoinMember.jsx
        │   └── EventDetailsMember.jsx
        │
        ├── MyTeam/
        │   ├── Myteam.jsx
        │   └── EventCardTeam.jsx
        │
        ├── Schedule/
        │   └── SchedulePage.jsx
        │
        └── sports/             ← Sport-specific pages (one folder per sport)
            └── cricket/
                ├── EventSetup.jsx      ← Organizer: teams, schedule, match init
                ├── Format.jsx          ← Set tournament format
                ├── LiveScoreboard.jsx  ← Real-time scoreboard
                ├── MatchManager.jsx    ← Start match, record toss, confirm XI
                ├── MatchScorecard.jsx  ← Full scorecard view
                ├── ScoreInput.jsx      ← Ball-by-ball score entry
                ├── SquadSubmit.jsx     ← Captain submits squad
                └── participant/
                    ├── EventDetails.jsx  ← Role detection → redirect to creator/member
                    ├── CreateTeam.jsx    ← Create a new team
                    ├── JoinTeam.jsx      ← Join existing team with code
                    ├── TeamCreator.jsx   ← Team captain dashboard
                    └── TeamMember.jsx    ← Team member view
```

---

## 11. Frontend — Route Map

```
PUBLIC
  /                           Landing page
  /login                      Login (redirects to /home if already logged in)
  /register                   Register
  /auth/callback              Google OAuth token handler

PROTECTED — General
  /home                       Dashboard
  /choice                     Role selection (Member / Participant)
  /all-events                 Browse all public events
  /profile                    User profile

PROTECTED — Organizer
  /new-events-hosted                          Create event
  /events-hosted                              My hosted events
  /update-event/:eventId                      Edit event
  /event/:eventName/:eventId/workshop         Workshop event setup

PROTECTED — Participant
  /join-event                                 Join event with invitation code
  /event-details/:identityNumber/:participantCode/:participantId
                                              Participant event details
  /my-events                                  My participated events

PROTECTED — Member
  /joinMember                                 Join event as member
  /get-event/:memberCode                      Member event details
  /my-events-member                           My member events

PROTECTED — Schedule
  /sports/cricket/schedule/:eventId           View / generate tournament schedule

PROTECTED — Cricket (Organizer)
  /event/:eventName/:eventId/sports/cricket   Cricket event setup page
  /sports/cricket/format/:eventId             Set tournament format
  /sports/cricket/format/:eventId/view        View format (read-only)
  /sports/cricket/match-manager/:eventId      Manage matches (toss, XI, scoring)

PROTECTED — Cricket (Participant)
  /sports/cricket/event-details/:eventId/:identityNumber/:participantCode/:participantId
                                              Role detection → redirect
  /sports/cricket/create-team/:eventId        Create a team
  /sports/cricket/join-team/:eventId          Join a team with code
  /sports/cricket/team-creator/:eventId       Team captain dashboard
  /sports/cricket/team-member/:eventId        Team member view

PROTECTED — Cricket (Live Scoring)
  /sports/cricket/scoreboard/:eventId         Live scoreboard
  /sports/cricket/match/:matchId/scorecard    Full match scorecard
  /sports/cricket/match/:matchId/score-input  Ball-by-ball score entry
  /sports/cricket/match/:matchId/squad-submit Captain squad submission
```

---

## 12. Cricket Tournament Workflow

```
1. ORGANIZER CREATES EVENT
   POST /api/v1/events/create  (category: sports, sports: cricket)
   → navigates to /event/:name/:id/sports/cricket  (EventSetup page)

2. PARTICIPANTS JOIN
   POST /api/v1/participants/participate/:participantCode
   → navigates to /sports/cricket/event-details/:eventId/...
   → EventDetails detects role (creator / member / none)
   → creator  → /sports/cricket/team-creator/:eventId
   → member   → /sports/cricket/team-member/:eventId
   → none     → show Create Team / Join Team buttons

3. TEAM FORMATION
   Create team:  POST /api/v1/teams/create-team/:eventId
   Join team:    POST /api/v1/sports/cricket/players/join-team/:teamCode/:eventId

4. ORGANIZER SETS FORMAT
   POST /api/v1/sports/cricket/format/:eventId
   { tournamentType, overs, playersPerTeam }

5. SCHEDULE GENERATION
   POST /api/v1/schedule/:eventId/ai      ← Gemini AI generates fixtures
   POST /api/v1/schedule/:eventId/manual  ← Manual fixture entry

6. MATCH INITIALIZATION
   POST /api/v1/sports/cricket/matches/event/:eventId/init
   → creates Match documents from schedule

7. MATCH DAY
   a. Toss
      PATCH /api/v1/sports/cricket/matches/:matchId/start
      { tossWinner, tossDecision }  → status: toss_done

   b. Squad Submission (both captains)
      POST /api/v1/sports/cricket/matches/:matchId/submit-squad
      { teamName, players[] }  → status: squads_ready (when both done)

   c. Confirm Playing XI (scorer)
      POST /api/v1/sports/cricket/matches/:matchId/confirm-xi
      { team1PlayingXI[], team2PlayingXI[] }  → status: live

   d. Ball-by-ball Scoring
      POST /api/v1/sports/cricket/matches/:matchId/delivery
      { runs, isWicket, isWide, isNoBall, batsmanName, bowlerName, ... }
      → updates innings, emits "match:updated" via Socket.IO

   e. Match End
      → auto-detected when wickets >= 10 or overs >= format.overs
      → status: completed, result string set

8. LIVE VIEWING
   GET /api/v1/sports/cricket/matches/event/:eventId/is-live
   → "Watch Live" button appears only when isLive === true
   → LiveScoreboard subscribes to Socket.IO room, re-renders on each delivery
```

---

## 13. Multi-Sport Architecture

Cricket is fully isolated under `sports/cricket/`. Adding a new sport (e.g. volleyball) requires:

**Backend** — create `Backend/src/sports/volleyball/`
```
sports/volleyball/
├── models/
│   └── format.model.js       ← sport-specific format
├── controllers/
│   └── match.controller.js   ← sport-specific match logic
└── routes/
    └── match.route.js
```
Mount in `app.js`:
```js
import volleyballMatchRouter from "./sports/volleyball/routes/match.route.js";
app.use("/api/v1/sports/volleyball/matches", volleyballMatchRouter);
```

**Frontend** — create `Frontend/client/src/pages/sports/volleyball/`
```
sports/volleyball/
├── EventSetup.jsx
├── LiveScoreboard.jsx
└── participant/
    └── EventDetails.jsx
```
Add routes in `Route.jsx`:
```jsx
import VolleyballEventSetup from "../pages/sports/volleyball/EventSetup";
<Route path="/event/:name/:id/sports/volleyball" element={<VolleyballEventSetup />} />
```

Zero changes to existing cricket code.

---

## 14. Environment Variables

Copy `.env.example` to `.env` in the `Backend/` folder and fill in the values.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | Yes | Server port (default 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `ACCESS_TOKEN_SECRET` | Yes | JWT secret for access tokens |
| `ACCESS_TOKEN_EXPIRY` | No | Access token expiry (default `1d`) |
| `REFRESH_TOKEN_SECRET` | Yes | JWT secret for refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh token expiry (default `7d`) |
| `CLOUDINARY_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `FRONTEND_ORIGIN` | Yes | Frontend URL for CORS (e.g. `http://localhost:5173`) |
| `FRONTEND_ORIGIN_WITH_PATH` | No | Frontend URL with base path |
| `FRONTEND_BASE_PATH` | No | Base path (e.g. `/Campus-Sphere`) |
| `REDIS_URL` | No | Redis URL (default `redis://localhost:6379`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | Google OAuth callback URL |
| `EMAIL_USER` | No | Gmail address for OTP emails |
| `EMAIL_PASS` | No | Gmail App Password |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI schedule generation |

Frontend `.env` (`Frontend/client/.env`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. `http://localhost:3000`). Leave empty to use Vite proxy. |

---

## 15. Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (Atlas or local)
- Docker (for Redis) — optional but recommended

### 1. Clone and install

```bash
git clone https://github.com/Surajshivam-123/Campus-Sphere.git
cd Campus-Sphere

# Backend
cd Backend && npm install

# Frontend
cd ../Frontend/client && npm install
```

### 2. Configure environment

```bash
# Backend
cp Backend/.env.example Backend/.env
# Fill in MONGODB_URI, JWT secrets, Cloudinary, etc.

# Frontend
echo "VITE_API_URL=http://localhost:3000" > Frontend/client/.env
```

### 3. Start Redis (optional)

```bash
docker compose up -d
# Redis on :6379, RedisInsight on :8001
```

### 4. Run the servers

```bash
# Backend (terminal 1)
cd Backend && npm start

# Frontend (terminal 2)
cd Frontend/client && npm run dev
```

Frontend runs at `http://localhost:5173/Campus-Sphere/`
Backend runs at `http://localhost:3000`

The Vite dev server proxies all `/api` requests to the backend, so no CORS issues in development.
