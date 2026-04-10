import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function IamChoice() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg shadow-sm p-10 w-full max-w-md text-center space-y-8 border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h1
          className="font-heading text-3xl font-semibold tracking-tight"
          style={{ color: "var(--color-navy)" }}
        >
          I am
        </h1>
        <div
          className="w-12 h-px mx-auto"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 50%, transparent)" }}
        />
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => navigate("/joinMember")}
            className="btn-primary w-full sm:w-auto px-6 py-3"
          >
            Member
          </button>
          <button
            onClick={() => navigate("/join-event")}
            className="btn-secondary w-full sm:w-auto px-6 py-3"
          >
            Participant
          </button>
        </div>
      </motion.div>
    </div>
  );
}
