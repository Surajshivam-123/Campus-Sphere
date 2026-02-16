import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AllEvents = () => {
  const navigate=useNavigate()

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-4">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="font-heading text-4xl font-semibold text-[#1e3a5f] mb-10 tracking-tight"
      >
        My Events
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 w-full max-w-lg space-y-6"
      >
        <div className="text-center">
          <h2 className="font-heading text-lg font-semibold text-[#374151] mb-4 tracking-tight">Participated</h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/my-events-member')}
              className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition-colors text-sm font-medium"
            >
              Member
            </button>
            <button
              onClick={() => navigate('/my-events')}
              className="px-5 py-2.5 bg-white text-[#1e3a5f] border border-[#1e3a5f] rounded hover:bg-[#f0ede6] transition-colors text-sm font-medium"
            >
              Participant
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <button
            onClick={() => navigate('/events-hosted')}
            className="px-6 py-3 bg-[#b8860b] text-white rounded border border-[#b8860b] hover:bg-[#a67a0a] transition-colors text-sm font-medium"
          >
            Hosted Events
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AllEvents;
