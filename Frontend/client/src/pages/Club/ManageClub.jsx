import API_URL from "../../config/api";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaUserCheck, FaCog, FaCrown, FaStar, FaTrash, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import fetchWithAuth from "../../config/fetchWithAuth";

function Avatar({ user, size = 8 }) {
  const initials = (user?.fullname || user?.username || "?").charAt(0).toUpperCase();
  return user?.avatar ? (
    <img src={user.avatar} alt={initials} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} />
  ) : (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0`}
      style={{ backgroundColor: "var(--color-navy)" }}
    >
      {initials}
    </div>
  );
}

// ── Members Tab ───────────────────────────────────────────────────────────────
function MembersTab({ clubId, club, currentUser, onClubDeleted }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [positionModal, setPositionModal] = useState(null); // { memberId, position, isHead }
  const [transferModal, setTransferModal] = useState(false);
  const [newFounderId, setNewFounderId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const isFounder = club?.founder?._id === currentUser?._id || club?.founder === currentUser?._id;

  const loadMembers = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/members/${clubId}`);
      const data = await res.json();
      if (data.success) {
        setMembers([...(data.data.activeMembers || []), ...(data.data.alumniMembers || [])]);
      }
    } catch (e) {
      console.error("Error loading members", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, [clubId]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: "", msg: "" }), 3000);
  };

  const handleAssignPosition = async () => {
    if (!positionModal) return;
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/members/${positionModal.memberId}/position`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: positionModal.position, isHead: positionModal.isHead }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update position");
      showFeedback("success", "Position updated.");
      setPositionModal(null);
      loadMembers();
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAlumni = async (memberId) => {
    if (!window.confirm("Mark this member as alumni?")) return;
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/members/${memberId}/alumni`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      showFeedback("success", "Marked as alumni.");
      loadMembers();
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member from the club?")) return;
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/members/${memberId}/remove`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      showFeedback("success", "Member removed.");
      loadMembers();
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferFoundership = async () => {
    if (!newFounderId) return;
    if (!window.confirm("Transfer foundership? You will become an alumni.")) return;
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/${clubId}/transfer-founder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newFounderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      showFeedback("success", "Foundership transferred.");
      setTransferModal(false);
      navigate(`/clubs/${clubId}`);
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const activeMembers = members.filter((m) => m.status === "active" && m.user?._id !== (club?.founder?._id || club?.founder));

  if (loading) return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>Loading…</p>;

  return (
    <div className="space-y-4">
      {feedback.msg && (
        <motion.p
          className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
          style={feedback.type === "success"
            ? { color: "var(--color-success)", backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)" }
            : { color: "var(--color-error)", backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-error) 25%, transparent)" }
          }
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          {feedback.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />} {feedback.msg}
        </motion.p>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>No members yet.</p>
      ) : (
        <div>
          {members.map((m) => {
            const isThisFounder = m.position === "Founder";
            return (
              <div key={m._id} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                <Avatar user={m.user} size={8} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--color-navy)" }}>
                    {m.user?.fullname || m.user?.username}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {isThisFounder && <FaCrown size={10} style={{ color: "var(--color-gold)" }} />}
                    {m.isHead && !isThisFounder && <FaStar size={10} style={{ color: "var(--color-gold)" }} />}
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{m.position}</span>
                    {m.status === "alumni" && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)", color: "var(--color-gold)" }}>
                        Alumni
                      </span>
                    )}
                  </div>
                </div>
                {!isThisFounder && m.status === "active" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setPositionModal({ memberId: m._id, position: m.position, isHead: m.isHead })}
                      className="text-xs font-medium"
                      style={{ color: "var(--color-navy)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleMarkAlumni(m._id)}
                      disabled={actionLoading}
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Alumni
                    </button>
                    {isFounder && (
                      <button
                        onClick={() => handleRemove(m._id)}
                        disabled={actionLoading}
                        className="text-xs"
                        style={{ color: "var(--color-error)" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Foundership — founder only */}
      {isFounder && activeMembers.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => setTransferModal(true)}
            className="text-sm font-medium underline"
            style={{ color: "var(--color-error)" }}
          >
            Transfer Foundership
          </button>
        </div>
      )}

      {/* Position Modal */}
      {positionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border shadow-lg p-6 w-full max-w-sm"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h3 className="font-heading text-base font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
              Assign Position
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={positionModal.position}
                onChange={(e) => setPositionModal((p) => ({ ...p, position: e.target.value }))}
                placeholder="e.g. President, Secretary…"
                className="input-base w-full"
              />
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={positionModal.isHead}
                  onChange={(e) => setPositionModal((p) => ({ ...p, isHead: e.target.checked }))}
                  className="w-4 h-4"
                />
                Head / Leadership role
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAssignPosition} disabled={actionLoading} className="btn-primary flex-1 text-sm">
                {actionLoading ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setPositionModal(null)} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border shadow-lg p-6 w-full max-w-sm"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h3 className="font-heading text-base font-semibold mb-1" style={{ color: "var(--color-navy)" }}>
              Transfer Foundership
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
              You will become an alumni with position "Past Founder".
            </p>
            <select
              value={newFounderId}
              onChange={(e) => setNewFounderId(e.target.value)}
              className="input-base w-full mb-4"
            >
              <option value="">Select new founder…</option>
              {activeMembers.map((m) => (
                <option key={m._id} value={m.user?._id}>
                  {m.user?.fullname || m.user?.username} — {m.position}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={handleTransferFoundership} disabled={actionLoading || !newFounderId} className="btn-primary flex-1 text-sm">
                {actionLoading ? "Transferring…" : "Transfer"}
              </button>
              <button onClick={() => setTransferModal(false)} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Join Requests Tab ─────────────────────────────────────────────────────────
function JoinRequestsTab({ clubId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const loadRequests = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/join-requests/${clubId}`);
      const data = await res.json();
      if (data.success) setRequests(data.data || []);
    } catch (e) {
      console.error("Error loading requests", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [clubId]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: "", msg: "" }), 3000);
  };

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/join-requests/handle/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      showFeedback("success", `Request ${action}d.`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>Loading…</p>;

  return (
    <div className="space-y-4">
      {feedback.msg && (
        <motion.p
          className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
          style={feedback.type === "success"
            ? { color: "var(--color-success)", backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)" }
            : { color: "var(--color-error)", backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-error) 25%, transparent)" }
          }
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          {feedback.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />} {feedback.msg}
        </motion.p>
      )}

      {requests.length === 0 ? (
        <div className="py-12 text-center">
          <FaUserCheck className="mx-auto text-3xl mb-2" style={{ color: "var(--color-border)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No pending join requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Avatar user={req.requester} size={9} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>
                  {req.requester?.fullname || req.requester?.username}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  @{req.requester?.username}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleAction(req._id, "approve")}
                  disabled={actionLoading === req._id}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(req._id, "reject")}
                  disabled={actionLoading === req._id}
                  className="btn-danger px-3 py-1.5 text-xs"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ clubId, club, isFounder }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: club?.name || "",
    description: club?.description || "",
    college: club?.college || "",
    category: club?.category || "technical",
    isPublic: club?.isPublic ?? true,
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: "", msg: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (logo) formData.append("logo", logo);

      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/${clubId}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update");
      showFeedback("success", "Club updated successfully.");
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this club? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/${clubId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      navigate("/clubs");
    } catch (err) {
      showFeedback("error", err.message);
      setDeleting(false);
    }
  };

  const LabelCls = "block text-xs font-medium mb-2 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      {feedback.msg && (
        <motion.p
          className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
          style={feedback.type === "success"
            ? { color: "var(--color-success)", backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)" }
            : { color: "var(--color-error)", backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)", borderColor: "color-mix(in srgb, var(--color-error) 25%, transparent)" }
          }
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          {feedback.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />} {feedback.msg}
        </motion.p>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Club name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="input-base w-full" />
        </div>
        <div>
          <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>College</label>
          <input type="text" name="college" value={form.college} onChange={handleChange} className="input-base w-full" />
        </div>
        <div>
          <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-base w-full resize-none" />
        </div>
        <div>
          <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-base w-full">
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isPublic" name="isPublic" checked={form.isPublic} onChange={handleChange} className="w-4 h-4" />
          <label htmlFor="isPublic" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Publicly visible</label>
        </div>
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
            Update logo
          </label>
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="text-sm" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-sm">
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>

      {isFounder && (
        <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-error)" }}>Danger Zone</h3>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FaTrash size={12} /> {deleting ? "Deleting…" : "Delete Club"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ManageClub ───────────────────────────────────────────────────────────
export default function ManageClub() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState("members");
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/${clubId}`);
        const data = await res.json();
        if (data.success) setClub(data.data);
      } catch (e) {
        console.error("Error loading club", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <p className="text-sm" style={{ color: "var(--color-error)" }}>Club not found.</p>
      </div>
    );
  }

  const isFounder = club.founder?._id === user?._id || club.founder === user?._id;

  const tabs = [
    { id: "members", label: "Members", icon: <FaUsers size={13} /> },
    { id: "requests", label: "Join Requests", icon: <FaUserCheck size={13} /> },
    ...(isFounder ? [{ id: "settings", label: "Settings", icon: <FaCog size={13} /> }] : []),
  ];

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold" style={{ color: "var(--color-navy)" }}>
              Manage — {club.name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>{club.college}</p>
          </div>
          <button onClick={() => navigate(`/clubs/${clubId}`)} className="btn-secondary px-4 py-2 text-sm">
            View Club
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition border"
              style={
                tab === id
                  ? { backgroundColor: "var(--color-navy)", color: "#fff", borderColor: "var(--color-navy)" }
                  : { backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }
              }
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="rounded-lg border shadow-sm p-6"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {tab === "members" && <MembersTab clubId={clubId} club={club} currentUser={user} />}
          {tab === "requests" && <JoinRequestsTab clubId={clubId} />}
          {tab === "settings" && isFounder && <SettingsTab clubId={clubId} club={club} isFounder={isFounder} />}
        </div>
      </motion.div>
    </div>
  );
}
