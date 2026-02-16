import API_URL from "../config/api";

const getsingleEvent = async(eventId)=>{
        try {
            const event=await fetch(`${API_URL}/api/cpsh/events/get-single-event/${eventId}`,{
                method:"GET",
                headers:{
                    "Content-Type":"application/json"
                },
                credentials:"include"
            })
            const result=await event.json();
            console.log("Server response",result);
            if(!result){
                console.log("No event found");
            }
            return result;
        } catch (error) {
            console.log("Error while getting single event",error);
            return(null)
        }
    }
export default getsingleEvent;