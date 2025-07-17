export default function CricketEventPage({ event }) {
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
    membercode,
    participation,
    poster,
    members, // Assuming you have a list of members
    team, // Assuming you have a list of participants
  } = event;

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
              <strong>Participation Type:</strong> {participation}
            </div>
            <div>
              <strong>Member Code:</strong> {membercode}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            <p className="mt-1 text-gray-600">{description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">Rules</h2>
            {rules.map((rule,index) => (
              <p key={index} className="mt-1 text-gray-600 whitespace-pre-line">{index+1}. {rule}</p>
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
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
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
