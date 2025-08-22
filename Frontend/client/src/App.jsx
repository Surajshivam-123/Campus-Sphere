import { useState } from "react";
import AppRoutes from "./routes/Route";
import { useEffect } from "react";
import { data } from "react-router-dom";

function App() {
  const [status, setStatus] = useState("Loading...");
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/campus-sphere`)
      .then((res) => res.text)
      .then((data) => setStatus(data))
      .catch(() => setStatus("Something went wrong"));
  },[]);
  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;
