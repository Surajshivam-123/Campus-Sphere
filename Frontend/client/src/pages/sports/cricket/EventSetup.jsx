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
  FaUserClock,
} from "react-icons/fa";
import LoadingPage from "../../LoadingPage";
import API_URL from "../../../config/api";
import fetchWithAuth from "../../../config/fetchWithAuth";
import { formatDateTime } from "../../../utils/helpers";
import MemberRequests from "../../MyHostedEvent/MemberRequests";

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
  const [matchesExist, setMatchesExist] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [scorerUpdater, setScorerUpdater] = useState(null);
  const [scorerLoading, setScorerLoading] = useState(null); // userId being processed

  useEffect(() => {
    const loadEvent = async () => {
      const getsingleEvent = async () => {
        try {
          const event = await fetchWithAuth(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
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
      const response = await fetchWithAuth(
        `${API_URL}/api/cpsh/members/get-member/${eventId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const member = await response.json();
      console.log("Server Response", member);
      setMember(member?.data?.members);
      setOwnerName(member?.data?.ownerName);

      // Fetch teams that have participated in this event
      try {
        const teamsRes = await fetchWithAuth(`${API_URL}/api/cpsh/teams/get-event-teams/${eventId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const teamsData = await teamsRes.json();
        setTeams(teamsData?.data || []);
      } catch (error) {
        console.log("Error while getting event teams", error);
      }

      // Fetch cricket format if exists
      try {
        const fmtRes = await fetchWithAuth(`${API_URL}/api/cpsh/cricket-format/${eventId}`);
        const fmtData = await fmtRes.json();
        setCricketFormat(fmtData?.data || null);
      } catch (error) {
        console.log("Error while getting cricket format", error);
      }

      // Fetch schedule if exists
      try {
        const schedRes = await fetchWithAuth(`${API_URL}/api/cpsh/schedule/${eventId}`);
        const schedData = await schedRes.json();
        setSchedule(schedData?.data || null);
      } catch (error) {
        console.log("Error while getting schedule", error);
      }

      // Check if matches already exist (tournament started)
      try {
        const matchRes = await fetchWithAuth(`${API_URL}/api/cpsh/matches/event/${eventId}`);
        const matchData = await matchRes.json();
        setMatchesExist(matchData?.data?.length > 0);
      } catch (error) {
        console.log("Error while checking matches", error);
      }

      // Fetch participants for scorer assignment
      try {
        const partRes = await fetchWithAuth(`${API_URL}/api/cpsh/participants/get-all-participants/${eventId}`);
        const partData = await partRes.json();
        setParticipants(partData?.data || []);
      } catch (error) {
        console.log("Error while getting participants", error);
      }

      // Fetch current scorer from event
      try {
        const evRes = await fetchWithAuth(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`);
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
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    const response = await fetchWithAuth(
      `${API_URL}/api/cpsh/events/delete/${eventId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      alert(`Could not delete event: ${result?.message || response.status}`);
      return;
    }
    navigate("/events-hosted");
  };
  const handleInitMatches = async () => {
    setInitLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/matches/event/${eventId}/init`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setInitDone(true);
        setMatchesExist(true);
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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/events/${eventId}/assign-scorer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetchWithAuth(`${API_URL}/api/cpsh/events/${eventId}/revoke-scorer`, {
        method: "DELETE",
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
      const response = await fetchWithAuth(
        `${API_URL}/api/cpsh/members/edit-role/${memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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
      className="min-h-screen bg-[#faf9f6] py-10 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {poster && (
          <img
            src={poster}
            alt="Cricket Event Poster"
            className="w-full h-64 object-cover"
          />
        )}

          <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-3xl font-semibold text-[#1e3a5f]">
              {eventName}
            </h1>
            {festivalName && <p className="text-sm text-gray-400">{festivalName}</p>}
            <div className="w-8 h-px bg-[#b8860b]/40 mt-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#374151]">
            <p>
              <FaCalendarAlt className="inline-block mr-2 text-[#1e3a5f]" />
              <strong>Date:</strong> {formatDateTime(startDate)}
            </p>
            <p>
              <FaMapMarkerAlt className="inline-block mr-2 text-[#1e3a5f]" />
              <strong>Location:</strong> {location}
            </p>
            <p>
              <FaChalkboardTeacher className="inline-block mr-2 text-[#1e3a5f]" />
              <strong>Organized By:</strong> {organization}
            </p>
            <p><strong>Mode:</strong> {mode}</p>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Sport:</strong> {sports}</p>
            <p>
              <FaUsers className="inline-block mr-2 text-[#1e3a5f]" />
              <strong>Max Participants:</strong> {maxParticipants}
            </p>
            <p><strong>Participant Code:</strong> {participantCode}</p>
            <p><strong>Member Code:</strong> {memberCode}</p>
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
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaUserClock className="text-blue-500" /> Join Requests
            </h2>
            <div className="mt-4">
              <MemberRequests eventId={eventId} />
            </div>
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
                {members.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {member.name}{member.isOrganizer ? " (You)" : ""}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editableMemberId === member._id && !member.isOrganizer ? (
                        <input
                          type="text"
                          value={editedRoles[member._id] || member.role}
                          onChange={(e) =>
                            setEditedRoles({ ...editedRoles, [member._id]: e.target.value })
                          }
                          className="border-b border-gray-300 focus:outline-none px-2 py-1 rounded"
                        />
                      ) : (
                        member.role || "N/A"
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {member.isOrganizer ? (
                        "N/A"
                      ) : editableMemberId === member._id ? (
                        <button onClick={() => handleSaveRole(member._id)} className="cursor-pointer text-green-600 font-semibold">Save</button>
                      ) : (
                        <button onClick={() => setEditableMemberId(member._id)} className="cursor-pointer text-blue-600 font-semibold">Edit</button>
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

          <div className="flex flex-wrap gap-3 justify-start mt-6">
            <button
              onClick={() => navigate(`/sports/cricket/format/${eventId}`)}
              className="cursor-pointer bg-[#1e3a5f] text-white px-5 py-2 rounded border border-[#1e3a5f] font-medium text-sm hover:bg-[#2d4a6f] transition"
            >
              <FaFlag className="inline-block mr-2" />
              {cricketFormat ? "Update Format" : "Create Format"}
            </button>
            {cricketFormat && (
              <button
                onClick={() => navigate(`/sports/cricket/format/${eventId}/view`)}
                className="cursor-pointer bg-white text-[#1e3a5f] px-5 py-2 rounded border border-[#1e3a5f] font-medium text-sm hover:bg-[#f0ede6] transition"
              >
                <FaFlag className="inline-block mr-2" />
                View Format
              </button>
            )}
            <button
              onClick={() => navigate(`/sports/cricket/schedule/${eventId}`)}
              className="cursor-pointer bg-[#b8860b] text-white px-5 py-2 rounded border border-[#b8860b] font-medium text-sm hover:bg-[#a67a0a] transition"
            >
              <FaTrophy className="inline-block mr-2" />
              {schedule ? "Update Schedule" : "Create Schedule"}
            </button>
            {schedule && (
              <>
                <button
                  onClick={matchesExist ? () => navigate(`/sports/cricket/scoreboard/${eventId}`) : handleInitMatches}
                  disabled={initLoading}
                  className="cursor-pointer bg-green-600 text-white px-5 py-2 rounded border border-green-600 font-medium text-sm hover:bg-green-700 transition disabled:opacity-60"
                >
                  <FaTrophy className="inline-block mr-2" />
                  {initLoading ? "Starting..." : matchesExist ? "Resume Tournament" : "Start Tournament"}
                </button>
                <button
                  onClick={() => navigate(`/sports/cricket/scoreboard/${eventId}`)}
                  className="cursor-pointer bg-white text-[#1e3a5f] px-5 py-2 rounded border border-[#1e3a5f] font-medium text-sm hover:bg-[#f0ede6] transition"
                >
                  <FaTrophy className="inline-block mr-2" />
                  View Scoreboard
                </button>
              </>
            )}
            <button
              onClick={handleupdatebutton}
              className="cursor-pointer bg-white text-[#374151] px-5 py-2 rounded border border-gray-200 font-medium text-sm hover:border-[#b8860b]/50 transition"
            >
              <FaPenAlt className="inline-block mr-2" />
              Update Event
            </button>
            <button
              onClick={handeldelete}
              className="cursor-pointer border border-red-200 text-red-600 px-5 py-2 rounded font-medium text-sm hover:bg-red-50 transition"
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
