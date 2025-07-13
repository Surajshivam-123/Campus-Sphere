import logo from '../assets/logo.jpg'
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-400 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row transition-all">
        
        {/* Left: Branding Section */}
        <div className="w-full md:w-1/2 bg-purple-600 text-white p-10 flex flex-col justify-center items-center">
          <img src={logo} alt="Campus Sphere Logo" className="rounded-full" />
          <p className="mt-4 text-center text-lg font-light">
            Organize, Participate, and Celebrate Campus Events Seamlessly.
          </p>
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Login to your account</h2>

          {/* Google Login */}
          <button className="cursor-pointer flex items-center justify-center gap-3 border border-gray-300 rounded-md py-2 w-full hover:bg-gray-100 transition">
            <img
              src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw"
              alt="Google"
              className="w-6 h-6"
            />
            <span className="text-gray-600 font-medium">Continue with Google</span>
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="px-3 text-gray-400 text-sm">or login with email</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="text-sm cursor-pointer text-blue-600 hover:underline focus:outline-none"
              >
                Login via OTP
              </button>
            </div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="cursor-pointer w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
              onClick={()=>{
                navigate("/home")
              }}
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Don’t have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
