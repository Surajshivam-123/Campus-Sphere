import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaCrown, FaStar, FaPlus } from "react-icons/fa";
import { useFetch } from "../../hooks/useFetch";
import API_URL from "../../config/api";

export default function MyClubs() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`${API_URL}/api/cpsh/clubs/my-clubs`);

  const memberships = data || [];

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight" style={{ color: "var(--color-navy)" }}>
              My Clubs
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Clubs you have joined or founded
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/clubs")} className="btn-secondary px-4 py-2 text-sm">
              Browse Clubs
            </button>
            <button onClick={() => navigate("/clubs/create")} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              <FaPlus size={12} /> Create Club
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <p className="text-sm text-center py-12" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
        )}

        {error && (
          <p className="text-sm text-center py-12" style={{ color: "var(--color-error)" }}>
            Failed to load clubs.
          </p>
        )}

        {!loading && !error && memberships.length === 0 && (
          <div className="py-16 text-center">
            <FaUsers className="mx-auto text-4xl mb-3" style={{ color: "var(--color-border)" }} />
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              You haven't joined any clubs yet.
            </p>
            <button onClick={() => navigate("/clubs")} className="btn-primary px-6 py-2 text-sm">
              Browse Clubs
            </button>
          </div>
        )}

        {!loading && !error && memberships.length > 0 && (
          <div className="space-y-3">
            {memberships.map(({ membership, club }, i) => (
              <motion.div
                key={membership._id}
                className="rounded-lg border transition-colors cursor-pointer"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
                whileHover={{ scale: 1.005 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 40%, transparent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                onClick={() => navigate(`/clubs/${club?._id}`)}
              >
                <div className="p-4 flex items-center gap-4">
                  {club?.logo ? (
                    <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                      style={{ backgroundColor: "var(--color-navy)" }}
                    >
                      {club?.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-base font-semibold truncate" style={{ color: "var(--color-navy)" }}>
                      {club?.name}
                    </h2>
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                      {club?.college}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1">
                      {membership.position === "Founder" && <FaCrown size={11} style={{ color: "var(--color-gold)" }} />}
                      {membership.isHead && membership.position !== "Founder" && <FaStar size={11} style={{ color: "var(--color-gold)" }} />}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--color-navy) 10%, transparent)",
                          color: "var(--color-navy)",
                        }}
                      >
                        {membership.position}
                      </span>
                    </div>
                    {membership.status === "alumni" && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)",
                          color: "var(--color-gold)",
                        }}
                      >
                        Alumni
                      </span>
                    )}
                    <span className="text-xs capitalize" style={{ color: "var(--color-text-muted)" }}>
                      {club?.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
