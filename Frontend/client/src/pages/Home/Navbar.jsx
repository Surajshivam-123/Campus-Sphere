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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b transition-all duration-300">
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
          <h1 className="font-heading text-[var(--color-text-heading)] text-2xl md:text-3xl font-bold tracking-tight select-none gradient-text">
            Campus Sphere
          </h1>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors focus-visible:outline-none"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1 text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors focus:outline-none"
              aria-label="Open menu"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[60] overflow-hidden pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black pointer-events-auto"
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute top-0 right-0 w-64 h-full shadow-2xl p-6 space-y-6 border-l pointer-events-auto bg-surface border-base"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 rounded transition-colors text-secondary hover:bg-surface-2"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 text-sm font-medium text-secondary">
                <Link
                  to="/all-events"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors hover:border-gold hover:text-navy"
                >
                  My Events
                </Link>
                <Link
                  to="/clubs"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors hover:border-gold hover:text-navy"
                >
                  Clubs
                </Link>
                <Link
                  to="/clubs/join"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors hover:border-gold hover:text-navy"
                >
                  Join a Club
                </Link>
                <Link
                  to="/my-clubs"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors hover:border-gold hover:text-navy"
                >
                  My Clubs
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded border border-transparent transition-colors hover:border-gold hover:text-navy"
                >
                  Profile
                </Link>


                <button
                  onClick={handleLogout}
                  className="text-left py-2 px-3 rounded border border-transparent transition-colors text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
