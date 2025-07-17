import { Routes, Route } from "react-router-dom";
import Front from "../pages/Front/Front";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home/Home";
import CreateEvent from "../pages/Event Creation/CreateEvent";
import WorkshopEventDetails from "../pages/Event Creation/WorkshopEventDetails";
import EventList from "../pages/MyHostedEvent/EventList";
import JoinEvent from "../pages/JoinEvent"
import MyEvents from "../pages/MyParticipatedEvents/MyEvents";
import CricketEventPage from "../pages/Event Creation/CricketEventPage";

export default function AppRoutes() {
  const cricketEvent = {
  festivalName: "Annual Sports Fest 2025",
  eventName: "Inter-College Cricket League",
  startDate: "2025-08-10",
  location: "Main Ground, Campus",
  organization: "ABC Institute of Tech",
  description: "Exciting 20-over cricket matches between top college teams!",
  mode: "Offline",
  category: "Sports",
  sports: "Cricket",
  maxParticipants: 11,
  rules: ["Each team must have 11 players.","Each match will be 20 overs.","ICC rules apply."],
  membercode: "CRK25ABC",
  participation: "Team",
  poster: "https://via.placeholder.com/800x400.png?text=Cricket+Event",
  members:[{name:'suraj',role:'organizer'},
  {name:'shivam',role:'third umpire'},{name:'golu',role:' ground umpire'},{name:'bholu',role:' ground umpire'}],
  team:['csk','rcb','mi','kkr']

};
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
        <Route path="/register" element={<Register/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/new-events-hosted" element={<CreateEvent/>}/>
        <Route path="/event/:eventName/workshop" element={<WorkshopEventDetails/>}/>
        <Route path="/events-hosted" element={<EventList/>}/>
        <Route path="/join-event" element={<JoinEvent/>}/>
        <Route path="/my-events" element={<MyEvents/>}/>
        <Route path="/event/:eventName/sports/cricket" element={<CricketEventPage event={cricketEvent}/>}/>
      </Routes>
    </>
  );
}
