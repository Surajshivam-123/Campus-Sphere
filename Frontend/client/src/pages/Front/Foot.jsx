import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center gap-4 bg-[#1e3a5f] text-white py-16 text-center border-t border-[#2d4a6f]">
      <h2 className="font-heading text-2xl font-semibold mb-2 tracking-tight">Ready to launch your event?</h2>
      <p className="text-[#e8e6e1] text-sm max-w-md mb-6">
        Sign up now and simplify your campus event management experience.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/login")}
          className="cursor-pointer bg-[#b8860b] text-white px-5 py-2.5 rounded border border-[#b8860b] font-medium text-sm hover:bg-[#a67a0a] transition-colors"
        >
          Sign in
        </button>
        <button
          onClick={() => navigate("/register")}
          className="cursor-pointer bg-white text-[#1e3a5f] px-5 py-2.5 rounded border border-white font-medium text-sm hover:bg-[#faf9f6] hover:text-[#1e3a5f] transition-colors"
        >
          Register
        </button>
      </div>
    </section>
  );
}
