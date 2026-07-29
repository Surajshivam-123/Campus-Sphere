import API_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTrophy, FaMedal, FaArrowLeft, FaSync } from "react-icons/fa";
import fetchWithAuth from "../../config/fetchWithAuth";
import socket from "../../config/socket";
import LoadingPage from "../LoadingPage";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function Leaderboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/coding/submissions/event/${eventId}/leaderboard`);
      const data = await res.json();
      if (data?.data) { setLeaderboard(data.data); setLastUpdated(new Date()); }
    } catch (e) {
      console.error("Error fetching leaderboard", e);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const contestRes = await fetchWithAuth(`${API_URL}/api/cpsh/coding/contest/${eventId}`);
        const contestData = await contestRes.json();
        if (contestData?.data) setContest(contestData.data);
      } catch (e) {
        console.error("Error loading leaderboard page", e);
      }
      await fetchLeaderboard();
      setLoading(false);
    };
    load();
  }, [eventId]);

  // Real-time updates
  useEffect(() => {
    socket.connect();
    socket.emit("join:contest", eventId);
    socket.on("leaderboard:updated", () => fetchLeaderboard());
    return () => {
      socket.emit("leave:contest", eventId);
      socket.off("leaderboard:updated");
      socket.disconnect();
    };
  }, [eventId]);

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium transition"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <FaArrowLeft size={12} /> Back
          </button>
          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition"
            style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}
          >
            <FaSync size={10} /> Refresh
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {/* Title bar */}
          <div className="px-6 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <FaTrophy style={{ color: "var(--color-gold)", fontSize: "1.5rem" }} />
              <div>
                <h1 className="font-heading text-xl font-semibold" style={{ color: "var(--color-navy)" }}>
                  Leaderboard
                </h1>
                {lastUpdated && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    Updated {lastUpdated.toLocaleTimeString()}
                    {contest?.status === "live" && " · Live"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-16 text-center">
              <FaTrophy className="mx-auto text-4xl mb-3" style={{ color: "var(--color-border)" }} />
              <p className="font-medium" style={{ color: "var(--color-text-secondary)" }}>No submissions yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Accepted submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--color-surface-2)", borderBottom: `1px solid var(--color-border)` }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-12" style={{ color: "var(--color-text-muted)" }}>#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Participant</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Solved</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => (
                    <motion.tr
                      key={entry.participant._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: `1px solid var(--color-border-soft)` }}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        {i < 3 ? (
                          <FaMedal style={{ color: MEDAL_COLORS[i], fontSize: "1.1rem" }} />
                        ) : (
                          <span className="font-mono font-bold text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {entry.rank}
                          </span>
                        )}
                      </td>

                      {/* Participant */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {entry.participant.avatar ? (
                            <img src={entry.participant.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: "var(--color-navy)" }}
                            >
                              {(entry.participant.fullname || entry.participant.username || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium" style={{ color: "var(--color-navy)" }}>
                              {entry.participant.fullname || entry.participant.username}
                            </p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                              @{entry.participant.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Solved count */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold" style={{ color: "var(--color-navy)" }}>{entry.solvedCount}</span>
                      </td>

                      {/* Total score */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-base" style={{ color: "var(--color-gold)" }}>{entry.totalScore}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
