import { useState } from "react";

export default function JoinEvent() {
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validCodes = ["TECH2025", "SPORTS24", "CULTUREX"]; // Sample valid codes

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!invitationCode.trim()) {
      setError("⚠️ Invitation code is required.");
      setSuccess("");
    } else if (!validCodes.includes(invitationCode.trim().toUpperCase())) {
      setError("❌ Invalid invitation code. Please try again.");
      setSuccess("");
    } else {
      setSuccess("✅ Successfully joined the event!");
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-300 to-purple-300 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          🎟️ Join Event
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Invitation Code
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Enter your invitation code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {error && (
            <p className="text-red-600 font-medium bg-red-100 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 font-medium bg-green-100 px-4 py-2 rounded-lg">
              {success}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition duration-200"
          >
            Join Event
          </button>
        </form>
      </div>
    </div>
  );
}
