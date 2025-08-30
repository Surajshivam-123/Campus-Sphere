import { useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaFileUpload } from "react-icons/fa";
import Rules from "./Rule";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
        "http://localhost:3000/api/cpsh/events/create",
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
    <div className="pt-28 min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 px-4 flex justify-center items-start">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white bg-opacity-80 backdrop-blur-lg shadow-2xl rounded-xl p-8 w-full max-w-3xl border border-purple-200"
      >
        <h1 className="text-4xl font-bold text-purple-700 mb-6 text-center">
          🎉 Create New Event
        </h1>
        <p className="text-sm text-red-600 mb-4 italic">* Mandatory fields</p>

        <form className="space-y-6" >
          {/* FESTIVAL NAME */}
          <Input label="Festival name" name="festivalName" value={eventData.festivalName} onChange={handleInputChange} placeholder="Enter festival name (if any)" />

          {/* EVENT NAME */}
          <Input label="Event Name *" required name="eventName" value={eventData.eventName} onChange={handleInputChange} placeholder="Enter event name" />

          {/* ORGANIZATION */}
          <Input label="Organization *" required name="organization" value={eventData.organization} onChange={handleInputChange} placeholder="Enter organizer name" />

          {/* MODE */}
          <Select label="Mode *" required name="mode" value={eventData.mode} onChange={handleInputChange} options={["Offline", "Online"]} defaultLabel="-- Select Mode --" />

          {/* DESCRIPTION */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Description *</label>
            <textarea
              required
              rows="4"
              name="description"
              value={eventData.description}
              onChange={handleInputChange}
              placeholder="Brief description about the event"
              className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
            />
          </div>

          {/* DATE & LOCATION */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input label={<><FaCalendarAlt className="mr-2" /> Date & Time *</>} type="datetime-local" required name="startDate" value={eventData.startDate} onChange={handleInputChange} />
            <Input label={<><FaMapMarkerAlt className="mr-2" /> Location / Venue *</>} required name="eventLocation" value={eventData.eventLocation} onChange={handleInputChange} placeholder="e.g. Main Auditorium" />
          </div>

          {/* CATEGORY */}
          <div className="grid md:grid-cols-2 gap-6">
            <Select label="Category *" required name="category" value={eventData.category} onChange={handleInputChange}
              options={["sports", "coding", "cultural", "workshop", "others"]}
              defaultLabel="-- Select Category --"
            />
            {eventData.category === "sports" && (
              <Select label="Sports *" required name="sports" value={eventData.sports} onChange={handleInputChange}
                options={["cricket", "volleyball", "basketball", "others"]}
                defaultLabel="-- Select Sport --"
              />
            )}
            {eventData.sports === "others" && (
              <Input label="Other Sport Name *" required name="others" value={eventData.others} onChange={handleInputChange} />
            )}
            <Input label="Max Participants *" type="number" required name="maxParticipants" value={eventData.maxParticipants} onChange={handleInputChange} placeholder="e.g. 50" />
          </div>
            </form>
          {/* RULES */}
          <Rules save={handleRule} />

          {/* POSTER */}
          <div>
            <label className="text-gray-700 font-medium mb-1 flex items-center">
              <FaFileUpload className="mr-2" /> Upload Poster / Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-[50%] text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Event Preview"
                className="mt-3 rounded-md w-[25%] max-h-64 object-cover shadow-lg"
              />
            )}
          </div>

          {err && <p className="text-red-500 text-sm">{err}</p>}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition duration-200"
          >
            Create Event
          </motion.button>
        
      </motion.div>
    </div>
  );
}

// REUSABLE INPUT COMPONENT
function Input({ label, ...rest }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-1">{label}</label>
      <input
        {...rest}
        className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
      />
    </div>
  );
}

// REUSABLE SELECT COMPONENT
function Select({ label, options = [], defaultLabel, ...rest }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-1">{label}</label>
      <select
        {...rest}
        className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
      >
        <option value="">{defaultLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
