import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import API_URL from "../../config/api";
import fetchWithAuth from "../../config/fetchWithAuth";

export default function JoinEvent() {
  const [invitationCode, setInvitationCode] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) return setError("Invitation code is required.");
    if (!identityNumber.trim()) return setError("Identity number is required.");
    if (invitationCode.length !== 5) return setError("Invalid invitation code. Please try again.");

    setError(""); setSuccess("");
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/cpsh/participants/participate/${invitationCode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invitationCode, identityNumber }),
        }
      );
      const result = await response.json();
      if (!result?.success) {
        setError(result?.message);
      } else {
        setSuccess("Event joined successfully!");
        setTimeout(() => {
          navigate(`/event-details/${identityNumber}/${encodeURIComponent(invitationCode)}/${result.data._id}`);
        }, 1200);
      }
    } catch (err) {
      console.error("Error joining event:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex justify-center items-center p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg shadow-sm p-10 w-full max-w-lg border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h1
          className="font-heading text-2xl font-semibold text-center mb-6 tracking-tight"
          style={{ color: "var(--color-navy)" }}
        >
          Join event
        </h1>
        <div
          className="w-12 h-px mx-auto mb-6"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: "Invitation code", value: invitationCode, onChange: setInvitationCode, placeholder: "Enter your invitation code" },
            { label: "Identity number", value: identityNumber, onChange: setIdentityNumber, placeholder: "Enter your identity number" },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input-base"
              />
            </div>
          ))}

          {error && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
              style={{
                color: "var(--color-error)",
                backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-error) 25%, transparent)",
              }}
            >
              <FiAlertCircle className="shrink-0" /> {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
              style={{
                color: "var(--color-success)",
                backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)",
              }}
            >
              <FiCheckCircle className="shrink-0" /> {success}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            type="submit"
            className="btn-primary w-full"
          >
            Join event
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
