import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const IamChoice = () => {
  const navigate=useNavigate()

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 w-full max-w-md text-center space-y-8"
      >
        <h1 className="font-heading text-3xl font-semibold text-[#1e3a5f] tracking-tight">I am</h1>
        <div className="w-12 h-px bg-[#b8860b]/50 mx-auto" />
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => navigate('/joinMember')}
            className="w-full sm:w-auto px-6 py-3 bg-[#1e3a5f] text-white rounded border border-[#1e3a5f] font-medium text-sm hover:bg-[#2d4a6f] transition-colors"
          >
            Member
          </button>
          <button
            onClick={() => navigate('/join-event')}
            className="w-full sm:w-auto px-6 py-3 bg-white text-[#1e3a5f] border border-[#1e3a5f] rounded font-medium text-sm hover:bg-[#f0ede6] transition-colors"
          >
            Participant
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default IamChoice;
