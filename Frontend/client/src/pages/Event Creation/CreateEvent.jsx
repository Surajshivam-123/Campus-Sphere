import { useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaFileUpload } from "react-icons/fa";
import Rules from "./Rule";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [err, seterr] = useState("");
  const [eventData, setEventdata] = useState({
    festivalName: "",
    eventName: "",
    eventDate: "",
    eventLocation: "",
    organization: "",
    description: "",
    mode: "",
    category: "",
    sports: "",
    others: "",
    maxParticipants: 0,
    imagePreview: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventdata((prev) => ({
        ...prev,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      eventName,
      eventDate,
      eventLocation,
      organization,
      description,
      mode,
      category,
      totalParticipants,
    } = eventData;
    if (
      !eventName.trim() ||
      !eventDate.trim() ||
      !eventLocation.trim() ||
      !organization.trim() ||
      !description.trim() ||
      !mode.trim() ||
      !category.trim() ||
      !totalParticipants
    ) {
      seterr("All mandatory fields are required.");
      return;
    }
    if (eventData.category === "Sports") {
      navigate(
        `/event/${eventData.eventName}/${eventData.category}/${eventData.sports=== "others" ? eventData.others : eventData.sports}`,
        { state: eventData }
      );
    }
    else{
      navigate(
        `/event/${eventData.eventName}/${eventData.category}`,
        { state: eventData }
      );
    }
    console.log("Event Created!");
  };

  return (
    <div className="pt-28 min-h-screen bg-gradient-to-r from-purple-400 to-blue-500 px-4 flex justify-center items-start">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-purple-700 mb-6 text-center">
          Create New Event
        </h1>
        <p>*-Mandatory fields</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Festival name
            </label>
            <input
              type="text"
              name="festivalName"
              value={eventData.festivalName}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
              placeholder="Enter festival name (if any)"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Event Name *
            </label>
            <input
              type="text"
              required
              name="eventName"
              value={eventData.eventName}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
              placeholder="Enter event name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Organization *
            </label>
            <input
              type="text"
              required
              name="organization"
              value={eventData.organization}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
              placeholder="Enter organizer name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mode *
            </label>
            <select
              required
              name="mode"
              value={eventData.mode}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
            >
              <option>-- Select Mode of Event --</option>
              <option value={"Offline"}>Offline</option>
              <option value={"Online"}>Online</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description *
            </label>
            <textarea
              rows="4"
              required
              name="description"
              value={eventData.description}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
              placeholder="Brief description about the event"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className=" text-gray-700 font-medium mb-1 flex items-center">
                <FaCalendarAlt className="mr-2" /> Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                name="eventDate"
                value={eventData.eventDate}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
              />
            </div>

            <div>
              <label className=" text-gray-700 font-medium mb-1 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Location / Venue *
              </label>
              <input
                type="text"
                required
                name="eventLocation"
                value={eventData.eventLocation}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
                placeholder="e.g. Main Auditorium"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Category *
              </label>
              <select
                required
                name="category"
                value={eventData.category}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
              >
                <option value="">-- Select Category --</option>
                <option value="sports">Sports</option>
                <option value="coding">Coding</option>
                <option value="cultural">Cultural</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            {eventData.category === "sports" && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Sports *
                </label>
                <select
                  required
                  name="sports"
                  value={eventData.sports}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
                >
                  <option value="">-- Select Sports --</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Basketball">Basketball</option>
                  <option value="others">others</option>
                </select>
              </div>
            )}
            {eventData.sports === "others" && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Please specify name of other event
                </label>
                <input
                  type="text"
                  required
                  name="others"
                  value={eventData.others}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
                />
              </div>
            )}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Max Participants *
              </label>
              <input
                type="number"
                required
                name="totalParticipants"
                value={eventData.totalParticipants}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
                placeholder="e.g. 50"
              />
            </div>
          </div>
          <Rules />
          <div>
            <label className=" text-gray-700 font-medium mb-1 flex items-center">
              <FaFileUpload className="mr-2" /> Upload Poster / Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-[30%] text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200"
            />
            {eventData.imagePreview && (
              <img
                src={eventData.imagePreview}
                alt="Event Preview"
                className="mt-3 rounded-md w-[20%] max-h-64 object-cover shadow"
              />
            )}
          </div>
          <p className="text-red-500 text-xs">{err}</p>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition duration-200"
            onClick={handleSubmit}
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
