import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChalkboardTeacher, FaComments,
} from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import LoadingPage from "../../../LoadingPage";
import FloatingChatButton from "../../../../components/shared/FloatingChatButton";
import API_URL from "../../../../config/api";
import fetchWithAuth from "../../../../config/fetchWithAuth";
import { formatDateTime } from "../../../../utils/helpers";
import useScorerRole from "../../../../hooks/useScorerRole";
import useIsLive from "../../../../hooks/useIsLive";

export default function CricketEventDetailsPageParticipant() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  // role: null=loading, "none", "creator", "member"
  const [role, setRole] = useState(null);
  const { isScorer } = useScorerRole(eventId);
  const { isLive } = useIsLive(eventId);

  useEffect(() => {
    const load = async () => {
      // Load event
      try {
        const evRes = await fetchWithAuth(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`, {
          method: "GET", headers: { "Content-Type": "application/json" }
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
    if (role === "creator") navigate(`/sports/cricket/team-creator/${eventId}`, { replace: true });
    if (role === "member") navigate(`/sports/cricket/team-member/${eventId}`, { replace: true });
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
    <motion.div className="min-h-screen bg-[#faf9f6] py-10 px-4"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <FloatingChatButton eventId={eventId} />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s"
          alt="Cricket Event Poster" className="w-full h-64 object-cover" />

        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-3xl font-semibold text-[#1e3a5f]">{eventName}</h1>
            {festivalName && <p className="text-sm text-gray-400">{festivalName}</p>}
            <div className="w-8 h-px bg-[#b8860b]/40 mt-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#374151]">
            <p><FaCalendarAlt className="inline-block mr-2 text-[#1e3a5f]" /><strong>Date:</strong> {formatDateTime(startDate)}</p>
            <p><FaMapMarkerAlt className="inline-block mr-2 text-[#1e3a5f]" /><strong>Location:</strong> {location}</p>
            <p><FaChalkboardTeacher className="inline-block mr-2 text-[#1e3a5f]" /><strong>Organized By:</strong> {organization}</p>
            <p><strong>Mode:</strong> {mode}</p>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Sport:</strong> {sports}</p>
            <p><FaUsers className="inline-block mr-2 text-[#1e3a5f]" /><strong>Max Participants:</strong> {maxParticipants}</p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-[#1e3a5f]">Description</h2>
            <p className="mt-1 text-[#374151] text-sm leading-relaxed">{description}</p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-[#1e3a5f]">Rules</h2>
            <ul className="list-disc ml-6 text-[#374151] text-sm space-y-1 mt-1">
              {rules.map((rule, i) => <li key={i}>{rule}</li>)}
            </ul>
          </div>
        </div>

        {isScorer && (
          <div className="mx-8 mb-4 flex items-center justify-between gap-3 bg-indigo-600 text-white rounded-2xl px-5 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <MdSportsCricket className="text-2xl flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">You are the assigned scorer</p>
                <p className="text-xs text-indigo-200">The host has given you access to update the scorecard.</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/sports/cricket/match-manager/${eventId}`)}
              className="bg-white text-indigo-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition flex-shrink-0"
            >
              Update Scorecard
            </button>
          </div>
        )}

        <div className="px-8 pb-8 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/events/${eventId}/chat`)}
            className="bg-[#1e3a5f] text-white rounded px-5 py-2 hover:bg-[#2d4a6f] transition font-medium text-sm flex items-center gap-2">
            <FaComments size={12} /> Open Chat
          </button>
          <button
            onClick={() => navigate(`/sports/cricket/create-team/${eventId}`)}
            className="bg-[#1e3a5f] text-white rounded px-5 py-2 hover:bg-[#2d4a6f] transition font-medium text-sm border border-[#1e3a5f]">
            Create Team
          </button>
          <button
            onClick={() => navigate(`/sports/cricket/join-team/${eventId}`)}
            className="bg-white text-[#1e3a5f] rounded px-5 py-2 hover:bg-[#f0ede6] transition font-medium text-sm border border-[#1e3a5f]">
            Join Team
          </button>
          {isLive && (
            <button
              onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
              className="bg-green-600 text-white rounded px-5 py-2 hover:bg-green-700 transition font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" /> Watch Live
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
