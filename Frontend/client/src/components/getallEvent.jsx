

const getAllEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/cpsh/events/get-all-events",
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