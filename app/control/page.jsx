"use client";

import { useState, useEffect } from "react";
import styles from "./control.module.css";

export default function ControlPanel() {
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");

  // --- ACTIONS ---
  const revealAnswer = (num) => {
    console.log("Reveal answer", num);
  };

  const strike = () => {
    console.log("Strike ❌");
  };

  const startTimer = () => {
    console.log("Timer started");
  };

  const resetTimer = () => {
    console.log("Timer reset");
  };

  const nextQuestion = () => {
    console.log("Next question");
  };

  const updateScore = (team, delta) => {
    console.log(`${team} score ${delta > 0 ? "+" : ""}${delta}`);
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "1" && e.key <= "6") revealAnswer(Number(e.key));
      if (e.key === "x" || e.key === "X") strike();
      if (e.key === " ") {
        e.preventDefault();
        startTimer();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={styles.container}>
      {/* LEFT */}
      <div className={styles.section}>
        <h2>Teams</h2>

        <select onChange={(e) => setTeamA(e.target.value)}>
          <option>Team A</option>
          <option>Team One</option>
          <option>Team Two</option>
        </select>

        <select onChange={(e) => setTeamB(e.target.value)}>
          <option>Team B</option>
          <option>Team Three</option>
          <option>Team Four</option>
        </select>

        <button className={`${styles.btn} ${styles.primary}`}>
          Start Feud
        </button>
      </div>

      {/* CENTER */}
      <div className={styles.section}>
        <h2>Game Controls</h2>

        <button className={styles.btn} onClick={startTimer}>
          Start Timer
        </button>

        <button className={styles.btn} onClick={resetTimer}>
          Reset Timer
        </button>

        <button
          className={`${styles.btn} ${styles.danger}`}
          onClick={strike}
        >
          ❌ Strike
        </button>

        <h3>Score Control</h3>

        <button
          className={styles.btn}
          onClick={() => updateScore(teamA, +10)}
        >
          ➕ {teamA}
        </button>

        <button
          className={styles.btn}
          onClick={() => updateScore(teamA, -10)}
        >
          ➖ {teamA}
        </button>

        <button
          className={styles.btn}
          onClick={() => updateScore(teamB, +10)}
        >
          ➕ {teamB}
        </button>

        <button
          className={styles.btn}
          onClick={() => updateScore(teamB, -10)}
        >
          ➖ {teamB}
        </button>

        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={nextQuestion}
        >
          Next Question
        </button>
      </div>

      {/* RIGHT */}
      <div className={styles.section}>
        <h2>Reveal</h2>

        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              className={styles.btn}
              onClick={() => revealAnswer(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <button className={`${styles.btn} ${styles.danger}`}>
          BIG ❌
        </button>
      </div>
    </div>
  );
}
