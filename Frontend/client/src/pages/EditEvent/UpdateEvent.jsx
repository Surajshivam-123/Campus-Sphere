import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import Rules from "../EventCreation/Rule";
import { motion } from "framer-motion";
import FormInput from "../../components/shared/FormInput";
import FormSelect from "../../components/shared/FormSelect";
import FormTextarea from "../../components/shared/FormTextarea";
import eventService from "../../services/event.service";
import LoadingPage from "../LoadingPage";

function UpdateEventForm({ event, onSubmit }) {
  const [formData, setFormData] = useState(event);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
  };

  const handleRule = (allrules) => setFormData((prev) => ({ ...prev, rules: allrules }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    navigate("/events-hosted");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg shadow-sm p-8 w-full max-w-3xl mx-auto border"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h2
        className="font-heading text-2xl font-semibold mb-2 text-center tracking-tight"
        style={{ color: "var(--color-navy)" }}
      >
        Update event
      </h2>
      <div
        className="w-12 h-px mx-auto mb-6"
        style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 50%, transparent)" }}
      />

      <form className="space-y-6">
        <FormInput name="festivalName" label="Festival name" value={formData.festivalName} onChange={handleChange} />
        <FormInput name="eventName" label="Event name" value={formData.eventName} onChange={handleChange} required />
        <FormInput name="organization" label="Organization" value={formData.organization} onChange={handleChange} required />
        <FormSelect name="mode" label="Mode" value={formData.mode} onChange={handleChange}
          options={["Offline", "Online"]} defaultLabel="-- Select mode --" required />
        <FormInput type="datetime-local" name="startDate" label="Start date & time"
          icon={<FaCalendarAlt />} value={formatDateTimeLocal(formData.startDate)} onChange={handleChange} required />
        <FormInput name="maxParticipants" label="Max participants" value={formData.maxParticipants}
          onChange={handleChange} type="number" required />
        <FormTextarea name="description" label="Description" value={formData.description}
          onChange={handleChange} rows={4} required />
      </form>

      <Rules save={handleRule} oldrule={formData.rules} />

      <div className="mt-6">
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          type="submit"
          onClick={handleSubmit}
          className="btn-primary w-full"
        >
          Save changes
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function UpdateEventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await eventService.getEventById(eventId);
        if (result?.statusCode === 200 || result?.success) setEvent(result?.data);
      } catch (error) {
        console.error("Error loading event:", error);
      }
    };
    load();
  }, [eventId]);

  if (!event) return <LoadingPage />;

  const handleUpdate = async (updatedData) => {
    try {
      await eventService.updateEvent(eventId, updatedData);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <div
      className="pt-28 min-h-screen px-4 pb-12"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <UpdateEventForm event={event} onSubmit={handleUpdate} />
    </div>
  );
}
