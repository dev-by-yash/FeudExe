import styles from "./optioncard.module.css";

export default function OptionCard({ index, text = "", revealed = false }) {
  return (
    <div className={styles.border}>
        <div className={styles.optioncard}>
            <div className={styles.circle}>
                <div className={styles.circleText} >
                    {revealed ? text : index}
                </div>
            </div>
        </div>
    </div>
  );
}
