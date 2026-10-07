import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import EventChatWrapper from "../components/shared/EventChatWrapper";
import LoadingPage from "../pages/LoadingPage";

// Public Pages
const Front = lazy(() => import("../pages/Front/Front"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));

// Home & Navigation
const Home = lazy(() => import("../pages/Home/Home"));
const IamChoice = lazy(() => import("../pages/Home/Option"));
const AllEvents = lazy(() => import("../pages/Home/AllEvents"));

// Event Creation & Management
const CreateEvent = lazy(() => import("../pages/EventCreation/CreateEvent"));
const WorkshopEventDetails = lazy(() => import("../pages/EventCreation/WorkshopEventDetails"));
const UpdateEventPage = lazy(() => import("../pages/EditEvent/UpdateEvent"));

// Hosted Events
const EventList = lazy(() => import("../pages/MyHostedEvent/EventList"));
const HostedEventDetail = lazy(() => import("../pages/MyHostedEvent/HostedEventDetail"));

// Participant - Join & View Events
const JoinEvent = lazy(() => import("../pages/ParticipateEvent/JoinEvent"));
const EventDetailsPage = lazy(() => import("../pages/ParticipateEvent/EventDetails"));
const MyEvents = lazy(() => import("../pages/MyParticipatedEvents/MyEvents"));

// Member - Join & View Events
const JoinMember = lazy(() => import("../pages/JoinMember/JoinMember"));
const EventDetailsMemberPage = lazy(() => import("../pages/JoinMember/EventDetailsMember"));
const MemberEvents = lazy(() => import("../pages/MyParticipatedEvents/ParticipateateasMember"));

// Schedule
const SchedulePage = lazy(() => import("../pages/Schedule/SchedulePage"));

// User Profile
const Profile = lazy(() => import("../pages/Profile"));

// AI Assistant (RAG)
const AiAssistantPage = lazy(() => import("../pages/AiAssistant/AiAssistantPage"));

// Auth Callback (Google OAuth)
const AuthCallback = lazy(() => import("../pages/AuthCallback"));

// ── Cricket ──────────────────────────────────────────────────────────────────
const CricketEventSetup = lazy(() => import("../pages/sports/cricket/EventSetup"));
const CricketFormat = lazy(() => import("../pages/sports/cricket/Format"));
const CricketOrganizerPage = lazy(() => import("../pages/sports/cricket/CricketOrganizerPage"));
const CricketLiveScoreboard = lazy(() => import("../pages/sports/cricket/LiveScoreboard"));
const CricketMatchScorecard = lazy(() => import("../pages/sports/cricket/MatchScorecard"));
const CricketScoreInput = lazy(() => import("../pages/sports/cricket/ScoreInput"));
const CricketMatchManager = lazy(() => import("../pages/sports/cricket/MatchManager"));
const CricketSquadSubmit = lazy(() => import("../pages/sports/cricket/SquadSubmit"));
const CricketEventDetails = lazy(() => import("../pages/sports/cricket/participant/EventDetails"));
const CricketJoinTeam = lazy(() => import("../pages/sports/cricket/participant/JoinTeam"));
const CricketCreateTeam = lazy(() => import("../pages/sports/cricket/participant/CreateTeam"));
const CricketTeamCreator = lazy(() => import("../pages/sports/cricket/participant/TeamCreator"));
const CricketTeamMember = lazy(() => import("../pages/sports/cricket/participant/TeamMember"));

// ── Coding ────────────────────────────────────────────────────────────────────
const ProblemEditor = lazy(() => import("../pages/coding/organizer/ProblemEditor"));
const CodingOrganizerPage = lazy(() => import("../pages/coding/organizer/CodingOrganizerPage"));
const ContestArena = lazy(() => import("../pages/coding/participant/ContestArena"));
const Leaderboard = lazy(() => import("../pages/coding/Leaderboard"));

// ── Campus Clubs ──────────────────────────────────────────────────────────────
const AllClubs = lazy(() => import("../pages/Club/AllClubs"));
const CreateClub = lazy(() => import("../pages/Club/CreateClub"));
const ClubDetail = lazy(() => import("../pages/Club/ClubDetail"));
const ManageClub = lazy(() => import("../pages/Club/ManageClub"));
const MyClubs = lazy(() => import("../pages/Club/MyClubs"));
const JoinClub = lazy(() => import("../pages/Club/JoinClub"));
const ClubChat = lazy(() => import("../pages/Club/ClubChat"));
const EventChat = lazy(() => import("../pages/Event/EventChat"));
const TeamChat = lazy(() => import("../pages/Event/TeamChat"));
const PublicEvents = lazy(() => import("../pages/Event/PublicEvents"));

const PageLayout = () => {
  return (
    <EventChatWrapper>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full h-full"
      >
        <Suspense fallback={<LoadingPage />}>
          <Outlet />
        </Suspense>
      </motion.div>
    </EventChatWrapper>
  );
};

export default function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<PageLayout />}>
          {/* Root — show landing page to guests, redirect authenticated users to /home */}
          <Route path="/" element={<PublicRoute landing><Front /></PublicRoute>} />

      {/* Public-only Routes (redirect to /home if already logged in) */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Google OAuth Callback — no guard, handles its own redirect */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* AI Assistant (accessible to all, personalized when logged in) */}
      <Route path="/assistant"    element={<AiAssistantPage />} />
      <Route path="/ai-assistant" element={<Navigate to="/assistant" replace />} />

      {/* ── All routes below require authentication ── */}

      {/* Home & Navigation */}
      <Route path="/home"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/choice"      element={<ProtectedRoute><IamChoice /></ProtectedRoute>} />
      <Route path="/all-events"  element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />
      <Route path="/events"      element={<ProtectedRoute><PublicEvents /></ProtectedRoute>} />

      {/* Event Creation */}
      <Route path="/new-events-hosted"                        element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/event/:eventName/:eventId/workshop"       element={<ProtectedRoute><WorkshopEventDetails /></ProtectedRoute>} />
      <Route path="/events-hosted"                            element={<ProtectedRoute><EventList /></ProtectedRoute>} />
      <Route path="/update-event/:eventId"                    element={<ProtectedRoute><UpdateEventPage /></ProtectedRoute>} />
      <Route path="/hosted-event/:eventId"                    element={<ProtectedRoute><HostedEventDetail /></ProtectedRoute>} />

      {/* Participant */}
      <Route path="/join-event"                                                                    element={<ProtectedRoute><JoinEvent /></ProtectedRoute>} />
      <Route path="/event-details/:identityNumber/:participantCode/:participantId"                 element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
      <Route path="/my-events"                                                                     element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />

      {/* Member */}
      <Route path="/joinMember"              element={<ProtectedRoute><JoinMember /></ProtectedRoute>} />
      <Route path="/get-event/:memberCode"   element={<ProtectedRoute><EventDetailsMemberPage /></ProtectedRoute>} />
      <Route path="/my-events-member"        element={<ProtectedRoute><MemberEvents /></ProtectedRoute>} />

      {/* Schedule */}
      <Route path="/sports/cricket/schedule/:eventId" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />

      {/* User Profile */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* ── Cricket Routes ──────────────────────────────────────────────────── */}
      <Route path="/organizer/cricket/:eventId"                                                                      element={<ProtectedRoute><CricketOrganizerPage /></ProtectedRoute>} />
      <Route path="/event/:eventName/:eventId/sports/cricket"                                                        element={<ProtectedRoute><CricketEventSetup /></ProtectedRoute>} />
      <Route path="/sports/cricket/format/:eventId"                                                                  element={<ProtectedRoute><CricketFormat /></ProtectedRoute>} />
      <Route path="/sports/cricket/format/:eventId/view"                                                             element={<ProtectedRoute><CricketFormat viewOnly /></ProtectedRoute>} />
      <Route path="/sports/cricket/event-details/:eventId/:identityNumber/:participantCode/:participantId"           element={<ProtectedRoute><CricketEventDetails /></ProtectedRoute>} />
      <Route path="/sports/cricket/join-team/:eventId"                                                               element={<ProtectedRoute><CricketJoinTeam /></ProtectedRoute>} />
      <Route path="/sports/cricket/create-team/:eventId"                                                             element={<ProtectedRoute><CricketCreateTeam /></ProtectedRoute>} />
      <Route path="/sports/cricket/team-creator/:eventId"                                                            element={<ProtectedRoute><CricketTeamCreator /></ProtectedRoute>} />
      <Route path="/sports/cricket/team-member/:eventId"                                                             element={<ProtectedRoute><CricketTeamMember /></ProtectedRoute>} />
      <Route path="/sports/cricket/scoreboard/:eventId"                                                              element={<ProtectedRoute><CricketLiveScoreboard /></ProtectedRoute>} />
      <Route path="/sports/cricket/match/:matchId/scorecard"                                                         element={<ProtectedRoute><CricketMatchScorecard /></ProtectedRoute>} />
      <Route path="/sports/cricket/match/:matchId/score-input"                                                       element={<ProtectedRoute><CricketScoreInput /></ProtectedRoute>} />
      <Route path="/sports/cricket/match-manager/:eventId"                                                           element={<ProtectedRoute><CricketMatchManager /></ProtectedRoute>} />
      <Route path="/sports/cricket/match/:matchId/squad-submit"                                                      element={<ProtectedRoute><CricketSquadSubmit /></ProtectedRoute>} />

      {/* ── Coding Routes ────────────────────────────────────────────────────── */}
      <Route path="/organizer/coding/:eventId"      element={<ProtectedRoute><CodingOrganizerPage /></ProtectedRoute>} />
      <Route path="/coding/problem/new/:eventId"    element={<ProtectedRoute><ProblemEditor /></ProtectedRoute>} />
      <Route path="/coding/problem/edit/:problemId" element={<ProtectedRoute><ProblemEditor /></ProtectedRoute>} />
      <Route path="/coding/contest/:eventId"        element={<ProtectedRoute><ContestArena /></ProtectedRoute>} />
      <Route path="/coding/leaderboard/:eventId"    element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

      {/* ── Campus Club Routes ───────────────────────────────────────────────── */}
      <Route path="/clubs"                    element={<AllClubs />} />
      <Route path="/clubs/create"             element={<ProtectedRoute><CreateClub /></ProtectedRoute>} />
      <Route path="/clubs/join"               element={<ProtectedRoute><JoinClub /></ProtectedRoute>} />
      <Route path="/clubs/:clubId/manage"     element={<ProtectedRoute><ManageClub /></ProtectedRoute>} />
      <Route path="/clubs/:clubId/chat"       element={<ProtectedRoute><ClubChat /></ProtectedRoute>} />
<Route path="/events/:eventId/chat"      element={<ProtectedRoute><EventChat /></ProtectedRoute>} />
      <Route path="/teams/:teamId/chat"       element={<ProtectedRoute><TeamChat /></ProtectedRoute>} />
      <Route path="/clubs/:clubId"            element={<ClubDetail />} />
      <Route path="/my-clubs"                 element={<ProtectedRoute><MyClubs /></ProtectedRoute>} />

          {/* Catch-all — any unknown URL redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
