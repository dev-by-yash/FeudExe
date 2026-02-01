import styles from "./leaderboard.module.css";
import RankBadge from "./RankBadge";

export default function LeaderboardRow({ rank, team, score }) {
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
      <div className={styles.score}>{score}</div>
    </div>
  );
}
