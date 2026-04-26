import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTrophy, FaCheckCircle } from "react-icons/fa";
import API_URL from "../../../config/api";
import fetchWithAuth from "../../../config/fetchWithAuth"
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
        const teamsRes = await fetchWithAuth(`${API_URL}/api/cpsh/teams/get-event-teams/${eventId}`, {
          credentials: "include",
        });
        const teamsData = await teamsRes.json();
        setTeams(teamsData?.data || []);

        const fmtRes = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-format/${eventId}`, {
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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-format/${eventId}`, {
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
      <div className="grid grid-cols-2 gap-2">
        {teams.map((t, i) => (
          <div
            key={t._id || i}
            className="bg-[#f0f4ff] border border-[#c7d4f0] rounded px-3 py-2 text-[#1e3a5f] font-medium text-sm"
          >
            {t.name}
          </div>
        ))}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#faf9f6] py-12 px-4"
    >
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <FaTrophy className="text-[#b8860b] text-2xl" />
          <h2 className="font-heading text-2xl font-semibold text-[#1e3a5f] tracking-tight">
            {viewOnly ? "Tournament Format" : existing ? "Update Format" : "Create Format"}
          </h2>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 mb-6 text-sm">
            <FaCheckCircle />
            <span>Format {existing ? "updated" : "saved"} successfully.</span>
          </div>
        )}

        {viewOnly ? (
          <div className="space-y-4">
            {[
              { label: "Tournament Type", value: existing?.tournamentType },
              { label: "Overs per Innings", value: existing?.overs },
              { label: "Players per Team", value: existing?.playersPerTeam },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#f0f4ff] border border-[#c7d4f0] rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-semibold text-[#1e3a5f]">{value ?? "—"}</p>
              </div>
            ))}
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">
                Participating Teams ({teams.length})
              </p>
              <TeamGrid />
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-2.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
            >
              Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">Tournament Type</label>
              <select
                value={tournamentType}
                onChange={(e) => setTournamentType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm bg-white"
              >
                {TOURNAMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">Overs per Innings</label>
              <input
                type="number"
                min="1"
                value={overs}
                onChange={(e) => setOvers(e.target.value)}
                placeholder="e.g. 20"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">Players per Team</label>
              <input
                type="number"
                min="1"
                value={playersPerTeam}
                onChange={(e) => setPlayersPerTeam(e.target.value)}
                placeholder="e.g. 11"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">
                Participating Teams ({teams.length})
              </p>
              <TeamGrid />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
              >
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-medium text-sm transition disabled:opacity-60"
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
