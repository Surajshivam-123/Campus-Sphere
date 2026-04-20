import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import API_URL from "../../config/api";

function ClubCard({ club, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="rounded-lg border transition-colors cursor-pointer"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 40%, transparent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
      onClick={() => navigate(`/clubs/${club._id}`)}
    >
      <div className="p-5">
        <div className="flex items-center gap-4 mb-3">
          {club.logo ? (
            <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{ backgroundColor: "var(--color-navy)" }}
            >
              {club.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold truncate" style={{ color: "var(--color-navy)" }}>
              {club.name}
            </h2>
            <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
              {club.college}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-navy) 10%, transparent)",
              color: "var(--color-navy)",
            }}
          >
            {club.category}
          </span>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            by {club.founder?.fullname || club.founder?.username || "Unknown"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AllClubs() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: clubs, loading, error } = useFetch(`${API_URL}/api/cpsh/clubs/all`);

  const filtered = (clubs || []).filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.college.toLowerCase().includes(q);
    const matchCategory = category === "all" || c.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight" style={{ color: "var(--color-navy)" }}>
              Campus Clubs
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Discover and join clubs at your campus
            </p>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <button onClick={() => navigate("/my-clubs")} className="btn-secondary px-4 py-2 text-sm">
                My Clubs
              </button>
            )}
            {isAuthenticated && (
              <button onClick={() => navigate("/clubs/create")} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                <FaPlus size={12} /> Create Club
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Search clubs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-8 py-2 text-sm w-full"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base py-2 text-sm"
          >
            <option value="all">All categories</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Content */}
        {loading && (
          <p className="text-sm text-center py-12" style={{ color: "var(--color-text-muted)" }}>
            Loading clubs…
          </p>
        )}

        {error && (
          <p className="text-sm text-center py-12" style={{ color: "var(--color-error)" }}>
            Failed to load clubs. Please try again.
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center">
            <FaUsers className="mx-auto text-4xl mb-3" style={{ color: "var(--color-border)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {search || category !== "all" ? "No clubs match your filters." : "No clubs yet. Be the first to create one!"}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((club, i) => (
              <ClubCard key={club._id} club={club} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
