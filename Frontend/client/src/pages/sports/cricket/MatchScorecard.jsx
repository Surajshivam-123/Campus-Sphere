import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCircle, FaLock } from "react-icons/fa";
import { MdSportsCricket } from "react-icons/md";
import API_URL from "../../../config/api";
import socket from "../../../config/socket";
import useEventAccess from "../../../hooks/useEventAccess";

function InningsTable({ innings, label }) {
  if (!innings?.battingTeam) return null;
  const ovDisp = `${innings.overs}.${innings.balls}`;

  // Economy: runs per over using total balls bowled
  const economy = (b) => {
    const totalBalls = b.overs * 6 + b.balls;
    if (totalBalls === 0) return "-";
    return ((b.runs / totalBalls) * 6).toFixed(2);
  };

  // Strike rate
  const strikeRate = (b) =>
    b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";

  const batted = innings.batsmen?.filter((b) => b.balls > 0 || b.isOut) || [];
  const didNotBat = innings.batsmen?.filter((b) => b.balls === 0 && !b.isOut) || [];

  return (
    <div className="mb-8">
      {/* Innings header */}
      <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3 mb-3">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{label}</span>
          <h3 className="font-extrabold text-indigo-800 text-lg leading-tight">{innings.battingTeam}</h3>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-gray-900">{innings.runs}/{innings.wickets}</span>
          <p className="text-xs text-gray-500">({ovDisp} ov){innings.extras > 0 ? ` · Extras: ${innings.extras}` : ""}</p>
        </div>
      </div>

      {/* Batting table */}
      {batted.length > 0 && (
        <div className="overflow-x-auto mb-1">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-indigo-50 text-indigo-700 text-xs uppercase tracking-wide">
                <th className="px-3 py-2 rounded-tl-lg w-1/3">Batsman</th>
                <th className="px-3 py-2 text-center">R</th>
                <th className="px-3 py-2 text-center">B</th>
                <th className="px-3 py-2 text-center">4s</th>
                <th className="px-3 py-2 text-center">6s</th>
                <th className="px-3 py-2 text-center rounded-tr-lg">SR</th>
              </tr>
            </thead>
            <tbody>
              {batted.map((b, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-100 transition-colors ${
                    b.isOnStrike && !b.isOut ? "bg-yellow-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-3 py-2 font-semibold text-gray-800">
                    <span>{b.name}</span>
                    {b.isOut
                      ? <span className="ml-1 text-xs font-normal text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full">out</span>
                      : b.isOnStrike
                      ? <span className="ml-1 text-xs font-bold text-green-600">*</span>
                      : <span className="ml-1 text-xs font-normal text-blue-400">not out</span>}
                  </td>
                  <td className="px-3 py-2 text-center font-extrabold text-gray-900">{b.runs}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.balls}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.fours}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.sixes}</td>
                  <td className={`px-3 py-2 text-center font-semibold ${
                    parseFloat(strikeRate(b)) >= 150 ? "text-green-600" :
                    parseFloat(strikeRate(b)) >= 100 ? "text-blue-600" : "text-gray-500"
                  }`}>
                    {strikeRate(b)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Did not bat */}
      {didNotBat.length > 0 && (
        <p className="text-xs text-gray-400 px-3 mb-3">
          Did not bat: {didNotBat.map((b) => b.name).join(", ")}
        </p>
      )}

      {/* Bowling table */}
      {innings.bowlers?.length > 0 && (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-purple-50 text-purple-700 text-xs uppercase tracking-wide">
                <th className="px-3 py-2 rounded-tl-lg w-1/3">Bowler</th>
                <th className="px-3 py-2 text-center">O</th>
                <th className="px-3 py-2 text-center">M</th>
                <th className="px-3 py-2 text-center">R</th>
                <th className="px-3 py-2 text-center">W</th>
                <th className="px-3 py-2 text-center rounded-tr-lg">Econ</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowlers.map((b, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-semibold text-gray-800">{b.name}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.overs}.{b.balls}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.maidens ?? 0}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{b.runs}</td>
                  <td className={`px-3 py-2 text-center font-extrabold ${b.wickets > 0 ? "text-red-600" : "text-gray-700"}`}>
                    {b.wickets}
                  </td>
                  <td className={`px-3 py-2 text-center font-semibold ${
                    parseFloat(economy(b)) <= 6 ? "text-green-600" :
                    parseFloat(economy(b)) <= 9 ? "text-yellow-600" : "text-red-500"
                  }`}>
                    {economy(b)}
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
    fetch(`${API_URL}/api/cpsh/matches/${matchId}`, { credentials: "include" })
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
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 max-w-sm w-full text-center"
        >
          <FaLock className="text-4xl text-gray-300 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-[#1e3a5f] mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Only participants, members, players, and the organiser of this event can view live scores.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-medium rounded border border-[#1e3a5f] text-sm transition"
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
    <div className="min-h-screen bg-[#faf9f6] py-8 px-4">
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

              {/* Live: current batsmen & bowler at a glance */}
              {isLive && currentInn?.batsmen?.length > 0 && (
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentInn.batsmen
                    .filter((b) => !b.isOut && (b.isOnStrike || currentInn.currentNonStriker === b.name))
                    .map((b, i) => (
                      <div key={i} className={`rounded-xl px-4 py-3 border ${b.isOnStrike ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                          {b.isOnStrike ? "On Strike 🏏" : "Non-Striker"}
                        </p>
                        <p className="font-extrabold text-gray-800 text-base">{b.name}</p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          <span className="font-bold text-gray-900">{b.runs}</span>
                          <span className="text-gray-400"> ({b.balls}b)</span>
                          <span className="ml-2 text-xs text-gray-400">
                            SR: <span className="font-semibold text-blue-600">
                              {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}
                            </span>
                          </span>
                          {b.fours > 0 && <span className="ml-2 text-xs text-green-600">{b.fours}×4</span>}
                          {b.sixes > 0 && <span className="ml-1 text-xs text-indigo-600">{b.sixes}×6</span>}
                        </p>
                      </div>
                    ))}
                  {currentInn.bowlers?.filter((b) => b.name === currentInn.currentBowler).map((b, i) => {
                    const totalBalls = b.overs * 6 + b.balls;
                    return (
                      <div key={i} className="rounded-xl px-4 py-3 border border-purple-200 bg-purple-50">
                        <p className="text-xs font-semibold text-purple-400 uppercase mb-1">Current Bowler 🎳</p>
                        <p className="font-extrabold text-gray-800 text-base">{b.name}</p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          <span className="font-bold text-red-600">{b.wickets}W</span>
                          <span className="text-gray-400"> / </span>
                          <span className="font-bold text-gray-900">{b.runs}R</span>
                          <span className="text-gray-400"> ({b.overs}.{b.balls} ov)</span>
                          <span className="ml-2 text-xs text-gray-400">
                            Econ: <span className="font-semibold text-purple-600">
                              {totalBalls > 0 ? ((b.runs / totalBalls) * 6).toFixed(2) : "-"}
                            </span>
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

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
