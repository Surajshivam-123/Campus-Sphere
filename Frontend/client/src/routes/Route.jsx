import { Routes, Route } from "react-router-dom";
import Front from "../pages/Front/Front";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home/Home";
import CreateEvent from "../pages/Event Creation/CreateEvent";
import WorkshopEventDetails from "../pages/Event Creation/WorkshopEventDetails";
import EventList from "../pages/MyHostedEvent/EventList";
import JoinEvent  from "../pages/ParticipateEvent/JoinEvent";
import MyEvents from "../pages/MyParticipatedEvents/MyEvents";
import CricketEventPage from "../pages/Event Creation/CricketEventPage";
import UpdateEventPage from "../pages/Edit Event/updateEvent";
import EventDetailsPage from "../pages/ParticipateEvent/EventDetails";

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Front />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/new-events-hosted" element={<CreateEvent />} />
        <Route path="/event/:eventName/:eventId/workshop" element={<WorkshopEventDetails />}/>
        <Route path="/events-hosted" element={<EventList />} />
        <Route path="/update-event/:eventId" element={<UpdateEventPage />} />
        <Route path="/join-event" element={<JoinEvent />} />
        <Route path="/event-details/:identityNumber/:participantCode" element={<EventDetailsPage/>}/>
        <Route path="/my-events" element={<MyEvents />} />
        <Route
          path="/event/:eventName/:eventId/sports/cricket"
          element={<CricketEventPage />}
        />
      </Routes>
    </>
  );
}
