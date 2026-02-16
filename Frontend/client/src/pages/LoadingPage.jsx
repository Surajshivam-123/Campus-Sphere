import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#faf9f6]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div
          className="font-heading text-[#1e3a5f] text-2xl font-semibold tracking-tight"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Loading…
        </motion.div>
        <motion.div
          className="mt-6 h-0.5 w-32 rounded bg-[#e0e0e0] overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full bg-[#b8860b] rounded"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
