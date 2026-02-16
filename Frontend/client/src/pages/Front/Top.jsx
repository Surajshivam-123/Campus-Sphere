import logo from '../../../public/logo.jpg';

export default function Top({ onGetStartedClick }) {
  return (
    <section className="bg-[#1e3a5f] text-white min-h-screen flex flex-col items-center justify-center text-center p-8">
      <img
        src={logo}
        alt="Campus Sphere Logo"
        className="h-24 w-36 rounded-md border border-[#c9a227]/30 shadow"
      />
      <div className="mt-6 w-16 h-px bg-[#c9a227]/50" />
      <h1 className="font-heading text-4xl md:text-5xl font-semibold mt-6 mb-4 tracking-tight">Campus Sphere</h1>
      <p className="text-[#e8e6e1] text-base md:text-lg max-w-xl leading-relaxed">
        Organize, manage, and join campus events — coding contests, sports tournaments, and more — all in one place.
      </p>
      <div className="mt-8">
        <button
          onClick={onGetStartedClick}
          className="cursor-pointer bg-[#b8860b] text-white px-6 py-2.5 rounded border border-[#b8860b] font-medium text-sm hover:bg-[#a67a0a] transition-colors"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
