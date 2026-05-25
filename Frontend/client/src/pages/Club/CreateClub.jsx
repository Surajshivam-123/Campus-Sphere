import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import API_URL from "../../config/api";
import fetchWithAuth from "../../config/fetchWithAuth";

export default function CreateClub() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    college: "",
    category: "technical",
    isPublic: true,
  });
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.name.trim() || !form.college.trim()) {
      return setError("Club name and college are required.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("college", form.college.trim());
      formData.append("category", form.category);
      formData.append("isPublic", form.isPublic);
      if (logo) formData.append("logo", logo);

      const res = await fetchWithAuth(`${API_URL}/api/cpsh/clubs/create`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create club");
      }

      setSuccess("Club created successfully!");
      setTimeout(() => navigate(`/clubs/${data.data._id}`), 1000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const LabelCls = "block text-xs font-medium mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <div
          className="rounded-lg border shadow-sm p-8"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <h1 className="font-heading text-2xl font-semibold text-center mb-2 tracking-tight" style={{ color: "var(--color-navy)" }}>
            Create a Club
          </h1>
          <div className="w-12 h-px mx-auto mb-6" style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              {preview ? (
                <img src={preview} alt="Logo preview" className="w-20 h-20 rounded-full object-cover border" style={{ borderColor: "var(--color-border)" }} />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: "var(--color-navy)" }}
                >
                  {form.name.charAt(0).toUpperCase() || "C"}
                </div>
              )}
              <label className="cursor-pointer text-xs font-medium underline" style={{ color: "var(--color-navy)" }}>
                Upload logo (optional)
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Club name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Robotics Club"
                className="input-base w-full"
                required
              />
            </div>

            {/* College */}
            <div>
              <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>College *</label>
              <input
                type="text"
                name="college"
                value={form.college}
                onChange={handleChange}
                placeholder="e.g. IIT Bombay"
                className="input-base w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={LabelCls} style={{ color: "var(--color-text-secondary)" }}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What is this club about?"
                rows={3}
                className="input-base w-full resize-none"
              />
            </div>

            {/* Category */}
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

            {/* isPublic */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={form.isPublic}
                onChange={handleChange}
                className="w-4 h-4 accent-navy"
              />
              <label htmlFor="isPublic" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Make this club publicly visible
              </label>
            </div>

            {/* Feedback */}
            {error && (
              <motion.p
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
                style={{
                  color: "var(--color-error)",
                  backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)",
                  borderColor: "color-mix(in srgb, var(--color-error) 25%, transparent)",
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <FaExclamationTriangle className="shrink-0" /> {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded border"
                style={{
                  color: "var(--color-success)",
                  backgroundColor: "color-mix(in srgb, var(--color-success) 8%, transparent)",
                  borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)",
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <FaCheckCircle className="shrink-0" /> {success}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? "Creating…" : "Create Club"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
