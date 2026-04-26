import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaCheckCircle, FaUsers } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import API_URL from "../../../config/api";
import fetchWithAuth from "../../../config/fetchWithAuth"
export default function SquadSubmit() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [myTeam, setMyTeam] = useState(null);   // { _id, name, players: [{_id, name, isCaptain}] }
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}`, { credentials: "include" }),
          // profile needed to know which team is ours — we get it from team endpoint
        ]);
        const mData = await mRes.json();
        const m = mData?.data;
        if (!m) { setError("Match not found"); setLoading(false); return; }
        setMatch(m);

        // Fetch captain's team for this event
        const tRes2 = await fetchWithAuth(`${API_URL}/api/cpsh/teams/get-team/${m.event}`);
        const tData = await tRes2.json();
        const team = tData?.data;

        if (!team) {
          setError("You are not a captain of any team in this match");
          setLoading(false);
          return;
        }

        // Verify this team is in the match
        const isTeam1 = m.team1Id?.toString() === team._id?.toString();
        const isTeam2 = m.team2Id?.toString() === team._id?.toString();
        if (!isTeam1 && !isTeam2) {
          setError("Your team is not part of this match");
          setLoading(false);
          return;
        }

        setMyTeam({ _id: team._id, name: team.name, players: team.teamPlayer || [], isTeam1 });

        // If squad already submitted, mark as done and pre-fill selection
        const existingSquad = isTeam1 ? m.team1Squad : m.team2Squad;
        if (existingSquad?.length > 0) {
          setSubmitted(true);
          setSelected(new Set(existingSquad.map((p) => p.name)));
        }
      } catch (e) {
        setError("Failed to load match data");
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [matchId]);

  const toggle = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size < 1) { setError("Select at least 1 player"); return; }
    setSubmitting(true);
    setError("");
    try {
      const players = myTeam.players
        .filter((p) => selected.has(p.name))
        .map((p) => ({ name: p.name, playerId: p._id }));

      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/${matchId}/submit-squad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: myTeam.name, players }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setMatch(data.data);
      } else {
        setError(data.message || "Failed to submit squad");
      }
    } catch (e) {
      setError("Error submitting squad");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <MdSportsCricket className="text-4xl animate-pulse" />
      </div>
    );
  }

  // ── Error (no team found) ────────────────────────────────────────────────
  if (error && !myTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <MdSportsCricket className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const otherTeamName = myTeam?.isTeam1 ? match?.team2 : match?.team1;
  const otherSquadDone = myTeam?.isTeam1 ? match?.team2Squad?.length > 0 : match?.team1Squad?.length > 0;

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-5">
          <FaArrowLeft /> Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <MdSportsCricket className="text-3xl text-yellow-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Playing XI Selection</h1>
            <p className="text-sm text-gray-500">{match?.team1} vs {match?.team2} · {match?.round}</p>
          </div>
        </div>

        {/* Toss result */}
        {match?.tossWinner && (
          <div className="bg-white rounded-xl shadow-sm px-4 py-3 mb-4 text-sm text-gray-600 flex items-center gap-2">
            <span className="font-semibold text-yellow-700">{match.tossWinner}</span>
            <span>won the toss and elected to</span>
            <span className="font-semibold capitalize">{match.tossDecision}</span>
          </div>
        )}

        {/* Status of both teams */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { name: myTeam?.name, done: submitted, isYou: true },
            { name: otherTeamName, done: otherSquadDone, isYou: false },
          ].map((t) => (
            <div key={t.name} className={`rounded-xl px-4 py-3 border-2 text-sm ${
              t.done ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
            }`}>
              <p className="font-semibold text-gray-800 truncate">{t.name} {t.isYou && <span className="text-xs text-gray-400">(you)</span>}</p>
              {t.done
                ? <p className="text-green-600 text-xs flex items-center gap-1 mt-0.5"><FaCheckCircle /> Submitted</p>
                : <p className="text-gray-400 text-xs mt-0.5">Pending...</p>}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            // ── Already submitted ──────────────────────────────────────────
            <motion.div key="done"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <div className="text-center">
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-2" />
                <h2 className="text-lg font-bold text-gray-800">Squad Submitted</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {otherSquadDone
                    ? "Both squads ready. The scorer will now confirm the playing XI."
                    : `Waiting for ${otherTeamName} to submit their squad.`}
                </p>
              </div>

              {/* Show submitted squad */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <FaUsers /> Your submitted squad ({selected.size} players)
                </p>
                <div className="flex flex-wrap gap-2">
                  {[...selected].map((name) => (
                    <span key={name} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {match?.status === "live" && (
                <button onClick={() => navigate(`/sports/cricket/match/${matchId}/scorecard`)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Watch Live
                </button>
              )}
            </motion.div>
          ) : (
            // ── Selection UI ───────────────────────────────────────────────
            <motion.div key="select"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-5 space-y-4">

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-800">{myTeam?.name}</h2>
                  <p className="text-xs text-gray-400">Tap players to select your playing XI</p>
                </div>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {selected.size} selected
                </span>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="space-y-2">
                {myTeam?.players?.map((p) => {
                  const isSelected = selected.has(p.name);
                  return (
                    <motion.button key={p.name} whileTap={{ scale: 0.98 }}
                      onClick={() => toggle(p.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
                      }`}>
                      <span className="font-medium text-gray-800 text-sm">
                        {p.name}
                        {p.isCaptain && (
                          <span className="ml-2 text-xs text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded">C</span>
                        )}
                      </span>
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                        isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                      }`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting || selected.size === 0}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition disabled:opacity-50 shadow-md">
                {submitting ? "Submitting..." : `Submit Squad (${selected.size} players)`}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
