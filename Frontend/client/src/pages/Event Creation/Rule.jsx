import { useState } from "react";
import { FaFontAwesome } from "react-icons/fa";

export default function Rules() {
  const [rules, setRules] = useState(["Always be kind"]);
  const [newRule, setNewRule] = useState("");
  const handleAddRule = (e) => {
    if (newRule.trim()) {
      e.preventDefault();
      setRules([...rules, newRule]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (indexToRemove) => {
    setRules(rules.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="max-w-md mx-auto bg-white  overflow-hidden md:max-w-2xl ">
      <h2 className="flex items-center text-xl text-gray-700 font-medium mb-6">
        {/* <FaFontAwesome icon="fa-solid fa-scale-balanced" /> */}
        <span>Rules</span>
      </h2>
      <div className="mb-8">
        <ul className="space-y-3">
          {rules.map((rule, index) => (
            <li
              key={index}
              className="flex items-center justify-between group hover:bg-gray-50 rounded p-2"
            >
              <div className="flex items-center flex-1">
                <span className="w-8 text-gray-500 font-medium">
                  {index + 1}.
                </span>
                <span className="flex-1 text-gray-700">{rule}</span>
              </div>
              <button
                onClick={() => handleRemoveRule(index)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
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
            </li>
          ))}
        </ul>
      </div>

      <div className="flex space-x-2 items-center mb-8">
        <input
          type="text"
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Enter a new rule"
          className="flex-1 border ml-1 border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAddRule}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 transition-colors flex items-center"
          title="Add rule"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="ml-2">Add</span>
        </button>
      </div>
    </div>
  );
}
