import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

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

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Front />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Home & Navigation */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/choice" element={<ProtectedRoute><IamChoice /></ProtectedRoute>} />
      <Route path="/all-events" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />

      {/* Event Creation */}
      <Route path="/new-events-hosted" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/event/:eventName/:eventId/workshop" element={<ProtectedRoute><WorkshopEventDetails /></ProtectedRoute>} />
      <Route path="/events-hosted" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
      <Route path="/update-event/:eventId" element={<ProtectedRoute><UpdateEventPage /></ProtectedRoute>} />

      {/* Participant */}
      <Route path="/join-event" element={<ProtectedRoute><JoinEvent /></ProtectedRoute>} />
      <Route path="/event-details/:identityNumber/:participantCode/:participantId" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
      <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />

      {/* Member */}
      <Route path="/joinMember" element={<ProtectedRoute><JoinMember /></ProtectedRoute>} />
      <Route path="/get-event/:memberCode" element={<ProtectedRoute><EventDetailsMemberPage /></ProtectedRoute>} />
      <Route path="/my-events-member" element={<ProtectedRoute><MemberEvents /></ProtectedRoute>} />

      {/* Schedule */}
      <Route path="/sports/cricket/schedule/:eventId" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />

      {/* User Profile */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Google OAuth Callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ── Cricket Routes ──────────────────────────────────────────────────── */}
      {/* Event setup (organizer) */}
      <Route path="/event/:eventName/:eventId/sports/cricket" element={<ProtectedRoute><CricketEventSetup /></ProtectedRoute>} />
      <Route path="/sports/cricket/format/:eventId" element={<ProtectedRoute><CricketFormat /></ProtectedRoute>} />
      <Route path="/sports/cricket/format/:eventId/view" element={<ProtectedRoute><CricketFormat viewOnly /></ProtectedRoute>} />

      {/* Participant flow */}
      <Route path="/sports/cricket/event-details/:eventId/:identityNumber/:participantCode/:participantId" element={<ProtectedRoute><CricketEventDetails /></ProtectedRoute>} />
      <Route path="/sports/cricket/join-team/:eventId" element={<ProtectedRoute><CricketJoinTeam /></ProtectedRoute>} />
      <Route path="/sports/cricket/create-team/:eventId" element={<ProtectedRoute><CricketCreateTeam /></ProtectedRoute>} />
      <Route path="/sports/cricket/team-creator/:eventId" element={<ProtectedRoute><CricketTeamCreator /></ProtectedRoute>} />
      <Route path="/sports/cricket/team-member/:eventId" element={<ProtectedRoute><CricketTeamMember /></ProtectedRoute>} />

      {/* Live scoring */}
      <Route path="/sports/cricket/scoreboard/:eventId" element={<ProtectedRoute><CricketLiveScoreboard /></ProtectedRoute>} />
      <Route path="/sports/cricket/match/:matchId/scorecard" element={<ProtectedRoute><CricketMatchScorecard /></ProtectedRoute>} />
      <Route path="/sports/cricket/match/:matchId/score-input" element={<ProtectedRoute><CricketScoreInput /></ProtectedRoute>} />
      <Route path="/sports/cricket/match-manager/:eventId" element={<ProtectedRoute><CricketMatchManager /></ProtectedRoute>} />
      <Route path="/sports/cricket/match/:matchId/squad-submit" element={<ProtectedRoute><CricketSquadSubmit /></ProtectedRoute>} />
    </Routes>
  );
}
