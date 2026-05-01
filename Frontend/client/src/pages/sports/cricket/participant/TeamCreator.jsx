import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChalkboardTeacher,
  FaTrash, FaCrown, FaCheckCircle, FaBell, FaUserPlus, FaCheck, FaTimes,
} from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import LoadingPage from "../../../LoadingPage";
import API_URL from "../../../../config/api";
import { formatDateTime } from "../../../../utils/helpers";
import useScorerRole from "../../../../hooks/useScorerRole";
import useIsLive from "../../../../hooks/useIsLive";
import socket from "../../../../config/socket";
import { useAuth } from "../../../../hooks/useAuth";
import fetchWithAuth from "../../../../config/fetchWithAuth";
import FloatingChatButton from "../../../../components/shared/FloatingChatButton";

export default function TeamCreatorPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [teamdata, setTeamdata] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [respondingId, setRespondingId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamlogo, setTeamlogo] = useState(null);
  const [editName, setEditName] = useState(false);
  const [editlogo, setEditlogo] = useState(false);
  const [showTeam, setShowTeam] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { isScorer } = useScorerRole(eventId);
  const { isLive } = useIsLive(eventId);
  const [pendingMatch, setPendingMatch] = useState(null);

  // Squad selection state
  const [squadSelected, setSquadSelected] = useState(new Set());
  const [squadSubmitted, setSquadSubmitted] = useState(false);
  const [squadSubmitting, setSquadSubmitting] = useState(false);
  const [squadError, setSquadError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch event, team, and matches all at once
        const [evRes, teamRes, matchRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`),
          fetchWithAuth(`${API_URL}/api/cpsh/teams/get-team/${eventId}`),
          fetchWithAuth(`${API_URL}/api/cpsh/matches/event/${eventId}`),
        ]);

        const evData = await evRes.json();
        const teamData = await teamRes.json();
        const matchData = await matchRes.json();

        if (evData?.data) setEvent(evData.data);

        if (teamData?.data) {
          setTeamdata(teamData.data);
          setTeamName(teamData.data.name);
          setTeamlogo(teamData.data.teamlogo);

          const myTeamId = teamData.data._id?.toString();

          // Find a match where toss is done and this team is playing
          const active = (matchData?.data || []).find((m) => {
            if (!["toss_done", "squads_ready"].includes(m.status)) return false;
            return (
              m.team1Id?.toString() === myTeamId ||
              m.team2Id?.toString() === myTeamId
            );
          });

          if (active) {
            setPendingMatch(active);
            const isTeam1 = active.team1Id?.toString() === myTeamId;
            const existingSquad = isTeam1 ? active.team1Squad : active.team2Squad;
            if (existingSquad?.length > 0) {
              setSquadSubmitted(true);
              setSquadSelected(new Set(existingSquad.map((p) => p.name)));
            }
          }
        }

        // Fetch pending join requests for captain
        try {
          const reqRes = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-players/join-requests/${eventId}`, {
            credentials: "include",
          });
          const reqData = await reqRes.json();
          if (reqData?.success) setJoinRequests(reqData.data || []);
        } catch (e) {
          console.log("Error loading join requests", e);
        }
      } catch (e) {
        console.log("Error loading page data", e);
      }
    };
    load();
  }, [eventId]);

  // Socket: receive new join requests in real-time
  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit("join:captain", user._id);

    socket.on("join:request", (data) => {
      if (data.eventId?.toString() === eventId?.toString()) {
        setJoinRequests((prev) => [...prev, {
          _id: data.requestId,
          requester: { fullname: data.requesterName, username: data.requesterName },
        }]);
      }
    });

    return () => {
      socket.off("join:request");
      socket.disconnect();
    };
  }, [user, eventId]);

  if (!event) return <LoadingPage />;

  const { festivalName, eventName, startDate, location, organization, description, mode, category, sports, maxParticipants, rules } = event;

  const handleUpdateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append("name", teamName);
      if (teamlogo instanceof File) formData.append("teamlogo", teamlogo);
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/teams/update-team/${eventId}`, {
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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/teams/delete-team/${eventId}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result?.success) navigate(-1);
    } catch (e) { console.log("Error deleting team", e); }
  };

  const handleSquadToggle = (name) => {
    setSquadSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleSquadSubmit = async () => {
    if (squadSelected.size === 0) { setSquadError("Select at least 1 player"); return; }
    if (!pendingMatch) return;
    setSquadSubmitting(true);
    setSquadError("");
    try {
      const players = (teamdata?.teamPlayer || [])
        .filter((p) => squadSelected.has(p.name))
        .map((p) => ({ name: p.name, playerId: p._id }));

      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${pendingMatch._id}/submit-squad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: teamdata.name, players }),
      });
      const data = await res.json();
      if (res.ok) {
        setSquadSubmitted(true);
        setPendingMatch(data.data);
      } else {
        setSquadError(data.message || "Failed to submit squad");
      }
    } catch (e) {
      setSquadError("Error submitting squad");
    } finally {
      setSquadSubmitting(false);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-players/remove-player/${playerId}`, {
        method: "DELETE"
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

  const handleRespondRequest = async (requestId, action) => {
    setRespondingId(requestId);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-players/join-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await res.json();
      if (result?.success) {
        setJoinRequests((prev) => prev.filter((r) => r._id !== requestId));
        if (action === "approve") {
          // Refresh team data to show new player
          const teamRes = await fetchWithAuth(`${API_URL}/api/cpsh/teams/get-team/${eventId}`, { credentials: "include" });
          const teamData = await teamRes.json();
          if (teamData?.data) {
            setTeamdata(teamData.data);
          }
        }
      }
    } catch (e) {
      console.log("Error responding to request", e);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <motion.div className="min-h-screen bg-[#faf9f6] py-10 px-4"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <FloatingChatButton eventId={eventId} teamId={teamdata?._id} isCaptain={true} />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s"
          alt="Cricket Event Poster" className="w-full h-48 object-cover" />

        <div className="p-8 space-y-6">

          {/* Squad Submit Alert */}
          {pendingMatch && !squadSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <MdSportsCricket className="text-xl flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Action required — submit your playing XI</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {pendingMatch.team1} vs {pendingMatch.team2} · Scroll down to the Players section
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-600 font-medium">↓ See Players</span>
            </motion.div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FaCrown className="text-[#b8860b] text-lg" />
              <span className="text-xs font-medium text-[#b8860b] bg-[#faf9f6] border border-[#b8860b]/30 px-2 py-0.5 rounded-full">Team Captain</span>
            </div>
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

        {/* Scorer Banner */}
        {isScorer && (
          <div className="mx-8 mb-2 flex items-center justify-between gap-3 bg-indigo-600 text-white rounded-2xl px-5 py-4 shadow-lg">
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

        {/* Action Buttons */}
        <div className="px-8 pb-4 flex flex-wrap gap-3">
          <button onClick={() => setShowTeam((v) => !v)}
            className="bg-[#1e3a5f] text-white rounded px-4 py-2 hover:bg-[#2d4a6f] transition text-sm font-medium border border-[#1e3a5f]">
            {showTeam ? "Hide Team" : "Show Team"}
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="border border-red-200 text-red-600 rounded px-4 py-2 hover:bg-red-50 transition text-sm font-medium flex items-center gap-2">
            <FaTrash /> Delete Team
          </button>
          {isLive && (
            <button onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
              className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" /> Watch Live
            </button>
          )}
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

        {/* Join Requests Panel */}
        {joinRequests.length > 0 && (
          <div className="mx-8 mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <FaBell className="text-yellow-500" />
                <h3 className="font-bold text-yellow-800 text-sm">
                  Join Requests ({joinRequests.length})
                </h3>
              </div>
              {joinRequests.map((req) => (
                <div key={req._id} className="flex items-center justify-between bg-white border border-yellow-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                      {(req.requester?.fullname || req.requester?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {req.requester?.fullname || req.requester?.username}
                      </p>
                      <p className="text-xs text-gray-400">wants to join your team</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondRequest(req._id, "approve")}
                      disabled={respondingId === req._id}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req._id, "reject")}
                      disabled={respondingId === req._id}
                      className="flex items-center gap-1 bg-red-400 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              ))}
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

            {/* Players Table + Squad Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Players & Playing XI</h3>
                {pendingMatch && !squadSubmitted && (
                  <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full font-semibold">
                    Toss done — select your XI
                  </span>
                )}
                {squadSubmitted && (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <FaCheckCircle /> XI Submitted
                  </span>
                )}
              </div>

              {/* Squad selection panel — shown when toss is done */}
              <AnimatePresence>
                {pendingMatch ? (
                  <motion.div
                    key="squad-panel"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                          <MdSportsCricket />
                          {squadSubmitted ? "Your Playing XI" : "Select Playing XI"}
                        </p>
                        <p className="text-xs text-yellow-600 mt-0.5">
                          {pendingMatch.team1} vs {pendingMatch.team2} · {pendingMatch.round}
                          {" · Toss: "}
                          <span className="font-semibold">{pendingMatch.tossWinner}</span>
                          {" elected to "}
                          <span className="font-semibold capitalize">{pendingMatch.tossDecision}</span>
                        </p>
                      </div>
                      {!squadSubmitted && (
                        <span className="text-sm font-bold text-yellow-700 bg-yellow-200 px-3 py-1 rounded-full">
                          {squadSelected.size} selected
                        </span>
                      )}
                      {squadSubmitted && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          <FaCheckCircle /> Submitted
                        </span>
                      )}
                    </div>

                    {squadError && (
                      <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{squadError}</p>
                    )}

                    {/* Player checklist */}
                    <div className="space-y-2">
                      {(teamdata?.teamPlayer || []).map((p) => {
                        const isSelected = squadSelected.has(p.name);
                        return (
                          <motion.button
                            key={p.name}
                            whileTap={!squadSubmitted ? { scale: 0.98 } : {}}
                            onClick={() => !squadSubmitted && handleSquadToggle(p.name)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition ${
                              isSelected
                                ? "border-yellow-500 bg-yellow-100"
                                : "border-gray-200 bg-white hover:border-yellow-300"
                            } ${squadSubmitted ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <span className="font-medium text-gray-800 text-sm flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-500"
                              }`}>
                                {p.name.charAt(0).toUpperCase()}
                              </span>
                              {p.name}
                              {p.isCaptain && (
                                <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">C</span>
                              )}
                            </span>
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                              isSelected ? "border-yellow-500 bg-yellow-500" : "border-gray-300"
                            }`}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Submit / status */}
                    {!squadSubmitted ? (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSquadSubmit}
                        disabled={squadSubmitting || squadSelected.size === 0}
                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition disabled:opacity-50 shadow"
                      >
                        {squadSubmitting ? "Submitting..." : `Submit Playing XI (${squadSelected.size} players)`}
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-700 font-medium">
                          {(pendingMatch?.team1Squad?.length > 0 && pendingMatch?.team2Squad?.length > 0)
                            ? "Both teams submitted — scorer is confirming the playing XI"
                            : "Waiting for the other team to submit their squad"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-toss"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mb-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <MdSportsCricket className="text-gray-400 text-xl flex-shrink-0" />
                    <p className="text-sm text-gray-500">
                      Playing XI selection will be available once the toss is done for your match.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Full roster table */}
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
