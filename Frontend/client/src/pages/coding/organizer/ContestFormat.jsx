import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import fetchWithAuth from "../../../config/fetchWithAuth";
import API_URL from "../../../config/api";

const LANGUAGES = ["cpp", "c", "python", "java", "javascript"];

export default function CodingContestFormat() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    durationMinutes: 120,
    startTime: "",
    scoringType: "points",
    allowedLanguages: ["cpp", "python", "java", "javascript"],
    maxAttempts: 0,
    showLeaderboard: true,
  });

  useEffect(() => {
    fetchWithAuth(`${API_URL}/api/cpsh/coding/format/${eventId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          const f = d.data;
          setForm({
            durationMinutes: f.durationMinutes,
            startTime: f.startTime ? new Date(f.startTime).toISOString().slice(0, 16) : "",
            scoringType: f.scoringType,
            allowedLanguages: f.allowedLanguages,
            maxAttempts: f.maxAttempts,
            showLeaderboard: f.showLeaderboard,
          });
        }
      })
      .catch(console.error);
  }, [eventId]);

  const toggleLang = (lang) => {
    setForm((prev) => ({
      ...prev,
      allowedLanguages: prev.allowedLanguages.includes(lang)
        ? prev.allowedLanguages.filter((l) => l !== lang)
        : [...prev.allowedLanguages, lang],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/coding/format/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.success) { setSaved(true); setTimeout(() => navigate(`/event/${eventId}/coding`), 1200); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const inputCls = "input-base";
  const labelCls = "block text-xs font-medium mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto rounded-lg shadow-sm p-8 border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h2 className="font-heading text-2xl font-semibold mb-2 tracking-tight" style={{ color: "var(--color-navy)" }}>
          Contest Format
        </h2>
        <div className="w-12 h-px mb-6" style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 50%, transparent)" }} />

        {saved && (
          <div className="alert-success flex items-center gap-2 mb-6">
            <FaCheckCircle /> Format saved — redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Start time */}
          <div>
            <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>
              Start date & time <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              required
              className={inputCls}
            />
          </div>

          {/* Duration */}
          <div>
            <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>
              Duration (minutes) <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
              required
              className={inputCls}
            />
          </div>

          {/* Scoring type */}
          <div>
            <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Scoring type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "points", label: "Points", desc: "Sum of problem points" },
                { id: "time_penalty", label: "ICPC Style", desc: "Penalty for wrong attempts" },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, scoringType: id }))}
                  className="p-4 rounded-lg border text-left transition-colors"
                  style={{
                    borderColor: form.scoringType === id ? "var(--color-navy)" : "var(--color-border)",
                    backgroundColor: form.scoringType === id
                      ? "color-mix(in srgb, var(--color-navy) 8%, transparent)"
                      : "var(--color-surface)",
                  }}
                >
                  <p className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Allowed languages */}
          <div>
            <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Allowed languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const active = form.allowedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang(lang)}
                    className="px-3 py-1.5 rounded border text-sm font-medium transition-colors"
                    style={{
                      borderColor: active ? "var(--color-navy)" : "var(--color-border)",
                      backgroundColor: active ? "var(--color-navy)" : "var(--color-surface)",
                      color: active ? "#fff" : "var(--color-text-secondary)",
                    }}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max attempts */}
          <div>
            <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>
              Max attempts per problem (0 = unlimited)
            </label>
            <input
              type="number"
              min={0}
              value={form.maxAttempts}
              onChange={(e) => setForm((p) => ({ ...p, maxAttempts: Number(e.target.value) }))}
              className={inputCls}
            />
          </div>

          {/* Show leaderboard */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, showLeaderboard: !p.showLeaderboard }))}
              className="w-10 h-6 rounded-full transition-colors relative"
              style={{ backgroundColor: form.showLeaderboard ? "var(--color-navy)" : "var(--color-border)" }}
              aria-label="Toggle leaderboard visibility"
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.showLeaderboard ? "calc(100% - 1.25rem)" : "0.25rem" }}
              />
            </button>
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Show live leaderboard to participants
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Format"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
