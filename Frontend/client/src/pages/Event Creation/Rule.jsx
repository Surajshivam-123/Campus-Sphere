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
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl p-8"
    >
      <h2 className="text-xl mb-6">Event Rules</h2>

      <div className="mb-6">
        <ul className="space-y-3">
          {rules.map((rule, index) => (
            <motion.li
              key={index}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex justify-between items-center bg-blue-50 rounded-lg px-4 py-2 border border-blue-200 hover:bg-blue-100"
            >
              <span className="text-gray-800 font-medium">
                {index + 1}. {rule}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveRule(index)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
                title="Remove rule"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
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
          className="flex-1 border border-blue-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          type="button"
          onClick={handleAddRule}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md shadow transition-transform hover:scale-105"
        >
          + Add
        </button>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="w-1/2 py-2 rounded-md bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold hover:from-purple-500 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Save Rules
        </button>
      </div>
    </motion.form>
  );
}
