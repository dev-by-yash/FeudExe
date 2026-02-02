"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./buzzer.module.css";

export default function BuzzerPage() {
  const searchParams = useSearchParams();
  const team = searchParams.get("team") || "Unknown Team";

  const [locked, setLocked] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const state = JSON.parse(localStorage.getItem("feudBuzzer"));
    if (state?.locked) {
      setLocked(true);
      setWinner(state.team);
    }
  }, []);

  const buzz = () => {
    const existing = JSON.parse(localStorage.getItem("feudBuzzer"));

    // Someone already buzzed
    if (existing?.locked) {
      setLocked(true);
      setWinner(existing.team);
      return;
    }

    const data = {
      locked: true,
      team,
      time: Date.now()
    };

    localStorage.setItem("feudBuzzer", JSON.stringify(data));
    setLocked(true);
    setWinner(team);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.team}>{team}</h1>

      <button
        className={`${styles.buzzBtn} ${locked ? styles.disabled : ""}`}
        onClick={buzz}
        disabled={locked}
      >
        {locked ? "BUZZED" : "BUZZ"}
      </button>

      {locked && winner && (
        <p className={styles.status}>
          {winner === team
            ? "✅ You buzzed first!"
            : `❌ ${winner} buzzed first`}
        </p>
      )}
    </div>
  );
}
