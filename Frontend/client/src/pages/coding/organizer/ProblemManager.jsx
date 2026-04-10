import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import fetchWithAuth from "../../../config/fetchWithAuth";
import API_URL from "../../../config/api";
import LoadingPage from "../../LoadingPage";

const DIFFICULTIES = ["easy", "medium", "hard"];
const DIFF_COLOR = { easy: "var(--color-success)", medium: "var(--color-warning)", hard: "var(--color-error)" };

const emptyProblem = {
  title: "", description: "", inputFormat: "", outputFormat: "",
  constraints: "", difficulty: "medium", points: 100,
  timeLimit: 2, memoryLimit: 256, order: 0,
  testCases: [{ input: "", expectedOutput: "", isSample: true }],
};

export default function ProblemManager() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // problem id being edited
  const [form, setForm] = useState(emptyProblem);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/v1/coding/problems/event/${eventId}?organizer=true`);
      const data = await res.json();
      if (data?.data) setProblems(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [eventId]);

  const openCreate = () => { setForm({ ...emptyProblem, order: problems.length }); setEditing(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      title: p.title, description: p.description, inputFormat: p.inputFormat,
      outputFormat: p.outputFormat, constraints: p.constraints, difficulty: p.difficulty,
      points: p.points, timeLimit: p.timeLimit, memoryLimit: p.memoryLimit, order: p.order,
      testCases: p.testCases,
    });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing
        ? `${API_URL}/api/v1/coding/problems/${editing}`
        : `${API_URL}/api/v1/coding/problems/event/${eventId}`;
      const method = editing ? "PATCH" : "POST";
      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.success) { setShowForm(false); setEditing(null); await load(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this problem?")) return;
    await fetchWithAuth(`${API_URL}/api/v1/coding/problems/${id}`, { method: "DELETE" });
    await load();
  };

  const addTestCase = () => setForm((p) => ({ ...p, testCases: [...p.testCases, { input: "", expectedOutput: "", isSample: false }] }));
  const removeTestCase = (i) => setForm((p) => ({ ...p, testCases: p.testCases.filter((_, idx) => idx !== i) }));
  const updateTestCase = (i, field, value) =>
    setForm((p) => ({ ...p, testCases: p.testCases.map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc) }));

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight" style={{ color: "var(--color-navy)" }}>
              Problems
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {problems.length} problem{problems.length !== 1 ? "s" : ""} in this contest
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/event/${eventId}/coding`)} className="btn-secondary px-4 py-2">
              ← Back
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2">
              <Plus size={16} /> Add Problem
            </button>
          </div>
        </div>

        {/* Problem list */}
        {problems.length === 0 && !showForm ? (
          <div
            className="rounded-lg p-12 text-center border"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <p className="text-4xl mb-3">📝</p>
            <p className="font-medium" style={{ color: "var(--color-text-secondary)" }}>No problems yet</p>
            <p className="text-sm mt-1 mb-4" style={{ color: "var(--color-text-muted)" }}>Add your first problem to get started.</p>
            <button onClick={openCreate} className="btn-primary px-5 py-2.5">Add Problem</button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {problems.map((p, i) => (
              <div
                key={p._id}
                className="rounded-lg border overflow-hidden"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--color-navy)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>{p.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-semibold" style={{ color: DIFF_COLOR[p.difficulty] }}>
                          {p.difficulty}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {p.points} pts · {p.testCases.length} test case{p.testCases.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                      className="p-2 rounded transition-colors"
                      style={{ color: "var(--color-text-muted)" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-navy)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                      className="p-2 rounded transition-colors"
                      style={{ color: "var(--color-text-muted)" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-error)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                    >
                      <Trash2 size={15} />
                    </button>
                    {expandedId === p._id ? <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === p._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 space-y-3 text-sm" style={{ borderTop: `1px solid var(--color-border)` }}>
                        <p className="pt-4" style={{ color: "var(--color-text-secondary)" }}>{p.description}</p>
                        {p.constraints && (
                          <div>
                            <p className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Constraints</p>
                            <p style={{ color: "var(--color-text-secondary)" }}>{p.constraints}</p>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                            Sample test cases ({p.testCases.filter((tc) => tc.isSample).length})
                          </p>
                          {p.testCases.filter((tc) => tc.isSample).map((tc, j) => (
                            <div key={j} className="grid grid-cols-2 gap-3 mb-2">
                              <div className="rounded p-2" style={{ backgroundColor: "var(--color-surface-2)" }}>
                                <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>Input</p>
                                <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: "var(--color-text-secondary)" }}>{tc.input || "(empty)"}</pre>
                              </div>
                              <div className="rounded p-2" style={{ backgroundColor: "var(--color-surface-2)" }}>
                                <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>Expected Output</p>
                                <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: "var(--color-text-secondary)" }}>{tc.expectedOutput || "(empty)"}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="rounded-lg border p-6"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <h3 className="font-heading text-lg font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
                {editing ? "Edit Problem" : "New Problem"}
              </h3>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                      Title *
                    </label>
                    <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="input-base" placeholder="e.g. Two Sum" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                      Description *
                    </label>
                    <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={5} className="input-base resize-y" placeholder="Problem statement…" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Input Format</label>
                    <textarea value={form.inputFormat} onChange={(e) => setForm((p) => ({ ...p, inputFormat: e.target.value }))} rows={3} className="input-base resize-y" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Output Format</label>
                    <textarea value={form.outputFormat} onChange={(e) => setForm((p) => ({ ...p, outputFormat: e.target.value }))} rows={3} className="input-base resize-y" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Constraints</label>
                    <input value={form.constraints} onChange={(e) => setForm((p) => ({ ...p, constraints: e.target.value }))} className="input-base" placeholder="e.g. 1 ≤ n ≤ 10^5" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Difficulty</label>
                    <select value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))} className="input-base">
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Points</label>
                    <input type="number" min={1} value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: Number(e.target.value) }))} className="input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Time Limit (s)</label>
                    <input type="number" min={1} max={10} value={form.timeLimit} onChange={(e) => setForm((p) => ({ ...p, timeLimit: Number(e.target.value) }))} className="input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Memory Limit (MB)</label>
                    <input type="number" min={16} max={512} value={form.memoryLimit} onChange={(e) => setForm((p) => ({ ...p, memoryLimit: Number(e.target.value) }))} className="input-base" />
                  </div>
                </div>

                {/* Test cases */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                      Test Cases *
                    </label>
                    <button type="button" onClick={addTestCase} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-navy)" }}>
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.testCases.map((tc, i) => (
                      <div key={i} className="rounded-lg p-4 border space-y-3" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Test Case {i + 1}</span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--color-text-secondary)" }}>
                              <input
                                type="checkbox"
                                checked={tc.isSample}
                                onChange={(e) => updateTestCase(i, "isSample", e.target.checked)}
                                className="rounded"
                              />
                              Sample (visible to participants)
                            </label>
                            {form.testCases.length > 1 && (
                              <button type="button" onClick={() => removeTestCase(i)} style={{ color: "var(--color-error)" }}>
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Input</label>
                            <textarea value={tc.input} onChange={(e) => updateTestCase(i, "input", e.target.value)} rows={3} className="input-base resize-y font-mono text-xs" />
                          </div>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Expected Output</label>
                            <textarea value={tc.expectedOutput} onChange={(e) => updateTestCase(i, "expectedOutput", e.target.value)} rows={3} className="input-base resize-y font-mono text-xs" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : editing ? "Update Problem" : "Add Problem"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
