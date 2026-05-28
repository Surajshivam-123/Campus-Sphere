import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Smooth scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-2xl transition-all duration-300 group flex items-center justify-center border bg-[var(--color-surface)] border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] text-[var(--color-gold)] hover:text-white hover:bg-[var(--color-gold)] cursor-pointer"
          style={{
            boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3), 0 8px 10px -6px rgba(245, 158, 11, 0.3)",
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform duration-300" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
