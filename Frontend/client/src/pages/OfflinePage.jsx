import { useState } from "react";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw, AlertCircle, Database, ShieldAlert, Cpu } from "lucide-react";

export default function OfflinePage({ onRetry }) {
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(false);
  const [retryMessage, setRetryMessage] = useState("");

  const handleRetry = async () => {
    if (checking) return;
    setChecking(true);
    setRetryMessage("");

    // Simulate connection check latency
    setTimeout(() => {
      const isOnlineNow = navigator.onLine;
      setChecking(false);

      if (isOnlineNow) {
        setRetryMessage("Connection restored! Redirecting...");
        if (onRetry) {
          setTimeout(() => onRetry(), 800);
        }
      } else {
        // Trigger shake animation
        setShake(true);
        setRetryMessage("Unable to reach the network. Please check your system settings.");
        setTimeout(() => setShake(false), 600);
      }
    }, 1500);
  };

  const shakeVariants = {
    idle: {},
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, -2, 2, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-6 py-12 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {/* Background ambient decorations */}
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-gold/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-navy-light/10 to-transparent blur-3xl" />
      </div>

      <motion.div
        variants={shakeVariants}
        animate={shake ? "shake" : "idle"}
        className="max-w-md w-full relative z-10 text-center"
      >
        {/* Connection status card wrapper */}
        <div className="bg-surface border border-base rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-sm">
          {/* Card Accent Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy to-gold" />

          {/* Glowing Offline Icon */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer Pulse */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-gold/10 rounded-full blur-xl"
              />
              <div className="h-20 w-20 rounded-full bg-surface-2 border border-base flex items-center justify-center text-gold shadow-md">
                <WifiOff className="h-10 w-10 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="inline-block text-[10px] uppercase tracking-widest font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">
              Error: Connection Lost
            </span>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary tracking-tight">
              Where did the signal go?
            </h1>
            <p className="text-sm text-secondary leading-relaxed">
              It seems you are currently disconnected from the campus network. Please check your internet connection or Wi-Fi status.
            </p>
          </div>

          {/* Diagnostics Panel */}
          <div className="bg-surface-2 border border-base rounded-xl p-4 text-left space-y-3">
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Diagnostics Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-error" /> Network Link
                </span>
                <span className="text-error font-medium">Disconnected</span>
              </div>
              <div className="flex justify-between items-center border-t border-base/50 pt-2">
                <span className="text-secondary flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-gold" /> API Gateway
                </span>
                <span className="text-gold font-medium">Unreachable</span>
              </div>
              <div className="flex justify-between items-center border-t border-base/50 pt-2">
                <span className="text-secondary flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-success" /> Session Cache
                </span>
                <span className="text-success font-medium">Available</span>
              </div>
            </div>
          </div>

          {/* Retry Message */}
          {retryMessage && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs ${shake ? "text-error" : "text-success"} font-medium`}
            >
              {retryMessage}
            </motion.p>
          )}

          {/* Actions */}
          <div className="pt-2">
            <button
              onClick={handleRetry}
              disabled={checking}
              className="w-full btn-gold py-3 flex items-center justify-center gap-2 font-medium tracking-wide shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking System Connection..." : "Check Connection & Retry"}
            </button>
          </div>
        </div>

        {/* Support footer */}
        <p className="text-xs text-muted mt-4">
          Need help? Contact the campus IT helpdesk or reload the page.
        </p>
      </motion.div>
    </div>
  );
}
