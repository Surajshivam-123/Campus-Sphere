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
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [matchesExist, setMatchesExist] = useState(false);
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
        try {
          const matchRes = await fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}`, { credentials: "include" });
          const matchData = await matchRes.json();
          setMatchesExist(matchData?.data?.length > 0);
        } catch { /* ignore */ }
      } catch (err) { console.error("Error loading data", err); }
    };
    load();
  }, [eventId]);

  const handleAIGenerate = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/cpsh/schedule/${eventId}/ai`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate schedule");
      setSchedule(data.data); setSaved(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleManualSave = async () => {
    const valid = manualMatches.every((m) => m.team1 && m.team2 && m.team1 !== m.team2);
    if (!valid) { setError("Each match needs two different teams selected."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/cpsh/schedule/${eventId}/manual`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ matches: manualMatches }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save schedule");
      setSchedule(data.data); setSaved(true); setMode(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const updateMatch = (i, field, value) =>
    setManualMatches((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  const addMatch = () => setManualMatches((prev) => [...prev, { team1: "", team2: "", round: "", date: "", venue: "" }]);
  const removeMatch = (i) => setManualMatches((prev) => prev.filter((_, idx) => idx !== i));

  const handleInitMatches = async () => {
    setInitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}/init`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) { setMatchesExist(true); navigate(`/sports/cricket/scoreboard/${eventId}`); }
      else setError(data.message || "Failed to initialize matches");
    } catch { setError("Error initializing matches"); }
    finally { setInitLoading(false); }
  };

  const teamNames = teams.map((t) => t.name);

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto rounded-lg shadow-sm p-8 space-y-6 border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <FaTrophy style={{ color: "var(--color-gold)", fontSize: "1.5rem" }} />
          <h2 className="font-heading text-2xl font-semibold tracking-tight" style={{ color: "var(--color-navy)" }}>
            Tournament Schedule
          </h2>
        </div>

        {saved && <div className="alert-success flex items-center gap-2"><FaCheckCircle /> Schedule saved successfully.</div>}
        {error && <div className="alert-error">{error}</div>}

        {/* Existing schedule */}
        {schedule && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Method: <span className="font-medium" style={{ color: "var(--color-navy)" }}>{schedule.method}</span>
              </p>
              <button
                onClick={() => { setSchedule(null); setSaved(false); setMode(null); }}
                className="text-xs hover:underline"
                style={{ color: "var(--color-error)" }}
              >
                Regenerate
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm rounded overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
                <thead style={{ backgroundColor: "color-mix(in srgb, var(--color-navy) 8%, transparent)" }}>
                  <tr>
                    {["#", "Team 1", "Team 2", "Round", "Date", "Venue"].map((h) => (
                      <th key={h} className="py-2 px-3 text-left font-medium" style={{ color: "var(--color-navy)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.matches.map((m, i) => (
                    <tr key={i} style={{ borderTop: `1px solid var(--color-border)` }}>
                      <td className="py-2 px-3" style={{ color: "var(--color-text-muted)" }}>{i + 1}</td>
                      <td className="py-2 px-3 font-medium" style={{ color: "var(--color-navy)" }}>{m.team1}</td>
                      <td className="py-2 px-3 font-medium" style={{ color: "var(--color-navy)" }}>{m.team2}</td>
                      <td className="py-2 px-3" style={{ color: "var(--color-text-muted)" }}>{m.round || "—"}</td>
                      <td className="py-2 px-3" style={{ color: "var(--color-text-muted)" }}>{m.date || "—"}</td>
                      <td className="py-2 px-3" style={{ color: "var(--color-text-muted)" }}>{m.venue || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 pt-2">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={matchesExist ? () => navigate(`/sports/cricket/scoreboard/${eventId}`) : handleInitMatches}
                disabled={initLoading}
                className="flex-1 py-2.5 rounded text-white font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--color-success)" }}
              >
                {initLoading ? <><FaSpinner className="animate-spin" /> Starting…</> : matchesExist ? <><FaTrophy /> Resume Tournament</> : <><FaTrophy /> Start Tournament</>}
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <FaTrophy /> View Scoreboard
              </motion.button>
            </div>
          </div>
        )}

        {/* Method selection */}
        {!schedule && !mode && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "ai", icon: <FaRobot className="text-3xl" style={{ color: "var(--color-gold)" }} />, title: "Generate with AI", desc: "Unbiased, randomized schedule" },
              { id: "manual", icon: <FaPenAlt className="text-3xl" style={{ color: "var(--color-navy)" }} />, title: "Create Manually", desc: "Pick matchups yourself" },
            ].map(({ id, icon, title, desc }) => (
              <motion.button key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setMode(id)}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border transition text-center"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 50%, transparent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
              >
                {icon}
                <span className="font-medium text-sm" style={{ color: "var(--color-navy)" }}>{title}</span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{desc}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* AI mode */}
        <AnimatePresence>
          {!schedule && mode === "ai" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                AI will generate a fair, randomized schedule based on your tournament format and registered teams.
              </p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Teams registered: <span className="font-medium" style={{ color: "var(--color-navy)" }}>{teamNames.join(", ") || "None"}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setMode(null)} className="btn-secondary flex-1">Back</button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAIGenerate} disabled={loading}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><FaSpinner className="animate-spin" /> Generating…</> : <><FaRobot /> Generate Schedule</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual mode */}
        <AnimatePresence>
          {!schedule && mode === "manual" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Add matches manually. Select teams for each matchup.</p>
              {manualMatches.map((match, i) => (
                <div key={i} className="rounded-lg p-4 space-y-3 border" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>Match {i + 1}</span>
                    {manualMatches.length > 1 && (
                      <button onClick={() => removeMatch(i)} className="text-xs hover:underline" style={{ color: "var(--color-error)" }}>Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Team 1", field: "team1", isSelect: true, options: teamNames },
                      { label: "Team 2", field: "team2", isSelect: true, options: teamNames.filter((t) => t !== match.team1) },
                      { label: "Round", field: "round", placeholder: "e.g. Quarter Final" },
                      { label: "Date", field: "date", type: "date" },
                    ].map(({ label, field, isSelect, options, placeholder, type }) => (
                      <div key={field}>
                        <label className="text-xs mb-1 block" style={{ color: "var(--color-text-muted)" }}>{label}</label>
                        {isSelect ? (
                          <select value={match[field]} onChange={(e) => updateMatch(i, field, e.target.value)} className="input-base">
                            <option value="">Select team</option>
                            {options.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <input type={type || "text"} value={match[field]} onChange={(e) => updateMatch(i, field, e.target.value)} placeholder={placeholder} className="input-base" />
                        )}
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="text-xs mb-1 block" style={{ color: "var(--color-text-muted)" }}>Venue</label>
                      <input value={match.venue} onChange={(e) => updateMatch(i, "venue", e.target.value)} placeholder="e.g. Ground A" className="input-base" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addMatch}
                className="w-full py-2 rounded border-2 border-dashed text-sm font-medium transition"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 50%, transparent)"; e.currentTarget.style.color = "var(--color-gold)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >
                + Add Match
              </button>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setMode(null)} className="btn-secondary flex-1">Back</button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={handleManualSave} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><FaSpinner className="animate-spin" /> Saving…</> : <><FaPenAlt /> Save Schedule</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => navigate(-1)} className="btn-secondary w-full">Back</button>
      </motion.div>
    </div>
  );
}
