import { useNavigate } from "react-router-dom";
import logo from "../../../public/logo.jpg";

export default function Top({ onGetStartedClick }) {
  const navigate = useNavigate();
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center text-center p-8 animated-bg relative overflow-hidden"
    >
      <div className="glass p-12 rounded-3xl max-w-3xl flex flex-col items-center shadow-2xl relative z-10 mx-4 border-[rgba(255,255,255,0.1)] border">
        <img
          src={logo}
          alt="Campus Sphere Logo"
          className="h-28 w-40 rounded-xl shadow-lg mb-8 object-cover border-2 border-white/20"
        />
        
        <h1 className="font-heading text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md">
          Campus Sphere
        </h1>
        <p className="text-lg md:text-xl max-w-xl leading-relaxed text-blue-50 font-medium mb-10 opacity-90">
          Organize, manage, and join campus events — coding contests, sports tournaments, and more — all in one seamless experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/login")}
            className="btn-gold px-8 py-3 text-lg font-bold shadow-xl shadow-amber-500/20"
          >
            Get Started
          </button>
          <button
            onClick={onGetStartedClick}
            className="px-8 py-3 rounded-lg border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
