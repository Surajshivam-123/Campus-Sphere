import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-400">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="flex flex-col items-center"
      >
        <motion.div
          className="text-white text-5xl font-extrabold tracking-wide"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          🚀 Loading...
        </motion.div>

        <motion.div
          className="mt-6 h-2 w-40 rounded-full bg-white/30 overflow-hidden relative"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
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
