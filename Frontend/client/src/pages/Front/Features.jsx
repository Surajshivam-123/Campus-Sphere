export default function Features() {
  return (
    <section className="py-16 bg-gray-100 text-gray-800 text-center">
      <h2 className="text-3xl font-bold mb-12">What You Can Do</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Host Events</h3>
          <p>Create and manage college events with ease — from tech fests to sports meets.</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Join Competitions</h3>
          <p>Students can browse and register for events in just a few clicks.</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
          <p>Get real-time updates, results, and notifications for ongoing events.</p>
        </div>
      </div>
    </section>
  );
}
