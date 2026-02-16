import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import Rules from "../Event Creation/Rule";
import { motion } from "framer-motion";
import API_URL from "../../config/api.js";

function UpdateEventForm({ event, onSubmit }) {
  const [formData, setFormData] = useState(event);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  function formatDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"
  }

  const handleRule = (allrules) => {
    setFormData((prev) => ({
      ...prev,
      rules: allrules,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    navigate("/events-hosted");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto bg-white p-10 mt-10 rounded-3xl shadow-2xl"
    >
      <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-8 tracking-wide">
       Update Your Event
      </h2>
      <form className="space-y-6">
        <Input
          name="festivalName"
          label="Festival Name"
          value={formData.festivalName}
          onChange={handleChange}
        />
        <Input
          name="eventName"
          label="Event Name"
          value={formData.eventName}
          onChange={handleChange}
        />
        <Input
          name="organization"
          label="Organization"
          value={formData.organization}
          onChange={handleChange}
        />

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Change Mode
          </label>
          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          >
            <option>-- Select Mode of Event --</option>
            <option value={"Offline"}>Offline</option>
            <option value={"Online"}>Online</option>
          </select>
        </div>

        <div>
          <label className="text-gray-700 font-semibold flex items-center mb-2">
            <FaCalendarAlt className="mr-2 text-blue-600" />
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            name="startDate"
            value={formatDateTimeLocal(formData.startDate)}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>

        <Input
          name="maxParticipants"
          label="Max Participants"
          value={formData.maxParticipants}
          onChange={handleChange}
          type="number"
        />

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          ></textarea>
        </div>

      </form>
      <Rules save={handleRule} oldrule={formData.rules} />
      <div className="flex">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all"
          >
            Update Event
          </motion.button>
        </div>
    </motion.div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
      />
    </div>
  );
}

export default function UpdateEventPage() {
  const { eventId } = useParams();
  const [event, setevent] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/cpsh/events/get-single-event/${eventId}`,
          {
            method:"GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const result=await response.json();
        if (result?.statusCode === 200) {
            setevent(result?.data);
        }
      } catch (error) {
        console.log("Error while getting a single event in client side: ",error);
      }
    };
    loadEvent();
  }, []);

  if (!event) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 text-xl text-gray-600">
        Loading event details...
      </div>
    );
  }

  const handleUpdate = async (updatedData) => {
    console.log("Updated Event Data:", updatedData);
    const res = await fetch(
      `${API_URL}/api/cpsh/events/update/${eventId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      }
    );
    const result = await res.json();
    console.log("Server response:", result);
  };

  return <div className="min-h-screen bg-purple-400 py-10">
    <UpdateEventForm event={event} onSubmit={handleUpdate} />
  </div>;
}
