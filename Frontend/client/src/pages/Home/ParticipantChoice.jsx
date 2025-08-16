import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ParticpantChoice = () => {
  const navigate=useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex flex-col items-center justify-center px-4">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold text-gray-800 mb-12"
      >
        Participated as
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/30 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-full max-w-lg space-y-6 border border-white/40"
      >
        {/* Participated Section */}
        <div className="text-center">
          <div className="flex justify-center gap-6">
            <button
              onClick={() => navigate('/my-teams')}
              className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all shadow-md"
            >
              Team
            </button>
            <button
              onClick={() => navigate('/my-events')}
              className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all shadow-md"
            >
              Individual
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParticpantChoice;
