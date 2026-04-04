import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCircle, FaLock } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import API_URL from "../../config/api";
import socket from "../../config/socket";
import useEventAccess from "../../hooks/useEventAccess";

function InningsTable({ innings, label }) {
  if (!innings?.battingTeam) return null;
  const ovDisp = `${innings.overs}.${innings.balls}`;

  return (
    <div className="mb-6">
      <h3 className="font-bold text-indigo-700 text-base mb-2">
        {label} — {innings.battingTeam}:{" "}
        <span className="text-gray-900 text-xl">{innings.runs}/{innings.wickets}</span>
        <span className="text-sm text-gray-500 ml-2">({ovDisp} ov)</span>
        {innings.extras > 0 && <span className="text-xs text-gray-400 ml-2">Extras: {innings.extras}</span>}
      </h3>

      {innings.batsmen?.length > 0 && (
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-indigo-50 text-indigo-700">
                <th className="px-3 py-2 rounded-tl-lg">Batsman</th>
                <th className="px-3 py-2 text-center">R</th>
                <th className="px-3 py-2 text-center">B</th>
                <th className="px-3 py-2 text-center">4s</th>
                <th className="px-3 py-2 text-center">6s</th>
                <th className="px-3 py-2 text-center rounded-tr-lg">SR</th>
              </tr>
            </thead>
            <tbody>
              {innings.batsmen.map((b, i) => (
                <tr key={i} className={`border-b border-gray-100 ${b.isOnStrike && !b.isOut ? "bg-yellow-50" : ""}`}>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {b.name}
                    {b.isOut ? <span className="text-xs text-red-400 ml-1">(out)</span>
                      : b.isOnStrike ? <span className="text-xs text-green-600 ml-1">*</span> : ""}
                  </td>
                  <td className="px-3 py-2 text-center font-bold">{b.runs}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.balls}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.fours}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.sixes}</td>
                  <td className="px-3 py-2 text-center text-gray-500">
                    {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {innings.bowlers?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-purple-50 text-purple-700">
                <th className="px-3 py-2 rounded-tl-lg">Bowler</th>
                <th className="px-3 py-2 text-center">O</th>
                <th className="px-3 py-2 text-center">R</th>
                <th className="px-3 py-2 text-center">W</th>
                <th className="px-3 py-2 text-center rounded-tr-lg">Econ</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowlers.map((b, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-800">{b.name}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.overs}.{b.balls}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.runs}</td>
                  <td className="px-3 py-2 text-center font-bold">{b.wickets}</td>
                  <td className="px-3 py-2 text-center text-gray-500">
                    {b.overs > 0 ? (b.runs / b.overs).toFixed(2) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BallDots({ balls }) {
  if (!balls?.length) return null;
  const recent = [...balls].reverse().slice(0, 30);
  const dotColor = (b) => {
    if (b.isWicket) return "bg-red-500 text-white";
    if (b.isWide || b.isNoBall) return "bg-yellow-400 text-white";
    if (b.runs === 6) return "bg-indigo-600 text-white";
    if (b.runs === 4) return "bg-green-500 text-white";
    if (b.runs === 0) return "bg-gray-200 text-gray-600";
    return "bg-blue-100 text-blue-800";
  };
  const label = (b) => b.isWicket ? "W" : b.isWide ? "Wd" : b.isNoBall ? "Nb" : b.runs;

  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-700 mb-2 text-sm">Recent Balls</h3>
      <div className="flex flex-wrap gap-2">
        {recent.map((b, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${dotColor(b)}`}
            title={b.commentary}
          >
            {label(b)}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function MatchScorecard() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("scorecard");
  const [connected, setConnected] = useState(false);
  const [flash, setFlash] = useState(false);

  // Derive eventId from match once loaded for access check
  const [eventId, setEventId] = useState(null);
  const { access, loading: accessLoading } = useEventAccess(eventId);

  // Initial fetch
  useEffect(() => {
    fetch(`${API_URL}/api/v1/matches/${matchId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          setMatch(d.data);
          setEventId(d.data.event);
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [matchId]);

  // Socket — only after access confirmed
  useEffect(() => {
    if (!access) return;
    socket.connect();
    socket.emit("join:match", matchId);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("match:updated", (updated) => {
      if (updated._id !== matchId) return;
      setMatch(updated);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    });
    return () => {
      socket.emit("leave:match", matchId);
      socket.off("match:updated");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [matchId, access]);

  if (loading || accessLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  if (!access) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center"
        >
          <FaLock className="text-5xl text-indigo-300 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Only participants, members, players, and the organiser of this event can view live scores.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!match) return <div className="min-h-screen flex items-center justify-center text-gray-400">Match not found</div>;

  const isLive = match.status === "live";
  const currentInn = match.currentInnings === 1 ? match.innings1 : match.innings2;

  const scoreOf = (teamName) => {
    if (match.innings1.battingTeam === teamName)
      return `${match.innings1.runs}/${match.innings1.wickets}`;
    if (match.innings2.battingTeam === teamName)
      return `${match.innings2.runs}/${match.innings2.wickets}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
            <FaArrowLeft /> Back
          </button>
          <span className={`flex items-center gap-1 text-xs font-medium ${connected ? "text-green-500" : "text-gray-400"}`}>
            <FaCircle className="text-[8px]" />
            {connected ? "Live" : "Connecting..."}
          </span>
        </div>

        {/* Match header */}
        <motion.div
          animate={{ backgroundColor: flash ? "#eef2ff" : "#ffffff" }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl shadow-md p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-indigo-500 font-semibold uppercase">{match.round || "Match"}</span>
            <span className={`flex items-center gap-1 text-xs font-bold uppercase ${isLive ? "text-green-500" : "text-gray-400"}`}>
              {isLive && <FaCircle className="text-[8px] animate-pulse" />}
              {match.status}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-center flex-1">
              <p className="font-extrabold text-xl text-gray-800">{match.team1}</p>
              {scoreOf(match.team1) && (
                <p className="text-2xl font-black text-indigo-700">{scoreOf(match.team1)}</p>
              )}
            </div>
            <MdSportsCricket className="text-3xl text-gray-300 mx-4" />
            <div className="text-center flex-1">
              <p className="font-extrabold text-xl text-gray-800">{match.team2}</p>
              {scoreOf(match.team2) && (
                <p className="text-2xl font-black text-indigo-700">{scoreOf(match.team2)}</p>
              )}
            </div>
          </div>

          {match.result && (
            <div className="mt-3 text-center text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl py-2">
              {match.result}
            </div>
          )}
          {isLive && match.currentInnings === 2 && match.innings1.runs > 0 && (
            <div className="mt-2 text-center text-sm text-gray-500">
              Target: <span className="font-bold text-gray-800">{match.innings1.runs + 1}</span>
              {" · "}Need <span className="font-bold">{match.innings1.runs + 1 - match.innings2.runs}</span> off{" "}
              <span className="font-bold">{(match.overs - match.innings2.overs) * 6 - match.innings2.balls}</span> balls
            </div>
          )}
          {match.tossWinner && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Toss: {match.tossWinner} chose to {match.tossDecision}
            </p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["scorecard", "commentary"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-5">
          {tab === "scorecard" ? (
            <>
              {isLive && <BallDots balls={currentInn?.ballByBall} />}
              <InningsTable innings={match.innings1} label="1st Innings" />
              {match.innings2?.battingTeam && <InningsTable innings={match.innings2} label="2nd Innings" />}
            </>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {[...(match.innings2?.ballByBall || []), ...(match.innings1?.ballByBall || [])]
                .reverse()
                .map((b, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50">
                    <span className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      b.isWicket ? "bg-red-500 text-white" : b.runs === 6 ? "bg-indigo-600 text-white" : b.runs === 4 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"
                    }`}>
                      {b.isWicket ? "W" : b.isWide ? "Wd" : b.isNoBall ? "Nb" : b.runs}
                    </span>
                    <p className="text-sm text-gray-700">{b.commentary || `Over ${b.over}.${b.ball} — ${b.runs} run(s)`}</p>
                  </div>
                ))}
              {!match.innings1?.ballByBall?.length && !match.innings2?.ballByBall?.length && (
                <p className="text-gray-400 text-center py-8">No commentary yet</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
