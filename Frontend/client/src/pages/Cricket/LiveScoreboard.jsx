import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCircle, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaLock } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import API_URL from "../../config/api";
import socket from "../../config/socket";
import useEventAccess from "../../hooks/useEventAccess";

const STATUS_COLOR = {
  live: "text-green-500",
  upcoming: "text-yellow-500",
  completed: "text-gray-400",
  abandoned: "text-red-400",
};

function MatchCard({ match, onClick }) {
  const i1 = match.innings1;
  const i2 = match.innings2;
  const isLive = match.status === "live";
  const ovDisp = (inn) => `${inn.overs}.${inn.balls}`;

  const scoreFor = (teamName) => {
    if (i1.battingTeam === teamName)
      return <span className="text-xl font-extrabold text-gray-900">{i1.runs}/{i1.wickets}<span className="text-sm font-normal text-gray-500 ml-1">({ovDisp(i1)})</span></span>;
    if (i2.battingTeam === teamName && (i2.runs > 0 || i2.wickets > 0))
      return <span className="text-xl font-extrabold text-gray-900">{i2.runs}/{i2.wickets}<span className="text-sm font-normal text-gray-500 ml-1">({ovDisp(i2)})</span></span>;
    return <span className="text-gray-400 text-sm">Yet to bat</span>;
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      onClick={() => onClick(match._id)}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">{match.round || "Match"}</span>
        <span className={`flex items-center gap-1 text-xs font-bold uppercase ${STATUS_COLOR[match.status]}`}>
          {isLive && <FaCircle className="text-[8px] animate-pulse" />}
          {match.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-800">{match.team1}</span>
          {scoreFor(match.team1)}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-800">{match.team2}</span>
          {scoreFor(match.team2)}
        </div>
      </div>

      {match.result && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm font-semibold text-indigo-600">{match.result}</div>
      )}
      {isLive && match.currentInnings === 2 && i1.runs > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          Target: <span className="font-bold text-gray-800">{i1.runs + 1}</span>
          {" · "}Need <span className="font-bold text-gray-800">{i1.runs + 1 - i2.runs}</span> off{" "}
          <span className="font-bold text-gray-800">{(match.overs - i2.overs) * 6 - i2.balls}</span> balls
        </div>
      )}

      <div className="flex gap-4 mt-3 text-xs text-gray-400">
        {match.venue && <span className="flex items-center gap-1"><FaMapMarkerAlt />{match.venue}</span>}
        {match.date && <span className="flex items-center gap-1"><FaCalendarAlt />{match.date}</span>}
      </div>
    </motion.div>
  );
}

export default function LiveScoreboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { access, loading: accessLoading } = useEventAccess(eventId);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [connected, setConnected] = useState(false);

  // Initial fetch — only if access granted
  useEffect(() => {
    if (!access) return;
    fetch(`${API_URL}/api/v1/matches/event/${eventId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d?.data) setMatches(d.data); })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [eventId, access]);

  // Socket — only connect if access granted
  useEffect(() => {
    if (!access) return;
    socket.connect();
    socket.emit("join:event", eventId);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("match:updated", (updatedMatch) => {
      setMatches((prev) => {
        const idx = prev.findIndex((m) => m._id === updatedMatch._id);
        if (idx === -1) return [...prev, updatedMatch];
        const next = [...prev];
        next[idx] = updatedMatch;
        return next;
      });
    });
    return () => {
      socket.emit("leave:event", eventId);
      socket.off("match:updated");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [eventId, access]);

  // Access check loading
  if (accessLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Checking access...</div>;
  }

  // Access denied
  if (!access) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center"
        >
          <FaLock className="text-5xl text-indigo-300 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Only participants, members, players, and the organiser of this event can view live scores.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter);
  const liveCount = matches.filter((m) => m.status === "live").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center gap-2 text-sm">
            {liveCount > 0 && (
              <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold text-xs">
                <FaCircle className="text-[8px] animate-pulse" /> {liveCount} LIVE
              </span>
            )}
            <span className={`flex items-center gap-1 text-xs font-medium ${connected ? "text-green-500" : "text-gray-400"}`}>
              <FaCircle className="text-[8px]" />
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <MdSportsCricket className="text-4xl text-indigo-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Live Scoreboard</h1>
            <p className="text-sm text-gray-500">Real-time updates via WebSocket</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "live", "upcoming", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                filter === f ? "bg-indigo-600 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:bg-indigo-50"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-1 text-xs opacity-70">({matches.filter((m) => m.status === f).length})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading matches...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MdSportsCricket className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No {filter !== "all" ? filter : ""} matches found.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {filtered.map((match) => (
                <MatchCard key={match._id} match={match} onClick={(id) => navigate(`/match/${id}/scorecard`)} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
