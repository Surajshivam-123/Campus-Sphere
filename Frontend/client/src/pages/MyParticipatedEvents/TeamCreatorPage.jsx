import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChalkboardTeacher,
  FaTrash, FaCrown,
} from "react-icons/fa";
import LoadingPage from "../LoadingPage";
import API_URL from "../../config/api";

export default function TeamCreatorPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [teamdata, setTeamdata] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamlogo, setTeamlogo] = useState(null);
  const [editName, setEditName] = useState(false);
  const [editlogo, setEditlogo] = useState(false);
  const [showTeam, setShowTeam] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
        const teamRes = await fetch(`${API_URL}/api/cpsh/teams/get-team/${eventId}`, {
          method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include",
        });
        const teamData = await teamRes.json();
        console.log("TeamData:",teamData)
        if (teamData?.data) {
          setTeamdata(teamData.data);
          setTeamName(teamData.data.name);
          setTeamlogo(teamData.data.teamlogo);
        }
      } catch (e) { console.log("Error loading team", e); }
    };
    load();
  }, [eventId]);

  if (!event) return <LoadingPage />;

  const { festivalName, eventName, startDate, location, organization, description, mode, category, sports, maxParticipants, rules } = event;

  const handleUpdateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append("name", teamName);
      if (teamlogo instanceof File) formData.append("teamlogo", teamlogo);
      const res = await fetch(`${API_URL}/api/cpsh/teams/update-team/${eventId}`, {
        method: "PATCH", credentials: "include", body: formData,
      });
      const result = await res.json();
      if (result?.success) {
        setEditName(false);
        setEditlogo(false);
        window.location.reload();
      }
    } catch (e) { console.log("Error updating team", e); }
  };

  const handleDeleteTeam = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cpsh/teams/delete-team/${eventId}`, {
        method: "DELETE", credentials: "include",
      });
      const result = await res.json();
      if (result?.success) navigate(-1);
    } catch (e) { console.log("Error deleting team", e); }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      const res = await fetch(`${API_URL}/api/cpsh/cricket-players/remove-player/${playerId}`, {
        method: "DELETE", credentials: "include",
      });
      const result = await res.json();
      if (result?.success) {
        setTeamdata((prev) => ({
          ...prev,
          teamPlayer: prev.teamPlayer.filter((p) => p._id !== playerId),
        }));
      }
    } catch (e) { console.log("Error removing player", e); }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6"
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s"
          alt="Cricket Event Poster" className="w-full h-64 object-cover" />

        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FaCrown className="text-yellow-500 text-xl" />
              <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Team Captain</span>
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
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-800 transition shadow">
            {showTeam ? "Hide Team" : "Show Team"}
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition shadow flex items-center gap-2">
            <FaTrash /> Delete Team
          </button>
        </div>

        {/* Confirm Delete */}
        {confirmDelete && (
          <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <p className="text-red-700 font-medium">Are you sure you want to delete this team?</p>
            <div className="flex gap-2">
              <button onClick={handleDeleteTeam} className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-800 transition">Yes, Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        )}

        {/* Team Panel */}
        {showTeam && teamdata && (
          <div className="p-6 bg-gray-50 rounded-xl shadow-md mx-6 mb-6 space-y-6">

            {/* Team Name */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Team Name:</span>
              {editName ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="border border-gray-300 px-3 py-1 rounded-lg text-base focus:outline-none focus:ring focus:ring-blue-300" />
                  <button onClick={handleUpdateTeam} className="text-green-600 font-semibold hover:underline">Save</button>
                  <button onClick={() => setEditName(false)} className="text-gray-500 hover:underline">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">{teamName}</span>
                  <button onClick={() => setEditName(true)} className="text-blue-600 hover:underline text-sm">Edit</button>
                </div>
              )}
            </div>

            {/* Team Logo */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Team Logo:</span>
              {editlogo ? (
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*"
                    onChange={(e) => setTeamlogo(e.target.files[0])}
                    className="text-sm text-gray-700 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700" />
                  <button onClick={handleUpdateTeam} className="text-green-600 font-semibold hover:underline">Save</button>
                  <button onClick={() => setEditlogo(false)} className="text-gray-500 hover:underline">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {typeof teamlogo === "string" && teamlogo ? (
                    <img src={teamlogo} alt="Team Logo" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <span className="text-gray-400 text-sm">No logo</span>
                  )}
                  <button onClick={() => setEditlogo(true)} className="text-blue-600 hover:underline text-sm">Edit</button>
                </div>
              )}
            </div>

            {/* Team Code */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-800">Team Code:</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{teamdata?.teamCode}</span>
              <span className="text-xs text-gray-400">(Share this with players to join)</span>
            </div>

            {/* Players Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Players</h3>
              <table className="w-full text-left border border-gray-300 rounded-md shadow-sm overflow-hidden">
                <thead className="bg-blue-50 text-blue-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4 border-b">Player Name</th>
                    <th className="py-3 px-4 border-b text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {teamdata?.teamPlayer?.length === 0 && (
                    <tr><td colSpan={2} className="py-4 px-4 text-center text-gray-400">No players yet. Share the team code to invite players.</td></tr>
                  )}
                  {teamdata?.teamPlayer?.map((player, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition">
                      <td className="py-3 px-4 border-b">
                        <span>{player?.name}</span>
                        {player?.isCaptain && (
                          <span className="ml-2 text-yellow-600 font-semibold text-xs">(Captain)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        {!player?.isCaptain && (
                          <button onClick={() => handleRemovePlayer(player._id)}
                            className="text-red-500 hover:text-red-700 transition" title="Remove player">
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
