import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react"; // or use SVG if you don't want this lib
import logo from "/logo.jpg";
import API_URL from "../../config/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/cpsh/users/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      console.log("Server Response", result);
      navigate("/");
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <nav className="bg-[#1e3a5f] border-b border-[#2d4a6f] shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center relative">
        {/* Logo (left) */}
        <Link to="/home" className="flex items-center space-x-3">
          <motion.img
            whileHover={{ scale: 1.03 }}
            src={logo}
            alt="Campus Sphere Logo"
            className="h-16 w-24 rounded-md border border-[#c9a227]/40 shadow"
          />
        </Link>
        <div>
          <h1 className="font-heading text-white text-3xl md:text-4xl font-semibold tracking-tight">Campus Sphere</h1>
        </div>
        {/* Hamburger Menu (right) */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="cursor-pointer text-white/90 hover:text-white focus:outline-none p-1"
          >
            <Menu size={28} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="fixed top-0 right-0 w-64 h-full bg-[#faf9f6] border-l border-gray-200 z-50 shadow-lg p-6 space-y-6"
                >
                  <div className="flex justify-end">
                    <button onClick={() => setMenuOpen(false)} className="text-[#374151] hover:text-[#1e3a5f]">
                      <X size={26} />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-1 text-base font-medium text-[#374151]">
                    <Link
                      to="/all-events"
                      onClick={() => setMenuOpen(false)}
                      className="py-2 px-3 rounded border border-transparent hover:border-[#b8860b]/30 hover:text-[#1e3a5f] transition-colors"
                    >
                      My Events
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="py-2 px-3 rounded border border-transparent hover:border-[#b8860b]/30 hover:text-[#1e3a5f] transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={(e) => {
                        logout(e);
                        setMenuOpen(false);
                      }}
                      className="text-left py-2 px-3 rounded border border-transparent hover:border-red-200 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
