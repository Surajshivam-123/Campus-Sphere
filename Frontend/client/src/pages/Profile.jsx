import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const profile = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/cpsh/users/profile",
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
      <div className="flex justify-center items-center h-screen text-gray-600 text-xl">
        Loading profile...
      </div>
    );

  return (
    <div className="bg-purple-500 h-screen flex justify-center items-center">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[600px] h-[500px] mx-auto mt-12 p-6 bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-3xl border border-purple-100"
    >
      <div className="flex flex-col items-center">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-28 h-28 rounded-full object-cover shadow-md border-4 border-purple-300 mb-4"
          src={user.profileImage || "/default-avatar.png"}
          alt="Profile"
        />
        <h2 className="text-2xl font-bold text-purple-700">{user.name}</h2>
        <p className="text-gray-500 mb-4">{user.email}</p>

        <div className="w-full text-left">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-1 mb-3">
            📋 User Details
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong className="text-gray-800">Username:</strong>{" "}
              <span className="text-indigo-600">{user.username}</span>
            </p>
            <p>
              <strong className="text-gray-800">Joined:</strong>{" "}
              <span className="text-indigo-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div></div>
  );
};

export default Profile;
