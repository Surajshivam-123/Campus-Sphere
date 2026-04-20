import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import logo from "/logo.jpg";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    setMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-navy)",
        borderColor: "var(--color-navy-light)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="flex items-center space-x-3">
          <motion.img
            whileHover={{ scale: 1.03 }}
            src={logo}
            alt="Campus Sphere Logo"
            className="h-16 w-24 rounded-md border object-cover"
            style={{ borderColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
          />
        </Link>

        {/* Title */}
        <h1 className="font-heading text-white text-3xl md:text-4xl font-semibold tracking-tight select-none">
          Campus Sphere
        </h1>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 text-white/90 hover:text-white focus:outline-none"
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Slide-out drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-0 right-0 w-64 h-full z-50 shadow-lg p-6 space-y-6 border-l"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 rounded transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                <Link
                  to="/all-events"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors hover:border-[var(--color-gold)]/30 hover:text-[var(--color-navy)]"
                  style={{ "--tw-text-opacity": 1 }}
                >
                  My Events
                </Link>
                <Link
                  to="/clubs"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-navy)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 30%, transparent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  Clubs
                </Link>
                <Link
                  to="/clubs/join"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-navy)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 30%, transparent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  Join a Club
                </Link>
                <Link
                  to="/my-clubs"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-navy)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 30%, transparent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  My Clubs
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-navy)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 30%, transparent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  Profile
                </Link>

                {/* Theme toggle inside drawer too */}
                <button
                  onClick={() => { toggle(); setMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded border border-transparent transition-colors flex items-center gap-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  {isDark ? "Light mode" : "Dark mode"}
                </button>

                <button
                  onClick={handleLogout}
                  className="text-left py-2 px-3 rounded border border-transparent transition-colors"
                  style={{ color: "var(--color-error)" }}
                >
                  Logout
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
