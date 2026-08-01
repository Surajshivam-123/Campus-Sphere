import { useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaFileUpload } from "react-icons/fa";
import Rules from "../EventCreation/Rule";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FormInput from "../../components/shared/FormInput";
import FormSelect from "../../components/shared/FormSelect";
import FormTextarea from "../../components/shared/FormTextarea";
import eventService from "../../services/event.service";

export default function CreateEvent() {
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const [posterSource, setPosterSource] = useState("upload"); // upload | ai
  const [posterPrompt, setPosterPrompt] = useState("");
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [eventData, setEventData] = useState({
    festivalName: "", eventName: "", startDate: "", eventLocation: "",
    organization: "", description: "", mode: "", category: "", sports: "",
    cultural: "", others: "", maxParticipants: 0, poster: "", rules: [],
  });

  const handleRule = (allrules) => setEventData((prev) => ({ ...prev, rules: allrules }));
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventData((prev) => ({ ...prev, poster: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGeneratePoster = async () => {
    if (!posterPrompt.trim()) {
      setErr("Please enter a description for the poster.");
      return;
    }
    setIsGeneratingPoster(true);
    setErr("");
    try {
      const res = await eventService.generatePoster(posterPrompt);
      if (res?.data?.url) {
        setEventData((prev) => ({ ...prev, poster: res.data.url }));
        setImagePreview(res.data.url);
      } else {
        setErr(res?.message || "Failed to generate AI poster.");
      }
    } catch (error) {
      console.error("Error generating poster:", error);
      setErr("Failed to generate AI poster.");
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { eventName, startDate, eventLocation, organization, description, mode, category, maxParticipants } = eventData;
    if (!eventName.trim() || !startDate.trim() || !eventLocation.trim() || !organization.trim() || !description.trim() || !mode.trim() || !category.trim() || !maxParticipants) {
      setErr("All mandatory fields are required.");
      return;
    }
    if (!eventData.poster) {
      setErr("Poster is required.");
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(eventData).forEach(([k, v]) => {
        if (k === "eventLocation") {
          formData.append("location", v);
        } else if (k === "poster") {
          if (posterSource === "upload") {
            formData.append("poster", v);
          }
        } else {
          formData.append(k, v);
        }
      });
      if (posterSource === "ai") {
        formData.append("posterUrl", eventData.poster);
      }
      const result = await eventService.createEvent(formData);
      console.log("Server Response:", result);
      navigate("/events-hosted");
    } catch (error) {
      console.error("Error creating event:", error);
      setErr("Failed to create event. Please try again.");
    }
  };

  return (
    <div
      className="pt-28 min-h-screen px-4 flex justify-center items-start pb-12"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg shadow-sm p-8 w-full max-w-3xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h1
          className="font-heading text-2xl font-semibold mb-2 text-center tracking-tight"
          style={{ color: "var(--color-navy)" }}
        >
          Create new event
        </h1>
        <div
          className="w-12 h-px mx-auto mb-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 50%, transparent)" }}
        />
        <p className="text-xs mb-6 text-center" style={{ color: "var(--color-text-muted)" }}>
          * Mandatory fields
        </p>

        <form className="space-y-6">
          <FormInput label="Festival name" name="festivalName" value={eventData.festivalName} onChange={handleInputChange} placeholder="Enter festival name (if any)" />
          <FormInput label="Event name" required name="eventName" value={eventData.eventName} onChange={handleInputChange} placeholder="Enter event name" />
          <FormInput label="Organization" required name="organization" value={eventData.organization} onChange={handleInputChange} placeholder="Enter organizer name" />
          <FormSelect label="Mode" required name="mode" value={eventData.mode} onChange={handleInputChange} options={["Offline", "Online"]} defaultLabel="-- Select mode --" />
          <FormTextarea label="Description" required rows={4} name="description" value={eventData.description} onChange={handleInputChange} placeholder="Brief description about the event" />

          <div className="grid md:grid-cols-2 gap-6">
            <FormInput label="Date & time" icon={<FaCalendarAlt />} type="datetime-local" required name="startDate" value={eventData.startDate} onChange={handleInputChange} />
            <FormInput label="Location / venue" icon={<FaMapMarkerAlt />} required name="eventLocation" value={eventData.eventLocation} onChange={handleInputChange} placeholder="e.g. Main Auditorium" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormSelect label="Category" required name="category" value={eventData.category} onChange={handleInputChange}
              options={["sports", "coding", "cultural", "workshop", "others"]} defaultLabel="-- Select category --" />
            {eventData.category === "sports" && (
              <FormSelect label="Sports" required name="sports" value={eventData.sports} onChange={handleInputChange}
                options={["cricket", "volleyball", "basketball", "others"]} defaultLabel="-- Select sport --" />
            )}
            {eventData.sports === "others" && (
              <FormInput label="Other sport name" required name="others" value={eventData.others} onChange={handleInputChange} />
            )}
            <FormInput label="Max participants" type="number" required name="maxParticipants" value={eventData.maxParticipants} onChange={handleInputChange} placeholder="e.g. 50" />
          </div>
        </form>

        <Rules save={handleRule} />

        {/* Poster upload */}
        <div className="mt-6">
          <label
            className="block text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <FaFileUpload className="shrink-0" /> Poster / Image *
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
                alt="Event preview"
                className="rounded-md w-1/2 max-h-64 object-cover border"
                style={{ borderColor: "var(--color-border)" }}
              />
            </div>
          )}
        </div>

        {err && <p className="text-sm mt-4" style={{ color: "var(--color-error)" }}>{err}</p>}

        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          type="submit"
          onClick={handleSubmit}
          className="btn-primary w-full mt-6"
        >
          Create event
        </motion.button>
      </motion.div>
    </div>
  );
}
