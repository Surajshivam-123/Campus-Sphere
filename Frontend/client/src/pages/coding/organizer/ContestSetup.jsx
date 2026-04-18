import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCode, FaPlus, FaTrophy, FaPlay, FaStop, FaCalendarAlt, FaTimes } from "react-icons/fa";
import API_URL from "../../../config/api";
import fetchWithAuth from "../../../config/fetchWithAuth";
import LoadingPage from "../../LoadingPage";
import { formatDateTime } from "../../../utils/helpers";

const LANGUAGES = ["cpp", "python", "java", "javascript", "c"];

const pad = (n) => String(n).padStart(2, "0");
const toLocalDatetimeInput = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ContestSetup() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    duration: 120,
    scoringMode: "binary",
    allowedLanguages: ["cpp", "python", "java", "javascript"],
  });

  const [scheduledInput, setScheduledInput] = useState("");

  // min = now + 1 min
  const minDatetime = toLocalDatetimeInput(new Date(Date.now() + 60_000));

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, contestRes, probRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`),
          fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}`),
          fetchWithAuth(`${API_URL}/api/v1/coding/problems/event/${eventId}?organizer=true`),
        ]);
        const evData = await evRes.json();
        const contestData = await contestRes.json();
        const probData = await probRes.json();

        if (evData?.data) setEvent(evData.data);
        if (contestData?.data) {
          setContest(contestData.data);
          setForm({
            duration: contestData.data.duration || 120,
            scoringMode: contestData.data.scoringMode || "binary",
            allowedLanguages: contestData.data.allowedLanguages || ["cpp", "python", "java", "javascript"],
          });
          if (contestData.data.scheduledStartTime) {
            setScheduledInput(toLocalDatetimeInput(contestData.data.scheduledStartTime));
          }
        }
        if (probData?.data) setProblems(probData.data);
      } catch (e) {
        console.error("Error loading contest setup", e);
      }
    };
    load();
  }, [eventId]);

  const toggleLang = (lang) =>
    setForm((prev) => ({
      ...prev,
      allowedLanguages: prev.allowedLanguages.includes(lang)
        ? prev.allowedLanguages.filter((l) => l !== lang)
        : [...prev.allowedLanguages, lang],
    }));

  const handleSave = async () => {
    setSaving(true); setMsg({ text: "", type: "" });
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.success) { setContest(data.data); setMsg({ text: "Settings saved.", type: "success" }); }
      else setMsg({ text: data?.message || "Failed to save.", type: "error" });
    } catch { setMsg({ text: "Error saving settings.", type: "error" }); }
    finally { setSaving(false); }
  };

  const handleSchedule = async () => {
    if (!scheduledInput) return setMsg({ text: "Pick a start date and time.", type: "error" });
    setScheduling(true); setMsg({ text: "", type: "" });
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledStartTime: new Date(scheduledInput).toISOString() }),
      });
      const data = await res.json();
      if (data?.success) {
        setContest(data.data);
        setMsg({ text: "Schedule saved. Participants will see a live countdown.", type: "success" });
      } else setMsg({ text: data?.message || "Failed to schedule.", type: "error" });
    } catch { setMsg({ text: "Error scheduling contest.", type: "error" }); }
    finally { setScheduling(false); }
  };

  const handleClearSchedule = async () => {
    setScheduling(true); setMsg({ text: "", type: "" });
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledStartTime: null }),
      });
      const data = await res.json();
      if (data?.success) {
        setContest(data.data);
        setScheduledInput("");
        setMsg({ text: "Schedule cleared. Participants will no longer see a countdown.", type: "success" });
      } else setMsg({ text: data?.message || "Failed to clear.", type: "error" });
    } catch { setMsg({ text: "Error clearing schedule.", type: "error" }); }
    finally { setScheduling(false); }
  };

  const handleStart = async () => {
    if (!window.confirm("Start the contest now? Participants will be notified.")) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}/start`, { method: "PATCH" });
      const data = await res.json();
      if (data?.success) {
        setContest(data.data);
        setScheduledInput("");
        setMsg({ text: "Contest is now live!", type: "success" });
      } else setMsg({ text: data?.message || "Failed to start.", type: "error" });
    } catch { setMsg({ text: "Error starting contest.", type: "error" }); }
  };

  const handleEnd = async () => {
    if (!window.confirm("End the contest? This cannot be undone.")) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}/end`, { method: "PATCH" });
      const data = await res.json();
      if (data?.success) { setContest(data.data); setMsg({ text: "Contest ended.", type: "success" }); }
    } catch { setMsg({ text: "Error ending contest.", type: "error" }); }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Delete this problem?")) return;
    try {
      await fetchWithAuth(`${API_URL}/api/v1/coding/problems/${problemId}`, { method: "DELETE" });
      setProblems((prev) => prev.filter((p) => p._id !== problemId));
    } catch (e) { console.error("Error deleting problem", e); }
  };

  if (!event) return <LoadingPage />;

  const statusColor = { draft: "var(--color-text-muted)", live: "var(--color-success)", ended: "var(--color-error)" };
  const isDraft = !contest?.status || contest.status === "draft";

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="rounded-lg p-6 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3 mb-1">
            <FaCode style={{ color: "var(--color-gold)", fontSize: "1.5rem" }} />
            <h1 className="font-heading text-2xl font-semibold tracking-tight" style={{ color: "var(--color-navy)" }}>
              Coding Contest Setup
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{event.eventName}</p>
          {contest && (
            <span className="inline-block mt-2 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{ color: statusColor[contest.status], borderColor: statusColor[contest.status] }}>
              {contest.status}
              {contest.status === "live" && contest.endTime && ` · ends ${formatDateTime(contest.endTime)}`}
              {contest.status === "draft" && contest.scheduledStartTime && ` · starts ${formatDateTime(contest.scheduledStartTime)}`}
            </span>
          )}
        </div>

        {msg.text && (
          <div className={msg.type === "success" ? "alert-success" : "alert-error"}>{msg.text}</div>
        )}

        {/* Contest Settings */}
        <div className="rounded-lg p-6 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="font-heading text-lg font-semibold mb-4" style={{ color: "var(--color-navy)" }}>Contest Settings</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Duration (minutes)</label>
              <input type="number" min={10} value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                className="input-base" disabled={contest?.status === "live"} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Scoring Mode</label>
              <select value={form.scoringMode}
                onChange={(e) => setForm((p) => ({ ...p, scoringMode: e.target.value }))}
                className="input-base" disabled={contest?.status === "live"}>
                <option value="binary">Binary (all or nothing)</option>
                <option value="partial">Partial (per test case)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Allowed Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button key={lang} type="button" onClick={() => toggleLang(lang)}
                  disabled={contest?.status === "live"}
                  className="px-3 py-1.5 rounded border text-sm font-medium transition-colors"
                  style={form.allowedLanguages.includes(lang)
                    ? { backgroundColor: "var(--color-navy)", color: "#fff", borderColor: "var(--color-navy)" }
                    : { backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}>
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* ── Schedule Start Time ── */}
          {isDraft && (
            <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <FaCalendarAlt style={{ color: "var(--color-gold)" }} />
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                  Schedule Start Time
                </label>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                Participants will see a live countdown. You can update or clear it anytime before starting.
              </p>

              <div className="flex gap-3 items-center flex-wrap">
                <input
                  type="datetime-local"
                  className="input-base"
                  value={scheduledInput}
                  min={minDatetime}
                  onChange={(e) => setScheduledInput(e.target.value)}
                  style={{ maxWidth: "260px" }}
                />
                <button
                  onClick={handleSchedule}
                  disabled={scheduling || !scheduledInput}
                  className="px-4 py-2.5 rounded text-sm font-medium border transition-colors"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)",
                    color: "var(--color-gold)",
                    borderColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)",
                    opacity: !scheduledInput ? 0.5 : 1,
                  }}>
                  {scheduling ? "Saving…" : contest?.scheduledStartTime ? "Update Schedule" : "Set Schedule"}
                </button>

                {/* Clear button — only shown when a schedule is already set */}
                {contest?.scheduledStartTime && (
                  <button
                    onClick={handleClearSchedule}
                    disabled={scheduling}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded text-sm font-medium border transition-colors"
                    style={{
                      color: "var(--color-error)",
                      borderColor: "color-mix(in srgb, var(--color-error) 30%, transparent)",
                      backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)",
                    }}>
                    <FaTimes size={11} /> Clear Schedule
                  </button>
                )}
              </div>

              {contest?.scheduledStartTime && (
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                  Currently scheduled: <strong>{formatDateTime(contest.scheduledStartTime)}</strong>
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {isDraft && (
              <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5">
                {saving ? "Saving…" : "Save Settings"}
              </button>
            )}
            {isDraft && problems.length > 0 && (
              <button onClick={handleStart}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium border transition"
                style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }}>
                <FaPlay /> Start Now
              </button>
            )}
            {contest?.status === "live" && (
              <button onClick={handleEnd} className="btn-danger flex items-center gap-2 px-5 py-2.5">
                <FaStop /> End Contest
              </button>
            )}
            {(contest?.status === "live" || contest?.status === "ended") && (
              <button onClick={() => navigate(`/coding/leaderboard/${eventId}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium border transition"
                style={{ backgroundColor: "var(--color-gold)", borderColor: "var(--color-gold)" }}>
                <FaTrophy /> View Leaderboard
              </button>
            )}
          </div>
        </div>

        {/* Problems */}
        <div className="rounded-lg p-6 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--color-navy)" }}>
              Problems ({problems.length})
            </h2>
            {contest?.status !== "ended" && (
              <button onClick={() => navigate(`/coding/problem/new/${eventId}`)}
                className="btn-primary flex items-center gap-2 px-4 py-2">
                <FaPlus /> Add Problem
              </button>
            )}
          </div>

          {problems.length === 0 ? (
            <div className="py-12 text-center">
              <FaCode className="mx-auto text-4xl mb-3" style={{ color: "var(--color-border)" }} />
              <p className="font-medium" style={{ color: "var(--color-text-secondary)" }}>No problems yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Add at least one problem before starting the contest.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {problems.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg px-4 py-3 border"
                  style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold w-6" style={{ color: "var(--color-text-muted)" }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>{p.title}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {p.difficulty} · {p.points} pts · {p.testCases?.length || 0} test cases
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/coding/problem/edit/${p._id}`)}
                      className="text-xs px-3 py-1.5 rounded border transition"
                      style={{ color: "var(--color-navy)", borderColor: "var(--color-border)" }}>
                      Edit
                    </button>
                    {contest?.status !== "live" && (
                      <button onClick={() => handleDeleteProblem(p._id)}
                        className="text-xs px-3 py-1.5 rounded border transition"
                        style={{ color: "var(--color-error)", borderColor: "color-mix(in srgb, var(--color-error) 30%, transparent)" }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
