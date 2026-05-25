import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaExclamationTriangle, FaCheckCircle, FaCrown, FaStar, FaCopy, FaCheck, FaLock, FaComments } from "react-icons/fa";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import API_URL from "../../config/api";
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

function MemberRow({ member }) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
      <Avatar user={member.user} size={8} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--color-navy)" }}>
          {member.user?.fullname || member.user?.username || "Unknown"}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
          @{member.user?.username}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {member.position === "Founder" && <FaCrown size={11} style={{ color: "var(--color-gold)" }} />}
        {member.isHead && member.position !== "Founder" && <FaStar size={11} style={{ color: "var(--color-gold)" }} />}
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-navy) 10%, transparent)",
            color: "var(--color-navy)",
          }}
        >
          {member.position}
        </span>
      </div>
    </div>
  );
}

export default function ClubDetail() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [clubCode, setClubCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const { data: club, loading: clubLoading } = useFetch(`${API_URL}/api/cpsh/clubs/${clubId}`);
  const { data: membersData, loading: membersLoading, refetch: refetchMembers } = useFetch(`${API_URL}/api/cpsh/clubs/members/${clubId}`);

  const activeMembers = membersData?.activeMembers || [];
  const alumniMembers = membersData?.alumniMembers || [];

  const isFounder = user && club && club.founder?._id === user._id;
  const isHeadMember = user && activeMembers.some((m) => m.user?._id === user._id && m.isHead);
  const canManage = isFounder || isHeadMember;

  const isMember = user && activeMembers.some((m) => m.user?._id === user._id);
  const isAlumni = user && alumniMembers.some((m) => m.user?._id === user._id);

  const copyCode = () => {
    navigator.clipboard.writeText(club.clubCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError(""); setJoinSuccess("");
    if (!clubCode.trim()) return setJoinError("Club code is required.");

    setJoinLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/join/${clubCode.trim()}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to send request");
      setJoinSuccess("Join request sent! Waiting for approval.");
      setClubCode("");
    } catch (err) {
      setJoinError(err.message || "Something went wrong.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this club?")) return;
    setLeaveError("");
    setLeaveLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/${clubId}/leave`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to leave club");
      navigate("/my-clubs");
    } catch (err) {
      setLeaveError(err.message || "Something went wrong.");
    } finally {
      setLeaveLoading(false);
    }
  };

  if (clubLoading) {
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

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Club header */}
        <div
          className="rounded-lg border shadow-sm p-6"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-start gap-5 flex-wrap">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="w-20 h-20 rounded-full object-cover shrink-0" />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
                style={{ backgroundColor: "var(--color-navy)" }}
              >
                {club.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="font-heading text-2xl font-semibold" style={{ color: "var(--color-navy)" }}>
                    {club.name}
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {club.college}
                  </p>
                </div>
                {canManage && (
                  <button
                    onClick={() => navigate(`/clubs/${clubId}/manage`)}
                    className="btn-secondary px-4 py-2 text-sm shrink-0"
                  >
                    Manage Club
                  </button>
                )}
                {(isMember || isFounder) && (
                  <button
                    onClick={() => navigate(`/clubs/${clubId}/chat`)}
                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm shrink-0"
                  >
                    <FaComments size={13} /> Club Chat
                  </button>
                )}
                {isMember && !isFounder && (
                  <button
                    onClick={handleLeave}
                    disabled={leaveLoading}
                    className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm shrink-0"
                    style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}
                  >
                    {leaveLoading ? "Leaving…" : "Leave Club"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-navy) 10%, transparent)",
                    color: "var(--color-navy)",
                  }}
                >
                  {club.category}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Founded by {club.founder?.fullname || club.founder?.username}
                </span>
              </div>

              {club.description && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {club.description}
                </p>
              )}

              {/* Club code — visible to members and founder so they can share it */}
              {(canManage || isMember) && club.clubCode && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Club code
                  </span>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-navy) 6%, transparent)",
                      borderColor: "color-mix(in srgb, var(--color-navy) 20%, transparent)",
                    }}
                  >
                    <span className="font-mono font-semibold text-sm tracking-widest" style={{ color: "var(--color-navy)" }}>
                      {club.clubCode}
                    </span>
                    <button
                      onClick={copyCode}
                      aria-label="Copy club code"
                      className="transition-colors"
                      style={{ color: copied ? "var(--color-gold)" : "var(--color-navy)" }}
                    >
                      {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    </button>
                  </div>
                  {!club.isPublic && (
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)",
                        color: "var(--color-gold)",
                      }}
                    >
                      <FaLock size={9} /> Private
                    </span>
                  )}
                </div>
              )}

              {/* For non-members on a private club — show lock indicator */}
              {!club.isPublic && !isMember && !isFounder && (
                <div className="mt-3 flex items-center gap-1.5">
                  <FaLock size={11} style={{ color: "var(--color-text-muted)" }} />
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Private club — join with a code
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Join section — only for non-members */}
        {isAuthenticated && !isMember && !isFounder && !isAlumni && (
          <div
            className="rounded-lg border p-5"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h2 className="font-heading text-base font-semibold mb-3" style={{ color: "var(--color-navy)" }}>
              Join this club
            </h2>
            <form onSubmit={handleJoin} className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={clubCode}
                onChange={(e) => setClubCode(e.target.value)}
                placeholder="Enter club code"
                className="input-base flex-1 min-w-40 py-2 text-sm"
              />
              <motion.button
                type="submit"
                disabled={joinLoading}
                className="btn-primary px-5 py-2 text-sm"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {joinLoading ? "Sending…" : "Request to Join"}
              </motion.button>
            </form>
            {joinError && (
              <motion.p
                className="text-xs font-medium flex items-center gap-1.5 mt-2"
                style={{ color: "var(--color-error)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <FaExclamationTriangle /> {joinError}
              </motion.p>
            )}
            {joinSuccess && (
              <motion.p
                className="text-xs font-medium flex items-center gap-1.5 mt-2"
                style={{ color: "var(--color-success)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <FaCheckCircle /> {joinSuccess}
              </motion.p>
            )}
          </div>
        )}

        {isMember && !isFounder && (
          <div
            className="rounded-lg border px-5 py-3 flex items-center gap-2"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)",
            }}
          >
            <FaCheckCircle style={{ color: "var(--color-success)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-success)" }}>
              You are a member of this club.
            </p>
          </div>
        )}

        {leaveError && (
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--color-error)" }}>
            <FaExclamationTriangle /> {leaveError}
          </p>
        )}

        {isAlumni && !isFounder && (
          <div
            className="rounded-lg border px-5 py-3 flex items-center gap-2"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-gold) 8%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-gold) 25%, transparent)",
            }}
          >
            <FaStar style={{ color: "var(--color-gold)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-gold)" }}>
              You are an alumni of this club.
            </p>
          </div>
        )}

        {/* Active Members */}
        <div
          className="rounded-lg border shadow-sm p-6"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FaUsers style={{ color: "var(--color-navy)" }} />
            <h2 className="font-heading text-base font-semibold" style={{ color: "var(--color-navy)" }}>
              Active Members ({activeMembers.length})
            </h2>
          </div>

          {membersLoading ? (
            <p className="text-sm py-4 text-center" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
          ) : activeMembers.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "var(--color-text-muted)" }}>No active members yet.</p>
          ) : (
            <div>
              {activeMembers.map((m) => (
                <MemberRow key={m._id} member={m} />
              ))}
            </div>
          )}
        </div>

        {/* Alumni / Past Members */}
        {alumniMembers.length > 0 && (
          <div
            className="rounded-lg border shadow-sm p-6"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h2 className="font-heading text-base font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
              Past Members ({alumniMembers.length})
            </h2>
            <div>
              {alumniMembers.map((m) => (
                <div key={m._id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                  <Avatar user={m.user} size={8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-secondary)" }}>
                      {m.user?.fullname || m.user?.username || "Unknown"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>@{m.user?.username}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--color-text-muted) 15%, transparent)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {m.position}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)",
                        color: "var(--color-gold)",
                      }}
                    >
                      Alumni
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
