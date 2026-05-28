import { useState, useEffect } from "react";
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

  // Email verification states
  const [verificationToken, setVerificationToken] = useState("");
  const [otpEmailSent, setOtpEmailSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setErrorMessage("");
    setOtpMessage("");
    if (!email?.trim()) return setErrorMessage("Email is required before verification");
    if (!/\S+@\S+\.\S+/.test(email)) return setErrorMessage("Please enter a valid email address");

    setIsSendingOtp(true);
    try {
      const response = await fetch(`${API_URL}/api/cpsh/users/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (response.ok || result?.success) {
        setOtpEmailSent(true);
        setResendCooldown(60);
        setOtpMessage("Verification OTP sent to your email!");
      } else {
        setErrorMessage(result?.message || "Failed to send verification OTP.");
      }
    } catch (err) {
      console.error("Send Registration OTP error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmOtp = async () => {
    setErrorMessage("");
    setOtpMessage("");
    if (!otpCode?.trim()) return setOtpMessage("Please enter the 6-digit OTP");

    setIsVerifyingOtp(true);
    try {
      const response = await fetch(`${API_URL}/api/cpsh/users/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const result = await response.json();
      if (response.ok || result?.success) {
        setVerificationToken(result?.data?.verificationToken);
        setIsEmailVerified(true);
        setOtpEmailSent(false);
        setOtpMessage("Email address successfully verified!");
      } else {
        setOtpMessage(result?.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      console.error("Verify Registration OTP error:", err);
      setOtpMessage("Something went wrong. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^()\-_+=\[\]{}|;:,./<>~`]/.test(password);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter";
    if (!/\d/.test(pwd)) return "Password must contain at least one number";
    if (!/[@$!%*?&#^()\-_+=\[\]{}|;:,./<>~`]/.test(pwd)) return "Password must contain at least one special character";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname) return setErrorMessage("Full name is required");
    if (!username) return setErrorMessage("Username is required");
    if (!email) return setErrorMessage("Email is required");
    if (!isEmailVerified) return setErrorMessage("Please verify your email address first");
    if (!password) return setErrorMessage("Password is required");

    const pwdError = validatePassword(password);
    if (pwdError) return setErrorMessage(pwdError);

    if (confirmPassword !== password) return setErrorMessage("Passwords do not match");

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("verificationToken", verificationToken);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const response = await fetch(`${API_URL}/api/cpsh/users/register`, {
        method: "POST",
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
    <div className="min-h-screen flex items-center justify-center py-10 px-4 animated-bg">
      <div className="card glass overflow-hidden w-full max-w-lg p-8 border border-white/10 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent z-0 rounded-lg pointer-events-none"></div>
        <div className="relative z-10">
        <h2 className="font-heading text-3xl font-bold text-center mb-8 tracking-tight text-navy">
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
              {label === "Email" ? (
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      disabled={isEmailVerified}
                      className="input-base flex-grow"
                    />
                    {isEmailVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-2.5 rounded border border-emerald-500/20 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || resendCooldown > 0}
                        className="btn-primary py-2.5 px-4 text-xs font-semibold shrink-0"
                        style={{
                          minWidth: "110px",
                          background: resendCooldown > 0 ? "var(--color-surface-2)" : "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                          color: resendCooldown > 0 ? "var(--color-text-muted)" : "var(--color-navy)"
                        }}
                      >
                        {isSendingOtp ? "Sending..." : resendCooldown > 0 ? `${resendCooldown}s` : "Verify Email"}
                      </button>
                    )}
                  </div>

                  {otpEmailSent && !isEmailVerified && (
                    <div className="p-4 rounded-lg border border-white/10 glass bg-white/5 space-y-3 animated-fade-in shadow-inner">
                      <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        Enter the 6-digit OTP sent to your email:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                          className="input-base text-center tracking-widest text-lg font-bold w-32 flex-grow-0"
                          style={{ borderColor: "var(--color-gold)" }}
                        />
                        <button
                          type="button"
                          onClick={handleConfirmOtp}
                          disabled={isVerifyingOtp}
                          className="btn-primary py-2.5 px-4 text-xs font-semibold flex-grow"
                          style={{
                            background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                            color: "var(--color-navy)"
                          }}
                        >
                          {isVerifyingOtp ? "Verifying..." : "Confirm OTP"}
                        </button>
                      </div>
                      {otpMessage && (
                        <p className="text-xs font-semibold text-gold mt-1">{otpMessage}</p>
                      )}
                    </div>
                  )}
                  {isEmailVerified && otpMessage && (
                    <p className="text-xs font-semibold text-emerald-500 mt-1">{otpMessage}</p>
                  )}
                </div>
              ) : (
                <input
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="input-base"
                />
              )}
              {label === "Password" && password && (
                <div className="mt-2 p-3 rounded-lg border text-xs bg-surface-2 border-base">
                  <p className="font-semibold text-secondary mb-1.5">Password requirements:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={hasMinLength ? "text-success font-bold" : "text-muted font-bold"}>
                        {hasMinLength ? "✓" : "○"}
                      </span>
                      <span className={hasMinLength ? "text-primary" : "text-secondary"}>Min 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={hasUppercase ? "text-success font-bold" : "text-muted font-bold"}>
                        {hasUppercase ? "✓" : "○"}
                      </span>
                      <span className={hasUppercase ? "text-primary" : "text-secondary"}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={hasLowercase ? "text-success font-bold" : "text-muted font-bold"}>
                        {hasLowercase ? "✓" : "○"}
                      </span>
                      <span className={hasLowercase ? "text-primary" : "text-secondary"}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={hasNumber ? "text-success font-bold" : "text-muted font-bold"}>
                        {hasNumber ? "✓" : "○"}
                      </span>
                      <span className={hasNumber ? "text-primary" : "text-secondary"}>One number</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <span className={hasSpecial ? "text-success font-bold" : "text-muted font-bold"}>
                        {hasSpecial ? "✓" : "○"}
                      </span>
                      <span className={hasSpecial ? "text-primary" : "text-secondary"}>One special character (@$!%*?& etc.)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {errorMessage && (
            <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{errorMessage}</p>
          )}

          <button type="submit" className="btn-primary w-full">
            Create account
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-bold hover:underline text-gold">
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
