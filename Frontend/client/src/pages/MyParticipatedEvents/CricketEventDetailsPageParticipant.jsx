import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaChalkboardTeacher,
} from "react-icons/fa";
import LoadingPage from "../LoadingPage";

export default function CricketEventDetailsPageParticipant() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [teamName, setTeamName] = useState("");
  const [editName, setEditName] = useState(false);
  const [cteam, setcTeam] = useState(0);
  const [teamdata, setTeamdata] = useState(null);
  const [teamlogo, setTeamlogo] = useState(null);
  const [editlogo, setEditlogo] = useState(false);
  const [event, setevent] = useState(null);
  const [deleteVisibility, setdeleteVisibility] = useState(false);
  useEffect(() => {
    const loadEvent = async () => {
      const getsingleEvent = async()=>{
        try {
            const event=await fetch(`http://localhost:3000/api/cpsh/events/get-single-event/${eventId}`,{
                method:"GET",
                headers:{
                    "Content-Type":"application/json"
                },
                credentials:"include"
            })
            const result=await event.json();
            console.log("Server response",result);
            if(!result){
                console.log("No event found");
            }
            setevent(result?.data);
        } catch (error) {
            console.log("Error while getting single event",error);
        }
    }
    getsingleEvent();
      const response = await fetch(
        `http://localhost:3000/api/cpsh/teams/get-team/${eventId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const team = await response.json();
      console.log("Server response", team);
      if (team.data) {
        setTeamdata(team?.data);
        setcTeam(1); //team is present
        setTeamName(team?.data?.name);
        setTeamlogo(team?.data?.teamlogo);
      }
    };
    loadEvent();
  }, []);

  if (!event) {
    return <LoadingPage />;
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
    poster,
  } = event;


  const handleRefresh = () => {
    window.location.reload(); // reloads the page
  };

  const handleFileChange = (e) => {
    setTeamlogo(e.target.files[0]);
  };

  // const handlejoin = async () => {
  //   try {
  //     const response=await fetch(`http://localhost:3000/api/cpsh/cricket-players/join-team/${teamdata?.teamCode}`,{
  //       method:"POST",
  //       credentials:"include"
  //     })
  //     const result=await response.json();
  //     console.log("Server response",result);
  //     if(result?.success){
  //       setcTeam(4);
  //     }
  //     handleRefresh();
  //   } catch (error) {
  //     console.log("Error while joining team", error);
  //   }
  // }
    const handleJoinBtn=()=>{
      navigate(`/join-team/${eventId}`)
    }
      

  const handlecreateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append("name", teamName);
      formData.append("teamlogo", teamlogo);
      const response = await fetch(
        `http://localhost:3000/api/cpsh/teams/create-team/${eventId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("Server response", result);

      if (result.success) {
        setcTeam(1); //team created
      }
      handleRefresh();
    } catch (error) {
      console.log("Error in handlecreateTeam", error);
    }
  };

  const handleUpdateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append("name", teamName);
      formData.append("teamlogo", teamlogo);
      const response = await fetch(
        `http://localhost:3000/api/cpsh/teams/update-team/${eventId}`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("Server response", result);

      if (result?.success) {
        setcTeam(1); //team updated
      }
      handleRefresh();
    } catch (error) {
      console.log("Error in handleUpdateTeam", error);
    }
  };

  const handleSave = () => {
    if (cteam === 2) {
      handlecreateTeam();
      setdeleteVisibility(true);
    } else {
      handleUpdateTeam();
    }
  };
  const handledeleteTeam = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/cpsh/teams/delete-team/${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const result = await response.json();
      console.log("Server response", result);
      if (result?.success) {
        setcTeam(0); //delete team
      }
      setdeleteVisibility(false);
    } catch (error) {
      console.log("Error while deleting team", error);
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
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s"
          alt="Cricket Event Poster"
          className="w-full h-64 object-cover"
        />
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

        <div className="px-6 pb-6 space-x-3">
          {cteam === 0 && (
            <>
              <button
                onClick={() => setcTeam(2)}
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-800 transition shadow"
              >
                Create Team
              </button>
              <button
                onClick={handleJoinBtn}
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-800 transition shadow"
              >
                Join Team
              </button>
            </>
          )}
          {cteam === 1 && (
            <button
              onClick={() => setcTeam(3)}
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-800 transition shadow"
            >
              Edit Team
            </button>
          )}
          {(cteam === 2 || cteam === 3) && (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-800 transition shadow"
            >
              Save Team
            </button>
          )}
          {(cteam === 3 || deleteVisibility) && (
            <button
              onClick={handledeleteTeam}
              className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-700 transition shadow"
            >
              Delete Team
            </button>
          )}
        </div>

        {(cteam === 2 || cteam === 3) && (
          <div className="p-6 bg-gray-50 rounded-xl shadow-md mx-6 mb-6 space-y-6">
            <div className="flex justify-between items-center text-xl font-semibold text-gray-800">
              Team Name:
              {editName ? (
                <input
                  type="text"
                  value={teamName}
                  className="border-b border-gray-300 px-3 py-1 rounded w-2/3 text-base focus:outline-none focus:ring focus:ring-blue-300"
                  onChange={(e) => setTeamName(e.target.value)}
                />
              ) : (
                <span>{teamName || "N/A"}</span>
              )}
              <div>
                {!editName ? (
                  <button
                    onClick={() => setEditName(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setEditName(false)}
                    className="text-green-600 hover:underline"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-semibold text-gray-800">
              Team Logo:
              {editlogo ? (
                <input
                  type="file"
                  accept="image/*"
                  className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0 file:font-semibold
                             file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
              ) : (
                <span className="truncate max-w-xs">{teamlogo}</span>
              )}
              <div>
                {!editlogo ? (
                  <button
                    onClick={() => setEditlogo(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setEditlogo(false)}
                    className="text-green-600 hover:underline"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Team Code:{" "}
              <span className="font-mono text-blue-700">
                {teamdata?.teamCode}
              </span>
            </h2>

            <table className="w-full mt-4 text-left border border-gray-300 rounded-md shadow-md overflow-hidden">
              <thead className="bg-blue-50 text-blue-800 font-semibold">
                <tr>
                  <th className="py-3 px-4 border-b">Player Name</th>
                  <th className="py-3 px-4 border-b">Role</th>
                  <th className="py-3 px-4 border-b">Edit Role</th>
                </tr>
              </thead>
              <tbody>
                {teamdata?.teamPlayer?.map((participant, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition">
                    <td className="py-3 px-4 border-b">{participant?.name}</td>
                    <td className="py-3 px-4 border-b">{participant?.role}</td>
                    <td className="py-3 px-4 border-b text-center">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
