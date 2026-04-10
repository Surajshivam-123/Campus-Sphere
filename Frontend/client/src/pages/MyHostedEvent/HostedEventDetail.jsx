import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUserClock, FaUsers, FaCopy, FaCheck, FaCode, FaPlus,
  FaTrophy, FaPlay, FaStop, FaPenAlt, FaTrash, FaFlag,
  FaCalendarAlt, FaMapMarkerAlt, FaChalkboardTeacher,
} from "react-icons/fa";
import { CalendarDays, MapPin, Info, Tag, Users } from "lucide-react";
import MemberRequests from "./MemberRequests";
import eventService from "../../services/event.service";
import memberService from "../../services/member.service";
import fetchWithAuth from "../../config/fetchWithAuth";
import API_URL from "../../config/api";
import { formatDateTime } from "../../utils/helpers";
import LoadingPage from "../LoadingPage";

// ── Shared label style ────────────────────────────────────────────────────────
const LabelCls = "block text-xs font-medium mb-2 uppercase tracking-wider";

// ── Coding contest panel (embedded) ──────────────────────────────────────────
const LANGUAGES = ["cpp", "python", "java", "javascript", "c"];

function CodingPanel({ eventId, navigate }) {
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [form, setForm] = useState({ duration: 120, scoringMode: "binary", allowedLanguages: ["cpp", "python", "java", "javascript"] });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [contestRes, probRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}`),
          fetchWithAuth(`${API_URL}/api/v1/coding/problems/event/${eventId}?organizer=true`),
        ]);
        const contestData = await contestRes.json();
        const probData = await probRes.json();
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
        console.error("Error loading coding panel", e);
      }
    };
    load();
  }, [eventId]);

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
        ...(body && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
      });
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = await apiCall(`${API_URL}/api/v1/coding/contest/${eventId}`, "POST", form);
    if (data?.success) { setContest(data.data); setMsg({ text: "Settings saved.", type: "success" }); }
    else setMsg({ text: data?.message || "Failed to save.", type: "error" });
    setSaving(false);
  };

  const handleStart = async () => {
    if (!window.confirm("Start the contest now? Participants will be notified.")) return;
    const data = await apiCall(`${API_URL}/api/v1/coding/contest/${eventId}/start`, "PATCH");
    if (data?.success) { setContest(data.data); setMsg({ text: "Contest is now live!", type: "success" }); }
    else setMsg({ text: data?.message || "Failed to start.", type: "error" });
  };

  const handleEnd = async () => {
    if (!window.confirm("End the contest? This cannot be undone.")) return;
    const data = await apiCall(`${API_URL}/api/v1/coding/contest/${eventId}/end`, "PATCH");
    if (data?.success) { setContest(data.data); setMsg({ text: "Contest ended.", type: "success" }); }
    else setMsg({ text: data?.message || "Failed to end.", type: "error" });
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Delete this problem?")) return;
    await fetchWithAuth(`${API_URL}/api/v1/coding/problems/${problemId}`, { method: "DELETE" });
    setProblems((prev) => prev.filter((p) => p._id !== problemId));
  };

  const statusColor = { draft: "var(--color-text-muted)", live: "var(--color-success)", ended: "var(--color-error)" };
  const isLive = contest?.status === "live";
  const isEnded = contest?.status === "ended";

  return (
    <div className="space-y-5">
      {/* Status badge */}
      {contest && (
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border"
            style={{ color: statusColor[contest.status], borderColor: statusColor[contest.status] }}
          >
            {contest.status}
            {isLive && contest.endTime && ` · ends ${formatDateTime(contest.endTime)}`}
          </span>
          {(isLive || isEnded) && (
            <button
              onClick={() => navigate(`/coding/leaderboard/${eventId}`)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded text-white font-medium"
              style={{ backgroundColor: "var(--color-gold)" }}
            >
              <FaTrophy size={10} /> Leaderboard
            </button>
          )}
        </div>
      )}

      {msg.text && (
        <div className={msg.type === "success" ? "alert-success" : "alert-error"}>{msg.text}</div>
      )}

      {/* Settings form — hidden when live/ended */}
      {!isLive && !isEnded && (
        <div className="rounded-lg p-5 border space-y-4" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>Contest Settings</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Duration (minutes)</label>
              <input
                type="number" min={10} value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                className="input-base"
              />
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
                <button
                  key={lang} type="button" onClick={() => toggleLang(lang)}
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

          <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2">
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {!isLive && !isEnded && problems.length > 0 && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium"
            style={{ backgroundColor: "var(--color-success)" }}
          >
            <FaPlay size={11} /> Start Contest
          </button>
        )}
        {isLive && (
          <button onClick={handleEnd} className="btn-danger flex items-center gap-2 px-4 py-2">
            <FaStop size={11} /> End Contest
          </button>
        )}
      </div>

      {/* Problems list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
            Problems ({problems.length})
          </h3>
          {!isEnded && (
            <button
              onClick={() => navigate(`/coding/problem/new/${eventId}`)}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <FaPlus size={10} /> Add Problem
            </button>
          )}
        </div>

        {problems.length === 0 ? (
          <div className="py-8 text-center rounded-lg border border-dashed" style={{ borderColor: "var(--color-border)" }}>
            <FaCode className="mx-auto text-3xl mb-2" style={{ color: "var(--color-border)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No problems yet. Add at least one before starting.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {problems.map((p, i) => (
              <div
                key={p._id}
                className="flex items-center justify-between rounded-lg px-4 py-3 border"
                style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm w-5" style={{ color: "var(--color-text-muted)" }}>
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
                    className="text-xs px-3 py-1.5 rounded border"
                    style={{ color: "var(--color-navy)", borderColor: "var(--color-border)" }}
                  >
                    Edit
                  </button>
                  {!isLive && (
                    <button
                      onClick={() => handleDeleteProblem(p._id)}
                      className="text-xs px-3 py-1.5 rounded border"
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
    </div>
  );
}

// ── Cricket actions panel ─────────────────────────────────────────────────────
function CricketPanel({ eventId, navigate }) {
  const [cricketFormat, setCricketFormat] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [matchesExist, setMatchesExist] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [fmtRes, schedRes, matchRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/sports/cricket/format/${eventId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/cpsh/schedule/${eventId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}`, { credentials: "include" }),
        ]);
        const fmtData = await fmtRes.json();
        const schedData = await schedRes.json();
        const matchData = await matchRes.json();
        setCricketFormat(fmtData?.data || null);
        setSchedule(schedData?.data || null);
        setMatchesExist(matchData?.data?.length > 0);
      } catch (e) {
        console.error("Error loading cricket panel", e);
      }
    };
    load();
  }, [eventId]);

  const handleInitMatches = async () => {
    setInitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}/init`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (res.ok) { setMatchesExist(true); navigate(`/sports/cricket/scoreboard/${eventId}`); }
      else alert(data.message || "Failed to initialize matches");
    } catch (e) {
      console.error("Error initializing matches", e);
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => navigate(`/sports/cricket/format/${eventId}`)}
        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
      >
        <FaFlag size={12} /> {cricketFormat ? "Update Format" : "Create Format"}
      </button>
      {cricketFormat && (
        <button
          onClick={() => navigate(`/sports/cricket/format/${eventId}/view`)}
          className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <FaFlag size={12} /> View Format
        </button>
      )}
      <button
        onClick={() => navigate(`/sports/cricket/schedule/${eventId}`)}
        className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium"
        style={{ backgroundColor: "var(--color-gold)" }}
      >
        <FaTrophy size={12} /> {schedule ? "Update Schedule" : "Create Schedule"}
      </button>
      {schedule && (
        <>
          <button
            onClick={matchesExist ? () => navigate(`/sports/cricket/scoreboard/${eventId}`) : handleInitMatches}
            disabled={initLoading}
            className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: "var(--color-success)" }}
          >
            <FaTrophy size={12} />
            {initLoading ? "Starting…" : matchesExist ? "Resume Tournament" : "Start Tournament"}
          </button>
          <button
            onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FaTrophy size={12} /> View Scoreboard
          </button>
        </>
      )}
    </div>
  );
}

// ── Avatar helper ─────────────────────────────────────────────────────────────
function Avatar({ user, size = 8 }) {
  const initials = (user?.fullname || user?.username || "?").charAt(0).toUpperCase();
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={initials}
      className={`w-${size} h-${size} rounded-full object-cover shrink-0`}
    />
  ) : (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0`}
      style={{ backgroundColor: "var(--color-navy)" }}
    >
      {initials}
    </div>
  );
}

// ── Members tab ───────────────────────────────────────────────────────────────
function MembersTab({ eventId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editableId, setEditableId] = useState(null);
  const [editedRoles, setEditedRoles] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await memberService.getMembers(eventId);
        if (result?.success) setMembers(result.data?.members || []);
      } catch (e) {
        console.error("Error loading members", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const handleSaveRole = async (memberId) => {
    try {
      const res = await fetch(`${API_URL}/api/cpsh/members/edit-role/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: editedRoles[memberId] }),
      });
      const result = await res.json();
      if (result.success) {
        setMembers((prev) => prev.map((m) => m._id === memberId ? { ...m, role: editedRoles[memberId] } : m));
        setEditableId(null);
      }
    } catch (e) {
      console.error("Error saving role", e);
    }
  };

  if (loading) return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>Loading members…</p>;

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return !q || m.name?.toLowerCase().includes(q) || m.owner?.username?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
          {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base max-w-xs py-1.5 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <FaUsers className="mx-auto text-3xl mb-2" style={{ color: "var(--color-border)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {search ? "No members match your search." : "No members yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--color-border)` }}>
                {["Member", "Username", "Role", ""].map((h) => (
                  <th key={h} className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m._id} style={{ borderBottom: `1px solid var(--color-border-soft)` }}>
                  {/* Name + avatar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={m.owner} size={7} />
                      <span className="font-medium" style={{ color: "var(--color-navy)" }}>
                        {m.name}
                        {m.isOrganizer && (
                          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)", color: "var(--color-gold)" }}>
                            Organizer
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  {/* Username */}
                  <td className="py-3 px-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {m.owner?.username ? `@${m.owner.username}` : "—"}
                  </td>
                  {/* Role */}
                  <td className="py-3 px-3">
                    {editableId === m._id && !m.isOrganizer ? (
                      <input
                        className="input-base py-1 text-xs w-32"
                        value={editedRoles[m._id] ?? m.role ?? ""}
                        onChange={(e) => setEditedRoles((p) => ({ ...p, [m._id]: e.target.value }))}
                        autoFocus
                      />
                    ) : (
                      <span className="badge-info">{m.role || "Member"}</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    {m.isOrganizer ? null : editableId === m._id ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleSaveRole(m._id)}
                          className="text-xs font-medium" style={{ color: "var(--color-success)" }}>
                          Save
                        </button>
                        <button onClick={() => setEditableId(null)}
                          className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditableId(m._id)}
                        className="text-xs" style={{ color: "var(--color-navy)" }}>
                        Edit role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Participants tab ──────────────────────────────────────────────────────────
function ParticipantsTab({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cpsh/participants/get-all-participants/${eventId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.data) setParticipants(data.data);
      } catch (e) {
        console.error("Error loading participants", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  if (loading) return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>Loading participants…</p>;

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    return !q
      || p.owner?.fullname?.toLowerCase().includes(q)
      || p.owner?.username?.toLowerCase().includes(q)
      || p.identityNumber?.toLowerCase().includes(q)
      || p.teamName?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
          {participants.length} participant{participants.length !== 1 ? "s" : ""}
        </p>
        <input
          type="text"
          placeholder="Search by name, ID or team…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base max-w-xs py-1.5 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <FaUsers className="mx-auto text-3xl mb-2" style={{ color: "var(--color-border)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {search ? "No participants match your search." : "No participants yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--color-border)` }}>
                {["Participant", "Username", "Identity No.", "Team", "Role"].map((h) => (
                  <th key={h} className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} style={{ borderBottom: `1px solid var(--color-border-soft)` }}>
                  {/* Name + avatar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={p.owner} size={7} />
                      <span className="font-medium" style={{ color: "var(--color-navy)" }}>
                        {p.owner?.fullname || p.owner?.username || "—"}
                      </span>
                    </div>
                  </td>
                  {/* Username */}
                  <td className="py-3 px-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {p.owner?.username ? `@${p.owner.username}` : "—"}
                  </td>
                  {/* Identity number */}
                  <td className="py-3 px-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-secondary)" }}>
                      {p.identityNumber}
                    </span>
                  </td>
                  {/* Team */}
                  <td className="py-3 px-3 text-xs">
                    {p.teamName ? (
                      <span className="font-medium" style={{ color: "var(--color-navy)" }}>{p.teamName}</span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>
                  {/* Role */}
                  <td className="py-3 px-3">
                    {p.teamName ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={p.isCaptain
                          ? { backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)", color: "var(--color-gold)" }
                          : { backgroundColor: "color-mix(in srgb, var(--color-navy) 10%, transparent)", color: "var(--color-navy)" }
                        }
                      >
                        {p.isCaptain ? "Captain" : "Player"}
                      </span>
                    ) : (
                      <span className="badge-info">Participant</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HostedEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState("overview"); // "overview" | "requests" | "members" | "contest" | "cricket"
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await eventService.getEventById(eventId);
        if (result?.success) setEvent(result.data);
      } catch (e) {
        console.error("Failed to load event", e);
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
      await fetch(`${API_URL}/api/cpsh/events/delete/${eventId}`, {
        method: "DELETE", credentials: "include",
      });
      navigate("/events-hosted");
    } catch (e) {
      console.error("Error deleting event", e);
      setDeleting(false);
    }
  };

  if (!event) return <LoadingPage />;

  const isCricket = event.category === "sports" && event.sports?.toLowerCase() === "cricket";
  const isCoding  = event.category === "coding";

  // Build tab list based on category
  const tabs = [
    { id: "overview",      label: "Overview" },
    { id: "requests",      label: "Join Requests" },
    { id: "members",       label: "Members" },
    { id: "participants",  label: "Participants" },
    ...(isCoding  ? [{ id: "contest", label: "Coding Contest" }] : []),
    ...(isCricket ? [{ id: "cricket", label: "Cricket Setup"  }] : []),
  ];

  // Default to "contest" tab for coding events
  const effectiveTab = tab === "overview" && isCoding ? "overview" : tab;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* ── Event header card ─────────────────────────────────────────────── */}
        <div
          className="rounded-lg border shadow-sm overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {/* Poster */}
          {event.poster && (
            <img src={event.poster} alt="Event poster" className="w-full h-48 object-cover" />
          )}

          <div className="p-6">
            {/* Title row */}
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
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-navy) 10%, transparent)",
                      color: "var(--color-navy)",
                    }}
                  >
                    {event.category}
                    {event.sports ? ` · ${event.sports}` : ""}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{event.mode}</span>
                </div>
              </div>

              {/* Edit / Delete */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/update-event/${eventId}`)}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <FaPenAlt size={10} /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <FaTrash size={10} /> {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>

            <div className="w-8 h-px my-4" style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }} />

            {/* Key details grid */}
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
                <FaChalkboardTeacher size={13} style={{ color: "var(--color-navy)", flexShrink: 0 }} />
                <span>{event.organization}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} style={{ color: "var(--color-navy)", flexShrink: 0 }} />
                <span>Max {event.maxParticipants} participants</span>
              </div>
            </div>

            {/* Invite codes */}
            <div className="flex flex-wrap gap-3">
              {[
                { code: event.memberCode,      key: "member",      label: "Member code" },
                { code: event.participantCode, key: "participant",  label: "Participant code" },
              ].filter(({ code }) => code).map(({ code, key, label }) => (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-navy) 6%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-navy) 20%, transparent)",
                  }}
                >
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-navy)" }}>
                    {label}
                  </span>
                  <span className="font-mono font-semibold text-sm" style={{ color: "var(--color-navy)" }}>{code}</span>
                  <button
                    onClick={() => copyCode(code, key)}
                    aria-label="Copy"
                    style={{ color: copied === key ? "var(--color-gold)" : "var(--color-navy)" }}
                  >
                    {copied === key ? <FaCheck size={12} /> : <FaCopy size={12} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition border"
              style={
                effectiveTab === id
                  ? { backgroundColor: "var(--color-navy)", color: "#fff", borderColor: "var(--color-navy)" }
                  : { backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────────────────────────── */}
        <div
          className="rounded-lg p-6 border shadow-sm"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {/* Overview */}
          {effectiveTab === "overview" && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h2 className="font-heading text-base font-semibold mb-2" style={{ color: "var(--color-navy)" }}>Description</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{event.description}</p>
              </div>

              {/* Rules */}
              {event.rules?.length > 0 && (
                <div>
                  <h2 className="font-heading text-base font-semibold mb-2" style={{ color: "var(--color-navy)" }}>Rules</h2>
                  <ol className="space-y-1.5">
                    {event.rules.map((rule, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        <span className="font-mono font-bold shrink-0" style={{ color: "var(--color-text-muted)" }}>{i + 1}.</span>
                        {rule}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Quick-action hint for coding events */}
              {isCoding && (
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3 border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-gold) 8%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-gold) 30%, transparent)",
                  }}
                >
                  <FaCode style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    This is a coding event. Go to the{" "}
                    <button
                      onClick={() => setTab("contest")}
                      className="font-semibold underline"
                      style={{ color: "var(--color-navy)" }}
                    >
                      Coding Contest
                    </button>{" "}
                    tab to set up problems and start the contest.
                  </p>
                </div>
              )}

              {/* Quick-action hint for cricket events */}
              {isCricket && (
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3 border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-navy) 6%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-navy) 20%, transparent)",
                  }}
                >
                  <FaTrophy style={{ color: "var(--color-navy)", flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    This is a cricket event. Go to the{" "}
                    <button
                      onClick={() => setTab("cricket")}
                      className="font-semibold underline"
                      style={{ color: "var(--color-navy)" }}
                    >
                      Cricket Setup
                    </button>{" "}
                    tab to configure format, schedule, and start the tournament.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Join Requests */}
          {effectiveTab === "requests" && <MemberRequests eventId={eventId} />}

          {/* Members */}
          {effectiveTab === "members" && <MembersTab eventId={eventId} />}

          {/* Participants */}
          {effectiveTab === "participants" && <ParticipantsTab eventId={eventId} />}

          {/* Coding Contest */}
          {effectiveTab === "contest" && <CodingPanel eventId={eventId} navigate={navigate} />}

          {/* Cricket Setup */}
          {effectiveTab === "cricket" && <CricketPanel eventId={eventId} navigate={navigate} />}
        </div>
      </motion.div>
    </div>
  );
}
