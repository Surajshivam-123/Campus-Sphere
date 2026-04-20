import { Link } from "react-router-dom";

export default function Body() {
  return (
    <div
      className="pt-28 min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <h1
        className="font-heading text-4xl font-semibold mb-12 text-center tracking-tight"
        style={{ color: "var(--color-navy)" }}
      >
        What would you like to do?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {[
          { to: "/choice",       title: "Participate",   desc: "Register for exciting campus events and contests." },
          { to: "/new-events-hosted", title: "Host",      desc: "Create and manage your own coding or sports events." },
          { to: "/clubs",        title: "Browse Clubs",   desc: "Discover and join campus clubs that match your interests." },
          { to: "/clubs/join",   title: "Join a Club",    desc: "Have a club code? Join any public or private club instantly." },
          { to: "/clubs/create", title: "Create a Club",  desc: "Found a new campus club and build your community." },
        ].map(({ to, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="rounded-lg p-8 text-center transition-all duration-200 group border"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 50%, transparent)";
              e.currentTarget.style.boxShadow = "0 4px 12px color-mix(in srgb, var(--color-gold) 10%, transparent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="h-0.5 mx-auto mb-4 transition-all duration-200 group-hover:w-16"
              style={{ width: "3rem", backgroundColor: "var(--color-gold)" }}
            />
            <h2
              className="font-heading text-2xl font-semibold mb-2"
              style={{ color: "var(--color-navy)" }}
            >
              {title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
