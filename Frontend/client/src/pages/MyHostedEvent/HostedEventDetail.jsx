import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers, FaCopy, FaCheck, FaCode,
  FaPenAlt, FaTrash, FaFlag,
} from "react-icons/fa";
import { CalendarDays, MapPin, Users } from "lucide-react";
import MemberRequests from "./MemberRequests";
import eventService from "../../services/event.service";
import memberService from "../../services/member.service";
import fetchWithAuth from "../../config/fetchWithAuth";
import API_URL from "../../config/api";
import { formatDateTime } from "../../utils/helpers";
import LoadingPage from "../LoadingPage";

const LabelCls = "block text-xs font-medium mb-2 uppercase tracking-wider";

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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/members/edit-role/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  if (loading) return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>Loading membersâ€¦</p>;

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
          placeholder="Search by nameâ€¦"
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
                    {m.owner?.username ? `@${m.owner.username}` : "â€”"}
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

// â”€â”€ Participants tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ParticipantsTab({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/cpsh/participants/get-all-participants/${eventId}`);
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

  if (loading) return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>Loading participantsâ€¦</p>;

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
          placeholder="Search by name, ID or teamâ€¦"
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
                        {p.owner?.fullname || p.owner?.username || "â€”"}
                      </span>
                    </div>
                  </td>
                  {/* Username */}
                  <td className="py-3 px-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {p.owner?.username ? `@${p.owner.username}` : "â€”"}
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
                      <span style={{ color: "var(--color-text-muted)" }}>â€”</span>
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

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/events/delete/${eventId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Delete failed (${res.status})`);
      }
      navigate("/events-hosted");
    } catch (e) {
      console.error("Error deleting event", e);
      alert(`Could not delete event: ${e.message}`);
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
    ...(isCoding  ? [{ id: "contest", label: "Coding Contest ↗" }] : []),
    ...(isCricket ? [{ id: "cricket", label: "Cricket Setup ↗"  }] : []),
  ];

  const effectiveTab = tab;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* â”€â”€ Event header card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    {event.sports ? ` Â· ${event.sports}` : ""}
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
                  <FaTrash size={10} /> {deleting ? "Deletingâ€¦" : "Delete"}
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

        {/* â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => {
                if (id === "contest") return navigate(`/organizer/coding/${eventId}`);
                if (id === "cricket") return navigate(`/organizer/cricket/${eventId}`);
                setTab(id);
              }}
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

        {/* â”€â”€ Tab content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    This is a coding event.{" "}
                    <button
                      onClick={() => navigate(`/organizer/coding/${eventId}`)}
                      className="font-semibold underline"
                      style={{ color: "var(--color-navy)" }}
                    >
                      Open Coding Contest Organizer
                    </button>
                  </p>
                </div>
              )}

              {isCricket && (
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3 border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-navy) 6%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-navy) 20%, transparent)",
                  }}
                >
                  <FaFlag style={{ color: "var(--color-navy)", flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    This is a cricket event.{" "}
                    <button
                      onClick={() => navigate(`/organizer/cricket/${eventId}`)}
                      className="font-semibold underline"
                      style={{ color: "var(--color-navy)" }}
                    >
                      Open Cricket Tournament Organizer
                    </button>
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
        </div>
      </motion.div>
    </div>
  );
}




