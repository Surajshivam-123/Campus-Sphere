import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPenAlt, FaTrophy, FaCheckCircle, FaSpinner } from "react-icons/fa";
import API_URL from "../../config/api";

export default function SchedulePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [mode, setMode] = useState(null); // "ai" | "manual"
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [initLoading, setInitLoading] = useState(false);

  // Manual schedule state: list of match objects
  const [manualMatches, setManualMatches] = useState([{ team1: "", team2: "", round: "", date: "", venue: "" }]);

  useEffect(() => {
    const load = async () => {
      try {
        const [teamsRes, schedRes] = await Promise.all([
          fetch(`${API_URL}/api/cpsh/teams/get-event-teams/${eventId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/cpsh/schedule/${eventId}`, { credentials: "include" }),
        ]);
        const teamsData = await teamsRes.json();
        const schedData = await schedRes.json();
        setTeams(teamsData?.data || []);
        if (schedData?.data) setSchedule(schedData.data);
      } catch (err) {
        console.log("Error loading data", err);
      }
    };
    load();
  }, [eventId]);

  const handleAIGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/cpsh/schedule/${eventId}/ai`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate schedule");
      setSchedule(data.data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    const valid = manualMatches.every((m) => m.team1 && m.team2 && m.team1 !== m.team2);
    if (!valid) { setError("Each match needs two different teams selected."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/cpsh/schedule/${eventId}/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ matches: manualMatches }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save schedule");
      setSchedule(data.data);
      setSaved(true);
      setMode(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMatch = (i, field, value) => {
    setManualMatches((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const addMatch = () => setManualMatches((prev) => [...prev, { team1: "", team2: "", round: "", date: "", venue: "" }]);
  const removeMatch = (i) => setManualMatches((prev) => prev.filter((_, idx) => idx !== i));

  const handleInitMatches = async () => {
    setInitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}/init`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/sports/cricket/scoreboard/${eventId}`);
      } else {
        setError(data.message || "Failed to initialize matches");
      }
    } catch (err) {
      setError("Error initializing matches");
    } finally {
      setInitLoading(false);
    }
  };

  const teamNames = teams.map((t) => t.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 py-10 px-6"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <FaTrophy className="text-purple-600 text-3xl" />
          <h2 className="text-3xl font-bold text-gray-800">Tournament Schedule</h2>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 rounded-xl px-4 py-3">
            <FaCheckCircle /> <span>Schedule saved successfully.</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3">{error}</div>
        )}

        {/* Existing schedule display */}
        {schedule && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Current schedule — method: <span className="font-semibold text-indigo-700">{schedule.method}</span>
              </p>
              <button onClick={() => { setSchedule(null); setSaved(false); setMode(null); }}
                className="text-xs text-red-500 hover:underline">Regenerate</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-indigo-50 text-indigo-800">
                  <tr>
                    <th className="py-2 px-3 text-left">#</th>
                    <th className="py-2 px-3 text-left">Team 1</th>
                    <th className="py-2 px-3 text-left">Team 2</th>
                    <th className="py-2 px-3 text-left">Round</th>
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.matches.map((m, i) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-3 font-medium">{m.team1}</td>
                      <td className="py-2 px-3 font-medium">{m.team2}</td>
                      <td className="py-2 px-3 text-gray-500">{m.round || "—"}</td>
                      <td className="py-2 px-3 text-gray-500">{m.date || "—"}</td>
                      <td className="py-2 px-3 text-gray-500">{m.venue || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleInitMatches}
                disabled={initLoading}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {initLoading ? <><FaSpinner className="animate-spin" /> Starting...</> : <><FaTrophy /> Start Tournament</>}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition flex items-center justify-center gap-2"
              >
                <FaTrophy /> View Scoreboard
              </motion.button>
            </div>
          </div>
        )}

        {/* Method selection */}
        {!schedule && !mode && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setMode("ai")}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition"
            >
              <FaRobot className="text-4xl text-purple-500" />
              <span className="font-semibold text-gray-700">Generate with AI</span>
              <span className="text-xs text-gray-400 text-center">Unbiased, randomized schedule using AI</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setMode("manual")}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              <FaPenAlt className="text-4xl text-indigo-500" />
              <span className="font-semibold text-gray-700">Create Manually</span>
              <span className="text-xs text-gray-400 text-center">Pick matchups and rounds yourself</span>
            </motion.button>
          </div>
        )}

        {/* AI mode */}
        <AnimatePresence>
          {!schedule && mode === "ai" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-gray-600 text-sm">
                AI will generate a fair, randomized schedule based on your tournament format and registered teams.
              </p>
              <p className="text-sm text-gray-500">Teams registered: <span className="font-semibold text-indigo-700">{teamNames.join(", ") || "None"}</span></p>
              <div className="flex gap-3">
                <button onClick={() => setMode(null)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-semibold">
                  Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAIGenerate} disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><FaSpinner className="animate-spin" /> Generating...</> : <><FaRobot /> Generate Schedule</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual mode */}
        <AnimatePresence>
          {!schedule && mode === "manual" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm text-gray-500">Add matches manually. Select teams for each matchup.</p>
              {manualMatches.map((match, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Match {i + 1}</span>
                    {manualMatches.length > 1 && (
                      <button onClick={() => removeMatch(i)} className="text-red-400 text-xs hover:underline">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Team 1</label>
                      <select id={`match-team1-${i}`} name={`match-team1-${i}`} value={match.team1} onChange={(e) => updateMatch(i, "team1", e.target.value)}
                        className="w-full p-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                        <option value="">Select team</option>
                        {teamNames.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Team 2</label>
                      <select id={`match-team2-${i}`} name={`match-team2-${i}`} value={match.team2} onChange={(e) => updateMatch(i, "team2", e.target.value)}
                        className="w-full p-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                        <option value="">Select team</option>
                        {teamNames.filter((t) => t !== match.team1).map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Round</label>
                      <input id={`match-round-${i}`} name={`match-round-${i}`} value={match.round} onChange={(e) => updateMatch(i, "round", e.target.value)}
                        placeholder="e.g. Quarter Final"
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date</label>
                      <input id={`match-date-${i}`} name={`match-date-${i}`} type="date" value={match.date} onChange={(e) => updateMatch(i, "date", e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Venue</label>
                      <input id={`match-venue-${i}`} name={`match-venue-${i}`} value={match.venue} onChange={(e) => updateMatch(i, "venue", e.target.value)}
                        placeholder="e.g. Ground A"
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addMatch}
                className="w-full py-2 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 text-sm font-semibold transition">
                + Add Match
              </button>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setMode(null)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-semibold">
                  Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleManualSave} disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaPenAlt /> Save Schedule</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => navigate(-1)}
          className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-semibold">
          Back
        </button>
      </div>
    </motion.div>
  );
}
