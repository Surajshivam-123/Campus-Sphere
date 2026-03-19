import LoadingPage from "../LoadingPage";
import EventCard from "../../components/shared/EventCard";
import { useEventParticipant } from "../../hooks/useEventParticipant";

export default function EventCardTeam({ event }) {
  const { participant, loading } = useEventParticipant(event._id);

  if (loading || !participant) {
    return <LoadingPage />;
  }

  return (
    <EventCard
      event={event}
      variant="team"
      additionalData={{
        identityNumber: participant.identityNumber,
        participantCode: event.participantCode,
        participantId: participant._id,
      }}
    />
  );
}
