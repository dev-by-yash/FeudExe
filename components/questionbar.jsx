import styles from "./questionbar.module.css";
export default function QuestionBar({ question }) {
  return (
    <div className={styles.border}>
    <div className={styles.questionBar}>
      {question}
      </div>
    </div>
  );
}
