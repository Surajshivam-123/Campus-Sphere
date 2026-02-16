import API_URL from "../config/api";

const getAllEvents = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/cpsh/events/get-all-events`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.log("Error while getting events and Error", error);
      return null;
    }
  };

  export default getAllEvents;