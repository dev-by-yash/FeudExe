import styles from "./leaderboardHeader.module.css";
import Image from "next/image";

export default function LeaderboardHeader() {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Leaderboard</h1>
      <div className={styles.logo}>
         <Image
          src="/Logo.png"
          alt="FEUD.exe"
          width={120}
          height={67}
          priority
        />
      </div>
    </div>
  );

}
