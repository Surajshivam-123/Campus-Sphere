import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../config/api";
import fetchWithAuth from "../config/fetchWithAuth";
import { formatDate } from "../utils/helpers";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/cpsh/users/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result?.statusCode === 200) setUser(result?.data);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    load();
  }, []);

  if (!user)
    return (
      <div
        className="flex justify-center items-center min-h-screen text-sm"
        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}
      >
        Loading profile…
      </div>
    );

  return (
    <div
      className="min-h-screen flex justify-center items-center py-12 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto p-8 rounded-lg shadow-sm border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex flex-col items-center">
          {user.avatar ? (
            <motion.img
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-24 h-24 rounded-md object-cover border mb-4"
              style={{ borderColor: "var(--color-border)" }}
              src={user.avatar}
              alt="Profile"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-md border mb-4 flex items-center justify-center text-white text-3xl font-semibold select-none"
              style={{ backgroundColor: "var(--color-navy)", borderColor: "var(--color-border)" }}
            >
              {user.fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <h2
            className="font-heading text-xl font-semibold"
            style={{ color: "var(--color-navy)" }}
          >
            {user.fullname}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>

          <div
            className="w-10 h-px mb-6"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
          />

          <div className="w-full text-left">
            <h3
              className="text-xs font-medium uppercase tracking-wider border-b pb-2 mb-3"
              style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}
            >
              User details
            </h3>
            <div className="space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <p>
                <span style={{ color: "var(--color-text-muted)" }}>Username </span>
                <span className="font-medium" style={{ color: "var(--color-navy)" }}>{user.username}</span>
              </p>
              <p>
                <span style={{ color: "var(--color-text-muted)" }}>Joined </span>
                <span className="font-medium" style={{ color: "var(--color-navy)" }}>{formatDate(user.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
