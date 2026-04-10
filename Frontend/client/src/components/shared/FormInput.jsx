export default function FormInput({ label, error, touched, required = false, icon, ...props }) {
  const showError = touched && error;
  return (
    <div>
      <label
        className="block text-xs font-medium mb-2 uppercase tracking-wider"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {icon && <span className="mr-2 inline">{icon}</span>}
        {label}
        {required && <span className="ml-1" style={{ color: "var(--color-error)" }}>*</span>}
      </label>
      <input
        {...props}
        className={`input-base${showError ? " input-error" : ""}`}
      />
      {showError && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </div>
  );
}
