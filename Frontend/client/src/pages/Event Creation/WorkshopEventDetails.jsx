import CopyToClipboard from "../Copy";
import { useLocation} from "react-router-dom";

const WorkshopEventDetails = () => {
  const location = useLocation(); // eventData passed here
  const eventData=location.state;
  if (!eventData) {
    return <div className="text-center mt-10 text-red-500">No Event Data Found</div>;
  }
  const registrationPercentage = Math.round(
    (eventData.registeredParticipants / eventData.totalParticipants) * 100
  );
  const checkinPercentage = Math.round(
    (eventData.checkedInParticipants / eventData.registeredParticipants) * 100
  );
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-purple-600 text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">{eventData.eventName}</h1>
          <p className="text-indigo-100">
            {eventData.eventDate} • {eventData.eventLocation}
          </p>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <section className="mb-10 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Event Summary</h2>
                <p className="text-gray-600">
                  Organized by {eventData.organizer}
                </p>
              </div>
              <div className="bg-indigo-50 border-2 border-indigo-100 p-4 rounded-lg">
                <p className="text-sm text-indigo-500 font-medium mb-1">
                  INVITATION CODE FOR MEMBERS
                </p>
                <div className="flex gap-4">
                  <h3 className="text-3xl font-medium text-indigo-700">
                    {eventData.invitationCode.members}
                  </h3>
                  <CopyToClipboard
                    textToCopy={eventData.invitationCode.members}
                  />
                </div>
              </div>
              <div className="bg-indigo-50 border-2 border-indigo-100 p-4 rounded-lg">
                <p className="text-sm text-indigo-500 font-medium mb-1">
                  INVITATION CODE FOR PARTICIPANTS
                </p>
                <div className="flex gap-4">
                  <h3 className="text-3xl font-medium text-indigo-700">
                    {eventData.invitationCode.candidates}
                  </h3>
                  <CopyToClipboard
                    textToCopy={eventData.invitationCode.candidates}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm font-medium mb-2">
                  Registration Progress ({eventData.registeredParticipants}/
                  {eventData.totalParticipants})
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${registrationPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {registrationPercentage}% of capacity
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  Check-in Completion ({eventData.checkedInParticipants}/
                  {eventData.registeredParticipants})
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${checkinPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {checkinPercentage}% of registered attendees
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Event Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Registration Sources
                </h3>
                <div className="space-y-3">
                  {Object.entries(eventData.registrationSources).map(
                    ([source, count]) => (
                      <div key={source}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize font-medium">
                            {source}
                          </span>
                          <span>
                            {count} (
                            {Math.round(
                              (count / eventData.registeredParticipants) * 100
                            )}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (count / eventData.registeredParticipants) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Attendee Categories
                </h3>
                <div className="h-64">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute w-full h-full rounded-full border-4 border-gray-200"></div>
                    <div
                      className="absolute w-full h-full rounded-full border-4 border-transparent"
                      style={{
                        background: `conic-gradient(
                          #8b5cf6 ${
                            (eventData.attendeeCategories.speakers /
                              eventData.registeredParticipants) *
                            360
                          }deg,
                          #3b82f6 ${
                            (eventData.attendeeCategories.speakers /
                              eventData.registeredParticipants) *
                            360
                          }deg ${
                          ((eventData.attendeeCategories.speakers +
                            eventData.attendeeCategories.sponsors) /
                            eventData.registeredParticipants) *
                          360
                        }deg,
                          #10b981 ${
                            ((eventData.attendeeCategories.speakers +
                              eventData.attendeeCategories.sponsors) /
                              eventData.registeredParticipants) *
                            360
                          }deg ${
                          ((eventData.attendeeCategories.speakers +
                            eventData.attendeeCategories.sponsors +
                            eventData.attendeeCategories.general) /
                            eventData.registeredParticipants) *
                          360
                        }deg,
                          #f59e0b ${
                            ((eventData.attendeeCategories.speakers +
                              eventData.attendeeCategories.sponsors +
                              eventData.attendeeCategories.general) /
                              eventData.registeredParticipants) *
                            360
                          }deg
                        )`,
                      }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-violet-500 rounded-full mr-2"></div>
                      <span>
                        Speakers: {eventData.attendeeCategories.speakers}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>
                        Sponsors: {eventData.attendeeCategories.sponsors}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>
                        General: {eventData.attendeeCategories.general}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Press: {eventData.attendeeCategories.press}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Participation Rate
                </h3>
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="relative w-40 h-40 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        strokeDasharray={`${
                          eventData.participationRate * 2.83
                        } 283`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">
                        {eventData.participationRate}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-center">
                    Active participation rate based on session attendance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Members</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eventData.eventPeople.members.map((member, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{member.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs">
                          {member.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-6">Participants</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Identity Number
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eventData.eventPeople.participants.map((member, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{member.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs">
                          {member.identityNumber}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default WorkshopEventDetails;
