import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import memberService from "../../services/member.service";

export default function JoinMember() {
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePreview = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!invitationCode.trim()) return setError("Invitation code is required.");
    if (invitationCode.trim().length !== 5) return setError("Invalid invitation code. Please try again.");

    setLoading(true);
    try {
      const result = await memberService.getEventByMemberCode(invitationCode.trim());
      if (!result?.success) return setError(result?.message || "Invalid code.");
      navigate(`/get-event/${encodeURIComponent(invitationCode.trim())}`);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
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
          className="font-heading text-2xl font-semibold text-center mb-6 tracking-tight"
          style={{ color: "var(--color-navy)" }}
        >
          Join event (member)
        </h1>
        <div
          className="w-12 h-px mx-auto mb-6"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
        />

        <form onSubmit={handlePreview} className="space-y-6">
          <div>
            <label
              className="block text-xs font-medium mb-2 uppercase tracking-wider"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Member code
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Enter 5-character member code"
              maxLength={5}
              className="input-base"
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
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          >
            {loading ? "Checking…" : "Preview event"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
