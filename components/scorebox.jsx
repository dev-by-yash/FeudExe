import styles from "./scorebox.module.css";
export default function ScoreBox({ score = 0 }) {
  return (
    <div className={styles.border}>
        <div className={styles.scoreBox}>
            {score}
        </div>
    </div>
  );
}
