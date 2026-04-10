import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaUserClock } from "react-icons/fa";
import memberService from "../../services/member.service";

export default function MemberRequests({ eventId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      try {
        const result = await memberService.getJoinRequests(eventId);
        if (result?.success) setRequests(result.data || []);
        else setError(result?.message || "Failed to load requests");
      } catch (err) {
        setError(err?.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const handle = async (requestId, action) => {
    setActing(requestId);
    try {
      const result = await memberService.handleJoinRequest(requestId, action);
      if (result?.success) setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Failed to handle request", err);
    } finally {
      setActing(null);
    }
  };

  if (loading) return (
    <p className="text-sm py-4 text-center" style={{ color: "var(--color-text-muted)" }}>
      Loading requests…
    </p>
  );

  if (error) return <div className="alert-error">{error}</div>;

  if (requests.length === 0) return (
    <div
      className="flex items-center gap-2 text-sm py-4 justify-center"
      style={{ color: "var(--color-text-muted)" }}
    >
      <FaUserClock /> No pending join requests.
    </div>
  );

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {requests.map((req) => (
          <motion.div
            key={req._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between rounded-lg px-4 py-3 border"
            style={{
              backgroundColor: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>
                {req.requester?.fullname || req.requester?.username}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                @{req.requester?.username}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handle(req._id, "approve")}
                disabled={acting === req._id}
                className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded transition disabled:opacity-50"
                style={{ backgroundColor: "var(--color-success)" }}
              >
                <FaCheckCircle /> Approve
              </button>
              <button
                onClick={() => handle(req._id, "reject")}
                disabled={acting === req._id}
                className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded transition disabled:opacity-50"
                style={{ backgroundColor: "var(--color-error)" }}
              >
                <FaTimesCircle /> Reject
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
