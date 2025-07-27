import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaFlag,
  FaPenAlt,
  FaTrash,
  FaChalkboardTeacher,
  FaTrophy,
} from "react-icons/fa";
import getsingleEvent from "../../components/getsingleEvent";

export default function CricketEventPage() {
  const navigate = useNavigate();
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

  const {
    festivalName,
    eventName,
    startDate,
    location,
    organization,
    description,
    mode,
    category,
    sports,
    maxParticipants,
    rules,
    memberCode,
    participantCode,
    Poster,
    createdAt,
  } = event;

  const poster =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s";
  const members = [
    { name: "suraj", role: "organizer" },
    { name: "shivam", role: "third umpire" },
    { name: "golu", role: " ground umpire" },
    { name: "bholu", role: " ground umpire" },
  ];
  const team = ["csk", "rcb", "mi", "kkr"];

  const handleupdatebutton = () => {
    navigate(`/update-event/${eventId}`);
  };
  const handeldelete = async () => {
    const response = await fetch(
      `http://localhost:3000/api/cpsh/events/delete/${eventId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const result = await response.json();
    console.log("Server response");
    navigate("/events-hosted");
  };
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        {poster && (
          <img
            src={poster}
            alt="Cricket Event Poster"
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold text-blue-800">
              {eventName}
            </h1>
            <p className="text-md font-medium text-blue-600">{festivalName}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
            <p>
              <FaCalendarAlt className="inline-block mr-2 text-blue-500" />
              <strong>Date:</strong> {startDate}
            </p>
            <p>
              <FaMapMarkerAlt className="inline-block mr-2 text-red-500" />
              <strong>Location:</strong> {location}
            </p>
            <p>
              <FaChalkboardTeacher className="inline-block mr-2 text-green-600" />
              <strong>Organized By:</strong> {organization}
            </p>
            <p>
              <strong>Mode:</strong> {mode}
            </p>
            <p>
              <strong>Category:</strong> {category}
            </p>
            <p>
              <strong>Sport:</strong> {sports}
            </p>
            <p>
              <FaUsers className="inline-block mr-2 text-purple-600" />
              <strong>Max Participants:</strong> {maxParticipants}
            </p>
            <p>
              <strong>Participant Code:</strong> {participantCode}
            </p>
            <p>
              <strong>Member Code:</strong> {memberCode}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            <p className="mt-1 text-gray-600 leading-relaxed">{description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Rules</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-1">
              {rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Members</h2>
            <table className="w-full mt-4 text-left border border-gray-300 rounded-md overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">Member Name</th>
                  <th className="py-2 px-4 border-b">Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{member.name}</td>
                    <td className="py-2 px-4 border-b">{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Participants
            </h2>
            <table className="w-full mt-4 text-left border border-gray-300 rounded-md overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">Team</th>
                </tr>
              </thead>
              <tbody>
                {team.map((participant, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{participant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-4 justify-start mt-6">
            <button 
            onClick={() => navigate("/cricket-format")}
            className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105">
              <FaFlag className="inline-block mr-2" />
              Create Format
            </button>
            <button className="cursor-pointer bg-gradient-to-r from-blue-400 to-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105">
              <FaTrophy className="inline-block mr-2" />
              Create Schedule
            </button>
            <button
              onClick={handleupdatebutton}
              className="cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <FaPenAlt className="inline-block mr-2" />
              Update Event
            </button>
            <button
              onClick={handeldelete}
              className="cursor-pointer bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <FaTrash className="inline-block mr-2" />
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
