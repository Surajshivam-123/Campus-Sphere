import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { useAuth } from "../hooks/useAuth";
import EventChatWrapper from "../components/shared/EventChatWrapper";

// Public Pages
import Front from "../pages/Front/Front";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Home & Navigation
import Home from "../pages/Home/Home";
import IamChoice from "../pages/Home/Option";
import AllEvents from "../pages/Home/AllEvents";

// Event Creation & Management
import CreateEvent from "../pages/EventCreation/CreateEvent";
import WorkshopEventDetails from "../pages/EventCreation/WorkshopEventDetails";
import UpdateEventPage from "../pages/EditEvent/UpdateEvent";

// Hosted Events
import EventList from "../pages/MyHostedEvent/EventList";
import HostedEventDetail from "../pages/MyHostedEvent/HostedEventDetail";

// Participant - Join & View Events
import JoinEvent from "../pages/ParticipateEvent/JoinEvent";
import EventDetailsPage from "../pages/ParticipateEvent/EventDetails";
import MyEvents from "../pages/MyParticipatedEvents/MyEvents";

// Member - Join & View Events
import JoinMember from "../pages/JoinMember/JoinMember";
import EventDetailsMemberPage from "../pages/JoinMember/EventDetailsMember";
import MemberEvents from "../pages/MyParticipatedEvents/ParticipateateasMember";

// Schedule
import SchedulePage from "../pages/Schedule/SchedulePage";

// User Profile
import Profile from "../pages/Profile";

// Auth Callback (Google OAuth)
import AuthCallback from "../pages/AuthCallback";

// ── Cricket ──────────────────────────────────────────────────────────────────
import CricketEventSetup from "../pages/sports/cricket/EventSetup";
import CricketFormat from "../pages/sports/cricket/Format";
import CricketOrganizerPage from "../pages/sports/cricket/CricketOrganizerPage";
import CricketLiveScoreboard from "../pages/sports/cricket/LiveScoreboard";
import CricketMatchScorecard from "../pages/sports/cricket/MatchScorecard";
import CricketScoreInput from "../pages/sports/cricket/ScoreInput";
import CricketMatchManager from "../pages/sports/cricket/MatchManager";
import CricketSquadSubmit from "../pages/sports/cricket/SquadSubmit";
import CricketEventDetails from "../pages/sports/cricket/participant/EventDetails";
import CricketJoinTeam from "../pages/sports/cricket/participant/JoinTeam";
import CricketCreateTeam from "../pages/sports/cricket/participant/CreateTeam";
import CricketTeamCreator from "../pages/sports/cricket/participant/TeamCreator";
import CricketTeamMember from "../pages/sports/cricket/participant/TeamMember";

// ── Coding ────────────────────────────────────────────────────────────────────
import ProblemEditor from "../pages/coding/organizer/ProblemEditor";
import CodingOrganizerPage from "../pages/coding/organizer/CodingOrganizerPage";
import ContestArena from "../pages/coding/participant/ContestArena";
import Leaderboard from "../pages/coding/Leaderboard";

// ── Campus Clubs ──────────────────────────────────────────────────────────────
import AllClubs from "../pages/Club/AllClubs";
import CreateClub from "../pages/Club/CreateClub";
import ClubDetail from "../pages/Club/ClubDetail";
import ManageClub from "../pages/Club/ManageClub";
import MyClubs from "../pages/Club/MyClubs";
import JoinClub from "../pages/Club/JoinClub";
import ClubChat from "../pages/Club/ClubChat";
import EventChat from "../pages/Event/EventChat";
import TeamChat from "../pages/Event/TeamChat";

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
        <Outlet />
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

      {/* ── All routes below require authentication ── */}

      {/* Home & Navigation */}
      <Route path="/home"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/choice"      element={<ProtectedRoute><IamChoice /></ProtectedRoute>} />
      <Route path="/all-events"  element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />

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
