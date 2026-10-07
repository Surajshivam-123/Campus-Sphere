export default function FormTextarea({ label, error, touched, required = false, rows = 4, ...props }) {
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
      <textarea
        rows={rows}
        {...props}
        className={`input-base resize-y${showError ? " input-error" : ""}`}
      />
      {showError && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </div>
  );
}
