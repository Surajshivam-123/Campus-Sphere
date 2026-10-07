import { User } from "../../models/user.model.js";
import { Event } from "../../models/event.model.js";
import { Participant } from "../../models/participant.model.js";
import { Member } from "../../models/members.model.js";
import { Team } from "../../models/team.model.js";
import { Club } from "../../models/club.model.js";
import { ClubMember } from "../../models/clubMember.model.js";
import { JoinRequest } from "../../models/joinRequest.model.js";
import { Cricket_Player } from "../../sports/cricket/models/player.model.js";
import { Submission } from "../../sports/coding/models/submission.model.js";

/**
 * Retrieve personalized, strictly scoped data for the authenticated user ONLY.
 * NEVER retrieves or leaks other users' records.
 *
 * @param {string} userId - MongoDB ObjectId string of the authenticated user
 * @returns {Promise<{ raw: object, formattedText: string, stats: object }>}
 */
export async function getUserPrivateContext(userId) {
  if (!userId) return null;

  try {
    // 1. Fetch user profile (safe fields only)
    const user = await User.findById(userId).select("fullname username email isVerified avatar createdAt");
    if (!user) return null;

    // 2. Query in parallel with strict user scoping
    const [
      organizedEvents,
      participatedEvents,
      memberRoles,
      ownedTeams,
      clubMemberships,
      foundedClubs,
      cricketStats,
      codingSubmissions,
      sentJoinRequests,
    ] = await Promise.all([
      // Events hosted by this user
      Event.find({ organizer: userId })
        .select("eventName festivalName category mode startDate location participantCode memberCode maxParticipants")
        .sort({ startDate: -1 })
        .lean(),

      // Events user joined as participant
      Participant.find({ owner: userId })
        .populate("event", "eventName festivalName category mode startDate location")
        .select("event identityNumber createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      // Events user joined as staff/member
      Member.find({ owner: userId })
        .populate("event", "eventName festivalName category startDate")
        .select("name role event createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      // Teams owned by this user
      Team.find({ owner: userId })
        .populate("event", "eventName")
        .select("name teamCode event createdAt")
        .lean(),

      // Clubs user is a member of
      ClubMember.find({ user: userId })
        .populate("club", "name college category clubCode isPublic")
        .select("club position isHead status joinedAt")
        .lean(),

      // Clubs founded by this user
      Club.find({ founder: userId })
        .select("name college category clubCode isPublic createdAt")
        .lean(),

      // Cricket tournaments / player stats
      Cricket_Player.find({ owner: userId })
        .populate({
          path: "team",
          select: "name event",
          populate: { path: "event", select: "eventName" },
        })
        .select("balls runs wickets overs team")
        .lean(),

      // Coding contest submissions
      Submission.find({ participant: userId })
        .populate("problem", "title difficulty")
        .populate("event", "eventName")
        .select("language status score passedCount totalCount problem event createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Join requests submitted by this user
      JoinRequest.find({ requester: userId })
        .populate("event", "eventName")
        .populate("team", "name")
        .populate("club", "name")
        .select("type status event team club createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Format clean readable summaries for the LLM prompt
    const lines = [];
    lines.push(`=== VERIFIED LOGGED-IN USER PROFILE ===`);
    lines.push(`Full Name: ${user.fullname}`);
    lines.push(`Username: @${user.username}`);
    lines.push(`Email: ${user.email}`);
    lines.push(`Email Verified: ${user.isVerified ? "Yes" : "No"}`);
    lines.push(`Joined Platform: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}`);

    // Events Hosted
    lines.push(`\n=== EVENTS HOSTED / ORGANIZED BY THIS USER (${organizedEvents.length}) ===`);
    if (organizedEvents.length === 0) {
      lines.push("None hosted yet.");
    } else {
      organizedEvents.forEach((e, idx) => {
        lines.push(
          `${idx + 1}. "${e.eventName}" [Category: ${e.category || "General"}, Mode: ${e.mode}, Date: ${
            e.startDate ? new Date(e.startDate).toDateString() : "TBD"
          }, Location: ${e.location || "N/A"}] (Codes: Participant Code: "${e.participantCode}", Member Code: "${e.memberCode}")`
        );
      });
    }

    // Events Participated In
    const validParticipations = participatedEvents.filter((p) => p.event);
    lines.push(`\n=== EVENTS JOINED AS PARTICIPANT (${validParticipations.length}) ===`);
    if (validParticipations.length === 0) {
      lines.push("None joined as participant yet.");
    } else {
      validParticipations.forEach((p, idx) => {
        const ev = p.event;
        lines.push(
          `${idx + 1}. "${ev.eventName}" [Category: ${ev.category || "General"}, Date: ${
            ev.startDate ? new Date(ev.startDate).toDateString() : "TBD"
          }, Location: ${ev.location || "N/A"}] (Identity/Roll: ${p.identityNumber})`
        );
      });
    }

    // Events Joined as Staff / Member
    const validMemberships = memberRoles.filter((m) => m.event);
    lines.push(`\n=== EVENTS JOINED AS STAFF / MEMBER (${validMemberships.length}) ===`);
    if (validMemberships.length === 0) {
      lines.push("None joined as staff member yet.");
    } else {
      validMemberships.forEach((m, idx) => {
        const ev = m.event;
        lines.push(
          `${idx + 1}. "${ev.eventName}" — Assigned Role: ${m.role || "Volunteer"} [Date: ${
            ev.startDate ? new Date(ev.startDate).toDateString() : "TBD"
          }]`
        );
      });
    }

    // Teams Owned or Joined as Player
    const playerTeams = cricketStats
      .filter((c) => c?.team && (!ownedTeams.some((ot) => ot._id?.toString() === c.team._id?.toString())))
      .map((c) => c.team);

    lines.push(`\n=== TEAMS (OWNED & SQUAD MEMBER) (${ownedTeams.length + playerTeams.length}) ===`);
    if (ownedTeams.length === 0 && playerTeams.length === 0) {
      lines.push("None created or joined yet.");
    } else {
      if (ownedTeams.length > 0) {
        lines.push("Teams Owned (Captain):");
        ownedTeams.forEach((t, idx) => {
          lines.push(
            `  ${idx + 1}. "${t.name}" (Team Code: "${t.teamCode}") — Event: ${t.event?.eventName || "General"}`
          );
        });
      }
      if (playerTeams.length > 0) {
        lines.push("Squad Member In:");
        playerTeams.forEach((t, idx) => {
          lines.push(
            `  ${idx + 1}. "${t.name}" — Event: ${t.event?.eventName || "Tournament"}`
          );
        });
      }
    }

    // Clubs
    lines.push(`\n=== CAMPUS CLUBS MEMBERSHIPS (${clubMemberships.length}) & FOUNDED (${foundedClubs.length}) ===`);
    if (foundedClubs.length > 0) {
      lines.push("Founded Clubs:");
      foundedClubs.forEach((c) => {
        lines.push(`- "${c.name}" [College: ${c.college}, Category: ${c.category}, Code: ${c.clubCode}]`);
      });
    }
    if (clubMemberships.length > 0) {
      lines.push("Joined Clubs:");
      clubMemberships.forEach((m) => {
        if (m.club) {
          lines.push(
            `- "${m.club.name}" — Position: ${m.position || "Member"} (${m.isHead ? "Club Head" : "Member"}, Status: ${m.status})`
          );
        }
      });
    }
    if (foundedClubs.length === 0 && clubMemberships.length === 0) {
      lines.push("No club memberships found.");
    }

    // Cricket Tournament Stats
    lines.push(`\n=== CRICKET TOURNAMENT PLAYER STATS (${cricketStats.length}) ===`);
    if (cricketStats.length === 0) {
      lines.push("No cricket tournament match records yet.");
    } else {
      cricketStats.forEach((c, idx) => {
        lines.push(
          `${idx + 1}. Team: "${c.team?.name || "Cricket Team"}" (Event: ${c.team?.event?.eventName || "Tournament"}) — Runs Scored: ${c.runs || 0}, Balls Faced: ${c.balls || 0}, Wickets Taken: ${c.wickets || 0}, Overs Bowled: ${c.overs || 0}`
        );
      });
    }

    // Coding Contest Submissions
    lines.push(`\n=== RECENT CODING CONTEST SUBMISSIONS (${codingSubmissions.length}) ===`);
    if (codingSubmissions.length === 0) {
      lines.push("No coding submissions recorded yet.");
    } else {
      codingSubmissions.forEach((s, idx) => {
        lines.push(
          `${idx + 1}. Problem: "${s.problem?.title || "Problem"}" [Event: ${s.event?.eventName || "Contest"}] — Verdict: ${s.status.toUpperCase()}, Score: ${s.score || 0}, Testcases: ${s.passedCount}/${s.totalCount}, Language: ${s.language}`
        );
      });
    }

    // Join Requests
    lines.push(`\n=== USER JOIN REQUESTS SENT (${sentJoinRequests.length}) ===`);
    if (sentJoinRequests.length === 0) {
      lines.push("No pending or past join requests.");
    } else {
      sentJoinRequests.forEach((r, idx) => {
        const target = r.event?.eventName || r.team?.name || r.club?.name || "Target";
        lines.push(
          `${idx + 1}. Type: ${r.type.toUpperCase()}, Target: "${target}", Status: ${r.status.toUpperCase()}`
        );
      });
    }

    const formattedText = lines.join("\n");

    const stats = {
      organizedCount: organizedEvents.length,
      participatedCount: validParticipations.length,
      staffCount: validMemberships.length,
      teamsCount: ownedTeams.length,
      clubsCount: clubMemberships.length + foundedClubs.length,
      cricketMatchesCount: cricketStats.length,
      codingSubmissionsCount: codingSubmissions.length,
    };

    return {
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
      stats,
      formattedText,
    };
  } catch (error) {
    console.error("Error retrieving user private context:", error);
    return null;
  }
}
