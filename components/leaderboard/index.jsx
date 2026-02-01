import LeaderboardRow from "./LeaderboardRow";
import LeaderboardHeader from "./LeaderboardHeader";


export default function Leaderboard() {
  return (
    <div>
      <LeaderboardHeader />

      <LeaderboardRow rank={1} team="Team one" score={10} />
      <LeaderboardRow rank={2} team="Team two" score={7} />
      <LeaderboardRow rank={3} team="Team three" score={6} />
      <LeaderboardRow rank={4} team="Team four" score={3} />
      <LeaderboardRow rank={5} team="Team five" score={1} />
    </div>
  );
}