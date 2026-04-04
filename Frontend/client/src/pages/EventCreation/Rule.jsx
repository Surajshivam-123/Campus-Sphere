import { useState } from "react";
import { motion } from "framer-motion";

export default function Rules({ save, oldrule = [] }) {
  const [rules, setRules] = useState(oldrule);
  const [newRule, setNewRule] = useState("");

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (indexToRemove) => {
    setRules(rules.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newRule.trim()) {
      handleAddRule(); // Add rule if present in input
    }
    save(rules); // Then save all rules
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8 pt-8 border-t border-gray-200"
    >
      <h2 className="font-heading text-lg font-semibold text-[#1e3a5f] mb-4 tracking-tight">Event rules</h2>
      <div className="w-10 h-px bg-[#b8860b]/40 mb-4" />

      <div className="mb-6">
        <ul className="space-y-2">
          {rules.map((rule, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex justify-between items-center bg-[#faf9f6] rounded border border-gray-200 px-4 py-2.5 hover:border-[#b8860b]/30 transition-colors"
            >
              <span className="text-[#374151] text-sm font-medium">
                {index + 1}. {rule}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveRule(index)}
                className="text-red-600 hover:text-red-700 transition-colors p-1"
                title="Remove rule"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 items-center mb-6">
        <input
          type="text"
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Enter a new rule"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
        />
        <button
          type="button"
          onClick={handleAddRule}
          className="bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-medium px-4 py-2.5 rounded border border-[#1e3a5f] text-sm transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="px-6 py-2.5 rounded bg-[#b8860b] text-white font-medium text-sm border border-[#b8860b] hover:bg-[#a67a0a] transition-colors"
        >
          Save rules
        </button>
      </div>
    </motion.form>
  );
}
