import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react"; // or use SVG if you don't want this lib
import logo from "../../../public/logo.jpg";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/cpsh/users/logout", {
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
    <nav className="bg-gradient-to-r from-purple-800 via-purple-600 to-purple-500 shadow-xl fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center relative">
        
        {/* Logo (left) */}
        <Link to="/home" className="flex items-center space-x-3">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={logo}
            alt="Campus Sphere Logo"
            className="h-18 w-28  rounded-full border-2 border-white shadow-lg"
          />
        </Link>
        <div><h1 className="text-white text-5xl font-bold">Campus Sphere</h1></div>
        {/* Hamburger Menu (right) */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="cursor-pointer text-white focus:outline-none"
          >
            <Menu size={30} />
          </button>

          <AnimatePresence>
        {menuOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-0 right-0 w-64 h-full bg-white z-50 shadow-xl p-6 space-y-6"
            >
              {/* Close Button */}
              <div className="flex justify-end">
                <button onClick={() => setMenuOpen(false)}>
                  <X size={28} className="text-gray-700" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex flex-col gap-4 text-lg font-medium text-gray-800">
                <Link
                  to="/all-events"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-purple-600"
                >
                  My Events
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-purple-600"
                >
                  Profile
                </Link>
                <button
                  onClick={(e) => {
                    logout(e);
                    setMenuOpen(false);
                  }}
                  className="text-left hover:text-red-600"
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
