import React, { useEffect, useState } from "react";
import axios from "axios";

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
        console.log("Error while getting user from server:",error)
      }
    };
    profile();
  });
  
  if (!user) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <div className="flex flex-col items-center">
        <img
          className="w-24 h-24 rounded-full object-cover mb-4"
          src={user.profileImage || "/default-avatar.png"}
          alt="Profile"
        />
        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
        <div className="mt-4 w-full">
          <h3 className="text-lg font-medium mb-2">Details</h3>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
