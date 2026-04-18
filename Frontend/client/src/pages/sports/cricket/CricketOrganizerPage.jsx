import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFlag, FaTrophy, FaCalendarAlt, FaUsers, FaChartBar,
  FaCopy, FaCheck, FaPenAlt, FaTrash,
} from "react-icons/fa";
import { CalendarDays, MapPin, Users } from "lucide-react";
import fetchWithAuth from "../../../config/fetchWithAuth";
import eventService from "../../../services/event.service";
import API_URL from "../../../config/api";
import { formatDateTime } from "../../../utils/helpers";
import LoadingPage from "../../LoadingPage";

export default function CricketOrganizerPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // ── Event state ──
  const [event, setEvent] = useState(null);
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Cricket state ──
  const [loading, setLoading] = useState(true);
  const [cricketFormat, setCricketFormat] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [matchesExist, setMatchesExist] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [evResult, fmtRes, schedRes, matchRes] = await Promise.all([
          eventService.getEventById(eventId),
          fetch(`${API_URL}/api/v1/sports/cricket/format/${eventId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/cpsh/schedule/${eventId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}`, { credentials: "include" }),
        ]);
        if (evResult?.success) setEvent(evResult.data);
        const fmtData   = await fmtRes.json();
        const schedData = await schedRes.json();
        const matchData = await matchRes.json();
        setCricketFormat(fmtData?.data || null);
        setSchedule(schedData?.data || null);
        setMatchesExist(matchData?.data?.length > 0);
      } catch (e) {
        console.error("Error loading cricket organizer page", e);
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

  if (loading) return <LoadingPage />;

  const ActionCard = ({ icon, title, desc, children }) => (
    <div className="rounded-lg p-5 border space-y-3"
      style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>{title}</h3>
      </div>
      {desc && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{desc}</p>}
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );

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
                      {event.category} · {event.sports}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{event.mode}</span>
                    {/* Tournament status badges */}
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                      style={cricketFormat
                        ? { color: "var(--color-success)", borderColor: "var(--color-success)" }
                        : { color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}>
                      Format: {cricketFormat ? "✓" : "Not set"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                      style={matchesExist
                        ? { color: "var(--color-success)", borderColor: "var(--color-success)" }
                        : { color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}>
                      {matchesExist ? "Running" : "Not started"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {matchesExist && (
                    <button onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: "var(--color-gold)" }}>
                      <FaTrophy size={10} /> Scoreboard
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
            <FaFlag size={12} /> Cricket Tournament Management
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
        </div>

        {/* ── Step 1 — Format ── */}
        <ActionCard
          icon={<FaFlag style={{ color: "var(--color-gold)" }} />}
          title="Step 1 — Tournament Format"
          desc={cricketFormat
            ? `Format configured: ${cricketFormat.matchType || ""} · ${cricketFormat.overs || ""} overs`
            : "Define match type, overs, and tournament structure before scheduling."}>
          <button onClick={() => navigate(`/sports/cricket/format/${eventId}`)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <FaFlag size={12} /> {cricketFormat ? "Update Format" : "Create Format"}
          </button>
          {cricketFormat && (
            <button onClick={() => navigate(`/sports/cricket/format/${eventId}/view`)}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
              View Format
            </button>
          )}
        </ActionCard>

        {/* ── Step 2 — Schedule ── */}
        <ActionCard
          icon={<FaCalendarAlt style={{ color: "var(--color-gold)" }} />}
          title="Step 2 — Match Schedule"
          desc={schedule
            ? `Schedule created · ${schedule.matches?.length || 0} matches`
            : "Create the match schedule after setting the format."}>
          <button onClick={() => navigate(`/sports/cricket/schedule/${eventId}`)}
            disabled={!cricketFormat}
            className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: "var(--color-gold)" }}>
            <FaCalendarAlt size={12} /> {schedule ? "Update Schedule" : "Create Schedule"}
          </button>
          {!cricketFormat && (
            <p className="text-xs self-center" style={{ color: "var(--color-text-muted)" }}>Set the format first</p>
          )}
        </ActionCard>

        {/* ── Step 3 — Squads ── */}
        {cricketFormat && (
          <ActionCard
            icon={<FaUsers style={{ color: "var(--color-gold)" }} />}
            title="Step 3 — Squad Management"
            desc="Manage team squads and player registrations for the tournament.">
            <button onClick={() => navigate(`/event/${encodeURIComponent(event?.eventName || "")}/${eventId}/sports/cricket`)}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
              <FaUsers size={12} /> Manage Squads
            </button>
          </ActionCard>
        )}

        {/* ── Step 4 — Tournament ── */}
        {schedule && (
          <ActionCard
            icon={<FaTrophy style={{ color: "var(--color-gold)" }} />}
            title="Step 4 — Tournament"
            desc={matchesExist
              ? "Tournament is running. Manage live scoring and match results."
              : "Initialize matches to begin the tournament."}>
            <button
              onClick={matchesExist ? () => navigate(`/sports/cricket/scoreboard/${eventId}`) : handleInitMatches}
              disabled={initLoading}
              className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium disabled:opacity-60"
              style={{ backgroundColor: "var(--color-success)" }}>
              <FaTrophy size={12} />
              {initLoading ? "Starting…" : matchesExist ? "Resume Tournament" : "Start Tournament"}
            </button>
            {matchesExist && (
              <button onClick={() => navigate(`/sports/cricket/match-manager/${eventId}`)}
                className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                Match Manager
              </button>
            )}
            {matchesExist && (
              <button onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
                className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                <FaChartBar size={12} /> Live Scoreboard
              </button>
            )}
          </ActionCard>
        )}

      </motion.div>
    </div>
  );
}
