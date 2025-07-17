import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import getsingleEvent from "../../components/getsingleevent";
import { useEffect, useState } from "react";

export default function CricketEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  if(!eventId){
    console.log("EventId is not available")
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
  return <div className="text-center mt-10 text-gray-600">Loading event details...</div>;
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
    Poster,//poster using of dummy poster members and team
    createdAt,
  } = event;
  const poster = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpuzEbDVckv1B-qGW2FO8sHwBmOKa7g9jQLwbtC3rhx4cTOIKY_mdhlCEKZOfixY0O9Yq&s";
  const members = [
    { name: "suraj", role: "organizer" },
    { name: "shivam", role: "third umpire" },
    { name: "golu", role: " ground umpire" },
    { name: "bholu", role: " ground umpire" },
  ]
  const team=["csk", "rcb", "mi", "kkr"];
  const handleupdatebutton = () => {
    navigate(`/update-event/${eventId}`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {poster && (
          <img
            src={poster}
            alt="Cricket Event Poster"
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-6 space-y-5">
          <h1 className="text-3xl font-bold text-blue-800">{eventName}</h1>
          <p className="text-sm text-gray-600">{festivalName}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <strong>Date:</strong> {startDate}
            </div>
            <div>
              <strong>Location:</strong> {location}
            </div>
            <div>
              <strong>Organized By:</strong> {organization}
            </div>
            <div>
              <strong>Mode:</strong> {mode}
            </div>
            <div>
              <strong>Category:</strong> {category}
            </div>
            <div>
              <strong>Sport:</strong> {sports}
            </div>
            <div>
              <strong>Max Participants:</strong> {maxParticipants}
            </div>
            <div>
              <strong>Participant Code:</strong> {participantCode}
            </div>
            <div>
              <strong>Member Code:</strong> {memberCode}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            <p className="mt-1 text-gray-600">{description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Rules</h2>
            {rules.map((rule, index) => (
              <p key={index} className="mt-1 text-gray-600 whitespace-pre-line">
                {index + 1}. {rule}
              </p>
            ))}
          </div>

          {/* Members Table */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Members</h2>
            <table className="min-w-full mt-4 bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border-b">Member Name</th>
                  <th className="py-2 px-4 border-b">Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{member.name}</td>
                    <td className="py-2 px-4 border-b">{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Participants Table */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Participants
            </h2>
            <table className="min-w-full mt-4 bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border-b">Team</th>
                </tr>
              </thead>
              <tbody>
                {team.map((participant, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{participant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Format
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Schedule
            </button>
            <button onClick={handleupdatebutton} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              Update Event
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
