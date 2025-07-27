import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function JoinEvent() {
  const [invitationCode, setInvitationCode] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invitationCode.trim()) {
      setError("Invitation code is required.");
      setSuccess("");
    } else if (!identityNumber.trim()) {
      setError("Identity number is required.");
      setSuccess("");
    } else if (invitationCode.length !== 5) {
      setError("Invalid invitation code. Please try again.");
      setSuccess("");
    } else {
      try {
        const response = await fetch(
          `http://localhost:3000/api/cpsh/participants/participate/${invitationCode}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              invitationCode,
              identityNumber,
            }),
          }
        );
        const result = await response.json();
        if (!result?.success) {
          setError(result?.message);
          setSuccess("");
        } else {
          setError("");
          setSuccess("Event joined successfully!");
          setTimeout(() => {
            navigate(`/event-details/${identityNumber}/${invitationCode}`);
          }, 1200);
        }
      } catch (error) {
        console.log("Error while submitting", error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 flex justify-center items-center p-6"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-lg transition-all duration-300 hover:shadow-purple-300"
      >
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-8 drop-shadow">
          Join Event
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div whileFocus={{ scale: 1.02 }}>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Invitation Code
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Enter your invitation code"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            />
          </motion.div>

          <motion.div whileFocus={{ scale: 1.02 }}>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Identity Number
            </label>
            <input
              type="text"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              placeholder="Enter your Identity Number"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 font-medium bg-red-100 px-4 py-3 rounded-lg shadow-inner flex items-center gap-2"
            >
              <FiAlertCircle className="text-xl" /> {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 font-medium bg-green-100 px-4 py-3 rounded-lg shadow-inner flex items-center gap-2"
            >
              <FiCheckCircle className="text-xl" /> {success}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg hover:shadow-xl"
          >
            Join Event
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
