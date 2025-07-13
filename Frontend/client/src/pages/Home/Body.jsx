import { Link } from "react-router-dom";

export default function Body() {
  return (
    <div className="pt-32 min-h-screen bg-gradient-to-b from-purple-100 to-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-purple-700 mb-12 text-center">What would you like to do?</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full">
        {/* Participate Card */}
        <Link
          to="/join-event"
          className="bg-white shadow-xl rounded-2xl p-8 text-center hover:scale-105 transform transition duration-300 hover:shadow-2xl border-t-4 border-purple-500"
        >
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">Participate in an Event</h2>
          <p className="text-gray-600">Register for exciting campus events and contests.</p>
        </Link>

        {/* Host Card */}
        <Link
          to="/new-events-hosted"
          className="bg-white shadow-xl rounded-2xl p-8 text-center hover:scale-105 transform transition duration-300 hover:shadow-2xl border-t-4 border-purple-500"
        >
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">Host an Event</h2>
          <p className="text-gray-600">Create and Manage your own coding or sports events easily.</p>
        </Link>
      </div>
    </div>
  );
}
