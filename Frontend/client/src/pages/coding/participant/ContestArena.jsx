import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCode, FaTrophy, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import API_URL from "../../../config/api";
import fetchWithAuth from "../../../config/fetchWithAuth";
import socket from "../../../config/socket";
import LoadingPage from "../../LoadingPage";
import ProblemView from "./ProblemView";
import CodeEditor from "./CodeEditor";

export default function ContestArena() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const timerRef = useRef(null);

  // Load contest + problems + my submissions
  useEffect(() => {
    const load = async () => {
      try {
        const [contestRes, probRes, subRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/v1/coding/contest/${eventId}`),
          fetchWithAuth(`${API_URL}/api/v1/coding/problems/event/${eventId}`),
          fetchWithAuth(`${API_URL}/api/v1/coding/submissions/event/${eventId}/mine`),
        ]);
        const contestData = await contestRes.json();
        const probData = await probRes.json();
        const subData = await subRes.json();

        if (contestData?.data) setContest(contestData.data);
        if (probData?.data) {
          setProblems(probData.data);
          if (probData.data.length > 0) setSelectedProblem(probData.data[0]);
        }
        if (subData?.data) setMySubmissions(subData.data);
      } catch (e) {
        console.error("Error loading contest arena", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  // Countdown timer
  useEffect(() => {
    if (!contest?.endTime || contest.status !== "live") return;
    const tick = () => {
      const secs = Math.max(0, Math.floor((new Date(contest.endTime) - Date.now()) / 1000));
      setTimeLeft(secs);
      if (secs === 0) clearInterval(timerRef.current);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [contest]);

  // Socket: listen for contest events + submission results
  useEffect(() => {
    socket.connect();
    socket.emit("join:contest", eventId);

    socket.on("contest:started", () => {
      window.location.reload(); // simplest way to refresh contest state
    });
    socket.on("contest:ended", () => {
      setContest((prev) => prev ? { ...prev, status: "ended" } : prev);
    });
    socket.on("submission:result", (result) => {
      setMySubmissions((prev) =>
        prev.map((s) => s._id === result.submissionId ? { ...s, ...result } : s)
      );
    });

    return () => {
      socket.emit("leave:contest", eventId);
      socket.off("contest:started");
      socket.off("contest:ended");
      socket.off("submission:result");
      socket.disconnect();
    };
  }, [eventId]);

  const onSubmitSuccess = (newSub) => {
    setMySubmissions((prev) => [newSub, ...prev]);
  };

  const formatTime = (secs) => {
    if (secs === null) return "--:--";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Best status per problem for this user
  const problemStatus = (problemId) => {
    const subs = mySubmissions.filter((s) => s.problem?._id === problemId || s.problem === problemId);
    if (subs.some((s) => s.status === "accepted")) return "accepted";
    if (subs.some((s) => ["wrong_answer", "runtime_error", "time_limit_exceeded", "compilation_error"].includes(s.status))) return "attempted";
    return "none";
  };

  if (loading) return <LoadingPage />;

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center p-8">
          <FaCode className="mx-auto text-5xl mb-4" style={{ color: "var(--color-border)" }} />
          <p className="font-medium" style={{ color: "var(--color-text-secondary)" }}>Contest not set up yet.</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>The organizer hasn't configured this contest.</p>
        </div>
      </div>
    );
  }

  if (contest.status === "draft") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center p-8 rounded-lg border max-w-sm w-full" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <FaClock className="mx-auto text-4xl mb-4" style={{ color: "var(--color-gold)" }} />
          <h2 className="font-heading text-xl font-semibold mb-2" style={{ color: "var(--color-navy)" }}>Contest Not Started</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            The organizer will start the contest soon. This page will update automatically.
          </p>
        </div>
      </div>
    );
  }

  const isEnded = contest.status === "ended";
  const isUrgent = timeLeft !== null && timeLeft < 300; // last 5 min

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{ backgroundColor: "var(--color-navy)", borderColor: "var(--color-navy-light)" }}
      >
        <div className="flex items-center gap-3">
          <FaCode className="text-white" />
          <span className="font-heading font-semibold text-white text-sm">Coding Contest</span>
          {isEnded && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 20%, transparent)", color: "var(--color-error)" }}>
              Ended
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          {!isEnded && (
            <div
              className="flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1 rounded"
              style={{
                backgroundColor: isUrgent ? "color-mix(in srgb, var(--color-error) 20%, transparent)" : "color-mix(in srgb, white 10%, transparent)",
                color: isUrgent ? "#fca5a5" : "white",
              }}
            >
              <FaClock size={12} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => navigate(`/coding/leaderboard/${eventId}`)}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition px-2 py-1 rounded"
            style={{ backgroundColor: "color-mix(in srgb, white 10%, transparent)" }}
          >
            <FaTrophy size={12} /> Leaderboard
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Problem list sidebar */}
        <div
          className="w-48 shrink-0 border-r overflow-y-auto"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="p-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
              Problems
            </p>
            {problems.map((p, i) => {
              const status = problemStatus(p._id);
              return (
                <button
                  key={p._id}
                  onClick={() => setSelectedProblem(p)}
                  className="w-full text-left px-3 py-2.5 rounded mb-1 transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: selectedProblem?._id === p._id ? "color-mix(in srgb, var(--color-navy) 10%, transparent)" : "transparent",
                    borderLeft: selectedProblem?._id === p._id ? `3px solid var(--color-navy)` : "3px solid transparent",
                  }}
                >
                  <span className="text-xs font-mono font-bold w-4" style={{ color: "var(--color-text-muted)" }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--color-navy)" }}>{p.title}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{p.points} pts</p>
                  </div>
                  {status === "accepted" && <FaCheckCircle size={10} style={{ color: "var(--color-success)", shrink: 0 }} />}
                  {status === "attempted" && <FaTimesCircle size={10} style={{ color: "var(--color-error)", shrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main area: problem + editor */}
        {selectedProblem ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Problem statement */}
            <div className="w-2/5 overflow-y-auto border-r" style={{ borderColor: "var(--color-border)" }}>
              <ProblemView problem={selectedProblem} index={problems.indexOf(selectedProblem)} />
            </div>

            {/* Code editor + submission */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <CodeEditor
                problem={selectedProblem}
                eventId={eventId}
                contest={contest}
                mySubmissions={mySubmissions.filter(
                  (s) => s.problem?._id === selectedProblem._id || s.problem === selectedProblem._id
                )}
                onSubmitSuccess={onSubmitSuccess}
                disabled={isEnded}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: "var(--color-text-muted)" }}>
            Select a problem to start
          </div>
        )}
      </div>
    </div>
  );
}
