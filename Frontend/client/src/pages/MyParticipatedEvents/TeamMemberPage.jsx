import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChalkboardTeacher,
  FaSignOutAlt, FaShieldAlt,
} from "react-icons/fa";
import LoadingPage from "../LoadingPage";
import API_URL from "../../config/api";
import fetchWithAuth from "../../config/fetchWithAuth";

export default function TeamMemberPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [teamdata, setTeamdata] = useState(null);
  const [showTeam, setShowTeam] = useState(true);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        const evRes = await fetch(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`, {
          method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include",
        });
        const evData = await evRes.json();
        setEvent(evData?.data);
      } catch (e) { console.log("Error loading event", e); }

      try {
        const teamRes = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-players/my-team/${eventId}`, {
          method: "GET", headers: { "Content-Type": "application/json" },
        });
        const teamData = await teamRes.json();
        console.log("Data: ", teamData);
        // console.log("Captain: ",teamData.data.captain)
        if (teamData?.data) {
          const { team, players ,captain} = teamData.data;
          setTeamdata({
            name: team.name,
            captain:captain.fullname,
            teamPlayer: players.map((p) => ({
              _id: p._id,
              name: p.name,
            })),
          });
        }
      } catch (e) { console.log("Error loading team", e); }
    };
    load();
  }, [eventId]);
  if (!event) return <LoadingPage />;

  const { festivalName, eventName, startDate, location, organization, description, mode, category, sports, maxParticipants, rules } = event;

  const handleLeaveTeam = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-players/leave-team/${eventId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result?.success) {
        navigate(-1);
      } else {
        setError(result?.message || "Failed to leave team.");
        setConfirmLeave(false);
      }
    } catch (e) {
      console.log("Error leaving team", e);
      setError("Something went wrong. Please try again.");
      setConfirmLeave(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-purple-100 to-white p-6"
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s"
          alt="Cricket Event Poster" className="w-full h-64 object-cover" />

        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-purple-500 text-xl" />
              <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Team Member</span>
            </div>
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

        {/* Action Buttons */}
        <div className="px-8 pb-4 flex flex-wrap gap-3">
          <button onClick={() => setShowTeam((v) => !v)}
            className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-800 transition shadow">
            {showTeam ? "Hide Team" : "Show Team"}
          </button>
          <button onClick={() => setConfirmLeave(true)}
            className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition shadow flex items-center gap-2">
            <FaSignOutAlt /> Leave Team
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {/* Confirm Leave */}
        {confirmLeave && (
          <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <p className="text-red-700 font-medium">Are you sure you want to leave this team?</p>
            <div className="flex gap-2">
              <button onClick={handleLeaveTeam} className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-800 transition">Yes, Leave</button>
              <button onClick={() => setConfirmLeave(false)} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        )}

        {/* Team Info Panel */}
        {showTeam && (
          <div className="p-6 bg-gray-50 rounded-xl shadow-md mx-6 mb-6 space-y-5">
            {!teamdata ? (
              <p className="text-gray-400 text-center">Loading team data...</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-800">Team:</span>
                  <span className="text-blue-700 font-bold text-lg">{teamdata?.name}</span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Players</h3>
                  <table className="w-full text-left border border-gray-300 rounded-md shadow-sm overflow-hidden">
                    <thead className="bg-purple-50 text-purple-800 font-semibold">
                      <tr>
                        <th className="py-3 px-4 border-b">Player Name</th>
                        <th className="py-3 px-4 border-b">Role</th>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 border-b">{teamdata?.captain}</th>
                        <th className="py-3 px-4 border-b">Captain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamdata?.teamPlayer?.length === 0 && (
                        <tr><td colSpan={2} className="py-4 px-4 text-center text-gray-400">No players in this team yet.</td></tr>
                      )}
                      {teamdata?.teamPlayer?.map((player, i) => (
                        <tr key={i} className="hover:bg-purple-50 transition">
                          <td className="py-3 px-4 border-b">{player?.name}</td>
                          <td className="py-3 px-4 border-b">{player?.role || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
