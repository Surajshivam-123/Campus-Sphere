export default function FormSelect({ label, options = [], defaultLabel = "-- Select --", error, touched, required = false, ...props }) {
  const showError = touched && error;
  return (
    <div>
      <label
        className="block text-xs font-medium mb-2 uppercase tracking-wider"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
        {required && <span className="ml-1" style={{ color: "var(--color-error)" }}>*</span>}
      </label>
      <select
        {...props}
        className={`input-base${showError ? " input-error" : ""}`}
      >
        <option value="">{defaultLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {showError && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </div>
  );
}
