import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center gap-3 bg-purple-700 text-white py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Event?</h2>

      <p className="text-lg mb-6">
        Sign up now and simplify your campus event management experience.
      </p>
      <div className="flex space-x-3">
        <button
          onClick={() => {
            navigate("/login");
          }}
          className="cursor-pointer bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          Login
        </button>
        <button onClick={()=>{
          navigate("/register")
        }} className="cursor-pointer bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
          Register
        </button>
      </div>
    </section>
  );
}
