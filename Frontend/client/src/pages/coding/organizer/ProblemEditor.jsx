import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlus, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import API_URL from "../../../config/api";
import fetchWithAuth from "../../../config/fetchWithAuth";
import LoadingPage from "../../LoadingPage";

const DIFFICULTIES = ["easy", "medium", "hard"];

const emptyTestCase = () => ({ input: "", expectedOutput: "", isSample: false });

export default function ProblemEditor() {
  const { eventId, problemId } = useParams(); // problemId present when editing
  const navigate = useNavigate();
  const isEdit = Boolean(problemId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    difficulty: "medium",
    points: 100,
    timeLimit: 2,
    memoryLimit: 256,
    order: 0,
    testCases: [{ ...emptyTestCase(), isSample: true }],
  });

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/cpsh/coding/problems/${problemId}?organizer=true`);
        const data = await res.json();
        if (data?.data) setForm(data.data);
      } catch (e) {
        console.error("Error loading problem", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [problemId, isEdit]);

  const handleField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleTestCase = (i, field, value) => {
    setForm((p) => {
      const tcs = [...p.testCases];
      tcs[i] = { ...tcs[i], [field]: value };
      return { ...p, testCases: tcs };
    });
  };

  const addTestCase = () => setForm((p) => ({ ...p, testCases: [...p.testCases, emptyTestCase()] }));

  const removeTestCase = (i) =>
    setForm((p) => ({ ...p, testCases: p.testCases.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (form.testCases.length === 0) {
      setError("Add at least one test case.");
      return;
    }
    setSaving(true); setError("");

    try {
      const url = isEdit
        ? `${API_URL}/api/cpsh/coding/problems/${problemId}`
        : `${API_URL}/api/cpsh/coding/problems/event/${eventId}`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data?.success) {
        // Navigate back to contest setup
        const eid = isEdit ? data.data.event : eventId;
        navigate(`/event/${eid}/coding`);
      } else {
        setError(data?.message || "Failed to save problem.");
      }
    } catch (e) {
      setError("Error saving problem.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  const inputCls = "input-base";
  const labelCls = "block text-xs font-medium mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="rounded-lg p-8 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h1 className="font-heading text-2xl font-semibold mb-6 tracking-tight" style={{ color: "var(--color-navy)" }}>
            {isEdit ? "Edit Problem" : "New Problem"}
          </h1>

          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title + order */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Title *</label>
                <input className={inputCls} value={form.title} onChange={(e) => handleField("title", e.target.value)} placeholder="e.g. Two Sum" />
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Display Order</label>
                <input type="number" className={inputCls} value={form.order} onChange={(e) => handleField("order", Number(e.target.value))} min={0} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Problem Statement *</label>
              <textarea
                className={`${inputCls} resize-y`}
                rows={6}
                value={form.description}
                onChange={(e) => handleField("description", e.target.value)}
                placeholder="Describe the problem clearly. Supports plain text."
              />
            </div>

            {/* Input / Output format */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Input Format</label>
                <textarea className={`${inputCls} resize-y`} rows={3} value={form.inputFormat} onChange={(e) => handleField("inputFormat", e.target.value)} placeholder="Describe the input format" />
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Output Format</label>
                <textarea className={`${inputCls} resize-y`} rows={3} value={form.outputFormat} onChange={(e) => handleField("outputFormat", e.target.value)} placeholder="Describe the output format" />
              </div>
            </div>

            {/* Constraints */}
            <div>
              <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Constraints</label>
              <textarea className={`${inputCls} resize-y`} rows={2} value={form.constraints} onChange={(e) => handleField("constraints", e.target.value)} placeholder="e.g. 1 ≤ n ≤ 10^5" />
            </div>

            {/* Difficulty / Points / Limits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Difficulty</label>
                <select className={inputCls} value={form.difficulty} onChange={(e) => handleField("difficulty", e.target.value)}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Points</label>
                <input type="number" className={inputCls} value={form.points} onChange={(e) => handleField("points", Number(e.target.value))} min={1} />
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Time Limit (s)</label>
                <input type="number" className={inputCls} value={form.timeLimit} onChange={(e) => handleField("timeLimit", Number(e.target.value))} min={1} max={10} step={0.5} />
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>Memory (MB)</label>
                <input type="number" className={inputCls} value={form.memoryLimit} onChange={(e) => handleField("memoryLimit", Number(e.target.value))} min={32} max={512} />
              </div>
            </div>

            {/* Test Cases */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls} style={{ color: "var(--color-text-secondary)" }}>
                  Test Cases ({form.testCases.length})
                </label>
                <button type="button" onClick={addTestCase} className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs">
                  <FaPlus /> Add
                </button>
              </div>

              <div className="space-y-4">
                {form.testCases.map((tc, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: "var(--color-surface-2)",
                      borderColor: tc.isSample ? "color-mix(in srgb, var(--color-gold) 40%, transparent)" : "var(--color-border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold" style={{ color: "var(--color-navy)" }}>
                        Test Case {i + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleTestCase(i, "isSample", !tc.isSample)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition"
                          style={
                            tc.isSample
                              ? { color: "var(--color-gold)", borderColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }
                              : { color: "var(--color-text-muted)", borderColor: "var(--color-border)" }
                          }
                          title={tc.isSample ? "Visible to participants" : "Hidden (judge only)"}
                        >
                          {tc.isSample ? <FaEye size={10} /> : <FaEyeSlash size={10} />}
                          {tc.isSample ? "Sample" : "Hidden"}
                        </button>
                        {form.testCases.length > 1 && (
                          <button type="button" onClick={() => removeTestCase(i)} style={{ color: "var(--color-error)" }}>
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "var(--color-text-muted)" }}>Input</label>
                        <textarea
                          className={`${inputCls} font-mono text-xs resize-y`}
                          rows={3}
                          value={tc.input}
                          onChange={(e) => handleTestCase(i, "input", e.target.value)}
                          placeholder="stdin"
                        />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: "var(--color-text-muted)" }}>Expected Output</label>
                        <textarea
                          className={`${inputCls} font-mono text-xs resize-y`}
                          rows={3}
                          value={tc.expectedOutput}
                          onChange={(e) => handleTestCase(i, "expectedOutput", e.target.value)}
                          placeholder="stdout"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-5 py-2.5">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5">
                {saving ? "Saving…" : isEdit ? "Update Problem" : "Create Problem"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
