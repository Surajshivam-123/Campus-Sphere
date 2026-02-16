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
import LoadingPage from "../LoadingPage";

export default function CricketEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  if (!eventId) {
    console.log("EventId is not available");
  }
  const [editableMemberId, setEditableMemberId] = useState(null);
  const [editedRoles, setEditedRoles] = useState({});
  const [event, setevent] = useState(null);
  const [member, setMember] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  useEffect(() => {
    const loadEvent = async () => {
      const result = await getsingleEvent(eventId);
      setevent(result?.data);
      const response = await fetch(
        `http://localhost:3000/api/cpsh/members/get-member/${eventId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const member = await response.json();
      console.log("Server Response", member);
      setMember(member?.data?.members);
      setOwnerName(member?.data?.ownerName);
    };
    loadEvent();
  }, []);

  if (!event) {
    return (
      <div>
        <LoadingPage />
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
    poster,
    createdAt,
  } = event;

  let members = [];
  for (let i = 0; i < (member?.length || 0); i++) {
    members.push({_id:member[i]._id , name: member[i].name, role: member[i].role });
  }
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
  const handleSaveRole = async (memberId) => {
  try {
    const role = editedRoles[memberId];
    const response = await fetch(
      `http://localhost:3000/api/cpsh/members/edit-role/${memberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role }),
      }
    );
    const result = await response.json();
    console.log("Server Resposne",result)
    if (result.success) {
      const updatedMembers = member.map((m) =>
        m._id === memberId ? { ...m, role } : m
      );
      setMember(updatedMembers);
      setEditableMemberId(null);
    } else {
      console.error("Failed to update role");
    }
  } catch (error) {
    console.error("Error updating role:", error);
  }
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
                  <th className="py-2 px-4 border-b">Edit Role</th>
                </tr>
              </thead>
              <tbody>
                <tr  className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{ownerName} (You)</td>
                  <td className="py-2 px-4 border-b">Organizer</td>
                 <td className="py-2 px-4 border-b">N/A</td>
                </tr>
                {members.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{member.name}</td>
                    <td className="py-2 px-4 border-b">
                      {editableMemberId === member._id ? (
                        <input
                          type="text"
                          value={editedRoles[member._id] || member.role}
                          onChange={(e) =>
                            setEditedRoles({
                              ...editedRoles,
                              [member._id]: e.target.value,
                            })
                          }
                          className="border-b border-gray-300 focus:outline-none px-2 py-1 rounded"
                        />
                      ) : (
                        member.role || "N/A"
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editableMemberId === member._id ? (
                        <button
                          onClick={() => handleSaveRole(member._id)}
                          className="cursor-pointer text-green-600 font-semibold"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditableMemberId(member._id)}
                          className="cursor-pointer text-blue-600 font-semibold"
                        >
                          Edit
                        </button>
                      )}
                    </td>
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
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105"
            >
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
