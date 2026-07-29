import logo from "../../public/logo.jpg";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import apiClient from "../services/api.service";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usermail, setUsermail] = useState("");
  const [password, setPassword] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/cpsh/users/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await login({ usermail, password });
      navigate("/home", { replace: true });
    } catch (error) {
      setMessage(error?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!otpEmail.trim()) return setMessage("Please enter your email");
    setLoading(true);
    try {
      const result = await apiClient.post("/api/cpsh/users/send-otp", { email: otpEmail });
      if (result?.statusCode === 200) { setOtpSent(true); setMessage(""); }
      else setMessage(result?.message);
    } catch (error) {
      setMessage(error?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!otp.trim()) return setMessage("Please enter the OTP");
    setLoading(true);
    try {
      const result = await apiClient.post("/api/cpsh/users/verify-otp", { email: otpEmail, otp });
      if (result?.statusCode === 200) {
        if (result?.data?.accessToken) localStorage.setItem("accessToken", result.data.accessToken);
        window.location.replace("/home");
      } else setMessage(result?.message);
    } catch (error) {
      setMessage(error?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-bg">
      <div className="card glass overflow-hidden w-full max-w-4xl flex flex-col md:flex-row border border-white/10 shadow-2xl">
        {/* Left: Branding */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center text-center bg-navy relative overflow-hidden">
          {/* Subtle gradient overlay on branding side */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy-light opacity-90 z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={logo}
              alt="Campus Sphere Logo"
              className="rounded-xl w-32 h-32 object-cover border-2 shadow-xl border-white/20 mb-6"
            />
            <h1 className="font-heading text-3xl font-bold text-white mb-3">Welcome Back!</h1>
            <p className="text-sm leading-relaxed max-w-xs text-blue-100/80">
              Organize, participate, and celebrate campus events seamlessly.
            </p>
            <div className="mt-8 w-16 h-1 rounded-full bg-gold" />
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="font-heading text-3xl font-bold mb-8 tracking-tight text-navy">
            Sign in to your account
          </h2>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 rounded py-2.5 w-full text-sm font-medium transition-colors border"
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

          <div className="flex items-center my-6">
            <div className="flex-grow h-px" style={{ backgroundColor: "var(--color-border)" }} />
            <span className="px-3 text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>or</span>
            <div className="flex-grow h-px" style={{ backgroundColor: "var(--color-border)" }} />
          </div>

          {/* OTP Mode */}
          {otpMode ? (
            <form className="space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <input
                id="otpEmail" name="otpEmail" type="email"
                placeholder="Enter your email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                disabled={otpSent}
                className="input-base"
              />
              {otpSent && (
                <div className="space-y-1">
                  <input
                    id="otp" name="otp" type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="input-base"
                  />
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Check your inbox. OTP expires in 10 minutes.
                  </p>
                </div>
              )}
              {message && (
                <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{message}</p>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Please wait…" : otpSent ? "Verify OTP" : "Send OTP"}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(""); setMessage(""); }}
                  className="w-full text-sm hover:underline text-center"
                  style={{ color: "var(--color-gold)" }}
                >
                  Resend OTP
                </button>
              )}
              <button
                type="button"
                onClick={() => { setOtpMode(false); setOtpSent(false); setOtp(""); setOtpEmail(""); setMessage(""); }}
                className="w-full text-sm hover:underline text-center"
                style={{ color: "var(--color-text-muted)" }}
              >
                Back to password login
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                id="usermail" name="usermail" type="text"
                placeholder="Email or username"
                value={usermail}
                onChange={(e) => setUsermail(e.target.value)}
                className="input-base"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setOtpMode(true); setMessage(""); }}
                  className="text-sm hover:underline focus:outline-none"
                  style={{ color: "var(--color-gold)" }}
                >
                  Login via OTP
                </button>
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {message && (
                <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>{message}</p>
              )}
              <button type="submit" className="btn-primary w-full">Sign in</button>
            </form>
          )}

          <p className="mt-4 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-medium hover:underline" style={{ color: "var(--color-gold)" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
