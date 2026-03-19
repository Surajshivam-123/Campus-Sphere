/**
 * Reusable form input component with consistent styling
 */
export default function FormInput({ 
  label, 
  error, 
  touched, 
  required = false,
  icon,
  ...props 
}) {
  const showError = touched && error;

  return (
    <div>
      <label className="block text-xs font-medium text-[#374151] mb-2 uppercase tracking-wider">
        {icon && <span className="mr-2 inline">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-1 text-sm transition-colors ${
          showError
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-200 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]'
        }`}
      />
      {showError && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
