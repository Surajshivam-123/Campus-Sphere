import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../LoadingPage";
import API_URL from "../../config/api";

export default function EventCardParticipant({ event }) {
  const navigate=useNavigate();
  const [participant,setParticipant]=useState(null)
  useEffect(()=>{
    const getParticipant=async()=>{
        const response=await fetch(`${API_URL}/api/cpsh/participants/get-single-participant/${event._id}`,{
            method:"GET",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include"
        })
        const result=await response.json();
        setParticipant(result?.data[0]);
        console.log("Server Response",result);
    }
    getParticipant();
  },[])
  if(!participant)return(
    <div><LoadingPage/></div>
  )
  const handlenavigation=()=>{
    if(event.category==='sports' && event.sports==='cricket'){
        navigate(`/cricket-event-details/${event._id}/${participant.identityNumber}/${event.participantCode}/${participant._id}`)
    }
    else{
        navigate(`/event-details/${participant.identityNumber}/${event.participantCode}/${participant._id}`)
    }
  }
  return (
    <div onClick={handlenavigation} className="cursor-pointer bg-white shadow-md rounded-xl p-4 w-full max-w-md mx-auto hover:shadow-xl transition duration-300">
      {event.fullname!=='' &&(
        <div className="text-purple-700 font-bold flex items-center mb-2">{event.festivalName}</div>
      )}
      <h2 className="text-xl font-bold text-purple-700">{event.eventName}</h2>
      <p className="text-gray-600 mt-2">{event.description}</p>
      <div className="flex justify-between mt-4 text-sm text-gray-500">
        <span>📅 {event.startDate}</span>
        <span>📍 {event.location}</span>
      </div>
    </div>
  );
}
