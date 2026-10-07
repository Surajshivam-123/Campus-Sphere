import { useState } from "react";
import { motion } from "framer-motion";

export default function Rules({ save, oldrule = [] }) {
  const [rules, setRules] = useState(oldrule);
  const [newRule, setNewRule] = useState("");

  const handleAddRule = () => {
    if (newRule.trim()) { setRules([...rules, newRule.trim()]); setNewRule(""); }
  };

  const handleRemoveRule = (i) => setRules(rules.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newRule.trim()) handleAddRule();
    save(rules);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 pt-8"
      style={{ borderTop: `1px solid var(--color-border)` }}
    >
      <h2
        className="font-heading text-lg font-semibold mb-4 tracking-tight"
        style={{ color: "var(--color-navy)" }}
      >
        Event rules
      </h2>
      <div
        className="w-10 h-px mb-4"
        style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
      />

      <ul className="space-y-2 mb-6">
        {rules.map((rule, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="flex justify-between items-center rounded px-4 py-2.5 border transition-colors"
            style={{
              backgroundColor: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
            }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {index + 1}. {rule}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveRule(index)}
              className="p-1 transition-colors"
              style={{ color: "var(--color-error)" }}
              title="Remove rule"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </motion.li>
        ))}
      </ul>

      <div className="flex gap-3 items-center mb-6">
        <input
          type="text"
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Enter a new rule"
          className="input-base flex-1"
        />
        <button
          type="button"
          onClick={handleAddRule}
          className="btn-primary px-4 py-2.5 whitespace-nowrap"
        >
          + Add
        </button>
      </div>

      <div className="text-center">
        <button type="submit" className="btn-gold px-6 py-2.5">
          Save rules
        </button>
      </div>
    </motion.form>
  );
}
