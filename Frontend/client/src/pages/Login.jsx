import logo from "../../public/logo.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function Login() {
  const navigate = useNavigate();
  const [usermail, setusermail] = useState("");
  const [password, setpassword] = useState("");
  const [message, setmessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/cpsh/users/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usermail,
            password,
          }),
        }
      );
      const result = await response.json();
      console.log("Server Response:", result);
      if (result?.statusCode === 200) {
        navigate("/home");
      }
      else{
        setmessage(result?.message);
      }
    } catch (error) {
      console.error("Error sending data while logging in:", error);
    }
  };
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

          <button className="cursor-pointer flex items-center justify-center gap-3 border border-gray-200 rounded py-2.5 w-full hover:bg-[#faf9f6] transition-colors text-sm text-[#374151]">
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

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Email or username"
              value={usermail}
              onChange={(e) => setusermail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
            <div className="flex justify-end">
              <button type="button" className="text-sm cursor-pointer text-[#b8860b] hover:underline focus:outline-none">
                Login via OTP
              </button>
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
            {message && <p className="text-red-600 text-sm text-center">{message}</p>}
            <button
              type="submit"
              className="cursor-pointer w-full bg-[#1e3a5f] text-white py-2.5 rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition-colors text-sm font-medium"
              onClick={handleSubmit}
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Don’t have an account?{" "}
            <a href="/register" className="text-[#b8860b] hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
