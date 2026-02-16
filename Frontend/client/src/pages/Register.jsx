import { useState } from "react";
import profile from "../assets/download.jpeg";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [fullname, setfullname] = useState("");
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file)); // preview
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    let fn = true,
      un = true,
      em = true,
      pw = true,
      cp = true;
    if (!fullname) {
      setErrorMessage("fullname is required");
      fn = false;
    }
    formData.append("fullname", fullname);
    if (!username) {
      setErrorMessage("username is required");
      un = false;
    }
    formData.append("username", username);
    if (!email) {
      setErrorMessage("email is required");
      em = false;
    }
    formData.append("email", email);
    if (!password) {
      setErrorMessage("password is required");
      pw = false;
    }
    formData.append("password", password);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    if (confirmPassword !== password) {
      setErrorMessage("Passwords do not match");
      cp = false;
    }
    if (fn && un && em && pw && cp) {
      try {
        const response = await fetch(
          "http://localhost:3000/api/cpsh/users/register",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        const result = await response.json();
        console.log("Server Response:", result);
        navigate("/home");
      } catch (err) {
        console.error("Error sending data:", err);
      }
    }
  };
  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center py-10 px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 w-full max-w-md">
        <h2 className="font-heading text-2xl font-semibold text-center text-[#1e3a5f] mb-6 tracking-tight">
          Create an account
        </h2>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-md bg-[#f0ede6] overflow-hidden border border-gray-200">
            <img src={profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
          </div>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1 uppercase tracking-wider">
              Profile image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-200 file:text-sm file:font-medium file:bg-[#faf9f6] file:text-[#1e3a5f] hover:file:bg-[#f0ede6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1 uppercase tracking-wider">Full name</label>
            <input
              type="text"
              placeholder="John Doe"
              onChange={(e) => setfullname(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1 uppercase tracking-wider">Username</label>
            <input
              type="text"
              placeholder="John123"
              onChange={(e) => setusername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1 uppercase tracking-wider">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setemail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setpassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1 uppercase tracking-wider">Confirm password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
            />
          </div>
          {errorMessage && <p className="text-red-600 text-sm text-center">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full bg-[#1e3a5f] text-white py-2.5 rounded border border-[#1e3a5f] hover:bg-[#2d4a6f] transition-colors text-sm font-medium"
            onClick={handleSubmit}
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-[#b8860b] hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
