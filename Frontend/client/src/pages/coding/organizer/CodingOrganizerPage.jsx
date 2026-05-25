import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCode, FaPlus, FaTrophy, FaPlay, FaStop,
  FaCalendarAlt, FaTimes, FaCopy, FaCheck,
  FaPenAlt, FaTrash,
} from "react-icons/fa";
import { CalendarDays, MapPin, Users } from "lucide-react";
import fetchWithAuth from "../../../config/fetchWithAuth";
import eventService from "../../../services/event.service";
import API_URL from "../../../config/api";
import { formatDateTime } from "../../../utils/helpers";
import LoadingPage from "../../LoadingPage";

const LANGUAGES = ["cpp", "python", "java", "javascript", "c"];
const LabelCls = "block text-xs font-medium mb-2 uppercase tracking-wider";
const pad = (n) => String(n).padStart(2, "0");
const toLocalDatetimeInput = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function CodingOrganizerPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // ── Event state ──
  const [event, setEvent] = useState(null);
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Contest state ──
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ duration: 120, scoringMode: "binary", allowedLanguages: ["cpp", "python", "java", "javascript"] });
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [acting, setActing] = useState(false);
  const [scheduledInput, setScheduledInput] = useState("");
  const [extendMinutes, setExtendMinutes] = useState(15);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const minDatetime = toLocalDatetimeInput(new Date(Date.now() + 60_000));

  useEffect(() => {
    const load = async () => {
      try {
        const [evResult, contestRes, probRes] = await Promise.all([
          eventService.getEventById(eventId),
          fetchWithAuth(`${API_URL}/api/cpsh/coding/contest/${eventId}`),
          fetchWithAuth(`${API_URL}/api/cpsh/coding/problems/event/${eventId}?organizer=true`),
        ]);
        if (evResult?.success) setEvent(evResult.data);
        const contestData = await contestRes.json();
        const probData = await probRes.json();
        if (contestData?.data) {
          setContest(contestData.data);
          setForm({
            duration: contestData.data.duration || 120,
            scoringMode: contestData.data.scoringMode || "binary",
            allowedLanguages: contestData.data.allowedLanguages || ["cpp", "python", "java", "javascript"],
          });
          if (contestData.data.scheduledStartTime)
            setScheduledInput(toLocalDatetimeInput(contestData.data.scheduledStartTime));
        }
        if (probData?.data) setProblems(probData.data);
      } catch (e) {
        console.error("Error loading coding organizer page", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const copyCode = (code, key) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/events/delete/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Delete failed");
      navigate("/events-hosted");
    } catch (e) {
      alert(`Could not delete event: ${e.message}`);
      setDeleting(false);
    }
  };

  const toggleLang = (lang) =>
    setForm((p) => ({
      ...p,
      allowedLanguages: p.allowedLanguages.includes(lang)
        ? p.allowedLanguages.filter((l) => l !== lang)
        : [...p.allowedLanguages, lang],
    }));

  const apiCall = async (url, method = "POST", body) => {
    setMsg({ text: "", type: "" });
    try {
      const res = await fetchWithAuth(url, {
        method,
        ...(body !== undefined && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
      });
      return await res.json();
    } catch { return null; }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = await apiCall(`${API_URL}/api/cpsh/coding/contest/${eventId}`, "POST", form);
    if (data?.success) { setContest(data.data); setMsg({ text: "Settings saved.", type: "success" }); }
    else setMsg({ text: data?.message || "Failed to save.", type: "error" });
    setSaving(false);
  };

  const handleSchedule = async () => {
    if (!scheduledInput) return setMsg({ text: "Pick a start date and time.", type: "error" });
    setScheduling(true);
    const data = await apiCall(`${API_URL}/api/cpsh/coding/contest/${eventId}/schedule`, "PATCH",
      { scheduledStartTime: new Date(scheduledInput).toISOString() });
    if (data?.success) { setContest(data.data); setMsg({ text: "Schedule saved. Participants will see a countdown.", type: "success" }); }
    else setMsg({ text: data?.message || "Failed to schedule.", type: "error" });
    setScheduling(false);
  };

  const handleClearSchedule = async () => {
    setScheduling(true);
    const data = await apiCall(`${API_URL}/api/cpsh/coding/contest/${eventId}/schedule`, "PATCH", { scheduledStartTime: null });
    if (data?.success) { setContest(data.data); setScheduledInput(""); setMsg({ text: "Schedule cleared.", type: "success" }); }
    else setMsg({ text: data?.message || "Failed to clear.", type: "error" });
    setScheduling(false);
  };

  const action = async (endpoint, confirm, successMsg, extra = {}) => {
    if (confirm && !window.confirm(confirm)) return;
    setActing(true);
    const data = await apiCall(`${API_URL}/api/cpsh/coding/contest/${eventId}/${endpoint}`, "PATCH",
      Object.keys(extra).length ? extra : undefined);
    if (data?.success) { setContest(data.data); setMsg({ text: successMsg, type: "success" }); }
    else setMsg({ text: data?.message || "Action failed.", type: "error" });
    setActing(false);
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Delete this problem?")) return;
    await fetchWithAuth(`${API_URL}/api/cpsh/coding/problems/${problemId}`, { method: "DELETE" });
    setProblems((prev) => prev.filter((p) => p._id !== problemId));
  };

  if (loading) return <LoadingPage />;

  const statusColor = { draft: "var(--color-text-muted)", live: "var(--color-success)", paused: "var(--color-gold)", ended: "var(--color-error)" };
  const s = contest?.status;
  const isDraft  = !s || s === "draft";
  const isLive   = s === "live";
  const isPaused = s === "paused";
  const isEnded  = s === "ended";
  const isActive = isLive || isPaused;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">

        {/* ── Event Header Card ── */}
        {event && (
          <div className="rounded-lg border shadow-sm overflow-hidden"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            {event.poster && <img src={event.poster} alt="poster" className="w-full h-48 object-cover" />}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  {event.festivalName && (
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-gold)" }}>
                      {event.festivalName}
                    </p>
                  )}
                  <h1 className="font-heading text-2xl font-semibold" style={{ color: "var(--color-navy)" }}>
                    {event.eventName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-navy) 10%, transparent)", color: "var(--color-navy)" }}>
                      {event.category}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{event.mode}</span>
                    {/* Contest status badge */}
                    {contest && (
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{ color: statusColor[s], borderColor: statusColor[s] }}>
                        {s}
                        {isLive   && contest.endTime && ` · ends ${formatDateTime(contest.endTime)}`}
                        {isPaused && " · timer frozen"}
                        {isDraft  && contest.scheduledStartTime && ` · starts ${formatDateTime(contest.scheduledStartTime)}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {(isActive || isEnded) && (
                    <button onClick={() => navigate(`/coding/leaderboard/${eventId}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: "var(--color-gold)" }}>
                      <FaTrophy size={10} /> Leaderboard
                    </button>
                  )}
                  <button onClick={() => navigate(`/update-event/${eventId}`)}
                    className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs">
                    <FaPenAlt size={10} /> Edit
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="btn-danger flex items-center gap-1.5 px-3 py-1.5 text-xs">
                    <FaTrash size={10} /> {deleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>

              <div className="w-8 h-px my-4" style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }} />

              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} style={{ color: "var(--color-navy)", flexShrink: 0 }} />
                  <span>{formatDateTime(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: "var(--color-navy)", flexShrink: 0 }} />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color: "var(--color-navy)", flexShrink: 0 }} />
                  <span>Max {event.maxParticipants} participants</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  { code: event.memberCode, key: "member", label: "Member code" },
                  { code: event.participantCode, key: "participant", label: "Participant code" },
                ].filter(({ code }) => code).map(({ code, key, label }) => (
                  <div key={key} className="flex items-center gap-2 rounded-lg px-3 py-2 border"
                    style={{ backgroundColor: "color-mix(in srgb, var(--color-navy) 6%, transparent)", borderColor: "color-mix(in srgb, var(--color-navy) 20%, transparent)" }}>
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-navy)" }}>{label}</span>
                    <span className="font-mono font-semibold text-sm" style={{ color: "var(--color-navy)" }}>{code}</span>
                    <button onClick={() => copyCode(code, key)} style={{ color: copied === key ? "var(--color-gold)" : "var(--color-navy)" }}>
                      {copied === key ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3"
            style={{ color: "var(--color-navy)" }}>
            <FaCode size={12} /> Coding Contest Management
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
        </div>

        {msg.text && (
          <div className={msg.type === "success" ? "alert-success" : "alert-error"}>{msg.text}</div>
        )}

        {/* ── Contest Settings ── */}
        {isDraft && (
          <div className="rounded-lg p-6 border space-y-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--color-navy)" }}>Contest Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Duration (minutes)</label>
                <input type="number" min={10} value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                  className="input-base" />
              </div>
              <div>
                <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Scoring Mode</label>
                <select value={form.scoringMode} onChange={(e) => setForm((p) => ({ ...p, scoringMode: e.target.value }))} className="input-base">
                  <option value="binary">Binary (all or nothing)</option>
                  <option value="partial">Partial (per test case)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Allowed Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang} type="button" onClick={() => toggleLang(lang)}
                    className="px-3 py-1.5 rounded border text-sm font-medium transition-colors"
                    style={form.allowedLanguages.includes(lang)
                      ? { backgroundColor: "var(--color-navy)", color: "#fff", borderColor: "var(--color-navy)" }
                      : { backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5">
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        )}

        {/* ── Schedule ── */}
        {isDraft && (
          <div className="rounded-lg p-6 border space-y-3" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <FaCalendarAlt style={{ color: "var(--color-gold)" }} />
              <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--color-navy)" }}>Schedule Start Time</h2>
            </div>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Participants will see a live countdown. Update or clear anytime before starting.
            </p>
            <div className="flex gap-3 items-center flex-wrap">
              <input type="datetime-local" className="input-base" value={scheduledInput}
                min={minDatetime} onChange={(e) => setScheduledInput(e.target.value)}
                style={{ maxWidth: "260px" }} />
              <button onClick={handleSchedule} disabled={scheduling || !scheduledInput}
                className="px-4 py-2.5 rounded text-sm font-medium border transition-colors"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)",
                  color: "var(--color-gold)",
                  borderColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)",
                  opacity: !scheduledInput ? 0.5 : 1,
                }}>
                {scheduling ? "Saving…" : contest?.scheduledStartTime ? "Update Schedule" : "Set Schedule"}
              </button>
              {contest?.scheduledStartTime && (
                <button onClick={handleClearSchedule} disabled={scheduling}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded text-sm font-medium border transition-colors"
                  style={{ color: "var(--color-error)", borderColor: "color-mix(in srgb, var(--color-error) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)" }}>
                  <FaTimes size={11} /> Clear Schedule
                </button>
              )}
            </div>
            {contest?.scheduledStartTime && (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Currently: <strong>{formatDateTime(contest.scheduledStartTime)}</strong>
              </p>
            )}
          </div>
        )}

        {/* ── Contest Controls ── */}
        <div className="rounded-lg p-6 border space-y-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--color-navy)" }}>Contest Controls</h2>
          <div className="flex flex-wrap gap-3">
            {isDraft && problems.length > 0 && (
              <button disabled={acting} onClick={() => action("start", "Start the contest now? Participants will be notified.", "Contest is now live!")}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium"
                style={{ backgroundColor: "var(--color-success)" }}>
                <FaPlay size={11} /> Start Now
              </button>
            )}
            {isLive && (
              <button disabled={acting} onClick={() => action("pause", null, "Contest paused. Timer frozen.")}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium border transition"
                style={{ color: "var(--color-gold)", borderColor: "color-mix(in srgb, var(--color-gold) 50%, transparent)", backgroundColor: "color-mix(in srgb, var(--color-gold) 10%, transparent)" }}>
                ⏸ Pause
              </button>
            )}
            {isPaused && (
              <button disabled={acting} onClick={() => action("resume", null, "Contest resumed.")}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium"
                style={{ backgroundColor: "var(--color-success)" }}>
                <FaPlay size={11} /> Resume
              </button>
            )}
            {isActive && (
              <button disabled={acting} onClick={() => action("end", "End the contest? Participants can no longer submit.", "Contest ended.")}
                className="btn-danger flex items-center gap-2 px-5 py-2.5">
                <FaStop size={11} /> End Contest
              </button>
            )}
            {!isDraft && (
              <button disabled={acting} onClick={() => action("restart", "Reset to draft? Timing data will be cleared. Problems and settings are kept.", "Contest reset to draft.")}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium border transition"
                style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                ↺ Restart
              </button>
            )}
          </div>
          {isActive && (
            <div className="flex items-center gap-3 pt-4 border-t flex-wrap" style={{ borderColor: "var(--color-border)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Extend by</span>
              <input type="number" min={1} max={120} value={extendMinutes}
                onChange={(e) => setExtendMinutes(Number(e.target.value))}
                className="input-base text-sm" style={{ width: "80px" }} />
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>minutes</span>
              <button disabled={acting} onClick={() => action("extend", null, `Extended by ${extendMinutes} min.`, { minutes: extendMinutes })}
                className="px-4 py-2.5 rounded text-sm font-medium border transition"
                style={{ color: "var(--color-navy)", borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                + Extend Time
              </button>
            </div>
          )}
        </div>

        {/* ── Problems ── */}
        <div className="rounded-lg p-6 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--color-navy)" }}>
              Problems ({problems.length})
            </h2>
            {!isEnded && (
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
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Add at least one problem before starting.</p>
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
                    {!isLive && !isPaused && (
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
