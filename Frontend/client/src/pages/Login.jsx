import logo from "../../public/logo.jpg";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import API_URL from "../config/api.js";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  const navigate = useNavigate();

  // password login state
  const [usermail, setusermail] = useState("");
  const [password, setpassword] = useState("");

  // OTP flow state
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setmessage] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/cpsh/users/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setmessage("");
    try {
      const response = await fetch(`${API_URL}/api/cpsh/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usermail, password }),
      });
      const result = await response.json();
      if (result?.statusCode === 200) {
        if (result?.data?.accessToken) {
          localStorage.setItem("accessToken", result.data.accessToken);
        }
        navigate("/home");
      } else {
        setmessage(result?.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setmessage("");
    if (!otpEmail.trim()) return setmessage("Please enter your email");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cpsh/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const result = await res.json();
      if (result?.statusCode === 200) {
        setOtpSent(true);
        setmessage("");
      } else {
        setmessage(result?.message);
      }
    } catch {
      setmessage("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setmessage("");
    if (!otp.trim()) return setmessage("Please enter the OTP");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cpsh/users/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const result = await res.json();
      if (result?.statusCode === 200) {
        if (result?.data?.accessToken) {
          localStorage.setItem("accessToken", result.data.accessToken);
        }
        navigate("/home");
      } else {
        setmessage(result?.message);
      }
    } catch {
      setmessage("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm";
  const btnPrimary = "cursor-pointer w-full bg-[#1e3a5f] text-white py-2.5 rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition-colors text-sm font-medium disabled:opacity-60";

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left: Branding */}
        <div className="w-full md:w-1/2 bg-[#1e3a5f] text-white p-10 flex flex-col justify-center items-center text-center">
          <img src={logo} alt="Campus Sphere Logo" className="rounded-md w-24 h-24 object-cover border border-[#c9a227]/30" />
          <p className="mt-4 text-[#e8e6e1] text-sm leading-relaxed max-w-xs">
            Organize, participate, and celebrate campus events seamlessly.
          </p>
          <div className="mt-6 w-12 h-px bg-[#c9a227]/50" />
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="font-heading text-2xl font-semibold text-[#1e3a5f] mb-6 tracking-tight">
            Sign in to your account
          </h2>

          <button
            onClick={handleGoogleLogin}
            className="cursor-pointer flex items-center justify-center gap-3 border border-gray-200 rounded py-2.5 w-full hover:bg-[#faf9f6] transition-colors text-sm text-[#374151]"
          >
            <img
              src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="px-3 text-gray-400 text-xs uppercase tracking-wider">or</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          {/* OTP Mode */}
          {otpMode ? (
            <form className="space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <input
                id="otpEmail"
                name="otpEmail"
                type="email"
                placeholder="Enter your email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                disabled={otpSent}
                className={inputCls}
              />
              {otpSent && (
                <div className="space-y-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400">Check your inbox. OTP expires in 10 minutes.</p>
                </div>
              )}
              {message && <p className="text-red-600 text-sm text-center">{message}</p>}
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(""); setmessage(""); }}
                  className="w-full text-sm text-[#b8860b] hover:underline text-center"
                >
                  Resend OTP
                </button>
              )}
              <button
                type="button"
                onClick={() => { setOtpMode(false); setOtpSent(false); setOtp(""); setOtpEmail(""); setmessage(""); }}
                className="w-full text-sm text-gray-400 hover:underline text-center"
              >
                Back to password login
              </button>
            </form>
          ) : (
            /* Password Mode */
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                id="usermail"
                name="usermail"
                type="text"
                placeholder="Email or username"
                value={usermail}
                onChange={(e) => setusermail(e.target.value)}
                className={inputCls}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setOtpMode(true); setmessage(""); }}
                  className="text-sm cursor-pointer text-[#b8860b] hover:underline focus:outline-none"
                >
                  Login via OTP
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                className={inputCls}
              />
              {message && <p className="text-red-600 text-sm text-center">{message}</p>}
              <button type="submit" className={btnPrimary}>
                Sign in
              </button>
            </form>
          )}

          <p className="mt-4 text-sm text-gray-500 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#b8860b] hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
