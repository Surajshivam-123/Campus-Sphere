import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../config/api";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const profile = async () => {
      try {
        const response = await fetch(
          "${API_URL}/api/cpsh/users/profile",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        console.log("Server Response:", result);
        if (result?.statusCode === 200) {
          setUser(result?.data);
        }
      } catch (error) {
        console.log("Error while getting user from server:", error);
      }
    };
    profile();
  }, []);

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#faf9f6] text-[#374151] text-sm">
        Loading profile…
      </div>
    );

  return (
    <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto p-8 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <div className="flex flex-col items-center">
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-24 h-24 rounded-md object-cover border border-gray-200 mb-4"
            src={user.avatar}
            alt="Profile"
          />
          <h2 className="font-heading text-xl font-semibold text-[#1e3a5f]">{user.name}</h2>
          <p className="text-[#374151] text-sm mb-6">{user.email}</p>
          <div className="w-10 h-px bg-[#b8860b]/40 mb-6" />
          <div className="w-full text-left">
            <h3 className="text-xs font-medium text-[#374151] uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">
              User details
            </h3>
            <div className="space-y-2 text-sm text-[#374151]">
              <p>
                <span className="text-gray-500">Username</span>{" "}
                <span className="font-medium text-[#1e3a5f]">{user.username}</span>
              </p>
              <p>
                <span className="text-gray-500">Joined</span>{" "}
                <span className="font-medium text-[#1e3a5f]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
