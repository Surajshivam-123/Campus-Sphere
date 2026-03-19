import { Routes, Route } from "react-router-dom";

// Public Pages
import Front from "../pages/Front/Front";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Home & Navigation
import Home from "../pages/Home/Home";
import IamChoice from "../pages/Home/Option";
import AllEvents from "../pages/Home/AllEvents";

// Event Creation & Management
import CreateEvent from "../pages/Event Creation/CreateEvent";
import WorkshopEventDetails from "../pages/Event Creation/WorkshopEventDetails";
import CricketEventPage from "../pages/Event Creation/CricketEventPage";
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

// User Profile
import Profile from "../pages/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Front />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home & Navigation Routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/choice" element={<IamChoice />} />
      <Route path="/all-events" element={<AllEvents />} />

      {/* Event Creation Routes */}
      <Route path="/new-events-hosted" element={<CreateEvent />} />
      <Route path="/event/:eventName/:eventId/workshop" element={<WorkshopEventDetails />} />
      <Route path="/event/:eventName/:eventId/sports/cricket" element={<CricketEventPage />} />
      <Route path="/cricket-format" element={<CreateCricketFormat />} />

      {/* Event Management Routes */}
      <Route path="/events-hosted" element={<EventList />} />
      <Route path="/update-event/:eventId" element={<UpdateEventPage />} />

      {/* Participant Routes */}
      <Route path="/join-event" element={<JoinEvent />} />
      <Route path="/event-details/:identityNumber/:participantCode/:participantId" element={<EventDetailsPage />} />
      <Route path="/my-events" element={<MyEvents />} />

      {/* Member Routes */}
      <Route path="/joinMember" element={<JoinMember />} />
      <Route path="/get-event/:memberCode" element={<EventDetailsMemberPage />} />
      <Route path="/my-events-member" element={<MemberEvents />} />

      {/* Cricket/Sports Routes */}
      <Route path="/cricket-event-details/:eventId/:identityNumber/:participantCode/:participantId" element={<CricketEventDetailsPageParticipant />} />
      <Route path="/join-team/:eventId" element={<JoinTeam />} />
      <Route path="/cricket-create-team/:eventId" element={<CreateTeamPage />} />
      <Route path="/cricket-team-creator/:eventId" element={<TeamCreatorPage />} />
      <Route path="/cricket-team-member/:eventId" element={<TeamMemberPage />} />

      {/* User Profile Route */}
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
