import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCircle } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import API_URL from "../../config/api";
import socket from "../../config/socket";

// ── Toss Setup ────────────────────────────────────────────────────────────────
function TossSetup({ match, onStart }) {
  const [tossWinner, setTossWinner] = useState(match.team1);
  const [tossDecision, setTossDecision] = useState("bat");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    await onStart({ tossWinner, tossDecision });
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <MdSportsCricket className="text-indigo-600" /> Toss Setup
      </h2>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-1">Toss Winner</label>
        <select
          value={tossWinner}
          onChange={(e) => setTossWinner(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value={match.team1}>{match.team1}</option>
          <option value={match.team2}>{match.team2}</option>
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-1">Elected to</label>
        <div className="flex gap-3">
          {["bat", "bowl"].map((d) => (
            <button
              key={d}
              onClick={() => setTossDecision(d)}
              className={`flex-1 py-3 rounded-xl font-semibold capitalize transition ${
                tossDecision === d ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition disabled:opacity-60"
      >
        {loading ? "Starting..." : "Start Match"}
      </button>
    </div>
  );
}

// ── Ball Input Panel ──────────────────────────────────────────────────────────
function DeliveryPanel({ match, onDelivery }) {
  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const [runs, setRuns] = useState(0);
  const [extras, setExtras] = useState({ isWide: false, isNoBall: false, isBye: false, isLegBye: false });
  const [isWicket, setIsWicket] = useState(false);
  const [batsmanName, setBatsmanName] = useState("");
  const [bowlerName, setBowlerName] = useState("");
  const [commentary, setCommentary] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastBalls, setLastBalls] = useState([]);

  // Populate last 6 balls of current over
  useEffect(() => {
    const balls = innings?.ballByBall || [];
    const currentOver = innings?.overs || 0;
    setLastBalls(balls.filter((b) => b.over === currentOver).slice(-6));
  }, [innings]);

  const toggleExtra = (key) =>
    setExtras((prev) => ({ isWide: false, isNoBall: false, isBye: false, isLegBye: false, [key]: !prev[key] }));

  const handleSubmit = async () => {
    if (!batsmanName.trim() || !bowlerName.trim()) {
      alert("Enter batsman and bowler names");
      return;
    }
    setLoading(true);
    await onDelivery({
      runs,
      isWicket,
      ...extras,
      batsmanName: batsmanName.trim(),
      bowlerName: bowlerName.trim(),
      commentary: commentary.trim(),
    });
    // Reset
    setRuns(0);
    setIsWicket(false);
    setExtras({ isWide: false, isNoBall: false, isBye: false, isLegBye: false });
    setCommentary("");
    setLoading(false);
  };

  const oversDisplay = `${innings.overs}.${innings.balls}`;
  const target = match.currentInnings === 2 ? match.innings1.runs + 1 : null;

  const dotColor = (b) => {
    if (b.isWicket) return "bg-red-500 text-white";
    if (b.isWide || b.isNoBall) return "bg-yellow-400 text-white";
    if (b.runs === 6) return "bg-indigo-600 text-white";
    if (b.runs === 4) return "bg-green-500 text-white";
    if (b.runs === 0) return "bg-gray-200 text-gray-600";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-4">
      {/* Live score strip */}
      <div className="bg-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{innings.battingTeam} batting</p>
          <p className="text-3xl font-extrabold">{innings.runs}/{innings.wickets}</p>
          <p className="text-sm opacity-80">{oversDisplay} overs · Extras: {innings.extras}</p>
        </div>
        <div className="text-right">
          {target && (
            <p className="text-sm opacity-80">
              Target: <span className="font-bold">{target}</span><br />
              Need: <span className="font-bold">{target - innings.runs}</span>
            </p>
          )}
          <p className="text-xs opacity-60 mt-1">Innings {match.currentInnings}</p>
        </div>
      </div>

      {/* Current over balls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-2">This Over</p>
        <div className="flex gap-2 flex-wrap">
          {lastBalls.length === 0 && <span className="text-gray-300 text-sm">No balls yet</span>}
          {lastBalls.map((b, i) => (
            <span key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${dotColor(b)}`}>
              {b.isWicket ? "W" : b.isWide ? "Wd" : b.isNoBall ? "Nb" : b.runs}
            </span>
          ))}
        </div>
      </div>

      {/* Player names */}
      <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Batsman *</label>
          <input
            value={batsmanName}
            onChange={(e) => setBatsmanName(e.target.value)}
            placeholder="Batsman name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Bowler *</label>
          <input
            value={bowlerName}
            onChange={(e) => setBowlerName(e.target.value)}
            placeholder="Bowler name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Runs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-3">Runs</p>
        <div className="grid grid-cols-7 gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((r) => (
            <button
              key={r}
              onClick={() => setRuns(r)}
              className={`py-3 rounded-xl font-bold text-lg transition ${
                runs === r
                  ? r === 4 ? "bg-green-500 text-white" : r === 6 ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-3">Extras</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: "isWide", label: "Wide" },
            { key: "isNoBall", label: "No Ball" },
            { key: "isBye", label: "Bye" },
            { key: "isLegBye", label: "Leg Bye" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleExtra(key)}
              className={`py-2 rounded-xl text-sm font-semibold transition ${
                extras[key] ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Wicket */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <button
          onClick={() => setIsWicket((v) => !v)}
          className={`w-full py-3 rounded-xl font-bold text-lg transition ${
            isWicket ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-red-50"
          }`}
        >
          {isWicket ? "⚡ WICKET!" : "Wicket"}
        </button>
      </div>

      {/* Commentary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Commentary (optional)</label>
        <input
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          placeholder="e.g. Bowled him! Clean bowled."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-lg transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Record Delivery"}
      </motion.button>
    </div>
  );
}

// ── Main ScoreInput page ──────────────────────────────────────────────────────
export default function ScoreInput() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatch = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/matches/${matchId}`, { credentials: "include" });
      const data = await res.json();
      if (data?.data) setMatch(data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => { fetchMatch(); }, [fetchMatch]);

  // Keep in sync with socket updates from other scorers
  useEffect(() => {
    socket.connect();
    socket.emit("join:match", matchId);
    socket.on("match:updated", (updated) => {
      if (updated._id === matchId) setMatch(updated);
    });
    return () => {
      socket.emit("leave:match", matchId);
      socket.off("match:updated");
      socket.disconnect();
    };
  }, [matchId]);

  const handleStartMatch = async (tossData) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/matches/${matchId}/start`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tossData),
      });
      const data = await res.json();
      if (data?.data) setMatch(data.data);
    } catch (err) {
      setError("Failed to start match");
    }
  };

  const handleDelivery = async (deliveryData) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/matches/${matchId}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(deliveryData),
      });
      const data = await res.json();
      if (data?.data) setMatch(data.data);
      else setError(data?.message || "Error recording delivery");
    } catch (err) {
      setError("Failed to record delivery");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!match) return <div className="min-h-screen flex items-center justify-center text-gray-400">Match not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
            <FaArrowLeft /> Back
          </button>
          <span className={`flex items-center gap-1 text-xs font-bold uppercase ${match.status === "live" ? "text-green-500" : "text-gray-400"}`}>
            {match.status === "live" && <FaCircle className="text-[8px] animate-pulse" />}
            {match.status}
          </span>
        </div>

        <h1 className="text-xl font-extrabold text-gray-800 mb-1">
          {match.team1} vs {match.team2}
        </h1>
        <p className="text-sm text-gray-500 mb-5">{match.round} · {match.overs} overs</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {match.status === "completed" || match.status === "abandoned" ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-lg font-bold text-gray-700 mb-2">Match {match.status}</p>
            {match.result && <p className="text-indigo-600 font-semibold">{match.result}</p>}
          </div>
        ) : match.status === "upcoming" ? (
          <TossSetup match={match} onStart={handleStartMatch} />
        ) : (
          <DeliveryPanel match={match} onDelivery={handleDelivery} />
        )}
      </div>
    </div>
  );
}
