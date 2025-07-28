import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaChalkboardTeacher,
} from "react-icons/fa";
import getsingleEvent from "../../components/getsingleEvent";
import LoadingPage from "../LoadingPage";

export default function CricketEventDetailsPageParticipant() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [teamName, setTeamName] = useState("");
  const [editName, setEditName] = useState(false);
  const [cteam, setcTeam] = useState(false);
  const [teamdata,setTeamdata]=useState(null)
  if (!eventId) {
    console.log("EventId is not available");
  }
  const [event, setevent] = useState(null);
  const [member, setMember] = useState([]);

  useEffect(() => {
    const loadEvent = async () => {
      const result = await getsingleEvent(eventId);
      
      const response =await fetch(`http://localhost:3000/api/cpsh/teams/get-team/${eventId}`,{
        method:"GET",
        headers:{
          "Content-Type":"application/json"
        },
        credentials:"include"
      })
      const team=await response.json();
      console.log("Server Response",team);
      if(team?.success){
        setTeamdata(team?.data);
      }
      setevent(result?.data);
    }
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
  } = event;

  const poster =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s";
  let members = [];
  for (let i = 0; i < (member?.length || 0); i++) {
    members.push({
      _id: member[i]._id,
      name: member[i].name,
      role: member[i].role,
    });
  }
  const team = ["csk", "rcb", "mi", "kkr"];
  const hanldecreateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append("name", teamName);
      formData.append("teamlogo", teamlogo);
      const response = await fetch(
        `http://localhost:3000/api/cpsh/teams/create-team/${eventId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: formData,
        }
      );
      const result=await response.json();
      console.log("Server Response",result);
      if(result.success){
        setcTeam(true);
      }
    } catch (error) {
      console.log("Error in handlecreateTeam",error);
    }
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
      console.log("Server Resposne", result);
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
        </div>
        {!cteam && (
          <button onClick={hanldecreateTeam} className="ml-2 mb-3 rounded px-3 py-1 bg-blue-600 hover:bg-blue-800">
            Create Team
          </button>
        )}
        {cteam && (
          <button className="ml-2 mb-3 rounded px-3 py-1 bg-blue-600 hover:bg-blue-800">
            My Team
          </button>
        )}
        <button className="ml-2 mb-3 rounded px-3 py-1 bg-red-400 hover:bg-red-600">
          Delete Team
        </button>
        <div>
          <div className="flex justify-between p-2 text-xl font-semibold text-gray-800">
            Team Name-
            {editName ? (
              <input
                type="text"
                value={teamName}
                className=" border-b border-gray-300 focus:outline-none px-2 py-1 rounded"
                onChange={(e) => setTeamName(e.target.value)}
              />
            ) : (
              teamName || "N/A"
            )}
            <div className="mr-0">
              {!editName && (
                <button
                  onClick={() => setEditName(true)}
                  className="cursor-pointer text-blue-600 font-semibold"
                >
                  Edit Name
                </button>
              )}
              {editName && (
                <button
                  onClick={() => setEditName(false)}
                  className="cursor-pointer text-green-600 font-semibold"
                >
                  Save Name
                </button>
              )}
            </div>
          </div>
          <h2 className="p-2 text-xl font-semibold text-gray-800">
            Team Code-{}
          </h2>
          <table className="w-full mt-4 text-left border border-gray-300 rounded-md overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Player Name</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Edit Role</th>
              </tr>
            </thead>
            <tbody>
              {/* {team.map((participant, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{participant}</td>
                  </tr>
                ))} */}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
