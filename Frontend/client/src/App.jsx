import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/Route";
import Navbar from "./pages/Home/Navbar";
import { Footer, ScrollToTop } from "./components/shared";
import OfflinePage from "./pages/OfflinePage";

function App() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleConnectionRetry = () => {
    setIsOnline(navigator.onLine);
  };

  // If connection is lost, show the offline page
  if (!isOnline) {
    return <OfflinePage onRetry={handleConnectionRetry} />;
  }

  // Pages where we DO NOT want the Navbar
  const hideNavbarPaths = ["/", "/login", "/register", "/auth/callback"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  // Pages where we DO NOT want the Footer
  const hideFooterPaths = ["/login", "/register", "/auth/callback"];
  const isChatRoute = location.pathname.includes("/chat");
  const isContestRoute = location.pathname.includes("/contest");
  const isScoreInput = location.pathname.includes("/score-input");
  const showFooter = !hideFooterPaths.includes(location.pathname) && !isChatRoute && !isContestRoute && !isScoreInput;

  return (
    <div className="flex flex-col min-h-screen bg-page text-primary">
      {showNavbar && <Navbar />}
      {/* We add a top padding to the main container when Navbar is present so content isn't hidden behind it */}
      <div className={`flex-grow ${showNavbar ? "pt-24" : ""}`}>
        <AppRoutes />
      </div>
      {showFooter && <Footer />}
      <ScrollToTop />
    </div>
  );
}

export default App;


