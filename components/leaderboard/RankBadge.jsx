import styles from "./rankBadge.module.css";

export default function RankBadge({ rank }) {
  let variant = "default";

  if (rank === 1) variant = "first";
  else if (rank === 2) variant = "second";
  else if (rank === 3) variant = "third";

  return (
    <div className={`${styles.badge} ${styles[variant]}`}>
      <span>{rank}</span>
    </div>
  );
}
