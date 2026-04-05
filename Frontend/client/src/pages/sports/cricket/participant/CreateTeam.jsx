import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../../../../config/api";

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [teamName, setTeamName] = useState("");
  const [teamlogo, setTeamlogo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) { setError("Team name is required."); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", teamName);
      if (teamlogo) formData.append("teamlogo", teamlogo);
      const res = await fetch(`${API_URL}/api/cpsh/teams/create-team/${eventId}`, {
        method: "POST", credentials: "include", body: formData,
      });
      const result = await res.json();
      if (result?.success) {
        navigate(`/sports/cricket/team-creator/${eventId}`, { replace: true });
      } else {
        setError(result?.message || "Failed to create team.");
      }
    } catch (e) {
      console.log("Error creating team", e);
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 flex justify-center items-center p-6">
      <motion.div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Create Team</h1>
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Logo (optional)</label>
            <input id="teamLogo" name="teamLogo" type="file" accept="image/*" onChange={(e) => setTeamlogo(e.target.files[0])}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-60">
              {loading ? "Creating..." : "Create Team"}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
