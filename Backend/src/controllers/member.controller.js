import { Member } from "../models/members.model";
import asyncHandler from "../utils/AsyncHandler";
import { Event } from "../models/event.model";

const participateEvent = asyncHandler(async (req, res) => {
  try {
    const { invitationCode } = req.params;
    const event = await Event.findOne({ memberCode: invitationCode });
    if (!event) {
      res.status(404).json({ message: "Invalid Member Code" });
    }
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event Joined successfully"));
  } catch (error) {
    console.log("Error while joining event", error);
  }
});

export { participateEvent };
