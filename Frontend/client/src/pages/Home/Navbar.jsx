import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3000/api/cpsh/users/logout",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          credentials:"include"
        }
      );
      const result = response.json();
      console.log("Server Response", result);
      navigate("/")
    } catch (error) {
      console.log("Error", error);
    }
  };
  return (
    <nav className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Campus Sphere Logo"
            className="h-20 w-35 rounded-full border-2 border-white shadow-md hover:scale-105 transition duration-300"
          />
        </Link>

        {/* Nav Links */}
        <ul className="hidden md:flex space-x-20 text-white font-medium text-lg">
          <li className="hover:text-yellow-300 transition">
            <Link to="/my-events">Events Participated</Link>
          </li>
          <li className="hover:text-yellow-300 transition">
            <Link to="/events-hosted">Events Hosted</Link>
          </li>
          <li className="hover:text-yellow-300 transition">
            <Link to="/profile">Profile</Link>
          </li>
        </ul>

        {/* Logout Button */}
        <Link
          to="/logout"
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300"
          onClick={logout}
        >
          Logout
        </Link>
      </div>
    </nav>
  );
}
