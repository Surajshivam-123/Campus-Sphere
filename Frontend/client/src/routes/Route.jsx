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
import CricketEventPage from "../pages/EventCreation/CricketEventPage";
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

// Cricket/Sports Specific
import CreateCricketFormat from "../pages/Cricket/Cricket";
import CricketEventDetailsPageParticipant from "../pages/MyParticipatedEvents/CricketEventDetailsPageParticipant";
import JoinTeam from "../pages/MyParticipatedEvents/JoinTeam";
import TeamCreatorPage from "../pages/MyParticipatedEvents/TeamCreatorPage";
import TeamMemberPage from "../pages/MyParticipatedEvents/TeamMemberPage";
import CreateTeamPage from "../pages/MyParticipatedEvents/CreateTeamPage";

// Schedule
import SchedulePage from "../pages/Schedule/SchedulePage";

// Live Score Pages
import LiveScoreboard from "../pages/Cricket/LiveScoreboard";
import MatchScorecard from "../pages/Cricket/MatchScorecard";
import ScoreInput from "../pages/Cricket/ScoreInput";
import MatchManager from "../pages/Cricket/MatchManager";

// User Profile
import Profile from "../pages/Profile";

// Auth Callback (Google OAuth)
import AuthCallback from "../pages/AuthCallback";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Front />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Home & Navigation Routes */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/choice" element={<ProtectedRoute><IamChoice /></ProtectedRoute>} />
      <Route path="/all-events" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />

      {/* Event Creation Routes */}
      <Route path="/new-events-hosted" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/event/:eventName/:eventId/workshop" element={<ProtectedRoute><WorkshopEventDetails /></ProtectedRoute>} />
      <Route path="/event/:eventName/:eventId/sports/cricket" element={<ProtectedRoute><CricketEventPage /></ProtectedRoute>} />
      <Route path="/cricket-format/:eventId" element={<ProtectedRoute><CreateCricketFormat /></ProtectedRoute>} />
      <Route path="/cricket-format/:eventId/view" element={<ProtectedRoute><CreateCricketFormat viewOnly /></ProtectedRoute>} />

      {/* Event Management Routes */}
      <Route path="/events-hosted" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
      <Route path="/update-event/:eventId" element={<ProtectedRoute><UpdateEventPage /></ProtectedRoute>} />

      {/* Participant Routes */}
      <Route path="/join-event" element={<ProtectedRoute><JoinEvent /></ProtectedRoute>} />
      <Route path="/event-details/:identityNumber/:participantCode/:participantId" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
      <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />

      {/* Member Routes */}
      <Route path="/joinMember" element={<ProtectedRoute><JoinMember /></ProtectedRoute>} />
      <Route path="/get-event/:memberCode" element={<ProtectedRoute><EventDetailsMemberPage /></ProtectedRoute>} />
      <Route path="/my-events-member" element={<ProtectedRoute><MemberEvents /></ProtectedRoute>} />

      {/* Cricket/Sports Routes */}
      <Route path="/cricket-event-details/:eventId/:identityNumber/:participantCode/:participantId" element={<ProtectedRoute><CricketEventDetailsPageParticipant /></ProtectedRoute>} />
      <Route path="/join-team/:eventId" element={<ProtectedRoute><JoinTeam /></ProtectedRoute>} />
      <Route path="/cricket-create-team/:eventId" element={<ProtectedRoute><CreateTeamPage /></ProtectedRoute>} />
      <Route path="/cricket-team-creator/:eventId" element={<ProtectedRoute><TeamCreatorPage /></ProtectedRoute>} />
      <Route path="/cricket-team-member/:eventId" element={<ProtectedRoute><TeamMemberPage /></ProtectedRoute>} />

      {/* User Profile Route */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Google OAuth Callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Schedule Route */}
      <Route path="/cricket-schedule/:eventId" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />

      {/* Live Score Routes — login required, access checked inside component */}
      <Route path="/cricket-scoreboard/:eventId" element={<ProtectedRoute><LiveScoreboard /></ProtectedRoute>} />
      <Route path="/match/:matchId/scorecard" element={<ProtectedRoute><MatchScorecard /></ProtectedRoute>} />
      <Route path="/match/:matchId/score-input" element={<ProtectedRoute><ScoreInput /></ProtectedRoute>} />
      <Route path="/cricket-match-manager/:eventId" element={<ProtectedRoute><MatchManager /></ProtectedRoute>} />
    </Routes>
  );
}
