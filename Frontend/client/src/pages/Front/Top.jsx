import logo from "../../../public/logo.jpg";

export default function Top({ onGetStartedClick }) {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center text-center p-8"
      style={{ backgroundColor: "var(--color-navy)" }}
    >
      <img
        src={logo}
        alt="Campus Sphere Logo"
        className="h-24 w-36 rounded-md border shadow"
        style={{ borderColor: "color-mix(in srgb, var(--color-gold) 30%, transparent)" }}
      />
      <div
        className="mt-6 w-16 h-px"
        style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 50%, transparent)" }}
      />
      <h1 className="font-heading text-4xl md:text-5xl font-semibold mt-6 mb-4 tracking-tight text-white">
        Campus Sphere
      </h1>
      <p className="text-base md:text-lg max-w-xl leading-relaxed" style={{ color: "#e8e6e1" }}>
        Organize, manage, and join campus events — coding contests, sports tournaments, and more — all in one place.
      </p>
      <div className="mt-8">
        <button
          onClick={onGetStartedClick}
          className="btn-gold px-6 py-2.5"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
