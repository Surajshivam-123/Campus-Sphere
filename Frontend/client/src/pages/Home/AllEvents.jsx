import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AllEvents() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="font-heading text-4xl font-semibold mb-10 tracking-tight"
        style={{ color: "var(--color-navy)" }}
      >
        My Events
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-lg shadow-sm p-8 w-full max-w-lg space-y-6 border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="text-center">
          <h2
            className="font-heading text-lg font-semibold mb-4 tracking-tight"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Participated
          </h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/my-events-member")}
              className="btn-primary px-5 py-2.5"
            >
              Member
            </button>
            <button
              onClick={() => navigate("/my-events")}
              className="btn-secondary px-5 py-2.5"
            >
              Participant
            </button>
          </div>
        </div>

        <div
          className="border-t pt-6 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => navigate("/events-hosted")}
            className="btn-gold px-6 py-3"
          >
            Hosted Events
          </button>
        </div>
      </motion.div>
    </div>
  );
}
