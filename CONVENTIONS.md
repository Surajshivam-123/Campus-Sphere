# Campus Sphere — Code Best Practices & Conventions

This document outlines the coding standards, architectural rules, and development conventions for the **Campus Sphere** codebase (Backend & Frontend). All contributors and team members should adhere to these practices to ensure codebase reliability, maintainability, and security.

---

## Table of Contents

1. [Architecture & Principles](#1-architecture--principles)
2. [Backend Conventions (Node.js & Express)](#2-backend-conventions-nodejs--express)
   - [Controller vs Service Separation](#controller-vs-service-separation)
   - [Express Handlers vs Socket.IO Event Handlers](#express-handlers-vs-socketio-event-handlers)
   - [API Responses & Error Handling](#api-responses--error-handling)
   - [Authentication & Token Handling](#authentication--token-handling)
   - [Mongoose & Database Best Practices](#mongoose--database-best-practices)
   - [Redis Caching Guidelines](#redis-caching-guidelines)
3. [Real-Time & Socket.IO Conventions](#3-real-time--socketio-conventions)
   - [Global Socket Singleton Lifecycle](#global-socket-singleton-lifecycle)
   - [Room Authorization & Naming](#room-authorization--naming)
4. [Frontend Conventions (React 19 & Vite)](#4-frontend-conventions-react-19--vite)
   - [Component Structure & Design](#component-structure--design)
   - [State Management & Custom Hooks](#state-management--custom-hooks)
   - [Data Fetching & API Services](#data-fetching--api-services)
   - [Theme & Styling Rules](#theme--styling-rules)
   - [Defensive UI Coding](#defensive-ui-coding)
5. [Naming Conventions](#5-naming-conventions)
6. [Git & Environment Practices](#6-git--environment-practices)

---

## 1. Architecture & Principles

- **Separation of Concerns**: Controllers handle HTTP transport (status codes, headers, cookie extraction, request validation). Services implement business logic and database orchestration. Models define data schemas and validation rules.
- **Fail-Safe & Defensive**: Always assume populated references can be `null` (e.g. deleted users or events), third-party services (Judge0, Cloudinary, Redis) may be unavailable, and network cookies may be blocked in cross-origin environments.
- **Stateless API, Stateful WebSockets**: Express routes should be stateless and rely on JWTs or verified sessions. Socket.IO connections manage real-time room memberships and subscriptions.

---

## 2. Backend Conventions (Node.js & Express)

### Controller vs Service Separation
- **Thin Controllers**: Controllers must only parse/validate input, invoke service methods, and format the HTTP response.
  ```javascript
  // Good: Controller delegates business logic to service
  const createClub = asyncHandler(async (req, res) => {
    const club = await clubService.createClub(req.body, req.file?.path, req.user._id);
    return res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, club, "Club created successfully")
    );
  });
  ```
- **Business Logic in Services**: Database queries, external API calls (e.g. Cloudinary, Judge0, Nodemailer), complex calculations, and transactions belong in `src/services/`.

### Express Handlers vs Socket.IO Event Handlers
> [!CAUTION]
> **Never wrap Socket.IO handlers in Express `asyncHandler`!**
> Express `asyncHandler` expects `(req, res, next)`. Socket.IO event listeners pass `(data, callback)` or simply `(data)`. Wrapping socket listeners in `asyncHandler` results in runtime crashes and broken error propagation.

- **Express Routes**:
  ```javascript
  // Express controllers: use asyncHandler, throw ApiError
  const getEvent = asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(req.params.id);
    if (!event) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, event));
  });
  ```
- **Socket.IO Events**:
  Implement handlers directly inside `initSocket(httpServer)` or dedicated socket service modules. Use `try...catch`, emit error events back to `socket`, and broadcast via `io.to(...)`:
  ```javascript
  // Socket.IO events: catch internally, emit socket error event
  socket.on("club:chat:send", async ({ clubId, text, senderId, senderName, senderAvatar, tempId }) => {
    try {
      if (!clubId || !text?.trim() || !senderId) return;

      // Authorize membership
      const isAllowed = await isMemberOrFounder(clubId, senderId);
      if (!isAllowed) {
        socket.emit("club:chat:error", { tempId, message: "Not authorized to post in this club." });
        return;
      }

      const message = await ClubMessage.create({ club: clubId, sender: senderId, text: text.trim() });
      io.to(`club:chat:${clubId}`).emit("club:chat:message", formatMessagePayload(message));
    } catch (err) {
      console.error("[club:chat:send] error:", err.message);
      socket.emit("club:chat:error", { tempId, message: "Failed to send message." });
    }
  });
  ```

### API Responses & Error Handling
- **Consistent Response Schema**: Always wrap successful responses using `ApiResponse`:
  ```javascript
  new ApiResponse(statusCode, data, message);
  ```
- **Standardized Errors**: Throw `ApiError` instances rather than generic `Error` instances:
  ```javascript
  throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid input data", [/* validation details */]);
  ```
- **HTTP Status Constants**: Use `HTTP_STATUS` from `src/constants/index.js` (e.g., `HTTP_STATUS.OK`, `HTTP_STATUS.CREATED`, `HTTP_STATUS.FORBIDDEN`).

### Authentication & Token Handling
- **Dual Token Strategy**:
  1. Set tokens in `httpOnly` secure cookies for same-origin or compatible browser sessions.
  2. **Crucial**: Always return `{ user, accessToken, refreshToken }` in the JSON response payload for both `login` **and** `registration`.
  ```javascript
  // registerUser & loginUser:
  res
    .status(HTTP_STATUS.CREATED)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        { user, accessToken, refreshToken },
        "Registration successful"
      )
    );
  ```
  *Why*: In cross-origin deployments (e.g. Vercel frontend + Render backend), third-party cookie restrictions frequently drop cookies. The client relies on the `Authorization: Bearer <token>` header stored in `localStorage`.

### Mongoose & Database Best Practices
- **Defend Against Orphaned / Deleted References**:
  When using `.populate()`, if a referenced document was deleted, Mongoose returns `null`. **Always check that populated objects and their `_id` exist before calling `.toString()` or accessing properties**:
  ```javascript
  // Good: Null checks for populated fields
  for (const sub of submissions) {
    if (!sub.participant?._id || !sub.problem?._id) continue;
    const uid = sub.participant._id.toString();
    const pid = sub.problem._id.toString();
    // ...
  }
  ```
- **Use `.lean()` for Read Operations**: Queries that only read data for serialization should use `.lean()` to bypass Mongoose hydration overhead and significantly improve throughput.
- **Indexes**:
  - Always define indexes on fields used in filtering, querying, and sorting (`timestamps`, foreign keys, query statuses).
  - Use compound indexes for multi-field constraints (e.g. `{ club: 1, user: 1 }` unique index).
- **Soft Deletion**: For chat messages, preserve thread context by soft-deleting: set `deleted: true` and replace `text` with `"This message was deleted."` rather than removing the document.

### Redis Caching Guidelines
- **Graceful Fallback**: The platform must operate seamlessly when Redis is offline. Always wrap cache operations with helper functions (`cacheGet`, `cacheSet`) that catch connection failures and fall back to database queries.
- **TTL (Time-To-Live)**: Never set indefinite caches for dynamic data. Use short TTLs (e.g., 15–60 seconds for contest leaderboards) or explicit cache invalidation upon state updates.

---

## 3. Real-Time & Socket.IO Conventions

### Global Socket Singleton Lifecycle
> [!IMPORTANT]
> **Never call `socket.disconnect()` inside a component's unmount cleanup!**

The frontend uses a single shared Socket.IO connection. Calling `socket.disconnect()` on component unmount breaks real-time connectivity for the entire single-page application (killing notifications, background updates, and open chats across tabs/components) until a hard browser refresh.

#### Correct React Cleanup Pattern:
```javascript
useEffect(() => {
  if (!socket.connected) socket.connect();

  socket.emit("join:match", matchId);
  socket.on("match:updated", handleMatchUpdate);

  return () => {
    // Leave room and remove listener — DO NOT disconnect socket
    socket.emit("leave:match", matchId);
    socket.off("match:updated", handleMatchUpdate);
  };
}, [matchId]);
```

### Room Authorization & Naming
- Follow standard room prefix conventions:
  - `event:<eventId>`: Public event notifications / updates
  - `event:chat:<eventId>`: Authorized event chat
  - `club:chat:<clubId>`: Active club members & founder
  - `team:chat:<teamId>`: Captain & registered team players
  - `match:<matchId>`: Live match score updates
  - `user:<userId>`: Direct user notifications (request approvals, alerts)
  - `captain:<captainId>`: Captain alerts for team join requests
- **Verification on Join**: Validate permissions before joining protected rooms (`socket.join(...)`) and verify identity on each inbound message event.

---

## 4. Frontend Conventions (React 19 & Vite)

### Component Structure & Design
- **Functional Components**: Use functional components with React Hooks exclusively.
- **Folder Placement**:
  - `src/pages/`: Top-level route views (organized by domain, e.g. `Club/`, `sports/cricket/`, `coding/`).
  - `src/components/`: Reusable modular components. Shared components belong in `src/components/shared/`.
  - `src/hooks/`: Custom hooks (`useAuth`, `useFetch`, `useTheme`, etc.).
  - `src/services/`: API client services for backend endpoints.
- **Lazy Loading**: Route pages should be lazy-loaded using `React.lazy()` and wrapped in `<Suspense fallback={<LoadingPage />}>` inside `Route.jsx` to optimize initial bundle delivery.

### State Management & Custom Hooks
- **Authentication**: Access current user info and auth routines via the `useAuth()` hook.
- **Avoid Stale Closures in Sockets & Callbacks**: Use `useCallback` and specify correct dependency arrays, or use functional state setters (`setItems(prev => ...)`) to avoid referencing stale values.

### Data Fetching & API Services
- **Axios API Client (`apiClient`)**:
  - Located in `src/services/api.service.js`.
  - Configured with interceptors to automatically attach `Authorization: Bearer <accessToken>` from `localStorage` and handle 401 token refresh handshakes.
- **`fetchWithAuth`**:
  - Helper wrapper around native `fetch` with credential forwarding and token support.
  - Used in components that prefer direct fetch calls.
- **Token Persistence**:
  - Whenever an authentication call succeeds (login, register, OAuth callback), store `accessToken` in `localStorage`:
    ```javascript
    if (response?.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    ```

### Theme & Styling Rules
- **CSS Variables & Design System**: Use Campus Sphere theme variables rather than hardcoded hex colors:
  - `var(--color-bg)`: Primary application background
  - `var(--color-surface)`: Cards, panels, modals
  - `var(--color-border)`: Dividers and outlines
  - `var(--color-navy)`: Primary brand color / text emphasis
  - `var(--color-gold)`: Accent color
  - `color-mix(...)`: For transparent color variants (e.g. `color-mix(in srgb, var(--color-navy) 10%, transparent)`)
- **Tailwind Utility Classes**: Use Tailwind for layout, spacing, flexbox, and grid. For dynamic theming, combine Tailwind layout utilities with style attributes referencing theme variables.

### Defensive UI Coding
- **Prop Scopes & Route Params**: Verify variables exist in component scope. Do not assume route parameters exist under arbitrary names without destructuring them from `useParams()`.
  ```jsx
  // Bad: eventId is not destructured from useParams()
  <FloatingChatButton eventId={eventId} />

  // Good: Reference verified state object or destructured param
  <FloatingChatButton eventId={eventData?._id} />
  ```
- **Optional Chaining (`?.`) & Fallbacks**: Always use optional chaining on nested objects received from APIs (`eventData?.organizer?.fullname`).
- **Loading & Empty States**: Every data-driven component must render a clean loading indicator (`<LoadingPage />` or skeleton) and an empty-state fallback when data is missing or lists are empty.

---

## 5. Naming Conventions

| Category | Convention | Examples |
|---|---|---|
| **React Components** | PascalCase | `FloatingChatButton.jsx`, `ContestArena.jsx` |
| **Custom Hooks** | camelCase with `use` prefix | `useAuth.jsx`, `useScorerRole.js` |
| **Services** | camelCase with `.service.js` suffix | `user.service.js`, `club.service.js` |
| **Controllers** | camelCase with `.controller.js` suffix | `clubChat.controller.js`, `user.controller.js` |
| **Models** | camelCase with `.model.js` suffix | `clubMember.model.js`, `eventMessage.model.js` |
| **Route Definitions** | camelCase with `.route.js` suffix | `club.route.js`, `event.route.js` |
| **Socket Events** | `domain:action` (colon-separated lowercase) | `club:chat:send`, `match:updated`, `join:contest` |
| **REST Endpoints** | kebab-case, plural nouns where applicable | `/api/cpsh/events/get-single-event/:id`, `/api/cpsh/clubs/my-clubs` |
| **Constants** | UPPER_SNAKE_CASE | `HTTP_STATUS`, `COOKIE_OPTIONS`, `PAGE_SIZE` |

---

## 6. Git & Environment Practices

### Line Endings & Formatting
- Ensure git handles line endings properly across platforms (Linux, macOS, Windows).
- Configure your local git setting:
  ```bash
  git config core.autocrlf input
  ```
- Avoid committing files with mixed CRLF and LF line terminators.

### Commits & Branches
- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add live ball-by-ball commentary in cricket module`
  - `fix: prevent global socket disconnect on scorecard unmount`
  - `docs: add code conventions and guidelines`
  - `refactor: extract team validation logic to service`
- Branch naming convention:
  - `feat/<feature-name>`
  - `fix/<issue-name>`
  - `chore/<task-name>`

### Pre-PR Checklist
Before submitting a pull request, ensure:
1. `npm run build` passes with zero errors in `Frontend/client`.
2. Backend files pass syntax checks (`node --check <file>`).
3. No lingering `console.log` statements in production routes.
4. No hardcoded credentials, API keys, or private URLs in code (use `.env` and `src/config/`).
5. All newly added socket listeners have corresponding removal cleanup in `useEffect`.
