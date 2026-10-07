/**
 * Campus Sphere Knowledge Base
 * Structured documentation chunks for Retrieval-Augmented Generation (RAG).
 */

export const KNOWLEDGE_BASE_CHUNKS = [
  {
    id: "overview",
    title: "About Campus Sphere",
    category: "General",
    keywords: ["what is campus sphere", "about", "overview", "features", "platform", "purpose"],
    content: `Campus Sphere is a comprehensive, full-stack campus event and tournament management platform designed for universities, colleges, student clubs, and event organizers.
Key Features include:
1. Event Management: Create, edit, and manage campus events (cultural, technical, sports, workshops) with custom posters, participant capacity, rules, and schedules.
2. Dual Join Models: Attendees join as Participants via unique participant codes, while staff/volunteers join as Members with assigned roles via member codes.
3. Cricket Tournament Platform: Complete lifecycle management including format setup (overs, powerplays, players), squad registration, match scheduling, live ball-by-ball scoring, and real-time scoreboards via Socket.IO.
4. Coding Contest Platform: Online programming contests featuring problem authoring with sample/hidden test cases, in-browser code editor supporting C++, Python, Java, and JavaScript, remote code execution with Judge0, and real-time live leaderboards.
5. Campus Clubs: Create student clubs, manage memberships (Heads, Members, Alumni), approve join requests, and interact through dedicated Club Chats.
6. Team Collaboration: Create teams for group events or hackathons, share team codes, design custom or AI-generated logos, and communicate via private Team Chats.
7. AI-Powered Tools: Gemini-powered AI SVG Avatar Generator, AI Event Banner/Poster Generator, AI Schedule Timetable Generator, and Campus Sphere RAG Assistant.
8. Observability & Performance: Production monitoring with Prometheus (/metrics) and Grafana dashboards, with high-performance Redis caching and automatic in-memory fallback.`
  },
  {
    id: "auth_and_account",
    title: "Authentication, Registration & User Accounts",
    category: "Authentication",
    keywords: ["register", "login", "signup", "auth", "otp", "google", "oauth", "password", "jwt", "avatar", "profile"],
    content: `Campus Sphere provides secure authentication and profile management:
- Registration & Login Methods:
  1. Email & Password: Standard signup with name, username, email, and password.
  2. Email OTP Verification: Passwordless or verification login sending a one-time passcode to the user's email via Nodemailer.
  3. Google OAuth 2.0: Single click login with Google account credentials (/api/cpsh/users/auth/google).
- Session Management: Employs secure JWT architecture with short-lived Access Tokens (header Bearer or cookie) and Refresh Tokens stored securely in the database and HTTP-only cookies, with automatic silent token refresh.
- Profile Management (/profile):
  - Users can view and update their full name, username, and profile picture.
  - AI Vector Avatar Generator: Users can provide a prompt (e.g. "cyberpunk coder" or "cricketer wearing helmet") and Gemini generates an SVG avatar directly.
  - Upload Custom Avatar: Users can upload image files which are stored via Cloudinary.`
  },
  {
    id: "event_creation_and_management",
    title: "Creating and Managing Events (Organizers)",
    category: "Events",
    keywords: ["create event", "host event", "organizer", "edit event", "rules", "poster", "schedule", "delete event"],
    content: `Organizers can create and manage events via the Event Management module:
- How to Create an Event (/events/create):
  1. Navigate to 'Create Event' from the navigation bar or dashboard.
  2. Fill in details: Event Name, Festival Name (optional), Organization / College, Category ('technical', 'cultural', 'sports', 'others'), Mode ('online' or 'offline'), Start Date, Location, and Maximum Participants limit.
  3. Add Event Rules: Enter custom rules and guidelines for attendees.
  4. Upload or Generate Poster: Upload an image file (hosted on Cloudinary) or use the Gemini AI Poster Generator to create an SVG banner.
  5. Upon creation, Campus Sphere automatically generates two unique codes:
     - 'participantCode': Share this code with attendees/competitors who want to participate.
     - 'memberCode': Share this code with staff, coordinators, and volunteers who assist in organizing.
- Managing Hosted Events (/all-events -> Hosted Events):
  - View attendee counts and registered participants.
  - Review, approve, or reject Member Join Requests.
  - Edit event details, update posters, or delete the event.
  - Generate AI Schedule Timetables with Gemini based on event duration and sessions.`
  },
  {
    id: "event_codes_and_roles",
    title: "Event Codes: Participant Code vs Member Code",
    category: "Events",
    keywords: ["participant code", "member code", "join code", "difference", "how to join", "event code"],
    content: `Campus Sphere uses a two-tier join model to distinguish attendees from event staff:
1. Participant Code:
   - Purpose: For regular students, attendees, and competitors who wish to participate in the event.
   - Requirements to Join: The user enters the event's unique 'participantCode' and their college Student Identity / Roll Number.
   - Permissions: Attend the event, view rules and schedules, compete in contests/sports, access public Event Chat.
2. Member Code:
   - Purpose: For volunteers, coordinators, and event staff who help run the event.
   - Requirements to Join: The user enters the event's unique 'memberCode' and specifies their preferred role (e.g., Coordinator, Volunteer, Scorer).
   - Workflow: Submits a join request to the organizer. Once approved, the member is officially added to the event staff.
   - Permissions: Assist in event operations, manage participants, access staff tools, and be assigned specialized roles like Scorer Updater in cricket matches.`
  },
  {
    id: "joining_events",
    title: "How to Join Events as a Participant",
    category: "Events",
    keywords: ["join event", "participate", "student identity", "my events", "registered events", "attend"],
    content: `To join an event as a participant:
1. Obtain the 'participantCode' from the event organizer, promotional poster, or event page.
2. Go to 'Join Event' (/events/join).
3. Enter the 'participantCode' and your Student Identity / Roll Number.
4. Click 'Join'. You are instantly registered for the event!
5. Viewing Your Events (/all-events -> Participated Events):
   - Access all events you have registered for.
   - Check event timings, location, guidelines, and rules.
   - Enter the public Event Chat to communicate with organizers and fellow attendees.`
  },
  {
    id: "joining_as_member",
    title: "How to Join Events as a Member / Volunteer",
    category: "Events",
    keywords: ["join as member", "volunteer", "coordinator", "member request", "staff", "crew"],
    content: `To join an event organizing committee or volunteer team:
1. Obtain the 'memberCode' from the lead organizer.
2. Go to 'Join as Member' (/events/join-member).
3. Enter the 'memberCode', your name, and your desired role (e.g. Coordinator, Volunteer, Technical Team, Scorer).
4. Click 'Submit Request'. A join request is sent to the event organizer.
5. Once the organizer reviews and approves your request, you become an active Event Member with staff badges and capabilities.`
  },
  {
    id: "teams_and_collaboration",
    title: "Teams and Team Chat",
    category: "Teams",
    keywords: ["team", "create team", "join team", "team code", "team logo", "team chat", "captain"],
    content: `For team-based events such as hackathons, coding contests, and cricket tournaments:
- Creating a Team:
  1. Go to the event page or My Team section.
  2. Enter Team Name and select the corresponding event.
  3. Upload a team logo or generate an AI vector logo with Gemini.
  4. Campus Sphere automatically generates a unique 'teamCode'.
- Joining a Team:
  - Teammates enter the 'teamCode' to join the squad.
  - For cricket tournaments, the team owner/captain registers the squad and playing 11.
- Team Chat:
  - Every team has a private, real-time Team Chat room (/teams/:teamId/chat).
  - Enables private communication, strategy discussions, and updates strictly between team members.`
  },
  {
    id: "cricket_tournament_platform",
    title: "Cricket Tournament Platform & Live Scoring",
    category: "Cricket",
    keywords: ["cricket", "tournament", "matches", "scoring", "scorer", "live score", "scoreboard", "overs", "wickets", "runs", "striker", "bowler"],
    content: `Campus Sphere features a professional cricket tournament management engine:
1. Tournament Setup:
   - Set up the CricketFormat: overs per innings, powerplay overs, players per team, and tournament format (Knockout, League, Round Robin, Double Elimination).
2. Squad Registration:
   - Team captains register their squads and playing 11.
   - Individual player profiles (Cricket_Player) track runs, balls faced, wickets taken, and overs bowled.
3. Fixtures & Match Manager:
   - Organizers create match fixtures between registered teams, assign dates, venues, and match numbers.
4. Live Ball-by-Ball Scoring (/score-input/:matchId):
   - Dedicated scoring console for the assigned Scorer or Organizer.
   - Update ball-by-ball actions: runs (0, 1, 2, 3, 4, 6), extras (wides, no-balls, byes, leg-byes), and wickets.
   - Dynamic tracking of striker, non-striker, current bowler, partnership runs, and over summaries.
   - Delegated Scorer Role: Organizers can designate any event member as 'scorerUpdater' so volunteers can score matches from mobile devices.
5. Real-Time Scorecard & Live Scoreboard:
   - Live scores are broadcast in real-time via Socket.IO to spectators.
   - Detailed match scorecard includes batting scorecards, bowling analysis, fall of wickets, run rates, and match results.`
  },
  {
    id: "coding_contest_platform",
    title: "Coding Contest Platform & Judge0 Execution",
    category: "Coding",
    keywords: ["coding", "contest", "programming", "problems", "judge0", "compiler", "test cases", "leaderboard", "cpp", "python", "java", "javascript"],
    content: `Campus Sphere includes an end-to-end competitive programming platform:
1. Contest Creation:
   - Organizers set contest duration (minutes), scheduled start time, allowed languages (C++, Python, Java, JavaScript), and scoring mode:
     * Binary Scoring: Full points only if all test cases pass.
     * Partial Scoring: Points awarded proportionally based on the number of passed test cases.
   - Contest states: Draft -> Live -> Paused -> Ended.
2. Problem Authoring:
   - Create problems with title, statement, input/output formats, constraints, time limits (ms), and memory limits (KB).
   - Add visible Sample Test Cases (with explanations) for participants to verify during coding.
   - Add Hidden Test Cases used for official grading.
3. Contest Arena for Participants (/coding/contest/:eventId):
   - Multi-language in-browser code editor with syntax highlighting and theme options.
   - 'Run Code': Test code against sample test cases before submitting.
   - 'Submit Code': Evaluates against all hidden test cases.
4. Remote Execution via Judge0:
   - Code is safely compiled and executed in a sandboxed Judge0 runner.
   - Verdicts returned: Accepted (AC), Wrong Answer (WA), Time Limit Exceeded (TLE), Memory Limit Exceeded (MLE), Runtime Error (RTE), or Compilation Error (CE).
5. Live Leaderboard:
   - Real-time leaderboard updated instantly over Socket.IO upon each submission.
   - Ranked by total score, problems solved, and time penalty.`
  },
  {
    id: "campus_clubs",
    title: "Campus Clubs & Student Organizations",
    category: "Clubs",
    keywords: ["clubs", "campus clubs", "join club", "create club", "club head", "club chat", "alumni", "college club"],
    content: `Campus Clubs empowers campus communities and student chapters:
- Creating a Club (/clubs/create):
  - Provide Club Name, Description, College, Category ('technical', 'cultural', 'sports', 'social', 'other'), and upload a Club Logo.
  - Automatically generates a unique 'clubCode' for the club.
- Discovering & Joining Clubs (/clubs):
  - Browse public clubs by college and category.
  - Join using the 'clubCode' or submit a join request to the club founder/head.
- Club Roles & Management:
  - Founder / Club Head: Manage club profile, approve/reject member applications, promote members to leadership positions.
  - Active Members: Participate in club activities and discussions.
  - Alumni: Preserve historical membership for graduating students.
- Club Chat (/clubs/:clubId/chat):
  - Dedicated real-time communication channel for club members to discuss projects, organize meetups, and share announcements.`
  },
  {
    id: "event_and_team_chat",
    title: "Real-time Chat Systems (Event, Team & Club)",
    category: "Chat",
    keywords: ["chat", "messages", "event chat", "team chat", "club chat", "socket.io", "discussion"],
    content: `Campus Sphere features three distinct real-time chat spaces:
1. Event Chat (/events/:eventId/chat):
   - Public chatroom open to all participants, members, and organizers of the event.
   - Perfect for general announcements, queries, and community banter.
2. Team Chat (/teams/:teamId/chat):
   - Private chatroom restricted to members of a specific team.
   - Used for confidential team planning, hackathon coordination, and cricket match strategies.
3. Club Chat (/clubs/:clubId/chat):
   - Member-only discussion board for student clubs.
All chats update in real-time without page refresh via Socket.IO.`
  },
  {
    id: "ai_features_summary",
    title: "AI Features in Campus Sphere",
    category: "AI",
    keywords: ["ai", "gemini", "avatar generator", "poster generator", "schedule generator", "rag assistant", "ai assistant"],
    content: `Campus Sphere leverages Google Gemini AI models for multiple productivity and creative features:
1. AI SVG Avatar Generator: Available on the User Profile page (/profile). Generates a customized vector avatar SVG based on user text descriptions.
2. AI Event Poster Generator: Available when creating an event (/events/create). Generates vector artwork banners tailored to event themes.
3. AI Schedule Generator: Available on hosted event management. Automatically structures an optimal multi-session agenda and timetable.
4. Campus Sphere RAG Assistant: The official AI guide that answers questions about platform features, explains workflows, and provides personalized details about the authenticated user's registered events, teams, clubs, and stats while strictly protecting user privacy.`
  },
  {
    id: "system_architecture_and_monitoring",
    title: "System Architecture & Observability",
    category: "Technical",
    keywords: ["architecture", "tech stack", "prometheus", "grafana", "redis", "mongodb", "docker", "metrics"],
    content: `Campus Sphere is built with modern, production-grade technologies:
- Frontend: React 19, Vite, TailwindCSS 4, React Router 7, Socket.IO Client.
- Backend: Node.js (>=18), Express 5, Socket.IO 4.
- Database: MongoDB 7 with Mongoose 8.
- Caching: Redis 7 (ioredis) with automatic in-memory fallback for high availability.
- Code Execution: Judge0 sandboxed engine (RapidAPI or self-hosted).
- Observability & Monitoring:
  - Prometheus metrics exposed at /metrics via prom-client, tracking request rates, HTTP response status codes, latencies, and MongoDB query times.
  - Grafana pre-provisioned dashboards for real-time visualization of server health and traffic.
- Deployment: Docker Compose for multi-container orchestration and Nginx reverse proxy.`
  },
  {
    id: "platform_navigation_guide",
    title: "Platform Navigation & URL Directory",
    category: "Navigation",
    keywords: ["routes", "urls", "pages", "navigation", "links", "where to find", "how to navigate", "directory"],
    content: `Campus Sphere provides clean, intuitive URL routing across all modules:
- General & Dashboard:
  - Landing / Welcome: /
  - Dashboard / Choice: /home or /choice
  - Public Events Showcase: /events
  - My Events (Hosted & Joined): /all-events
  - User Profile & AI Avatar Generator: /profile
  - AI Assistant: Accessible via the floating AI button or /assistant
- Event Management & Participation:
  - Host a New Event: /new-events-hosted
  - Join an Event (as Participant): /join-event
  - Join Event Staff (as Member): /joinMember
  - My Registered Events: /my-events
  - My Staff/Member Events: /my-events-member
  - Hosted Events Manager: /events-hosted
- Cricket Tournament Module:
  - Cricket Organizer Dashboard: /organizer/cricket/:eventId
  - Cricket Match Fixture Manager: /sports/cricket/match-manager/:eventId
  - Tournament Format Setup: /sports/cricket/format/:eventId
  - Live Scoreboard (Spectator View): /sports/cricket/scoreboard/:eventId
  - Match Scorecard: /sports/cricket/match/:matchId/scorecard
  - Live Scorer Input Console: /sports/cricket/match/:matchId/score-input
  - Captain Squad Submission: /sports/cricket/match/:matchId/squad-submit
  - Join / Create Cricket Team: /sports/cricket/join-team/:eventId and /sports/cricket/create-team/:eventId
- Coding Platform Module:
  - Coding Organizer Dashboard: /organizer/coding/:eventId
  - Problem Editor / Creator: /coding/problem/new/:eventId
  - Participant Contest Arena: /coding/contest/:eventId
  - Real-time Contest Leaderboard: /coding/leaderboard/:eventId
- Campus Clubs Module:
  - Discover All Clubs: /clubs
  - Join Club with Code: /clubs/join
  - Create a New Club: /clubs/create
  - Manage My Clubs: /my-clubs
  - Club Details: /clubs/:clubId
  - Club Real-time Chat: /clubs/:clubId/chat
- Chat Rooms:
  - Event Chat: /events/:eventId/chat
  - Team Chat: /teams/:teamId/chat`
  },
  {
    id: "faqs_and_troubleshooting",
    title: "FAQs, Roles & Troubleshooting",
    category: "Help",
    keywords: ["faq", "help", "troubleshooting", "error", "lost code", "invite code", "issues", "questions", "cannot join"],
    content: `Frequently Asked Questions and Solutions:
Q: Where do I find the Participant Code or Member Code for my event?
A: As an organizer, go to 'My Events' (/all-events) or 'Hosted Events' (/events-hosted). Open your event card or details to view the generated 'participantCode' and 'memberCode'. You can copy and share them with attendees.

Q: How can I let someone else update live cricket scores?
A: In Campus Sphere, the event organizer can designate any verified event member as a 'scorerUpdater' or delegate scoring rights. The designated scorer can navigate to /sports/cricket/match/:matchId/score-input to enter ball-by-ball updates from any phone or computer.

Q: Why did my code get a Time Limit Exceeded (TLE) or Wrong Answer (WA)?
A: In coding contests, code is evaluated by Judge0 in a sandbox.
- TLE: The algorithm exceeded the problem's time limit (usually 2000ms). Optimize loops or use faster I/O.
- WA: The output did not match hidden test case expected outputs. Verify edge cases, zero inputs, and exact output whitespace.
- CE: Compilation error. Check language version syntax.

Q: How do I approve member join requests for my event or club?
A:
- For Events: Go to your Hosted Event Details page (/hosted-event/:eventId) and check the 'Member Requests' section. Click Approve or Reject.
- For Clubs: Club Founders / Heads can visit /clubs/:clubId/manage to review join requests and update member roles.

Q: What is the difference between Public and Private Clubs?
A: Public clubs can be browsed and joined by any verified campus student. Private clubs require an explicit join request approval from the Club Founder or Club Head.

Q: How does the AI Assistant protect my privacy?
A: Campus Sphere AI operates under strict user isolation. It can only read activity records belonging directly to your authenticated session. It will never reveal other users' emails, submissions, or sensitive records.`
  }
];
