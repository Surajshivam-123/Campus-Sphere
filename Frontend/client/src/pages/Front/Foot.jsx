import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section
      className="flex flex-col items-center justify-center gap-4 py-16 text-center border-t"
      style={{
        backgroundColor: "var(--color-navy)",
        borderColor: "var(--color-navy-light)",
      }}
    >
      <h2 className="font-heading text-2xl font-semibold mb-2 tracking-tight text-white">
        Ready to launch your event?
      </h2>
      <p className="text-sm max-w-md mb-6" style={{ color: "#e8e6e1" }}>
        Sign up now and simplify your campus event management experience.
      </p>
      <div className="flex gap-4">
        <button onClick={() => navigate("/login")} className="btn-gold px-5 py-2.5">
          Sign in
        </button>
        <button
          onClick={() => navigate("/register")}
          className="btn-secondary px-6 py-2.5"
        >
          Register
        </button>
      </div>
    </section>
  );
}
