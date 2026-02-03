import styles from "./leaderboard.module.css";
import RankBadge from "./RankBadge";

export default function LeaderboardRow({ rank, team, score, gamesPlayed = 0, gamesWon = 0, winRate = 0 }) {
  const variants = {
    1: styles.first,
    2: styles.second,
    3: styles.third,
    4: styles.fourth,
    5: styles.fifth,
  };

  const numericRank = Number(rank);
  const variantClass = variants[numericRank] ?? styles.default;

  return (
    <div className={`${styles.row} ${variantClass}`}>
      <div className={styles.badgeSlot}>
        <RankBadge rank={numericRank} />
      </div>

      <div className={styles.team}>{team}</div>
      <div className={styles.score}>{typeof score === 'number' ? score.toLocaleString() : score}</div>

      {/* Additional Stats */}
      <div className={styles.stats}>
        <span className="text-gray-400 text-sm">{gamesPlayed} games</span>
        <span className="text-gray-400 text-sm mx-2">•</span>
        <span className="text-green-400 text-sm">{gamesWon} wins</span>
        <span className="text-gray-400 text-sm mx-2">•</span>
        <span className="text-blue-400 text-sm">{winRate}% WR</span>
      </div>
    </div>
  );
}

