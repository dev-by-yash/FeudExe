import Leaderboard from "@/components/leaderboard";
import BackToHome from "../../components/BackToHome";
import styles from "./page.module.css";

export default function LeaderboardPage() {
  return (
    <>
      <BackToHome />
      <div className={styles.page}>
        <Leaderboard />
      </div>
    </>
  );
}
