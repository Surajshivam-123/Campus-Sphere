import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChalkboardTeacher,
} from "react-icons/fa";
import LoadingPage from "../LoadingPage";
import API_URL from "../../config/api";
import fetchWithAuth from "../../config/fetchWithAuth";

export default function CricketEventDetailsPageParticipant() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  // role: null=loading, "none", "creator", "member"
  const [role, setRole] = useState(null);

  useEffect(() => {
    const load = async () => {
      // Load event
      try {
        const evRes = await fetch(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`, {
          method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include",
        });
        const evData = await evRes.json();
        setEvent(evData?.data);
      } catch (e) { console.log("Error loading event", e); }

      // Check if user is team creator
      try {
        const teamRes = await fetchWithAuth(`${API_URL}/api/cpsh/teams/get-team/${eventId}`, {
          method: "GET", headers: { "Content-Type": "application/json" },
        });
        const teamData = await teamRes.json();
        if (teamData?.success && teamData?.data) {
          setRole("creator");
          return;
        }
      } catch (e) { console.log("Error checking creator status", e); }

      // Check if user joined as a member
      try {
        const memberRes = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-players/my-team/${eventId}`, {
          method: "GET", headers: { "Content-Type": "application/json" },
        });
        const memberData = await memberRes.json();
        if (memberData?.success && memberData?.data) {
          setRole("member");
          return;
        }
      } catch (e) { console.log("Error checking member status", e); }

      setRole("none");
    };
    load();
  }, [eventId]);

  // Once role is determined, redirect to the right page
  useEffect(() => {
    if (role === "creator") navigate(`/cricket-team-creator/${eventId}`, { replace: true });
    if (role === "member") navigate(`/cricket-team-member/${eventId}`, { replace: true });
  }, [role]);

  if (!event || role === null || role === "creator" || role === "member") {
    return <LoadingPage />;
  }

  // role === "none" — show event details with Create / Join options
  const {
    festivalName, eventName, startDate, location, organization,
    description, mode, category, sports, maxParticipants, rules,
  } = event;

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6"
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s"
          alt="Cricket Event Poster" className="w-full h-64 object-cover" />

        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold text-blue-800">{eventName}</h1>
            <p className="text-md font-medium text-blue-600">{festivalName}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
            <p><FaCalendarAlt className="inline-block mr-2 text-blue-500" /><strong>Date:</strong> {startDate}</p>
            <p><FaMapMarkerAlt className="inline-block mr-2 text-red-500" /><strong>Location:</strong> {location}</p>
            <p><FaChalkboardTeacher className="inline-block mr-2 text-green-600" /><strong>Organized By:</strong> {organization}</p>
            <p><strong>Mode:</strong> {mode}</p>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Sport:</strong> {sports}</p>
            <p><FaUsers className="inline-block mr-2 text-purple-600" /><strong>Max Participants:</strong> {maxParticipants}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            <p className="mt-1 text-gray-600 leading-relaxed">{description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Rules</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-1">
              {rules.map((rule, i) => <li key={i}>{rule}</li>)}
            </ul>
          </div>
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={() => navigate(`/cricket-create-team/${eventId}`)}
            className="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-800 transition shadow font-medium">
            Create Team
          </button>
          <button
            onClick={() => navigate(`/join-team/${eventId}`)}
            className="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-800 transition shadow font-medium">
            Join Team
          </button>
        </div>
      </div>
    </motion.div>
  );
}
