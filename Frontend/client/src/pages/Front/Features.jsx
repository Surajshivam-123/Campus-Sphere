export default function Features() {
  return (
    <section className="py-16 bg-[#faf9f6] text-[#374151] text-center">
      <h2 className="font-heading text-2xl font-semibold text-[#1e3a5f] mb-10 tracking-tight">What You Can Do</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#b8860b]/30 transition-colors text-left">
          <div className="w-10 h-0.5 bg-[#b8860b] mb-4" />
          <h3 className="font-heading text-lg font-semibold text-[#1e3a5f] mb-2">Host Events</h3>
          <p className="text-sm text-[#374151] leading-relaxed">Create and manage college events with ease — from tech fests to sports meets.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#b8860b]/30 transition-colors text-left">
          <div className="w-10 h-0.5 bg-[#b8860b] mb-4" />
          <h3 className="font-heading text-lg font-semibold text-[#1e3a5f] mb-2">Join Competitions</h3>
          <p className="text-sm text-[#374151] leading-relaxed">Browse and register for events in just a few clicks.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#b8860b]/30 transition-colors text-left">
          <div className="w-10 h-0.5 bg-[#b8860b] mb-4" />
          <h3 className="font-heading text-lg font-semibold text-[#1e3a5f] mb-2">Track Progress</h3>
          <p className="text-sm text-[#374151] leading-relaxed">Get real-time updates, results, and notifications for ongoing events.</p>
        </div>
      </div>
    </section>
  );
}
