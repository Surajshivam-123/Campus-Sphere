import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt, FaFileUpload } from "react-icons/fa";
import Rules from "../EventCreation/Rule";
import { motion } from "framer-motion";
import FormInput from "../../components/shared/FormInput";
import FormSelect from "../../components/shared/FormSelect";
import FormTextarea from "../../components/shared/FormTextarea";
import eventService from "../../services/event.service";
import LoadingPage from "../LoadingPage";

function UpdateEventForm({ event, onSubmit }) {
  const [formData, setFormData] = useState(event);
  const [posterSource, setPosterSource] = useState("upload"); // upload | ai
  const [posterPrompt, setPosterPrompt] = useState("");
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [imagePreview, setImagePreview] = useState(event.poster || null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, poster: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGeneratePoster = async () => {
    if (!posterPrompt.trim()) {
      alert("Please enter a description for the poster.");
      return;
    }
    setIsGeneratingPoster(true);
    try {
      const res = await eventService.generatePoster(posterPrompt);
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, poster: res.data.url }));
        setImagePreview(res.data.url);
      } else {
        alert(res?.message || "Failed to generate AI poster.");
      }
    } catch (error) {
      console.error("Error generating poster:", error);
      alert("Failed to generate AI poster.");
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";
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
        <FormInput name="festivalName" label="Festival name" value={formData.festivalName || ""} onChange={handleChange} />
        <FormInput name="eventName" label="Event name" value={formData.eventName || ""} onChange={handleChange} required />
        <FormInput name="organization" label="Organization" value={formData.organization || ""} onChange={handleChange} required />
        <FormSelect name="mode" label="Mode" value={formData.mode || ""} onChange={handleChange}
          options={["Offline", "Online"]} defaultLabel="-- Select mode --" required />
        <FormInput type="datetime-local" name="startDate" label="Start date & time"
          icon={<FaCalendarAlt />} value={formatDateTimeLocal(formData.startDate)} onChange={handleChange} required />
        <FormInput name="maxParticipants" label="Max participants" value={formData.maxParticipants || 0}
          onChange={handleChange} type="number" required />
        <FormTextarea name="description" label="Description" value={formData.description || ""}
          onChange={handleChange} rows={4} required />
      </form>

      <Rules save={handleRule} oldrule={formData.rules} />

      {/* Poster / Image Section */}
      <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
        <label
          className="block text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <FaFileUpload className="shrink-0" /> Event Poster / Image
        </label>
        <div className="flex gap-4 border-b border-gray-100 pb-2 mb-4">
          <button
            type="button"
            onClick={() => setPosterSource("upload")}
            className={`text-xs font-semibold uppercase tracking-wider pb-1 transition ${
              posterSource === "upload"
                ? "border-b-2 border-[#1e3a5f] text-[#1e3a5f]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setPosterSource("ai")}
            className={`text-xs font-semibold uppercase tracking-wider pb-1 transition ${
              posterSource === "ai"
                ? "border-b-2 border-[#1e3a5f] text-[#1e3a5f]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            AI Generated
          </button>
        </div>

        {posterSource === "upload" ? (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full max-w-xs text-sm"
            style={{ color: "var(--color-text-muted)" }}
          />
        ) : (
          <div className="space-y-3 max-w-md">
            <input
              type="text"
              placeholder="Describe event poster (e.g. Neon hackathon coding contest banner)"
              value={posterPrompt}
              onChange={(e) => setPosterPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
            <button
              type="button"
              disabled={isGeneratingPoster}
              onClick={handleGeneratePoster}
              className="bg-[#b8860b] hover:bg-[#9a7009] text-white text-xs font-semibold px-4 py-2 rounded transition disabled:opacity-60"
            >
              {isGeneratingPoster ? "Generating Poster..." : "Generate AI Poster"}
            </button>
          </div>
        )}

        {imagePreview && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">Poster Preview:</p>
            <img
              src={imagePreview}
              alt="Event poster preview"
              className="rounded-md w-1/2 max-h-64 object-cover border"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
        )}
      </div>

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
      const data = new FormData();
      Object.entries(updatedData).forEach(([k, v]) => {
        if (k === "poster") {
          if (v instanceof File) {
            data.append("poster", v);
          }
        } else if (k === "rules" && Array.isArray(v)) {
          v.forEach((rule) => data.append("rules", rule));
        } else {
          data.append(k === "eventLocation" || k === "location" ? "location" : k, v);
        }
      });

      if (typeof updatedData.poster === "string" && updatedData.poster.startsWith("http")) {
        data.append("posterUrl", updatedData.poster);
      }

      await eventService.updateEvent(eventId, data);
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
