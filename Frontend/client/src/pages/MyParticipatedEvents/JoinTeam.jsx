import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import API_URL from "../../config/api";

export default function JoinTeam() {
  const [teamCode, setteamCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {eventId}=useParams();
  const handleGoBack = () => {
    window.history.back(); // goes back one step in browser history
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      setError("Invitation code is required.");
      setSuccess("");
    } else if (teamCode.length !== 5) {
      setError("Invalid invitation code. Please try again.");
      setSuccess("");
    } else {
      try {
        const response = await fetch(
          `${API_URL}/api/cpsh/cricket-players/join-team/${teamCode}/${eventId}`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        const result = await response.json();
        console.log("Server Response", result);
        if (!result?.success) {
          setError(result?.message);
          setSuccess("");
        } else {
          handleGoBack();
        }
      } catch (error) {
        console.log("Error while submitting", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-300 to-purple-300 flex justify-center items-center p-6">
      <motion.div
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-3xl font-bold text-center text-purple-700 mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
        Join Team
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Team Code
            </label>
            <input
              type="text"
              value={teamCode}
              onChange={(e) => setteamCode(e.target.value)}
              placeholder="Enter your team code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </motion.div>

          {error && (
            <motion.p
              className="text-red-600 font-medium bg-red-100 px-4 py-2 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaExclamationTriangle className="text-red-500" /> {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              className="text-green-600 font-medium bg-green-100 px-4 py-2 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaCheckCircle className="text-green-500" /> {success}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition duration-200 shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Join Team
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
