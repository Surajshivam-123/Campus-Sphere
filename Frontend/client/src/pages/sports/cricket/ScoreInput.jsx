import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCircle, FaCheckCircle } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import API_URL from "../../../config/api";
import socket from "../../../config/socket";
import fetchWithAuth from "../../../config/fetchWithAuth"
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
            <button key={d} onClick={() => setTossDecision(d)}
              className={`flex-1 py-3 rounded-xl font-semibold capitalize transition ${
                tossDecision === d ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
              }`}
            >{d}</button>
          ))}
        </div>
      </div>
      <button onClick={handleStart} disabled={loading}
        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition disabled:opacity-60">
        {loading ? "Saving toss..." : "Confirm Toss"}
      </button>
    </div>
  );
}

// ── Waiting for squads ────────────────────────────────────────────────────────
function WaitingForSquads({ match }) {
  const team1Done = match.team1Squad?.length > 0;
  const team2Done = match.team2Squad?.length > 0;
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Waiting for Squad Submissions</h2>
      <p className="text-sm text-gray-500">
        Toss done — each captain must now select their playing squad. Once both submit, you can confirm the playing XI.
      </p>
      <div className="space-y-2">
        {[{ name: match.team1, done: team1Done }, { name: match.team2, done: team2Done }].map((t) => (
          <div key={t.name} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 ${
            t.done ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
          }`}>
            <span className="font-medium text-gray-800">{t.name}</span>
            {t.done
              ? <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><FaCheckCircle /> Submitted</span>
              : <span className="text-xs text-gray-400">Pending...</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Playing XI Confirm (scorer picks who's on the ground) ────────────────────
function PlayingXIConfirm({ match, onConfirm }) {
  const [t1XI, setT1XI] = useState([]);
  const [t2XI, setT2XI] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (setter, name) =>
    setter((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]);

  const handleConfirm = async () => {
    if (t1XI.length === 0 || t2XI.length === 0) { setError("Select at least 1 player per team"); return; }
    setLoading(true);
    const toXI = (names, squad) =>
      names.map((n) => ({ name: n, playerId: squad.find((p) => p.name === n)?.playerId }));
    await onConfirm({
      team1PlayingXI: toXI(t1XI, match.team1Squad),
      team2PlayingXI: toXI(t2XI, match.team2Squad),
    });
    setLoading(false);
  };

  const TeamSelector = ({ label, squad, selected, setSelected }) => (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-bold text-gray-700 mb-3">{label} <span className="text-xs text-gray-400 font-normal">({selected.length} selected)</span></h3>
      <div className="space-y-2">
        {squad.map((p) => {
          const isSelected = selected.includes(p.name);
          return (
            <button key={p.name} onClick={() => toggle(setSelected, p.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition ${
                isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-300"
              }`}>
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              <span className={`w-4 h-4 rounded-full border-2 ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Confirm Playing XI</h2>
        <p className="text-sm text-gray-500 mt-1">Both squads submitted. Select who is actually on the ground.</p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <TeamSelector label={match.team1} squad={match.team1Squad} selected={t1XI} setSelected={setT1XI} />
      <TeamSelector label={match.team2} squad={match.team2Squad} selected={t2XI} setSelected={setT2XI} />
      <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-60">
        {loading ? "Confirming..." : "Confirm & Start Match"}
      </motion.button>
    </div>
  );
}

// ── Ball Input Panel ──────────────────────────────────────────────────────────
function DeliveryPanel({ match, onDelivery, onAbandon }) {
  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;

  const battingTeamName = innings.battingTeam;
  const bowlingTeamName = battingTeamName === match.team1 ? match.team2 : match.team1;
  const battingXI = (battingTeamName === match.team1 ? match.team1PlayingXI : match.team2PlayingXI) || [];
  const bowlingXI  = (bowlingTeamName === match.team1 ? match.team1PlayingXI : match.team2PlayingXI) || [];

  // Restore from DB if available (handles page refresh)
  const savedStriker    = innings.currentStriker    || null;
  const savedNonStriker = innings.currentNonStriker || null;
  const savedBowler     = innings.currentBowler     || null;

  const [striker,    setStriker]    = useState(savedStriker);
  const [nonStriker, setNonStriker] = useState(savedNonStriker);
  const [bowler,     setBowler]     = useState(savedBowler);

  // "init" if no players set yet, "new-batsman" after wicket, "new-bowler" after over, null = scoring
  const [prompt, setPrompt] = useState(
    savedStriker && savedNonStriker && savedBowler ? null : "init"
  );

  const [pick, setPick] = useState({ striker: "", nonStriker: "", bowler: "" });

  const [runs,       setRuns]       = useState(0);
  const [extras,     setExtras]     = useState({ isWide: false, isNoBall: false, isBye: false, isLegBye: false });
  const [isWicket,   setIsWicket]   = useState(false);
  const [commentary, setCommentary] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  // Last 6 balls of current over
  const lastBalls = (() => {
    const balls = innings?.ballByBall || [];
    const ov = innings?.overs || 0;
    return balls.filter((b) => b.over === ov).slice(-6);
  })();

  const toggleExtra = (key) =>
    setExtras((prev) => ({ isWide: false, isNoBall: false, isBye: false, isLegBye: false, [key]: !prev[key] }));

  // ── Confirm initial selection ──────────────────────────────────────────────
  const confirmInit = () => {
    if (!pick.striker || !pick.nonStriker || !pick.bowler) return;
    if (pick.striker === pick.nonStriker) return;
    setStriker(pick.striker);
    setNonStriker(pick.nonStriker);
    setBowler(pick.bowler);
    setPrompt(null);
  };

  // ── Confirm new batsman after wicket ──────────────────────────────────────
  const confirmNewBatsman = () => {
    if (!pick.striker) return;
    setStriker(pick.striker);
    setPrompt(null);
  };

  // ── Confirm new bowler after over ─────────────────────────────────────────
  const confirmNewBowler = () => {
    if (!pick.bowler) return;
    setBowler(pick.bowler);
    setPrompt(null);
  };

  // ── Record delivery ───────────────────────────────────────────────────────
  const handleDelivery = async () => {
    if (!striker || !bowler) return;
    setLoading(true);

    const isLegal = !extras.isWide && !extras.isNoBall;

    const updatedMatch = await onDelivery({
      runs,
      isWicket,
      ...extras,
      batsmanName: striker,
      bowlerName:  bowler,
      striker,
      nonStriker,
      commentary:  commentary.trim(),
    });

    // Use server-returned innings state to sync striker/nonStriker/bowler
    const updatedInnings = updatedMatch
      ? (updatedMatch.currentInnings === 1 ? updatedMatch.innings1 : updatedMatch.innings2)
      : null;

    const overDone = isLegal && (innings.balls + 1) % 6 === 0;

    if (isWicket) {
      // Server cleared currentBowler — keep bowler, need new batsman
      if (updatedInnings) {
        setNonStriker(updatedInnings.currentNonStriker || nonStriker);
      }
      setPrompt("new-batsman");
      setPick({ striker: "", nonStriker: nonStriker, bowler });
    } else if (overDone) {
      // Server swapped striker/nonStriker and cleared bowler
      if (updatedInnings) {
        setStriker(updatedInnings.currentStriker || nonStriker);
        setNonStriker(updatedInnings.currentNonStriker || striker);
      } else {
        setStriker(nonStriker);
        setNonStriker(striker);
      }
      setBowler(null);
      setPrompt("new-bowler");
      setPick({ striker: "", nonStriker: "", bowler: "" });
    } else if (!isWicket && isLegal && runs % 2 !== 0) {
      // Odd runs — server swapped, sync locally
      if (updatedInnings) {
        setStriker(updatedInnings.currentStriker || nonStriker);
        setNonStriker(updatedInnings.currentNonStriker || striker);
      } else {
        setStriker(nonStriker);
        setNonStriker(striker);
      }
    }

    setRuns(0);
    setIsWicket(false);
    setExtras({ isWide: false, isNoBall: false, isBye: false, isLegBye: false });
    setCommentary("");
    setLoading(false);
  };

  const dotColor = (b) => {
    if (b.isWicket) return "bg-red-500 text-white";
    if (b.isWide || b.isNoBall) return "bg-yellow-400 text-white";
    if (b.runs === 6) return "bg-indigo-600 text-white";
    if (b.runs === 4) return "bg-green-500 text-white";
    if (b.runs === 0) return "bg-gray-200 text-gray-600";
    return "bg-blue-100 text-blue-800";
  };

  // ── Already-used players (can't bat/bowl again in same role) ──────────────
  const outBatsmen = innings.batsmen?.filter((b) => b.isOut).map((b) => b.name) || [];
  const availableBatsmen = battingXI
    .map((p) => p.name)
    .filter((n) => n !== striker && n !== nonStriker && !outBatsmen.includes(n));
  const availableBowlers = bowlingXI
    .map((p) => p.name)
    .filter((n) => n !== bowler); // can't bowl consecutive overs

  // ── Prompt: initial player selection ──────────────────────────────────────
  if (prompt === "init") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Set Opening Players</h2>
          <p className="text-sm text-gray-500 mt-1">Choose 2 batsmen and the opening bowler to start the innings.</p>
        </div>

        {[
          { label: "Striker (on strike)", key: "striker",    list: battingXI.map(p=>p.name) },
          { label: "Non-striker",         key: "nonStriker", list: battingXI.map(p=>p.name) },
          { label: "Opening Bowler",      key: "bowler",     list: bowlingXI.map(p=>p.name) },
        ].map(({ label, key, list }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
            <select value={pick[key]} onChange={(e) => setPick((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">Select player</option>
              {list.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}

        {pick.striker && pick.nonStriker && pick.striker === pick.nonStriker && (
          <p className="text-red-500 text-xs">Striker and non-striker must be different players.</p>
        )}

        <motion.button whileTap={{ scale: 0.97 }} onClick={confirmInit}
          disabled={!pick.striker || !pick.nonStriker || !pick.bowler || pick.striker === pick.nonStriker}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50">
          Start Innings
        </motion.button>
      </motion.div>
    );
  }

  // ── Prompt: new batsman after wicket ──────────────────────────────────────
  if (prompt === "new-batsman") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏏</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Wicket!</h2>
            <p className="text-sm text-gray-500">Choose the next batsman to come in.</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">New Batsman</label>
          <select value={pick.striker} onChange={(e) => setPick((prev) => ({ ...prev, striker: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">Select batsman</option>
            {availableBatsmen.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
          Non-striker: <span className="font-semibold">{nonStriker}</span> · Bowler: <span className="font-semibold">{bowler}</span>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={confirmNewBatsman}
          disabled={!pick.striker}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition disabled:opacity-50">
          Send In New Batsman
        </motion.button>
      </motion.div>
    );
  }

  // ── Prompt: new bowler after over ─────────────────────────────────────────
  if (prompt === "new-bowler") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔄</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">End of Over {innings.overs}</h2>
            <p className="text-sm text-gray-500">Choose the bowler for the next over.</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Next Bowler</label>
          <select value={pick.bowler} onChange={(e) => setPick((prev) => ({ ...prev, bowler: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">Select bowler</option>
            {availableBowlers.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          {availableBowlers.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">All bowlers available — previous bowler can bowl again.</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
          Striker: <span className="font-semibold">{striker}</span> · Non-striker: <span className="font-semibold">{nonStriker}</span>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={confirmNewBowler}
          disabled={!pick.bowler}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50">
          Start Next Over
        </motion.button>
      </motion.div>
    );
  }

  // ── Main scoring UI ───────────────────────────────────────────────────────
  const oversDisplay = `${innings.overs}.${innings.balls}`;
  const target = match.currentInnings === 2 ? match.innings1.runs + 1 : null;

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

      {/* Active players strip */}
      <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-indigo-50 rounded-xl py-2 px-1">
          <p className="text-xs text-indigo-400 font-semibold">STRIKER</p>
          <p className="font-bold text-indigo-800 truncate">{striker}</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2 px-1">
          <p className="text-xs text-gray-400 font-semibold">NON-STRIKER</p>
          <p className="font-bold text-gray-700 truncate">{nonStriker}</p>
        </div>
        <div className="bg-purple-50 rounded-xl py-2 px-1">
          <p className="text-xs text-purple-400 font-semibold">BOWLER</p>
          <p className="font-bold text-purple-800 truncate">{bowler}</p>
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

      {/* Runs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-3">Runs</p>
        <div className="grid grid-cols-7 gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((r) => (
            <button key={r} onClick={() => setRuns(r)}
              className={`py-3 rounded-xl font-bold text-lg transition ${
                runs === r
                  ? r === 4 ? "bg-green-500 text-white" : r === 6 ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
              }`}>{r}</button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-3">Extras</p>
        <div className="grid grid-cols-4 gap-2">
          {[{ key: "isWide", label: "Wide" }, { key: "isNoBall", label: "No Ball" }, { key: "isBye", label: "Bye" }, { key: "isLegBye", label: "Leg Bye" }]
            .map(({ key, label }) => (
              <button key={key} onClick={() => toggleExtra(key)}
                className={`py-2 rounded-xl text-sm font-semibold transition ${
                  extras[key] ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
                }`}>{label}</button>
            ))}
        </div>
      </div>

      {/* Wicket */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <button onClick={() => setIsWicket((v) => !v)}
          className={`w-full py-3 rounded-xl font-bold text-lg transition ${
            isWicket ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-red-50"
          }`}>
          {isWicket ? "⚡ WICKET!" : "Wicket"}
        </button>
      </div>

      {/* Commentary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Commentary (optional)</label>
        <input value={commentary} onChange={(e) => setCommentary(e.target.value)}
          placeholder="e.g. Bowled him! Clean bowled."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>

      {/* Submit */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelivery} disabled={loading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-lg transition disabled:opacity-60">
        {loading ? "Saving..." : "Record Delivery"}
      </motion.button>

      {/* Abandon */}
      {!confirmAbandon ? (
        <button
          onClick={() => setConfirmAbandon(true)}
          className="w-full py-3 text-sm font-semibold text-red-500 border border-red-200 rounded-2xl hover:bg-red-50 transition"
        >
          Abandon Match
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-red-700 text-center">Are you sure you want to abandon this match?</p>
          <p className="text-xs text-red-400 text-center">The match can be resumed later from Match Manager.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmAbandon(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onAbandon}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
            >
              Yes, Abandon
            </button>
          </div>
        </div>
      )}
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
  const [authorized, setAuthorized] = useState(null);

  const fetchMatch = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}`, { credentials: "include" });
      const data = await res.json();
      if (data?.data) {
        setMatch(data.data);
        const eventId = data.data.event;
        const [eventRes, profileRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`, { credentials: "include" }),
          fetchWithAuth(`${API_URL}/api/cpsh/users/profile`, { credentials: "include" }),
        ]);
        const eventData = await eventRes.json();
        const profileData = await profileRes.json();
        const userId = profileData?.data?._id?.toString();
        const organizer = eventData?.data?.organizer?.toString();
        const scorer = eventData?.data?.scorerUpdater?.toString();
        setAuthorized(userId === organizer || userId === scorer);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => { fetchMatch(); }, [fetchMatch]);

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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}/start`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tossData),
      });
      const data = await res.json();
      if (data?.data) setMatch(data.data);
    } catch (err) { setError("Failed to save toss"); }
  };

  const handleConfirmXI = async (xiData) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}/confirm-xi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(xiData),
      });
      const data = await res.json();
      if (data?.data) setMatch(data.data);
      else setError(data?.message || "Failed to confirm XI");
    } catch (err) { setError("Failed to confirm XI"); }
  };

  const handleDelivery = async (deliveryData) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryData),
      });
      const data = await res.json();
      if (data?.data) {
        setMatch(data.data);
        return data.data; // return so DeliveryPanel can sync state
      } else {
        setError(data?.message || "Error recording delivery");
      }
    } catch (err) { setError("Failed to record delivery"); }
    return null;
  };

  const handleResumeMatch = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "live" }),
      });
      const data = await res.json();
      if (data?.data) setMatch(data.data);
      else setError(data?.message || "Failed to resume match");
    } catch (err) { setError("Failed to resume match"); }
  };

  const handleAbandonMatch = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "abandoned" }),
      });
      const data = await res.json();
      if (data?.data) setMatch(data.data);
      else setError(data?.message || "Failed to abandon match");
    } catch (err) { setError("Failed to abandon match"); }
  };


  if (!match) return <div className="min-h-screen flex items-center justify-center text-gray-400">Match not found</div>;

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 max-w-sm w-full text-center">
          <MdSportsCricket className="text-4xl text-gray-300 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-[#1e3a5f] mb-2">Not Authorized</h2>
          <p className="text-sm text-gray-500 mb-6">Only the host or the assigned scorer can update the scorecard.</p>
          <button onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-medium rounded border border-[#1e3a5f] text-sm transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    if (match.status === "completed") {
      return (
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-lg font-bold text-gray-700 mb-2">Match completed</p>
          {match.result && <p className="text-indigo-600 font-semibold">{match.result}</p>}
        </div>
      );
    }
    if (match.status === "abandoned") {
      return (
        <div className="bg-white rounded-2xl shadow-md p-6 text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <p className="text-lg font-bold text-gray-700">Match Abandoned</p>
          <p className="text-sm text-gray-500">
            This match was stopped. Resume it to continue scoring from where it left off.
          </p>
          {match.result && (
            <p className="text-sm text-gray-400 italic">{match.result}</p>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleResumeMatch}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
          >
            Resume Match
          </motion.button>
        </div>
      );
    }
    if (match.status === "upcoming") return <TossSetup match={match} onStart={handleStartMatch} />;
    if (match.status === "toss_done") return <WaitingForSquads match={match} />;
    if (match.status === "squads_ready") return <PlayingXIConfirm match={match} onConfirm={handleConfirmXI} />;
    return <DeliveryPanel match={match} onDelivery={handleDelivery} onAbandon={handleAbandonMatch} />;
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#1e3a5f] hover:text-[#2d4a6f] font-medium text-sm">
            <FaArrowLeft /> Back
          </button>
          <span className={`flex items-center gap-1 text-xs font-bold uppercase ${match.status === "live" ? "text-green-500" : "text-gray-400"}`}>
            {match.status === "live" && <FaCircle className="text-[8px] animate-pulse" />}
            {match.status.replace("_", " ")}
          </span>
        </div>

        <h1 className="font-heading text-xl font-semibold text-[#1e3a5f] mb-1">{match.team1} vs {match.team2}</h1>
        <p className="text-sm text-gray-500 mb-5">{match.round} · {match.overs} overs</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        {renderStep()}
      </div>
    </div>
  );
}
