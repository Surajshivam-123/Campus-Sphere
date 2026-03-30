import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTrophy, FaCheckCircle } from "react-icons/fa";
import API_URL from "../../config/api";

const TOURNAMENT_TYPES = ["Knockout", "League", "Round Robin", "Double Elimination"];

export default function CreateCricketFormat({ viewOnly = false }) {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [tournamentType, setTournamentType] = useState("Knockout");
  const [overs, setOvers] = useState("");
  const [playersPerTeam, setPlayersPerTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsRes = await fetch(`${API_URL}/api/cpsh/teams/get-event-teams/${eventId}`, {
          credentials: "include",
        });
        const teamsData = await teamsRes.json();
        setTeams(teamsData?.data || []);

        const fmtRes = await fetch(`${API_URL}/api/cpsh/cricket-format/${eventId}`, {
          credentials: "include",
        });
        const fmtData = await fmtRes.json();
        if (fmtData?.data) {
          const f = fmtData.data;
          setExisting(f);
          setTournamentType(f.tournamentType);
          setOvers(f.overs);
          setPlayersPerTeam(f.playersPerTeam);
        }
      } catch (err) {
        console.log("Error loading format data", err);
      }
    };
    fetchData();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cpsh/cricket-format/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tournamentType,
          overs: Number(overs),
          playersPerTeam: Number(playersPerTeam),
        }),
      });
      const data = await res.json();
      if (data?.data) {
        setSaved(true);
        setExisting(data.data);
      }
    } catch (err) {
      console.log("Error saving format", err);
    } finally {
      setLoading(false);
    }
  };

  const TeamGrid = () =>
    teams.length === 0 ? (
      <p className="text-gray-400 text-sm">No teams have joined yet.</p>
    ) : (
      <div className="grid grid-cols-2 gap-3">
        {teams.map((t, i) => (
          <div
            key={t._id || i}
            className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-indigo-800 font-medium text-sm"
          >
            {t.name}
          </div>
        ))}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 py-10 px-6"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <FaTrophy className="text-purple-600 text-3xl" />
          <h2 className="text-3xl font-bold text-gray-800">
            {viewOnly ? "Tournament Format" : existing ? "Update Format" : "Create Format"}
          </h2>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 rounded-xl px-4 py-3 mb-6">
            <FaCheckCircle />
            <span>Format {existing ? "updated" : "saved"} successfully.</span>
          </div>
        )}

        {viewOnly ? (
          <div className="space-y-5">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Tournament Type</p>
              <p className="text-lg font-semibold text-indigo-800">{existing?.tournamentType ?? "—"}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Overs per Innings</p>
              <p className="text-lg font-semibold text-indigo-800">{existing?.overs ?? "—"}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Players per Team</p>
              <p className="text-lg font-semibold text-indigo-800">{existing?.playersPerTeam ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Participating Teams ({teams.length})
              </p>
              <TeamGrid />
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tournament Type</label>
              <select
                value={tournamentType}
                onChange={(e) => setTournamentType(e.target.value)}
                className="w-full p-3 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TOURNAMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Overs per Innings</label>
              <input
                type="number"
                min="1"
                value={overs}
                onChange={(e) => setOvers(e.target.value)}
                placeholder="e.g. 20"
                required
                className="w-full p-3 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Players per Team</label>
              <input
                type="number"
                min="1"
                value={playersPerTeam}
                onChange={(e) => setPlayersPerTeam(e.target.value)}
                placeholder="e.g. 11"
                required
                className="w-full p-3 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Participating Teams ({teams.length})
              </label>
              <TeamGrid />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition disabled:opacity-60"
              >
                {loading ? "Saving..." : existing ? "Update Format" : "Save Format"}
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
