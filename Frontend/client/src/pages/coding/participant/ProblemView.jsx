const DIFF_COLOR = {
  easy:   "var(--color-success)",
  medium: "var(--color-warning)",
  hard:   "var(--color-error)",
};

export default function ProblemView({ problem, index }) {
  if (!problem) return null;

  const sampleCases = problem.testCases?.filter((tc) => tc.isSample) || [];

  return (
    <div className="p-5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
      {/* Title */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-bold text-base" style={{ color: "var(--color-text-muted)" }}>
            {String.fromCharCode(65 + index)}.
          </span>
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--color-navy)" }}>
            {problem.title}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold" style={{ color: DIFF_COLOR[problem.difficulty] }}>
            {problem.difficulty}
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>{problem.points} pts</span>
          <span style={{ color: "var(--color-text-muted)" }}>
            {problem.timeLimit}s · {problem.memoryLimit}MB
          </span>
        </div>
      </div>

      <div className="w-full h-px mb-4" style={{ backgroundColor: "var(--color-border)" }} />

      {/* Description */}
      <Section title="Problem Statement">
        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{problem.description}</pre>
      </Section>

      {problem.inputFormat && (
        <Section title="Input Format">
          <pre className="whitespace-pre-wrap font-sans">{problem.inputFormat}</pre>
        </Section>
      )}

      {problem.outputFormat && (
        <Section title="Output Format">
          <pre className="whitespace-pre-wrap font-sans">{problem.outputFormat}</pre>
        </Section>
      )}

      {problem.constraints && (
        <Section title="Constraints">
          <pre className="whitespace-pre-wrap font-mono text-xs">{problem.constraints}</pre>
        </Section>
      )}

      {/* Sample test cases */}
      {sampleCases.length > 0 && (
        <Section title="Examples">
          {sampleCases.map((tc, i) => (
            <div key={i} className="mb-4">
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>
                Example {i + 1}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Input</p>
                  <pre
                    className="text-xs p-3 rounded font-mono overflow-x-auto"
                    style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-primary)", border: `1px solid var(--color-border)` }}
                  >
                    {tc.input || "(empty)"}
                  </pre>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Output</p>
                  <pre
                    className="text-xs p-3 rounded font-mono overflow-x-auto"
                    style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-primary)", border: `1px solid var(--color-border)` }}
                  >
                    {tc.expectedOutput || "(empty)"}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-navy)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
