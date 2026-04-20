import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import API_URL from "../../config/api";

export default function JoinClub() {
  const navigate = useNavigate();
  const [clubCode, setClubCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clubName, setClubName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setClubName("");

    const code = clubCode.trim();
    if (!code) return setError("Club code is required.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cpsh/clubs/join/${code}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send join request.");
      }

      // Try to get the club name to show a friendly message
      // The backend returns { status: "pending" } — we can look up by code
      setSuccess("Join request sent! Waiting for the founder's approval.");
      setClubCode("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.div
        className="rounded-lg shadow-sm p-10 w-full max-w-lg border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="font-heading text-2xl font-semibold text-center mb-2 tracking-tight"
          style={{ color: "var(--color-navy)" }}
        >
          Join a Club
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
          Enter the club code shared by the founder to request membership.
          Works for both public and private clubs.
        </p>
        <div
          className="w-12 h-px mx-auto mb-6"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-xs font-medium mb-2 uppercase tracking-wider"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Club code
            </label>
            <input
              type="text"
              value={clubCode}
              onChange={(e) => setClubCode(e.target.value)}
              placeholder="Enter 6-character club code"
              maxLength={6}
              className="input-base w-full"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
              style={{
                color: "var(--color-error)",
                backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-error) 25%, transparent)",
              }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <FaExclamationTriangle className="shrink-0" /> {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
              style={{
                color: "var(--color-success)",
                backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)",
              }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <FaCheckCircle className="shrink-0" /> {success}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? "Sending request…" : "Request to Join"}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/clubs")}
            className="text-sm underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            Browse public clubs instead
          </button>
        </div>
      </motion.div>
    </div>
  );
}
