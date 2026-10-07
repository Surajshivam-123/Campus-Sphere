import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, CheckCircle2, X } from "lucide-react";

const MotionDiv = motion.div;

export default function CopyToClipboard({
  textToCopy,
  message = "Code is copied to clipboard",
  alertMessage,
  className = "",
  style = {},
  children,
  ...props
}) {
  const [copied, setCopied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertKey, setAlertKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }

    if (textToCopy === undefined || textToCopy === null) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(textToCopy));
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = String(textToCopy);
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setAlertKey((prev) => prev + 1);
      setShowAlert(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setCopied(false);
        setShowAlert(false);
      }, 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const displayText = alertMessage || message;

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors focus-visible:outline-none cursor-pointer ${className}`}
        style={{
          ...(copied
            ? {
                borderColor: "color-mix(in srgb, var(--color-success) 40%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--color-success) 10%, transparent)",
                color: "var(--color-success)",
              }
            : {
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }),
          ...style,
        }}
        {...props}
      >
        {children ? (
          typeof children === "function" ? (
            children({ copied, handleCopy })
          ) : (
            children
          )
        ) : (
          <>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </>
        )}
      </button>

      {mounted &&
        createPortal(
          <div className="fixed top-5 right-5 z-[9999] pointer-events-none flex flex-col items-end gap-2">
            <AnimatePresence>
              {showAlert && (
                <MotionDiv
                  key={alertKey}
                  initial={{ opacity: 0, y: -16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  role="status"
                  aria-live="polite"
                  className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md select-none"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "color-mix(in srgb, var(--color-success) 35%, transparent)",
                    color: "var(--color-text-primary)",
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-success) 15%, transparent)",
                      color: "var(--color-success)",
                    }}
                  >
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-medium tracking-tight">
                    {displayText}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAlert(false)}
                    className="ml-1 p-1 rounded-md transition-colors opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                    style={{ color: "var(--color-text-secondary)" }}
                    aria-label="Close notification"
                  >
                    <X size={14} />
                  </button>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </>
  );
}
