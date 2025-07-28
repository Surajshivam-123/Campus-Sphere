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

  if (!eventData)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-medium text-gray-600 animate-pulse">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          Event Details
        </h1>
        <div className="space-y-4 text-gray-700 text-lg">
          <p>
            <span className="font-semibold text-blue-600">Identity Number:</span>{" "}
            {identityNumber}
          </p>
          <p>
            <span className="font-semibold text-blue-600">Event Name:</span>{" "}
            {eventData.eventName}
          </p>
          <p>
            <span className="font-semibold text-blue-600">Date:</span>{" "}
            {eventData.startDate}
          </p>
          <p>
            <span className="font-semibold text-blue-600">Location:</span>{" "}
            {eventData.location}
          </p>
          <p>
            <span className="font-semibold text-blue-600">Description:</span>{" "}
            {eventData.description}
          </p>
        </div>
      </div>
    </div>
  );
}
