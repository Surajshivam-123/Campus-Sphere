import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/home", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center text-sm"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}
    >
      Signing you in…
    </div>
  );
}
