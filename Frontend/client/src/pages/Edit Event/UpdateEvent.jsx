import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getsingleEvent from "../../components/getsingleevent";
import { useParams } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaFileUpload } from "react-icons/fa";
import Rules from "../Event Creation/Rule";

function UpdateEventForm({ event, onSubmit }) {
  const [formData, setFormData] = useState(event);
  const navigate=useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
     // Trigger parent function (API call, etc.)
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Update Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="festivalName"
          label="Festival Name"
          //   defaultValue={event.festivalName}
          value={formData.festivalName}
          onChange={handleChange}
        />
        <Input
          name="eventName"
          label="Event Name"
          //   defaultValue={event.eventName}
          value={formData.eventName}
          onChange={handleChange}
        />
        <Input
          name="organization"
          label="Organization"
          //   defaultValue={event.organization}
          value={formData.organization}
          onChange={handleChange}
        />
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Change Mode
          </label>
          <select
            name="mode"
            // defaultValue={event.mode}
            value={formData.mode}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
          >
            <option>-- Select Mode of Event --</option>
            <option value={"Offline"}>Offline</option>
            <option value={"Online"}>Online</option>
          </select>
        </div>
        <div>
          <label className=" text-gray-700 font-medium mb-1 flex items-center">
            <FaCalendarAlt className="mr-2" />
            Change Start Date & Time
          </label>
          <input
            type="datetime-local"
            name="startDate"
            //faultValue={event.startDate}
            value={formData.startDate}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
          />
        </div>
        {/* <Input
          name="startDate"
          label="Start Date"
          defaultValue={event.startDate}}
          value={formData.startDate}
          onChange={handleChange}
          type="date"
        /> */}
        <Input
          name="maxParticipants"
          label="Max Participants"
          //defaultValue={event.maxParticipants}
          value={formData.maxParticipants}
          onChange={handleChange}
          type="number"
        />

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            //defaultValue={event.description}
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>
        <Rules save={handleRule} oldrule={formData.rules} />
        <button
          type="submit"
          onClick={handleSubmit}
          className="curosr-pointer bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Update Event
        </button>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        //defaultValue={defaultValue}
        onChange={onChange}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}

export default function UpdateEventPage() {
  const { eventId } = useParams();
  if (!eventId) {
    console.log("EventId is not available");
  }
  const [event, setevent] = useState(null);
  useEffect(() => {
    const loadEvent = async () => {
      const result = await getsingleEvent(eventId);
      setevent(result?.data || null);
    };
    loadEvent();
  }, []);
  if (!event) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading event details...
      </div>
    );
  }
  const handleUpdate = async (updatedData) => {
    console.log("Updated Event Data:", updatedData);
    const res = await fetch(
      `http://localhost:3000/api/cpsh/events/update/${eventId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
        credentials: "include",
      }
    );
    const result = await res.json();
    console.log("Server response:", result);
  };

  return <UpdateEventForm event={event} onSubmit={handleUpdate} />;
}
