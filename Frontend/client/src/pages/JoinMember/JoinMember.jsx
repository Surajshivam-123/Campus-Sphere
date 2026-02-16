import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function JoinMember() {
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) {
      setError("Invitation code is required.");
      setSuccess("");
    } else if (invitationCode.length !== 5) {
      setError("Invalid invitation code. Please try again.");
      setSuccess("");
    } else {
      try {
        const response = await fetch(
          `http://localhost:3000/api/cpsh/members/participate/${invitationCode}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ invitationCode }),
          }
        );
        const result = await response.json();
        console.log("Server Response", result);
        if (!result?.success) {
          setError(result?.message);
          setSuccess("");
        } else {
          navigate(`/get-event/${invitationCode}`);
        }
      } catch (error) {
        console.log("Error while submitting", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center p-6">
      <motion.div
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1 className="font-heading text-2xl font-semibold text-center text-[#1e3a5f] mb-6 tracking-tight">
          Join event (member)
        </h1>
        <div className="w-12 h-px bg-[#b8860b]/40 mx-auto mb-6" />
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">
              Invitation code
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Enter your invitation code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
          </motion.div>

          {error && (
            <motion.p
              className="text-red-600 text-sm font-medium bg-red-50 border border-red-100 px-4 py-2 rounded flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaExclamationTriangle className="text-red-500 shrink-0" /> {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              className="text-green-700 text-sm font-medium bg-green-50 border border-green-100 px-4 py-2 rounded flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaCheckCircle className="text-green-600 shrink-0" /> {success}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="w-full bg-[#1e3a5f] text-white font-medium py-2.5 rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition-colors text-sm"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Join event
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
