import { Link } from "react-router-dom";

export default function Body() {
  return (
    <div className="pt-28 min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-4">
      <h1 className="font-heading text-4xl font-semibold text-[#1e3a5f] mb-12 text-center tracking-tight">
        What would you like to do?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link
          to="/choice"
          className="bg-white border border-gray-200 rounded-lg p-8 text-center hover:border-[#b8860b]/50 hover:shadow-md transition-all duration-200 group"
        >
          <div className="w-12 h-0.5 bg-[#b8860b] mx-auto mb-4 group-hover:w-16 transition-all" />
          <h2 className="font-heading text-2xl font-semibold text-[#1e3a5f] mb-2">Participate</h2>
          <p className="text-[#374151] text-sm leading-relaxed">Register for exciting campus events and contests.</p>
        </Link>
        <Link
          to="/new-events-hosted"
          className="bg-white border border-gray-200 rounded-lg p-8 text-center hover:border-[#b8860b]/50 hover:shadow-md transition-all duration-200 group"
        >
          <div className="w-12 h-0.5 bg-[#b8860b] mx-auto mb-4 group-hover:w-16 transition-all" />
          <h2 className="font-heading text-2xl font-semibold text-[#1e3a5f] mb-2">Host</h2>
          <p className="text-[#374151] text-sm leading-relaxed">Create and manage your own coding or sports events.</p>
        </Link>
      </div>
    </div>
  );
}
