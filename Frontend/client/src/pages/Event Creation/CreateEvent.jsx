import { useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaFileUpload } from "react-icons/fa";
import Rules from "./Rule";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API_URL from "../../config/api.js";

export default function CreateEvent() {
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const [err, seterr] = useState("");
  const [eventData, setEventdata] = useState({
    festivalName: "",
    eventName: "",
    startDate: "",
    eventLocation: "",
    organization: "",
    description: "",
    mode: "",
    category: "",
    sports: "",
    cultural: "",
    others: "",
    maxParticipants: 0,
    poster: "",
    rules: [],
  });

  const handleRule = (allrules) => {
    setEventdata((prev) => ({
      ...prev,
      rules: allrules,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventdata((prev) => ({
        ...prev,
        poster: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const {
        eventName,
        festivalName,
        startDate,
        eventLocation,
        organization,
        description,
        mode,
        category,
        sports,
        cultural,
        others,
        maxParticipants,
        poster,
        rules,
      } = eventData;

      if (
        !eventName.trim() ||
        !startDate.trim() ||
        !eventLocation.trim() ||
        !organization.trim() ||
        !description.trim() ||
        !mode.trim() ||
        !category.trim() ||
        !maxParticipants
      ) {
        seterr("All mandatory fields are required.");
        return;
      }

      const formData = new FormData();
      formData.append("eventName", eventName);
      formData.append("startDate", startDate);
      formData.append("location", eventLocation);
      formData.append("organization", organization);
      formData.append("description", description);
      formData.append("mode", mode);
      formData.append("category", category);
      formData.append("maxParticipants", maxParticipants);
      formData.append("festivalName", festivalName);
      formData.append("sports", sports);
      formData.append("cultural", cultural);
      formData.append("others", others);
      formData.append("poster", poster);
      formData.append("rules", rules);

      const response = await fetch(
        `${API_URL}/api/cpsh/events/create`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("Server Response:", result);
      navigate("/events-hosted");
    } catch (error) {
      console.log("Error while creating event:", error);
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-[#faf9f6] px-4 flex justify-center items-start pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 w-full max-w-3xl"
      >
        <h1 className="font-heading text-2xl font-semibold text-[#1e3a5f] mb-2 text-center tracking-tight">
          Create new event
        </h1>
        <div className="w-12 h-px bg-[#b8860b]/50 mx-auto mb-4" />
        <p className="text-xs text-[#374151] mb-6 text-center">* Mandatory fields</p>

        <form className="space-y-6">
          <Input label="Festival name" name="festivalName" value={eventData.festivalName} onChange={handleInputChange} placeholder="Enter festival name (if any)" />
          <Input label="Event name *" required name="eventName" value={eventData.eventName} onChange={handleInputChange} placeholder="Enter event name" />
          <Input label="Organization *" required name="organization" value={eventData.organization} onChange={handleInputChange} placeholder="Enter organizer name" />
          <Select label="Mode *" required name="mode" value={eventData.mode} onChange={handleInputChange} options={["Offline", "Online"]} defaultLabel="-- Select mode --" />

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">Description *</label>
            <textarea
              required
              rows="4"
              name="description"
              value={eventData.description}
              onChange={handleInputChange}
              placeholder="Brief description about the event"
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label={<><FaCalendarAlt className="mr-2 inline" /> Date & time *</>} type="datetime-local" required name="startDate" value={eventData.startDate} onChange={handleInputChange} />
            <Input label={<><FaMapMarkerAlt className="mr-2 inline" /> Location / venue *</>} required name="eventLocation" value={eventData.eventLocation} onChange={handleInputChange} placeholder="e.g. Main Auditorium" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Select label="Category *" required name="category" value={eventData.category} onChange={handleInputChange}
              options={["sports", "coding", "cultural", "workshop", "others"]}
              defaultLabel="-- Select category --"
            />
            {eventData.category === "sports" && (
              <Select label="Sports *" required name="sports" value={eventData.sports} onChange={handleInputChange}
                options={["cricket", "volleyball", "basketball", "others"]}
                defaultLabel="-- Select sport --"
              />
            )}
            {eventData.sports === "others" && (
              <Input label="Other sport name *" required name="others" value={eventData.others} onChange={handleInputChange} />
            )}
            <Input label="Max participants *" type="number" required name="maxParticipants" value={eventData.maxParticipants} onChange={handleInputChange} placeholder="e.g. 50" />
          </div>
        </form>

        <Rules save={handleRule} />

        <div className="mt-6">
          <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider flex items-center gap-2">
            <FaFileUpload className="shrink-0" /> Upload poster / image *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full max-w-xs text-sm text-[#374151] file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-200 file:text-sm file:font-medium file:bg-[#faf9f6] file:text-[#1e3a5f] hover:file:bg-[#f0ede6]"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Event preview"
              className="mt-3 rounded-md w-1/4 max-h-48 object-cover border border-gray-200"
            />
          )}
        </div>

        {err && <p className="text-red-600 text-sm mt-4">{err}</p>}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          onClick={handleSubmit}
          className="w-full mt-6 bg-[#1e3a5f] text-white font-medium py-2.5 rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition-colors text-sm"
        >
          Create event
        </motion.button>
      </motion.div>
    </div>
  );
}

function Input({ label, ...rest }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">{label}</label>
      <input
        {...rest}
        className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
      />
    </div>
  );
}

function Select({ label, options = [], defaultLabel, ...rest }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">{label}</label>
      <select
        {...rest}
        className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm bg-white"
      >
        <option value="">{defaultLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
