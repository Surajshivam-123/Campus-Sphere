const features = [
  {
    title: "Host Events",
    desc: "Create and manage college events with ease — from tech fests to sports meets.",
  },
  {
    title: "Join Competitions",
    desc: "Browse and register for events in just a few clicks.",
  },
  {
    title: "Track Progress",
    desc: "Get real-time updates, results, and notifications for ongoing events.",
  },
];

export default function Features() {
  return (
    <section
      className="py-16 text-center"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <h2
        className="font-heading text-2xl font-semibold mb-10 tracking-tight"
        style={{ color: "var(--color-navy)" }}
      >
        What You Can Do
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
        {features.map(({ title, desc }) => (
          <div
            key={title}
            className="rounded-lg p-6 text-left border transition-colors"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 30%, transparent)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
          >
            <div
              className="w-10 h-0.5 mb-4"
              style={{ backgroundColor: "var(--color-gold)" }}
            />
            <h3
              className="font-heading text-lg font-semibold mb-2"
              style={{ color: "var(--color-navy)" }}
            >
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
