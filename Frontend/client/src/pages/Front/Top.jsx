import logo from '../../assets/logo.jpg';

export default function Top({ onGetStartedClick }) {
  return (
    <section className="bg-purple-600 text-white min-h-screen flex flex-col items-center justify-center text-center p-6">
      <img
        src={logo}
        alt="Campus Sphere Logo"
        className="h-30 w-48 rounded-full shadow-lg"
      />
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Campus Sphere</h1>
      <p className="text-lg md:text-xl max-w-2xl">
        Organize, manage, and join campus events like coding contests, sports tournaments, and more — all in one place.
      </p>
      <div className="mt-6 space-x-4">
        <button
          onClick={onGetStartedClick}
          className="cursor-pointer bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
