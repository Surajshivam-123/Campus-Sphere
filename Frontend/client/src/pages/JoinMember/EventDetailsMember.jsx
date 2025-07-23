import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventDetailsMemberPage() {
  const { memberCode } = useParams();
  const [eventData, setEventData] = useState(null);
  useEffect(() => {

    const loadEvent = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/cpsh/members/participate/${memberCode}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const result = await response.json();
        console.log("Server Response", result);
        if (result.success) {
          setEventData(result.data);
        }
      } catch (err) {
        console.error("Error loading event:", err);
      }
    };

    loadEvent();
  }, [memberCode]);

  if (!eventData) return <p className="text-center p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto shadow-lg rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Event Details</h1>
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
