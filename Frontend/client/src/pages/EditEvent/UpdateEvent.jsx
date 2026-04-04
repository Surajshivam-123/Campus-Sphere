import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import Rules from "../EventCreation/Rule";
import { motion } from "framer-motion";
import FormInput from "../../components/shared/FormInput";
import FormSelect from "../../components/shared/FormSelect";
import FormTextarea from "../../components/shared/FormTextarea";
import eventService from "../../services/event.service";

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
        <FormInput
          name="festivalName"
          label="Festival Name"
          value={formData.festivalName}
          onChange={handleChange}
        />
        <FormInput
          name="eventName"
          label="Event Name"
          value={formData.eventName}
          onChange={handleChange}
          required
        />
        <FormInput
          name="organization"
          label="Organization"
          value={formData.organization}
          onChange={handleChange}
          required
        />

        <FormSelect
          name="mode"
          label="Change Mode"
          value={formData.mode}
          onChange={handleChange}
          options={["Offline", "Online"]}
          defaultLabel="-- Select Mode of Event --"
          required
        />

        <FormInput
          type="datetime-local"
          name="startDate"
          label="Start Date & Time"
          icon={<FaCalendarAlt />}
          value={formatDateTimeLocal(formData.startDate)}
          onChange={handleChange}
          required
        />

        <FormInput
          name="maxParticipants"
          label="Max Participants"
          value={formData.maxParticipants}
          onChange={handleChange}
          type="number"
          required
        />

        <FormTextarea
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />

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



export default function UpdateEventPage() {
  const { eventId } = useParams();
  const [event, setevent] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const result = await eventService.getEventById(eventId);
        if (result?.statusCode === 200) {
          setevent(result?.data);
        }
      } catch (error) {
        console.log("Error while getting a single event in client side: ", error);
      }
    };
    loadEvent();
  }, [eventId]);

  if (!event) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 text-xl text-gray-600">
        Loading event details...
      </div>
    );
  }

  const handleUpdate = async (updatedData) => {
    console.log("Updated Event Data:", updatedData);
    try {
      const result = await eventService.updateEvent(eventId, updatedData);
      console.log("Server response:", result);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return <div className="min-h-screen bg-purple-400 py-10">
    <UpdateEventForm event={event} onSubmit={handleUpdate} />
  </div>;
}
