import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTrashAlt, FaPlus, FaTrophy } from "react-icons/fa";

export default function CreateCricketFormat() {
  const [format, setFormat] = useState("League");
  const [teams, setTeams] = useState([]);
  const [teamInput, setTeamInput] = useState("");
  const [matches, setMatches] = useState([]);

  const addTeam = () => {
    if (teamInput.trim() && !teams.includes(teamInput.trim())) {
      setTeams([...teams, teamInput.trim()]);
      setTeamInput("");
    }
  };

  const removeTeam = (index) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const generateMatches = () => {
    let generatedMatches = [];
    if (format === "League" || format === "Round Robin") {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          generatedMatches.push({
            team1: teams[i],
            team2: teams[j],
          });
        }
      }
    } else if (format === "Knockout") {
      for (let i = 0; i < teams.length; i += 2) {
        if (teams[i + 1]) {
          generatedMatches.push({
            team1: teams[i],
            team2: teams[i + 1],
          });
        }
      }
    }
    setMatches(generatedMatches);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-200 py-10 px-6"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <FaTrophy className="text-purple-600 text-3xl" />
          <h2 className="text-3xl font-bold text-gray-800">Cricket Tournament Setup</h2>
        </div>

        <label className="block text-lg font-medium mb-2">Select Format:</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full p-3 border border-purple-300 rounded-xl mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="League">League</option>
          <option value="Round Robin">Round Robin</option>
          <option value="Knockout">Knockout</option>
        </select>

        {/* Team Input */}
        <div className="mb-8">
          <label className="block text-lg font-medium mb-2">Add Teams:</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              placeholder="Enter team name"
              className="flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTeam}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md"
            >
              <FaPlus className="inline mr-1" /> Add
            </motion.button>
          </div>

          {/* Team List */}
          {teams.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {teams.map((team, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex justify-between items-center shadow-sm"
                >
                  <span className="font-medium text-indigo-800">{team}</span>
                  <button
                    onClick={() => removeTeam(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrashAlt />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Matches */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateMatches}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg transition duration-300"
        >
          Generate Matches
        </motion.button>

        {/* Match List */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-700">Fixtures:</h3>
            <div className="space-y-3">
              {matches.map((match, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-purple-100 shadow-sm rounded-lg p-4 flex justify-between"
                >
                  <span className="text-purple-700 font-medium">
                    {match.team1} 🆚 {match.team2}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
