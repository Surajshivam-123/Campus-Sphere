// src/pages/MyEvents.jsx
import { useEffect } from "react";
import EventCard from "./EventCard";
import { useState } from "react";


export default function MyEvents() {
  const [events, setEvents] = useState(null);
  const [message,setmessage]=useState("");
  const participatedEvents = [
    {
      id: 1,
      name: "Coding Contest 2025",
      description: "A campus-wide competitive coding contest.",
      date: "2025-06-20",
      location: "Auditorium Hall",
    },
    {
      id: 2,
      name: "Sports Meet",
      description: "Annual sports event with inter-department matches.",
      date: "2025-05-15",
      location: "Main Stadium",
    },
    {
      id: 3,
      name: "AI Workshop",
      description: "Workshop on the future of AI and ML.",
      date: "2025-04-10",
      location: "Lab 3, Block C",
    },
  ];
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
    <div>Loading...</div>
  )
  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">
        Events You Participated In
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
