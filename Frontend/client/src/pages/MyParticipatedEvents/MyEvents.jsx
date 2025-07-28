// src/pages/MyEvents.jsx
import { useEffect } from "react";
import EventCardParticipant from "./EventCardParticipant";
import { useState } from "react";
import LoadingPage from "../LoadingPage";

export default function MyEvents() {
  const [events, setEvents] = useState(null);
  const [message,setmessage]=useState("");
  useEffect(() => {
    const getEvent = async () => {
      const response = await fetch(
        "http://localhost:3000/api/cpsh/participants/my-events",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const result = await response.json();
      console.log("Server Response:",result);
      if(result?.statusCode===200){
        setmessage("");
      setEvents(result?.data);
    }
    else{
      setmessage(result?.message);
    }
    };
    getEvent();
  }, []);
  if(message!=="")return(
    <div>
      <p>{message}</p>
    </div>
  )
  if(!events)return(
    <div><LoadingPage/></div>
  )
  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">
        Events You Participated In as Participant
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCardParticipant key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
