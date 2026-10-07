import CopyToClipboard from "../../components/shared/CopyToClipboard";
import { useLocation } from "react-router-dom";

export default function WorkshopEventDetails() {
  const location = useLocation();
  const eventData = location.state;

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="alert-error">No event data found.</div>
      </div>
    );
  }

  const registrationPct = Math.round((eventData.registeredParticipants / eventData.totalParticipants) * 100);
  const checkinPct = Math.round((eventData.checkedInParticipants / eventData.registeredParticipants) * 100);

  const ProgressBar = ({ value, color }) => (
    <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--color-border)" }}>
      <div className="h-2 rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Header */}
      <header className="px-6 py-8" style={{ backgroundColor: "var(--color-navy)" }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">{eventData.eventName}</h1>
          <p className="text-sm mt-1" style={{ color: "#e8e6e1" }}>{eventData.eventDate} · {eventData.eventLocation}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Summary */}
        <section className="rounded-lg p-6 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className="flex flex-wrap justify-between items-start gap-6 mb-6">
            <div>
              <h2 className="font-heading text-lg font-semibold mb-1" style={{ color: "var(--color-navy)" }}>Event Summary</h2>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Organized by {eventData.organizer}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Member code", code: eventData.invitationCode.members },
                { label: "Participant code", code: eventData.invitationCode.candidates },
              ].map(({ label, code }) => (
                <div
                  key={label}
                  className="rounded-lg px-4 py-3 border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-navy) 6%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-navy) 20%, transparent)",
                  }}
                >
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "var(--color-navy)" }}>{label}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-lg" style={{ color: "var(--color-navy)" }}>{code}</span>
                    <CopyToClipboard textToCopy={code} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Registration ({eventData.registeredParticipants}/{eventData.totalParticipants})
              </p>
              <ProgressBar value={registrationPct} color="var(--color-navy)" />
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{registrationPct}% of capacity</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Check-in ({eventData.checkedInParticipants}/{eventData.registeredParticipants})
              </p>
              <ProgressBar value={checkinPct} color="var(--color-success)" />
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{checkinPct}% of registered attendees</p>
            </div>
          </div>
        </section>

        {/* People tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Members", rows: eventData.eventPeople.members, cols: ["Name", "Role"], render: (m) => [m.name, <span className="badge-info">{m.role}</span>] },
            { title: "Participants", rows: eventData.eventPeople.participants, cols: ["Name", "ID"], render: (p) => [p.name, <span className="badge-info font-mono">{p.identityNumber}</span>] },
          ].map(({ title, rows, cols, render }) => (
            <section key={title} className="rounded-lg overflow-hidden border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid var(--color-border)` }}>
                <h2 className="font-heading text-base font-semibold" style={{ color: "var(--color-navy)" }}>{title}</h2>
              </div>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: "var(--color-surface-2)" }}>
                  <tr>
                    {cols.map((c) => (
                      <th key={c} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const cells = render(row);
                    return (
                      <tr key={i} style={{ borderTop: `1px solid var(--color-border-soft)` }}>
                        {cells.map((cell, j) => (
                          <td key={j} className="px-5 py-3" style={{ color: j === 0 ? "var(--color-text-secondary)" : undefined }}>{cell}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
