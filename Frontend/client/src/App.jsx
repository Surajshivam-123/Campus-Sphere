import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/Route";
import Navbar from "./pages/Home/Navbar";

function App() {
  const location = useLocation();
  // Pages where we DO NOT want the Navbar
  const hideNavbarPaths = ["/", "/login", "/register", "/auth/callback"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      {/* We add a top padding to the main container when Navbar is present so content isn't hidden behind it */}
      <div className={showNavbar ? "pt-24" : ""}>
        <AppRoutes />
      </div>
    </>
  );
}

export default App;
