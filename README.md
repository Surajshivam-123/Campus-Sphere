#Purpose and Scope
This document provides a high-level introduction to Campus-Sphere, a full-stack web application designed for organizing and managing campus events. It covers the system's purpose, architecture, technology stack, and core features. For detailed information about specific subsystems, see:

Frontend architecture and routing: Frontend Architecture
Backend API structure: Backend Architecture
Authentication mechanisms: Authentication & Authorization
Event creation and management: Event Management System
User workflows by role: User Roles & Workflows
Cricket tournament features: Cricket Tournament Management

#System Description
Campus-Sphere is an event organizer platform for campus activities, implemented as a single-page application (SPA) with a RESTful backend API. The system supports multiple event types including workshops, sports tournaments (with specialized cricket management), cultural events, and coding competitions.

The platform implements a multi-role architecture where users can act as Hosts (event creators), Participants (event joiners using invitation codes), or Members (alternative participation pathway with different access levels). Events use unique invitation codes (participantCode and memberCode) to control access.

Sources: 
Backend/package.json
Frontend/client/src/routes/Route.jsx

#Technology Stack
##Frontend
###| Component | Technology | Purpose |
| Build Tool | Vite | Development server and build optimization |
| Framework | React | Component-based UI |
| Routing|React | Router | Client-side navigation |
| Styling | Tailwind | CSS | Utility-first styling |
| HTTP Client	| Fetch API	| Backend communication |

##Backend
###| Component | Technology	| Purpose |
| Runtime	| Node.js (>=18) | JavaScript execution environment |
| Framework |	Express.js(v5.1.0) | Web server and routing |
| Database	| MongoDB	| Document-based data persistence |
| ODM	| Mongoose (v8.16.3)	| Schema modeling and queries |
| Authentication	| JWT (jsonwebtoken v9.0.2) |	Token-based auth |
|Password Hashing	| bcrypt (v6.0.0) |	Secure password storage |
| File Upload	| Multer (v2.0.1)	| Multipart form data handling |
| Image Storage	| Cloudinary (v2.7.0)	| External image hosting |

API Base Path: All backend endpoints are namespaced under /api/cpsh/ to avoid conflicts and provide clear API versioning.

#Core Features
Authentication & Session Management
Registration/Login: User creation with fullname, username, email, password, and optional avatar
JWT Tokens: Dual-token system with accessToken (short-lived) and refreshToken (long-lived)
HTTP-Only Cookies: Tokens stored as secure cookies to prevent XSS attacks
Token Refresh: Automatic token renewal via /api/cpsh/users/refresh-token endpoint
Session Invalidation: Logout clears both client cookies and server-stored refresh tokens

#Event Management
Event Creation: Hosts create events with metadata including eventName, festivalName, location, startDate, category, and sports type
Invitation Codes: Auto-generated memberCode and participantCode for controlled access
Image Upload: Event posters uploaded to Cloudinary via multer middleware
CRUD Operations: Full create, read, update, delete capabilities for event hosts
Event Categories: Workshop, Sports (Cricket), Cultural, Coding, Others

#Multi-Role Participation
Host Role: Create, update, delete events; view participant/member lists; manage cricket formats
Participant Role: Join events with participantCode; view participation history; join cricket teams
Member Role: Join events with memberCode; separate tracking and access level from participants

#Frontend Routing Structure
The application uses a hub-and-spoke routing pattern centered around /home:

| Route |	Component	| Role	| Purpose |
| /	| Front.jsx	| Public	| Landing page |
|/login	| Login	| Public	| User authentication |
| /register	| Register	| Public	| User registration |
| /home |	Home(Body + Navbar)	|Authenticated |	Central navigation hub |
| /choice	| IamChoice	| Authenticated	| Role | selection gateway |
| /all-events	| AllEvents	| Authenticated |	Browse all events |
| /profile	| Profile	| Authenticated	| User profile management |
|/new-events-hosted	 | CreateEvent |	Host	| Create new event |
| /events-hosted	| EventList	| Host	| View/manage hosted events |
| /update-event/:eventId	| UpdateEventPage	| Host	| Edit event details |
| /join-event	| JoinEvent	| Participant	| Join with invitation code |
| /my-events	| MyEvents	| Participant	| View participated events |
| /event-details/:identityNumber/:participantCode |	EventDetailsPage	| Participant	| View event as participant |
| /joinMember	| JoinMember	| Member	| Join as member |
| /my-events-member	MemberEvents	| Member	| View member events |
| /get-event/:memberCode	| EventDetailsMemberPage	| Member	| View event as member |
| /cricket-format	| CreateCricketFormat	| Host	| Set up cricket tournament format |
| /join-team/:eventId	| JoinTeam	| Participant	| Join cricket team |
###Protected Routes: All routes except /, /login, and /register require authentication via cookie-based JWT.

#Environment Configuration
##Backend Environment Variables
The backend relies on environment variables for configuration (loaded via dotenv):
-Database connection strings
-JWT secrets (access and refresh token signing keys)
-Cloudinary credentials (cloud name, API key, API secret)
-CORS origin settings

##Frontend Environment Variables
VITE_API_URL=https://campus-sphere-1.onrender.com
The frontend uses VITE_API_URL to determine the backend base URL for API calls. During development, CORS is configured to allow http://localhost:5173.


##CORS Configuration: The backend explicitly allows http://localhost:5173 as the origin with credentials: true to enable cookie-based authentication during development.
