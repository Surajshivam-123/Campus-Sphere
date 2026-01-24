# Campus-Sphere

Campus-Sphere is a full-stack web application designed to organize and manage campus events efficiently. It supports multiple event types, role-based participation, secure authentication, and specialized sports (cricket) tournament management — all delivered through a modern single-page application (SPA).

---

## Purpose and Scope

This document provides a high-level overview of the **Campus-Sphere** platform, including:

* System purpose and architecture
* Technology stack
* Core features and workflows
* Frontend routing structure
* Environment and configuration details

For deeper dives into specific subsystems, refer to:

* Frontend Architecture
* Backend Architecture
* Authentication & Authorization
* Event Management System
* User Roles & Workflows
* Cricket Tournament Management

---

## System Description

Campus-Sphere is an event organizer platform for campus activities, implemented as a **single-page application (SPA)** backed by a **RESTful API**.

The system supports multiple event categories, including:

* Workshops
* Sports tournaments (with advanced cricket management)
* Cultural events
* Coding competitions
* Other campus activities

A **multi-role architecture** allows users to participate in different capacities:

* **Host** – creates and manages events
* **Participant** – joins events using invitation codes
* **Member** – joins events via an alternative access pathway

Access to events is controlled through auto-generated invitation codes:

* `participantCode`
* `memberCode`

**Sources**:

* `Backend/package.json`
* `Frontend/client/src/routes/Route.jsx`

---

## Technology Stack

### Frontend

| Component   | Technology   | Purpose                                      |
| ----------- | ------------ | -------------------------------------------- |
| Build Tool  | Vite         | Fast development server and optimized builds |
| Framework   | React        | Component-based user interface               |
| Routing     | React Router | Client-side navigation                       |
| Styling     | Tailwind CSS | Utility-first styling                        |
| HTTP Client | Fetch API    | Backend communication                        |

### Backend

| Component        | Technology                | Purpose                          |
| ---------------- | ------------------------- | -------------------------------- |
| Runtime          | Node.js (>=18)            | JavaScript execution environment |
| Framework        | Express.js (v5.1.0)       | Web server and routing           |
| Database         | MongoDB                   | Document-based data storage      |
| ODM              | Mongoose (v8.16.3)        | Schema modeling and queries      |
| Authentication   | JWT (jsonwebtoken v9.0.2) | Token-based authentication       |
| Password Hashing | bcrypt (v6.0.0)           | Secure password storage          |
| File Upload      | Multer (v2.0.1)           | Multipart form-data handling     |
| Image Storage    | Cloudinary (v2.7.0)       | External image hosting           |

### API Base Path

All backend endpoints are namespaced under:

```
/api/cpsh/
```

This ensures clear API versioning and avoids route conflicts.

---

## Core Features

### Authentication & Session Management

* **User Registration & Login**
  Users register with fullname, username, email, password, and an optional avatar.

* **JWT-Based Authentication**
  A dual-token system is used:

  * `accessToken` (short-lived)
  * `refreshToken` (long-lived)

* **Secure Cookies**
  Tokens are stored in **HTTP-only cookies** to prevent XSS attacks.

* **Token Refresh**
  Automatic access-token renewal via:

  ```
  /api/cpsh/users/refresh-token
  ```

* **Logout & Session Invalidation**
  Logout clears client-side cookies and invalidates refresh tokens on the server.

---

## Event Management

* **Event Creation**
  Hosts create events with metadata such as:

  * Event name
  * Festival name
  * Location
  * Start date
  * Category
  * Sports type (if applicable)

* **Invitation Codes**
  Auto-generated codes (`participantCode`, `memberCode`) control event access.

* **Image Uploads**
  Event posters are uploaded using Multer middleware and stored on Cloudinary.

* **CRUD Operations**
  Hosts can create, read, update, and delete events.

* **Supported Categories**

  * Workshop
  * Sports (Cricket)
  * Cultural
  * Coding
  * Others

---

## Multi-Role Participation

### Host

* Create, update, and delete events
* View participant and member lists
* Configure cricket tournament formats

### Participant

* Join events using `participantCode`
* View participation history
* Join cricket teams within events

### Member

* Join events using `memberCode`
* Separate access level and tracking from participants
* View member-specific event details

---

## Frontend Routing Structure

The frontend follows a **hub-and-spoke routing pattern** centered around `/home`.

| Route                                             | Component              | Access Level  | Purpose                   |
| ------------------------------------------------- | ---------------------- | ------------- | ------------------------- |
| `/`                                               | Front.jsx              | Public        | Landing page              |
| `/login`                                          | Login                  | Public        | User authentication       |
| `/register`                                       | Register               | Public        | User registration         |
| `/home`                                           | Home (Body + Navbar)   | Authenticated | Central navigation hub    |
| `/choice`                                         | IamChoice              | Authenticated | Role selection gateway    |
| `/all-events`                                     | AllEvents              | Authenticated | Browse all events         |
| `/profile`                                        | Profile                | Authenticated | User profile management   |
| `/new-events-hosted`                              | CreateEvent            | Host          | Create new event          |
| `/events-hosted`                                  | EventList              | Host          | Manage hosted events      |
| `/update-event/:eventId`                          | UpdateEventPage        | Host          | Edit event details        |
| `/join-event`                                     | JoinEvent              | Participant   | Join with invitation code |
| `/my-events`                                      | MyEvents               | Participant   | View participated events  |
| `/event-details/:identityNumber/:participantCode` | EventDetailsPage       | Participant   | Participant event view    |
| `/joinMember`                                     | JoinMember             | Member        | Join as member            |
| `/my-events-member`                               | MemberEvents           | Member        | View member events        |
| `/get-event/:memberCode`                          | EventDetailsMemberPage | Member        | Member event view         |
| `/cricket-format`                                 | CreateCricketFormat    | Host          | Configure cricket format  |
| `/join-team/:eventId`                             | JoinTeam               | Participant   | Join cricket team         |

### Protected Routes

All routes except `/`, `/login`, and `/register` require authentication using cookie-based JWTs.

---

## Environment Configuration

### Backend Environment Variables

Backend configuration is managed via environment variables (loaded using `dotenv`):

* MongoDB connection URI
* JWT access and refresh secrets
* Cloudinary credentials (cloud name, API key, API secret)
* CORS origin settings

### Frontend Environment Variables

```env
VITE_API_URL=https://campus-sphere-1.onrender.com
```

The frontend uses `VITE_API_URL` as the base URL for all API calls.

---

## CORS Configuration

During development, the backend explicitly allows:

```
http://localhost:5173
```

CORS is configured with:

* `credentials: true`

This enables secure cookie-based authentication between the frontend and backend.

---

## Conclusion

Campus-Sphere provides a scalable, secure, and role-driven platform for managing campus events. Its modular architecture, modern tech stack, and flexible participation model make it suitable for a wide range of academic and extracurricular use
