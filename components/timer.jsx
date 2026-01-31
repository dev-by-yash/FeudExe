import styles from "./timer.module.css";
export default function Timer({ time = "00" }) {
  return (
    <div className={styles.border}>
        <div className={styles.timer}>
            {time}
        </div>
    </div>
  );
}
