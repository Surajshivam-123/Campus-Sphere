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
import LoadingPage from "../../LoadingPage";
import API_URL from "../../../config/api";
import { formatDateTime } from "../../../utils/helpers";

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
  const [teams, setTeams] = useState([]);
  const [cricketFormat, setCricketFormat] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [initLoading, setInitLoading] = useState(false);
  const [initDone, setInitDone] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [scorerUpdater, setScorerUpdater] = useState(null);
  const [scorerLoading, setScorerLoading] = useState(null); // userId being processed

  useEffect(() => {
    const loadEvent = async () => {
      const getsingleEvent = async () => {
        try {
          const event = await fetch(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include"
          })
          const result = await event.json();
          console.log("Server response", result);
          if (!result) {
            console.log("No event found");
          }
          setevent(result?.data);
        } catch (error) {
          console.log("Error while getting single event", error);
        }
      }
      getsingleEvent();
      const response = await fetch(
        `${API_URL}/api/cpsh/members/get-member/${eventId}`,
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

      // Fetch teams that have participated in this event
      try {
        const teamsRes = await fetch(`${API_URL}/api/cpsh/teams/get-event-teams/${eventId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const teamsData = await teamsRes.json();
        setTeams(teamsData?.data || []);
      } catch (error) {
        console.log("Error while getting event teams", error);
      }

      // Fetch cricket format if exists
      try {
        const fmtRes = await fetch(`${API_URL}/api/v1/sports/cricket/format/${eventId}`, {
          credentials: "include",
        });
        const fmtData = await fmtRes.json();
        setCricketFormat(fmtData?.data || null);
      } catch (error) {
        console.log("Error while getting cricket format", error);
      }

      // Fetch schedule if exists
      try {
        const schedRes = await fetch(`${API_URL}/api/cpsh/schedule/${eventId}`, {
          credentials: "include",
        });
        const schedData = await schedRes.json();
        setSchedule(schedData?.data || null);
      } catch (error) {
        console.log("Error while getting schedule", error);
      }

      // Fetch participants for scorer assignment
      try {
        const partRes = await fetch(`${API_URL}/api/cpsh/participants/get-all-participants/${eventId}`, {
          credentials: "include",
        });
        const partData = await partRes.json();
        setParticipants(partData?.data || []);
      } catch (error) {
        console.log("Error while getting participants", error);
      }

      // Fetch current scorer from event
      try {
        const evRes = await fetch(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`, {
          credentials: "include",
        });
        const evData = await evRes.json();
        setScorerUpdater(evData?.data?.scorerUpdater || null);
      } catch (error) {
        console.log("Error while getting scorer", error);
      }
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
    members.push({ _id: member[i]._id, name: member[i].name, role: member[i].role });
  }

  const handleupdatebutton = () => {
    navigate(`/update-event/${eventId}`);
  };
  const handeldelete = async () => {
    const response = await fetch(
      `${API_URL}/api/cpsh/events/delete/${eventId}`,
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
  const handleInitMatches = async () => {
    setInitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/sports/cricket/matches/event/${eventId}/init`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setInitDone(true);
        navigate(`/sports/cricket/scoreboard/${eventId}`);
      } else {
        alert(data.message || "Failed to initialize matches");
      }
    } catch (err) {
      console.log("Error initializing matches", err);
    } finally {
      setInitLoading(false);
    }
  };

  const handleAssignScorer = async (userId) => {
    setScorerLoading(userId);
    try {
      const res = await fetch(`${API_URL}/api/cpsh/events/${eventId}/assign-scorer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) setScorerUpdater(data?.data?.scorerUpdater);
      else alert(data.message || "Failed to assign scorer");
    } catch (err) {
      console.log("Error assigning scorer", err);
    } finally {
      setScorerLoading(null);
    }
  };

  const handleRevokeScorer = async () => {
    setScorerLoading("revoke");
    try {
      const res = await fetch(`${API_URL}/api/cpsh/events/${eventId}/revoke-scorer`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setScorerUpdater(null);
    } catch (err) {
      console.log("Error revoking scorer", err);
    } finally {
      setScorerLoading(null);
    }
  };

  const handleSaveRole = async (memberId) => {
    try {
      const role = editedRoles[memberId];
      const response = await fetch(
        `${API_URL}/api/cpsh/members/edit-role/${memberId}`,
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
      console.log("Server Resposne", result)
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
              <strong>Date:</strong> {formatDateTime(startDate)}
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
                <tr className="hover:bg-gray-50">
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
                  <th className="py-2 px-4 border-b">Captain</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-2 px-4 border-b text-gray-400">No teams have joined yet.</td>
                  </tr>
                ) : (
                  teams.map((t, index) => (
                    <tr key={t._id || index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{t.name}</td>
                      <td className="py-2 px-4 border-b">{t.owner?.fullname || t.owner?.username || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Scorer Assignment */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Scorecard Updater</h2>
            {scorerUpdater && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-3">
                <span className="text-sm text-green-800 font-medium">
                  Current scorer: <span className="font-bold">
                    {participants.find(p => p.owner?._id === scorerUpdater || p.owner?._id?.toString() === scorerUpdater?.toString())?.owner?.fullname
                      || participants.find(p => p.owner?._id === scorerUpdater || p.owner?._id?.toString() === scorerUpdater?.toString())?.owner?.username
                      || "Assigned"}
                  </span>
                </span>
                <button
                  onClick={handleRevokeScorer}
                  disabled={scorerLoading === "revoke"}
                  className="text-xs text-red-500 hover:underline disabled:opacity-50"
                >
                  {scorerLoading === "revoke" ? "Revoking..." : "Revoke"}
                </button>
              </div>
            )}
            {participants.length === 0 ? (
              <p className="text-sm text-gray-400">No participants yet.</p>
            ) : (
              <table className="w-full text-left border border-gray-300 rounded-md overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b">Participant</th>
                    <th className="py-2 px-4 border-b">Identity No.</th>
                    <th className="py-2 px-4 border-b">Team</th>
                    <th className="py-2 px-4 border-b">Role</th>
                    <th className="py-2 px-4 border-b">Assign Scorer</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => {
                    const uid = p.owner?._id?.toString();
                    const isCurrentScorer = scorerUpdater?.toString() === uid;
                    return (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{p.owner?.fullname || p.owner?.username || "—"}</td>
                        <td className="py-2 px-4 border-b text-gray-500">{p.identityNumber}</td>
                        <td className="py-2 px-4 border-b">
                          {p.teamName
                            ? <span className="text-indigo-700 font-medium">{p.teamName}</span>
                            : <span className="text-gray-400 text-xs">No team</span>}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {p.teamName
                            ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isCaptain ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                                {p.isCaptain ? "Captain" : "Player"}
                              </span>
                            : <span className="text-xs text-gray-400">Spectator</span>}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {isCurrentScorer ? (
                            <span className="text-xs text-green-600 font-semibold">Assigned ✓</span>
                          ) : (
                            <button
                              onClick={() => handleAssignScorer(uid)}
                              disabled={scorerLoading === uid}
                              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                            >
                              {scorerLoading === uid ? "Assigning..." : "Assign"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-start mt-6">
            <button
              onClick={() => navigate(`/sports/cricket/format/${eventId}`)}
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <FaFlag className="inline-block mr-2" />
              {cricketFormat ? "Update Format" : "Create Format"}
            </button>
            {cricketFormat && (
              <button
                onClick={() => navigate(`/sports/cricket/format/${eventId}/view`)}
                className="cursor-pointer bg-gradient-to-r from-indigo-400 to-indigo-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105"
              >
                <FaFlag className="inline-block mr-2" />
                View Format
              </button>
            )}
            <button
              onClick={() => navigate(`/sports/cricket/schedule/${eventId}`)}
              className="cursor-pointer bg-gradient-to-r from-blue-400 to-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <FaTrophy className="inline-block mr-2" />
              {schedule ? "Update Schedule" : "Create Schedule"}
            </button>
            {schedule && (
              <>
                <button
                  onClick={handleInitMatches}
                  disabled={initLoading}
                  className="cursor-pointer bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105 disabled:opacity-60"
                >
                  <FaTrophy className="inline-block mr-2" />
                  {initLoading ? "Starting..." : "Start Tournament"}
                </button>
                <button
                  onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
                  className="cursor-pointer bg-gradient-to-r from-purple-500 to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-transform hover:scale-105"
                >
                  <FaTrophy className="inline-block mr-2" />
                  View Scoreboard
                </button>
              </>
            )}
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
