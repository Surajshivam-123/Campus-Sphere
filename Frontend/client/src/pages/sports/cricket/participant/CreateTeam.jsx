import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../../../../config/api";
import fetchWithAuth from "../../../../config/fetchWithAuth.js"
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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/teams/create-team/${eventId}`, {
        method: "POST", body: formData,
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
    <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center p-6">
      <motion.div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-heading text-2xl font-semibold text-center text-[#1e3a5f] mb-2 tracking-tight">Create Team</h1>
        <div className="w-12 h-px bg-[#b8860b]/40 mx-auto mb-6" />
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">Team Name</label>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">Team Logo (optional)</label>
            <input id="teamLogo" name="teamLogo" type="file" accept="image/*" onChange={(e) => setTeamlogo(e.target.files[0])}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-200 file:text-sm file:font-medium file:bg-[#faf9f6] file:text-[#1e3a5f] hover:file:bg-[#f0ede6]" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-2 rounded">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1e3a5f] text-white font-medium py-2.5 rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition text-sm disabled:opacity-60">
              {loading ? "Creating…" : "Create Team"}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 bg-white text-[#374151] font-medium py-2.5 rounded border border-gray-200 hover:bg-gray-50 transition text-sm">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
