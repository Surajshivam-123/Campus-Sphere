import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import profile from "../assets/download.jpeg";
import API_URL from "../config/api";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Register() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname) return setErrorMessage("Full name is required");
    if (!username) return setErrorMessage("Username is required");
    if (!email) return setErrorMessage("Email is required");
    if (!password) return setErrorMessage("Password is required");
    if (confirmPassword !== password) return setErrorMessage("Passwords do not match");

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const response = await fetch(`${API_URL}/api/cpsh/users/register`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      if (result?.statusCode === 201 || result?.success) {
        if (result?.data?.accessToken) localStorage.setItem("accessToken", result.data.accessToken);
        navigate("/home");
      } else {
        setErrorMessage(result?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const fields = [
    { label: "Full name", type: "text", placeholder: "John Doe", value: fullname, onChange: setFullname },
    { label: "Username", type: "text", placeholder: "john123", value: username, onChange: setUsername },
    { label: "Email", type: "email", placeholder: "you@example.com", value: email, onChange: setEmail },
    { label: "Password", type: "password", placeholder: "••••••••", value: password, onChange: setPassword },
    { label: "Confirm password", type: "password", placeholder: "••••••••", value: confirmPassword, onChange: setConfirmPassword },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="rounded-lg shadow-sm p-8 w-full max-w-md border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h2
          className="font-heading text-2xl font-semibold text-center mb-6 tracking-tight"
          style={{ color: "var(--color-navy)" }}
        >
          Create an account
        </h2>

        {/* Google */}
        <button
          onClick={() => window.location.href = `${BACKEND_URL}/api/cpsh/users/auth/google`}
          className="flex items-center justify-center gap-3 rounded py-2.5 w-full text-sm font-medium transition-colors border mb-6"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-surface)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-2)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface)"}
        >
          <img
            src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-grow h-px" style={{ backgroundColor: "var(--color-border)" }} />
          <span className="px-3 text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>or</span>
          <div className="flex-grow h-px" style={{ backgroundColor: "var(--color-border)" }} />
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-md overflow-hidden border"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface-2)" }}
          >
            <img src={profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* File input */}
          <div>
            <label
              className="block text-xs font-medium mb-1 uppercase tracking-wider"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Profile image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border file:text-sm file:font-medium transition-colors"
              style={{
                color: "var(--color-text-muted)",
                "--file-bg": "var(--color-surface-2)",
                "--file-color": "var(--color-navy)",
                "--file-border": "var(--color-border)",
              }}
            />
          </div>

          {fields.map(({ label, type, placeholder, value, onChange }) => (
            <div key={label}>
              <label
                className="block text-xs font-medium mb-1 uppercase tracking-wider"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input-base"
              />
            </div>
          ))}

          {errorMessage && (
            <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{errorMessage}</p>
          )}

          <button type="submit" className="btn-primary w-full">
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--color-gold)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
