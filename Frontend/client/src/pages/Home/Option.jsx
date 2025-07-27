import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const IamChoice = () => {
  const navigate=useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md text-center space-y-8 border border-white/20"
      >
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">I am</h1>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <button
            onClick={() => navigate('/joinMember')}
            className="px-8 py-3 bg-white/20 border border-white/30 text-white text-lg rounded-full hover:bg-white hover:text-purple-700 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Member
          </button>
          <button
            onClick={() => navigate('/join-event')}
            className="px-8 py-3 bg-white/20 border border-white/30 text-white text-lg rounded-full hover:bg-white hover:text-pink-600 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Participant
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default IamChoice;
