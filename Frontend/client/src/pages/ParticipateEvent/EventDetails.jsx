import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventDetailsPage() {
  const { identityNumber, participantCode } = useParams();
  const [eventData, setEventData] = useState(null);
  useEffect(() => {
    const loadEvent = async () => {
      const response = await fetch(
        `http://localhost:3000/api/cpsh/participants/participate/${participantCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const result = await response.json();
      if (result) {
        setEventData(result?.data);
      }
      console.log("Server Resposne", result);
    };
    loadEvent();
  }, [participantCode, identityNumber]);

  if (!eventData) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto shadow-lg rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Event Details</h1>
      <p>
        <strong>Identity Number:</strong> {identityNumber}
      </p>
      <p>
        <strong>Event Name:</strong> {eventData.eventName}
      </p>
      <p>
        <strong>Date:</strong> {eventData.startDate}
      </p>
      <p>
        <strong>Location:</strong> {eventData.location}
      </p>
      <p>
        <strong>Description:</strong> {eventData.description}
      </p>
    </div>
  );
}
