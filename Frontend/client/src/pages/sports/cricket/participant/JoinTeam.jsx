import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../../../../config/api";
import fetchWithAuth from "../../../../config/fetchWithAuth";
import socket from "../../../../config/socket";
import { useAuth } from "../../../../hooks/useAuth";

export default function JoinTeam() {
  const [teamCode, setTeamCode] = useState("");
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState(null); // null | "pending" | "approved" | "rejected"
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Connect to personal socket room to receive captain's response in real-time
  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit("join:user", user._id);

    socket.on("join:response", ({ teamName: tn, status, eventId: eid }) => {
      if (eid?.toString() === eventId?.toString()) {
        setTeamName(tn);
        setRequestStatus(status);
        if (status === "approved") {
          setTimeout(() => navigate(`/sports/cricket/team-member/${eventId}`, { replace: true }), 1500);
        }
      }
    });

    return () => {
      socket.off("join:response");
      socket.disconnect();
    };
  }, [user, eventId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamCode.trim()) { setError("Team code is required."); return; }
    if (teamCode.length !== 5) { setError("Team code must be 5 characters."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/v1/sports/cricket/players/request-join/${teamCode}/${eventId}`,
        { method: "POST" }
      );
      const result = await res.json();
      if (!result?.success) {
        // If already approved, go straight to team page
        if (result?.data?.status === "approved") {
          navigate(`/sports/cricket/team-member/${eventId}`, { replace: true });
          return;
        }
        setError(result?.message);
      } else {
        setRequestStatus("pending");
      }
    } catch (err) {
      console.log("Error sending join request", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pending state UI
  if (requestStatus === "pending") {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center p-6">
        <motion.div
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 w-full max-w-lg text-center space-y-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <FaClock className="text-amber-400 text-5xl mx-auto" />
          <h2 className="font-heading text-xl font-semibold text-[#1e3a5f]">Request Sent</h2>
          <p className="text-[#374151] text-sm">
            Your request to join <span className="font-medium text-[#1e3a5f]">{teamName || "the team"}</span> has been sent.
            Waiting for the captain's approval.
          </p>
          <p className="text-xs text-gray-400">You'll be redirected automatically once approved.</p>
          <button onClick={() => navigate(-1)} className="text-sm text-[#b8860b] hover:underline">
            Go back
          </button>
        </motion.div>
      </div>
    );
  }

  // Rejected state UI
  if (requestStatus === "rejected") {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center p-6">
        <motion.div
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 w-full max-w-lg text-center space-y-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <FaTimesCircle className="text-red-400 text-5xl mx-auto" />
          <h2 className="font-heading text-xl font-semibold text-[#1e3a5f]">Request Rejected</h2>
          <p className="text-[#374151] text-sm">
            The captain of <span className="font-medium text-[#1e3a5f]">{teamName}</span> has rejected your request.
          </p>
          <button
            onClick={() => { setRequestStatus(null); setTeamCode(""); }}
            className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition font-medium text-sm"
          >
            Try another team
          </button>
        </motion.div>
      </div>
    );
  }

  // Approved state UI
  if (requestStatus === "approved") {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center p-6">
        <motion.div
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 w-full max-w-lg text-center space-y-5"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        >
          <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
          <h2 className="font-heading text-xl font-semibold text-[#1e3a5f]">Approved!</h2>
          <p className="text-[#374151] text-sm">You've been added to <span className="font-medium">{teamName}</span>. Redirecting…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center p-6">
      <motion.div
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl font-semibold text-center text-[#1e3a5f] mb-2 tracking-tight">
          Join Team
        </h1>
        <div className="w-12 h-px bg-[#b8860b]/40 mx-auto mb-6" />
        <p className="text-center text-sm text-gray-400 mb-6">
          Enter the team code. The captain will approve your request.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">Team Code</label>
            <input
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="Enter 5-character team code"
              maxLength={5}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] font-mono tracking-widest text-center text-lg"
            />
          </div>

          {error && (
            <motion.p
              className="text-red-600 text-sm font-medium bg-red-50 border border-red-100 px-4 py-2 rounded flex items-center gap-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <FaExclamationTriangle className="shrink-0" /> {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white font-medium py-2.5 rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition text-sm disabled:opacity-60"
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          >
            {loading ? "Sending Request…" : "Send Join Request"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
