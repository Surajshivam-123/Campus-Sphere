import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FloatingChatButton from "./FloatingChatButton";

export default function EventChatWrapper({ children }) {
  const location = useLocation();
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    // Extract eventId from pathname (matches /events/:eventId, /sports/cricket/*/:eventId, /coding/*/:eventId, etc.)
    const match = location.pathname.match(
      /\/(events|sports\/cricket|sports|coding|coding\/contest|organizer\/coding|organizer\/cricket)\/([a-f\d]{24})/i
    );
    setEventId(match ? match[2] : null);
  }, [location.pathname]);

  return (
    <>
      {children}
      <FloatingChatButton eventId={eventId} />
    </>
  );
}
