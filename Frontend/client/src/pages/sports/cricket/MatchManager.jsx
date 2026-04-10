import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaPlay, FaPen, FaEye } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import API_URL from "../../../config/api";

const STATUS_BADGE = {
  upcoming: "bg-yellow-100 text-yellow-700",
  live: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-500",
  abandoned: "bg-red-100 text-red-500",
};

export default function MatchManager() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialising, setInitialising] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}`, { credentials: "include" });
      const data = await res.json();
      if (data?.data) setMatches(data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleInit = async () => {
    setInitialising(true);
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}/init`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data?.data) {
        setMatches(data.data);
        setMsg("Matches initialised from schedule.");
      } else {
        setMsg(data?.message || "Error initialising matches");
      }
    } catch (err) {
      setMsg("Failed to initialise matches");
    } finally {
      setInitialising(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-5">
          <FaArrowLeft /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MdSportsCricket className="text-3xl text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-gray-800">Match Manager</h1>
          </div>
          <button
            onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
            className="flex items-center gap-2 text-sm bg-white border border-indigo-200 text-indigo-600 px-3 py-2 rounded-xl hover:bg-indigo-50 transition"
          >
            <FaEye /> Live Board
          </button>
        </div>

        {msg && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {msg}
          </div>
        )}

        {/* Init button */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-700">Initialise Matches</p>
            <p className="text-xs text-gray-400">Creates matches from the saved schedule</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleInit}
            disabled={initialising}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60"
          >
            {initialising ? "Initialising..." : "Init from Schedule"}
          </motion.button>
        </div>

        {/* Match list */}
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MdSportsCricket className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No matches yet. Initialise from schedule above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-gray-800">{m.team1} vs {m.team2}</p>
                  <p className="text-xs text-gray-400">{m.round}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${STATUS_BADGE[m.status]}`}>
                    {m.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/sports/cricket/match/${m._id}/scorecard`)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition"
                    title="View scorecard"
                  >
                    <FaEye />
                  </button>
                  {m.status !== "completed" && (
                    <button
                      onClick={() => navigate(`/sports/cricket/match/${m._id}/score-input`)}
                      className={`p-2 rounded-xl text-white transition ${
                        m.status === "abandoned"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                      title={m.status === "abandoned" ? "Re-open & update scores" : "Enter scores"}
                    >
                      {m.status === "upcoming" ? <FaPlay /> : <FaPen />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
