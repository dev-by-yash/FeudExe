"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
  transports: ["websocket"],
});

export default function Buzzer() {
  const [nameInput, setNameInput] = useState("");
  const [team, setTeam] = useState(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Waiting for host...");

  useEffect(() => {
    socket.on("buzzer-ready", () => {
      setReady(true);
      setMessage("BUZZ NOW!");
    });

    socket.on("buzz-winner", (winner) => {
      setReady(false);
      setMessage(
        winner === team ? "YOU BUZZED FIRST!" : "Too Late!"
      );
    });

    return () => {
      socket.off("buzzer-ready");
      socket.off("buzz-winner");
    };
  }, [team]);

  const buzz = () => {
    if (!ready) return;
    socket.emit("buzz", team);
    setReady(false);
  };

  /* 🔹 STEP 1: JOIN SCREEN */
  if (!team) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Enter Team Name</h2>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          style={{ fontSize: "20px", padding: "10px" }}
        />
        <br /><br />
        <button
          disabled={!nameInput}
          onClick={() => setTeam(nameInput)}
          style={{ fontSize: "20px", padding: "10px" }}
        >
          Join
        </button>
      </div>
    );
  }

  /* 🔹 STEP 2: BUZZER SCREEN */
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>{message}</h1>
      <button
        disabled={!ready}
        onClick={buzz}
        style={{
          fontSize: "50px",
          padding: "50px",
          background: ready ? "#e63946" : "#555",
          color: "white",
          borderRadius: "12px",
          border: "none",
        }}
      >
        BUZZ
      </button>
    </div>
  );
}
