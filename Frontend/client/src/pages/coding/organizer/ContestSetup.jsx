import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCode, FaPlus, FaTrophy, FaPlay, FaStop } from "react-icons/fa";
import API_URL from "../../../config/api";
import fetchWithAuth from "../../../config/fetchWithAuth";
import LoadingPage from "../../LoadingPage";
import { formatDateTime } from "../../../utils/helpers";

const LANGUAGES = ["cpp", "python", "java", "javascript", "c"];

export default function ContestSetup() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    duration: 120,
    scoringMode: "binary",
    allowedLanguages: ["cpp", "python", "java", "javascript"],
  });

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
        }
        if (probData?.data) setProblems(probData.data);
      } catch (e) {
        console.error("Error loading contest setup", e);
      }
    };
    load();
  }, [eventId]);

  const toggleLang = (lang) => {
    setForm((prev) => ({
      ...prev,
      allowedLanguages: prev.allowedLanguages.includes(lang)
        ? prev.allowedLanguages.filter((l) => l !== lang)
        : [...prev.allowedLanguages, lang],
    }));
  };

  const handleSave = async () => {
    setSaving(true); setMsg({ text: "", type: "" });
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.success) {
        setContest(data.data);
        setMsg({ text: "Settings saved.", type: "success" });
      } else {
        setMsg({ text: data?.message || "Failed to save.", type: "error" });
      }
    } catch (e) {
      setMsg({ text: "Error saving settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    if (!window.confirm("Start the contest now? Participants will be notified.")) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}/start`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data?.success) {
        setContest(data.data);
        setMsg({ text: "Contest is now live!", type: "success" });
      } else {
        setMsg({ text: data?.message || "Failed to start.", type: "error" });
      }
    } catch (e) {
      setMsg({ text: "Error starting contest.", type: "error" });
    }
  };

  const handleEnd = async () => {
    if (!window.confirm("End the contest? This cannot be undone.")) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}/end`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data?.success) {
        setContest(data.data);
        setMsg({ text: "Contest ended.", type: "success" });
      }
    } catch (e) {
      setMsg({ text: "Error ending contest.", type: "error" });
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Delete this problem?")) return;
    try {
      await fetchWithAuth(`${API_URL}/api/v1/coding/problems/${problemId}`, { method: "DELETE" });
      setProblems((prev) => prev.filter((p) => p._id !== problemId));
    } catch (e) {
      console.error("Error deleting problem", e);
    }
  };

  if (!event) return <LoadingPage />;

  const statusColor = { draft: "var(--color-text-muted)", live: "var(--color-success)", ended: "var(--color-error)" };

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
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
            <span
              className="inline-block mt-2 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{ color: statusColor[contest.status], borderColor: statusColor[contest.status] }}
            >
              {contest.status}
              {contest.status === "live" && contest.endTime && ` · ends ${formatDateTime(contest.endTime)}`}
            </span>
          )}
        </div>

        {msg.text && (
          <div className={msg.type === "success" ? "alert-success" : "alert-error"}>{msg.text}</div>
        )}

        {/* Contest Settings */}
        <div className="rounded-lg p-6 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="font-heading text-lg font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
            Contest Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                min={10}
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                className="input-base"
                disabled={contest?.status === "live"}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                Scoring Mode
              </label>
              <select
                value={form.scoringMode}
                onChange={(e) => setForm((p) => ({ ...p, scoringMode: e.target.value }))}
                className="input-base"
                disabled={contest?.status === "live"}
              >
                <option value="binary">Binary (all or nothing)</option>
                <option value="partial">Partial (per test case)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
              Allowed Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLang(lang)}
                  disabled={contest?.status === "live"}
                  className="px-3 py-1.5 rounded border text-sm font-medium transition-colors"
                  style={
                    form.allowedLanguages.includes(lang)
                      ? { backgroundColor: "var(--color-navy)", color: "#fff", borderColor: "var(--color-navy)" }
                      : { backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }
                  }
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {contest?.status !== "live" && contest?.status !== "ended" && (
              <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5">
                {saving ? "Saving…" : "Save Settings"}
              </button>
            )}
            {contest?.status === "draft" && problems.length > 0 && (
              <button onClick={handleStart} className="flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium border transition"
                style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }}>
                <FaPlay /> Start Contest
              </button>
            )}
            {contest?.status === "live" && (
              <button onClick={handleEnd} className="btn-danger flex items-center gap-2 px-5 py-2.5">
                <FaStop /> End Contest
              </button>
            )}
            {(contest?.status === "live" || contest?.status === "ended") && (
              <button
                onClick={() => navigate(`/coding/leaderboard/${eventId}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium border transition"
                style={{ backgroundColor: "var(--color-gold)", borderColor: "var(--color-gold)" }}
              >
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
              <button
                onClick={() => navigate(`/coding/problem/new/${eventId}`)}
                className="btn-primary flex items-center gap-2 px-4 py-2"
              >
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
                <div
                  key={p._id}
                  className="flex items-center justify-between rounded-lg px-4 py-3 border"
                  style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                >
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
                    <button
                      onClick={() => navigate(`/coding/problem/edit/${p._id}`)}
                      className="text-xs px-3 py-1.5 rounded border transition"
                      style={{ color: "var(--color-navy)", borderColor: "var(--color-border)" }}
                    >
                      Edit
                    </button>
                    {contest?.status !== "live" && (
                      <button
                        onClick={() => handleDeleteProblem(p._id)}
                        className="text-xs px-3 py-1.5 rounded border transition"
                        style={{ color: "var(--color-error)", borderColor: "color-mix(in srgb, var(--color-error) 30%, transparent)" }}
                      >
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
